import axios from 'axios';

const instance = axios.create();
instance.defaults.baseURL = `${import.meta.env.VITE_APP_BASE_URL}`;
instance.defaults.withCredentials = true;
instance.defaults.validateStatus = status => {
  return status >= 200 && status < 400;
};

// 是否正在刷新token
let isRefreshing = false;
// 存储等待刷新token的请求
let failedQueue: any[] = [];

// 处理等待队列中的请求
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  
  failedQueue = [];
};

// 请求拦截器：向服务器发送请求之前
instance.interceptors.request.use(config => {
  const accessToken = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');
  
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  
  // 如果有refresh token，也添加到请求头中
  if (refreshToken) {
    config.headers['X-Refresh-Token'] = refreshToken;
  }
  
  return config;
});

// 响应拦截器
instance.interceptors.response.use(
  response => {
    // 检查是否有新的token返回
    const { authorization, Authorization } = response.headers;
    const newAccessToken = authorization || Authorization;
    
    const { 'x-new-refresh-token': newRefreshToken } = response.headers;
    
    if (newAccessToken) {
      localStorage.setItem('accessToken', newAccessToken);
    }
    
    if (newRefreshToken) {
      localStorage.setItem('refreshToken', newRefreshToken);
    }
    
    return response.data;
  },
  async reason => {
    const { status, config } = reason.response;
    
    if (status === 401) {
      // 如果是刷新token的请求失败，直接跳转登录
      if (config.url?.includes('/refresh-token')) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '#/login';
        return Promise.reject(reason);
      }
      
      // 如果正在刷新token，将请求加入队列
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          config.headers.Authorization = `Bearer ${token}`;
          return instance(config);
        }).catch(err => {
          return Promise.reject(err);
        });
      }
      
      // 开始刷新token
      isRefreshing = true;
      
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '#/login';
        return Promise.reject(reason);
      }
      
      try {
        // 调用刷新token接口
        const response = await axios.post(`${import.meta.env.VITE_APP_BASE_URL}/webapi/users/refresh-token`, {
          refreshToken
        });
        
        if (response.data.code === 0) {
          const { accessToken, refreshToken: newRefreshToken } = response.data.data;
          
          // 更新本地存储
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', newRefreshToken);
          
          // 处理等待队列
          processQueue(null, accessToken);
          
          // 重试原请求
          config.headers.Authorization = `Bearer ${accessToken}`;
          return instance(config);
        } else {
          throw new Error('刷新token失败');
        }
      } catch (error) {
        // 刷新失败，清除token并跳转登录
        processQueue(error, null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '#/login';
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }
    
    return Promise.reject(reason);
  }
);

export function queryGET(url: string, params = {}, config: any = {}) {
  config.params = params;
  return instance.get(url, config).then((res: any) => {
    return res;
  });
}

export function queryPOST(url: string, data: any, config = {}) {
  return instance.post(url, data, config).then((res: any) => {
    return res;
  });
}
