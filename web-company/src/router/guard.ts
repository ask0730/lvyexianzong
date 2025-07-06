import { Router } from 'vue-router';
import { TokenManager } from '../utils/token';

// 需要登录的路由
const authRoutes = ['/profile', '/chat'];

// 不需要登录的路由
const publicRoutes = ['/login', '/register', '/', '/about', '/news', '/product'];

export function setupRouterGuard(router: Router) {
  router.beforeEach(async (to, from, next) => {
    const isLoggedIn = TokenManager.isLoggedIn();
    const isAuthRoute = authRoutes.includes(to.path);
    const isPublicRoute = publicRoutes.includes(to.path);

    // 如果是需要登录的路由
    if (isAuthRoute) {
      if (!isLoggedIn) {
        // 未登录，跳转到登录页
        next('/login');
        return;
      }

      // 检查token是否即将过期
      if (TokenManager.isTokenExpiringSoon()) {
        try {
          // 尝试刷新token
          const refreshToken = TokenManager.getRefreshToken();
          if (refreshToken) {
            const response = await fetch('/webapi/users/refresh-token', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ refreshToken }),
            });

            if (response.ok) {
              const data = await response.json();
              if (data.code === 0) {
                TokenManager.setTokens(data.token, data.refreshToken);
                next();
                return;
              }
            }
          }
          
          // 刷新失败，清除认证信息并跳转到登录页
          TokenManager.clearAuth();
          next('/login');
          return;
        } catch (error) {
          console.error('Token刷新失败:', error);
          TokenManager.clearAuth();
          next('/login');
          return;
        }
      }
    }

    // 如果已登录且访问登录页，跳转到个人中心
    if (isLoggedIn && to.path === '/login') {
      next('/profile');
      return;
    }

    next();
  });
} 