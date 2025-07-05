import { RouteRecordRaw, createRouter, createWebHashHistory } from 'vue-router';
import type { App } from 'vue';
import dynamicRoutes from './config';
import { useToolStore } from '@/store';

export const constantRoutes: Array<RouteRecordRaw> = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/Login.vue'),
  },
  {
    path: '/mainbox',
    name: 'mainbox',
    component: () => import('@/views/MainBox.vue'),
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes: constantRoutes,
  scrollBehavior(to, from, savedPosition) {
    // 始终滚动到顶部
    if (savedPosition) {
      return savedPosition;
    }
    return { top: 0, behavior: 'smooth' };
  },
});

//每次路由跳转之前
router.beforeEach((to, from, next) => {
  const useTool = useToolStore();
  if (to.name === 'login') {
    next();
  } else {
    if (!localStorage.getItem('token')) {
      next({
        path: '/login',
      });
    } else {
      if (!useTool.isGetterRouter) {
        ConfigRouter();
        next({
          path: to.fullPath,
        });
      } else {
        next();
      }
    }
  }
});

const ConfigRouter = () => {
  const useTool = useToolStore();
  dynamicRoutes.forEach(item => {
    checkPermission(item) && router.addRoute('mainbox', item);
  });
  useTool.changeGetterRouter(true);
};

const checkPermission = (item: any) => {
  const useTool = useToolStore() as any;
  if (item.meta?.requireAdmin) {
    return useTool.userInfo.role == 1;
  }
  return true;
};

export default router;

export const setupRouter = (app: App<Element>) => {
  app.use(router);
};
