import { TokenManager } from './token';
import axios from 'axios';
import { useRouter } from 'vue-router';

// 退出登录
export async function logout() {
  try {
    // 调用后端退出登录接口
    const token = TokenManager.getToken();
    if (token) {
      await axios.post('/webapi/users/logout', {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    }
  } catch (error) {
    console.error('退出登录失败:', error);
  } finally {
    // 清除本地存储的认证信息
    TokenManager.clearAuth();
    
    // 清除axios默认请求头
    delete axios.defaults.headers.common['Authorization'];
    
    // 跳转到登录页
    window.location.href = '/login';
  }
}

// 检查用户是否已登录
export function isAuthenticated(): boolean {
  return TokenManager.isLoggedIn();
}

// 获取当前用户信息
export function getCurrentUser() {
  return TokenManager.getUserInfo();
} 