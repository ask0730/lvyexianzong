import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig(() => {
  return {
    plugins: [vue()],
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
        comps: resolve(__dirname, './src/components'),
        store: resolve(__dirname, './src/store'),
        '~': resolve(__dirname, './'),
      },
    },
    server: {
      port: 8080,
      force: true,
      proxy: {
        // 选项写法
        '/adminapi': {
          target: 'http://localhost:3000',
          changeOrigin: true,
          rewrite: path => path.replace(/^\//, ''),
        },
      },
    },
  };
});
