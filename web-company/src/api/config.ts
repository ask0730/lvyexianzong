import axios from 'axios';
import { TokenManager } from '../utils/token';

const instance = axios.create();
instance.defaults.baseURL = `${import.meta.env.VITE_APP_BASE_URL}`;
instance.defaults.withCredentials = true;
instance.defaults.validateStatus = status => {
  return status >= 200 && status < 400;
};

// 是否正在刷新token
let isRefreshing = false;
// 存储等待刷新token的请求
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

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
  const token = TokenManager.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截器
instance.interceptors.response.use(
  response => {
    return response.data;
  },
  async error => {
    const originalRequest = error.config;

    // 如果是401错误且不是刷新token的请求
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // 如果正在刷新token，将请求加入等待队列
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return instance(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = TokenManager.getRefreshToken();
      
      if (!refreshToken) {
        // 没有refresh token，清除本地存储并跳转到登录页
        TokenManager.clearAuth();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        // 调用刷新token接口
        const response = await axios.post('/webapi/users/refresh-token', {
          refreshToken: refreshToken
        });

        if (response.data.code === 0) {
          const { token: newToken, refreshToken: newRefreshToken } = response.data;
          
          // 更新本地存储
          TokenManager.setTokens(newToken, newRefreshToken);
          
          // 更新axios默认请求头
          instance.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
          
          // 处理等待队列中的请求
          processQueue(null, newToken);
          
          // 重试原始请求
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return instance(originalRequest);
        } else {
          // 刷新token失败，清除本地存储并跳转到登录页
          TokenManager.clearAuth();
          window.location.href = '/login';
          return Promise.reject(error);
        }
      } catch (refreshError) {
        // 刷新token请求失败，清除本地存储并跳转到登录页
        TokenManager.clearAuth();
        processQueue(refreshError, null);
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
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
