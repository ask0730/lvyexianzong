import { createApp } from 'vue';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import 'normalize.css';
import './styles/index.scss';
import './styles/element-plus-theme.css';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import { setupStore } from './store';
import router, { setupRouter } from './router';
import App from './App.vue';
import VueLazyLoad from 'vue3-lazyload';
import loadingImg from '@/assets/error/cloud.png';
import errorImg from '@/assets/error/404.png';
import 'core-js/stable'
import 'regenerator-runtime/runtime'

const app = createApp(App);
setupStore(app);
setupRouter(app);
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}
app.use(ElementPlus);
app.use(VueLazyLoad, {
  loading: loadingImg,
  error: errorImg,
});

router.isReady().then(() => {
  app.mount('#app');
});
