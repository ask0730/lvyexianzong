import { createPinia, defineStore } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';

import type { App } from 'vue';

const store = createPinia();
store.use(piniaPluginPersistedstate);

export const setupStore = (app: App<Element>) => {
  app.use(store);
};

export const useToolStore = defineStore('tool', {
  state: () => {
    return {
      isGetterRouter: false,
      isCollapsed: false,
    };
  },
  actions: {
    changeGetterRouter(value: boolean) {
      this.isGetterRouter = value;
    },
    changeCollapsed() {
      this.isCollapsed = !this.isCollapsed;
    },
  },
  persist: {
    key: 'tool',
    storage: localStorage,
    paths: ['isCollapsed'],
  },
});

export default store;
