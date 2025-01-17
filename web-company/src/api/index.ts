import axios from 'axios';

// 创建axios实例
const instance = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_URL,
  timeout: 5000,
  withCredentials: true, // 允许跨域请求携带凭证
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器
instance.interceptors.request.use(
  (config) => {
    // 确保headers对象存在
    config.headers = config.headers || {};
    
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('请求错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
instance.interceptors.response.use(
  (response) => {
    const newToken = response.headers['authorization'];
    if (newToken) {
      localStorage.setItem('token', newToken);
    }
    return response.data;
  },
  (error) => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          localStorage.removeItem('token');
          window.location.href = '/login';
          break;
        case 403:
          console.error('没有权限访问该资源');
          break;
        case 500:
          console.error('服务器错误');
          break;
        default:
          console.error('请求错误:', error.response.data);
      }
    } else if (error.request) {
      console.error('没有收到响应:', error.request);
    } else {
      console.error('请求配置错误:', error.message);
    }
    return Promise.reject(error);
  }
);

export default instance;
