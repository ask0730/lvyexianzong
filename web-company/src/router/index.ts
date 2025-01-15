import { RouteRecordRaw, createRouter, createWebHashHistory } from 'vue-router';
import type { App } from 'vue';
import News from '@/views/News.vue'
import Product from '@/views/Product.vue'
import About from '@/views/About.vue'

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
    path: '/login',
    name: 'login',
    component: () => import('@/views/Login.vue')
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/views/Register.vue')
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;

export const setupRouter = (app: App<Element>) => {
  app.use(router);
};
