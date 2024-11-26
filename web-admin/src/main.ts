import { createApp } from 'vue';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import 'normalize.css';
import './styles/index.scss';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import { setupStore } from './store';
import { setupDirective } from './directive';
import router, { setupRouter } from './router';
import Particles from '@tsparticles/vue3';
import { loadSlim } from '@tsparticles/slim';

import App from './App.vue';

const app = createApp(App);
setupStore(app);
setupRouter(app);
setupDirective(app);
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}
app.use(ElementPlus);
app.use(Particles, {
  init: async engine => {
    // await loadFull(engine); // you can load the full tsParticles library from "tsparticles" if you need it
    await loadSlim(engine); // or you can load the slim version from "@tsparticles/slim" if don't need Shapes or Animations
  },
});

router.isReady().then(() => {
  app.mount('#app');
});
