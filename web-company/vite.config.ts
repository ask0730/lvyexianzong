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
      port: 8081,
      force: true,
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
          ws: true
        },
        '/webapi': {
          target: 'http://localhost:3000',
          changeOrigin: true,
          rewrite: path => path.replace(/^\//, ''),
        },
      },
    },
  };
});

// 跨域问题原理