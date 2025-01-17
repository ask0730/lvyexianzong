import axios from 'axios';

const instance = axios.create();
instance.defaults.baseURL = `${import.meta.env.VITE_APP_BASE_URL}`;
instance.defaults.withCredentials = false;
instance.defaults.validateStatus = status => {
  return status >= 200 && status < 400;
};

// 请求拦截器：向服务器发送请求之前
instance.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截器
instance.interceptors.response.use(
  response => {
    // 如果响应头中包含新的token，更新本地存储
    const newToken = response.headers['authorization'];
    if (newToken) {
      localStorage.setItem('token', newToken);
    }
    return response.data;
  },
  error => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // token过期或无效，清除本地token并跳转到登录页
          localStorage.removeItem('token');
          window.location.href = '/login';
          break;
        default:
          console.error('请求错误:', error);
      }
    }
    return Promise.reject(error);
  }
);

export function queryGET(url: string, params = {}, config: any = {}) {
  config.params = params;
  return instance.get(url, config);
}

export function queryPOST(url: string, data: any, config = {}) {
  return instance.post(url, data, config);
}
