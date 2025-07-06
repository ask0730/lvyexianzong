import { RouteRecordRaw, createRouter, createWebHashHistory } from 'vue-router';
import type { App } from 'vue';
import News from '@/views/News.vue'
import Product from '@/views/Product.vue'
import About from '@/views/About.vue'
import { TokenManager } from '@/utils/token'

export const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/Home.vue'),
  },
  {
    path: '/news',
    name: 'news',
    component: News,
  },
  {
    path: '/news/:id',
    name: 'new',
    component: () => import('@/views/New.vue'),
  },
  {
    path: '/product',
    name: 'product',
    component: Product,
  },
  {
    path: '/about',
    component: About,
  },
  {
    path: '/chat',
    name: 'chat',
    component: () => import('@/views/Chat.vue')
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/Login.vue')
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/views/Register.vue')
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('@/views/Profile.vue'),
    meta: { requiresAuth: true }
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

// 添加全局导航守卫
router.beforeEach(async (to, from, next) => {
  if (to.meta.requiresAuth) {
    const isLoggedIn = TokenManager.isLoggedIn()
    
    if (isLoggedIn) {
      // 检查是否需要刷新token（token不存在或即将过期）
      const currentToken = TokenManager.getToken()
      const needsRefresh = !currentToken || TokenManager.isTokenExpiringSoon()
      
      if (needsRefresh) {
        try {
          const refreshToken = TokenManager.getRefreshToken()
          if (refreshToken) {
            const response = await fetch('/webapi/users/refresh-token', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ refreshToken }),
            })

            if (response.ok) {
              const data = await response.json()
              if (data.code === 0) {
                TokenManager.setTokens(data.token, data.refreshToken)
                next()
                return
              }
            }
          }
          
          // 刷新失败，清除认证信息并跳转到登录页
          TokenManager.clearAuth()
          next('/login')
          return
        } catch (error) {
          console.error('Token刷新失败:', error)
          TokenManager.clearAuth()
          next('/login')
          return
        }
      }
      
      next()
    } else {
      next('/login')
    }
  } else {
    next()
  }
})

export default router;

export const setupRouter = (app: App<Element>) => {
  app.use(router);
};
