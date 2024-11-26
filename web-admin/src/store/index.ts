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
      userInfo: {
        username: '',
        role: 0,
        avatar: '',
        gender: 0,
        introduction: '',
      },
    };
  },
  actions: {
    changeGetterRouter(value: boolean) {
      this.isGetterRouter = value;
    },
    changeCollapsed() {
      this.isCollapsed = !this.isCollapsed;
    },
    changeUserInfo(value: Object) {
      this.userInfo = {
        ...this.userInfo,
        ...value,
      };
    },
    clearUserInfo() {
      this.userInfo = {
        username: '',
        role: 0,
        avatar: '',
        gender: 0,
        introduction: '',
      };
    },
  },
  persist: {
    key: 'tool',
    storage: localStorage,
    paths: ['isCollapsed', 'userInfo'],
  },
});

export default store;
