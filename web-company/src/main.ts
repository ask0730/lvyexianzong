import { createApp } from 'vue';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import 'normalize.css';
import './styles/index.scss';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import { setupStore } from './store';
import router, { setupRouter } from './router';
import App from './App.vue';

const app = createApp(App);
setupStore(app);
setupRouter(app);
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}
app.use(ElementPlus);

router.isReady().then(() => {
  app.mount('#app');
});
