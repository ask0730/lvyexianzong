import axios from 'axios';

const instance = axios.create();
instance.defaults.baseURL = `${import.meta.env.VITE_APP_BASE_URL}`;
instance.defaults.withCredentials = true;
instance.defaults.validateStatus = status => {
  return status >= 200 && status < 400;
};

// 请求拦截器：向服务器发送请求之前
instance.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 响应拦截器
instance.interceptors.response.use(
  response => {
    const { authorization } = response.headers;
    authorization && localStorage.setItem('token', authorization);
    return response.data;
  },
  reason => {
    if (reason.response) {
      const { status } = reason.response;
      if (status === 401) {
        localStorage.removeItem('token');
        window.location.href = '#/login';
      }
    } else {
      // 网络或SSL错误
      alert('网络连接失败或SSL错误');
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
