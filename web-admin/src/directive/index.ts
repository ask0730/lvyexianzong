import { useToolStore } from '@/store';
import { App } from 'vue';

export const setupDirective = (app: App<Element>) => {
  const useTool = useToolStore() as any;
  app.directive('admin', {
    mounted(el) {
      if (useTool.userInfo.role !== 1) {
        el.parentNode?.removeChild(el);
      }
    },
  });
};
