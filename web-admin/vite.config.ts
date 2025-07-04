import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
import fs from 'fs';

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
      https: {
        key: fs.readFileSync('../web-server/cert/server.key'),
        cert: fs.readFileSync('../web-server/cert/server.crt'),
      },
      port: 5173,
      force: true,
      proxy: {
        '/adminapi': {
          target: 'https://localhost',
          changeOrigin: true,
          secure: false,
        },
        '/api': {
          target: 'https://localhost',
          changeOrigin: true,
          secure: false,
        }
      },
    },
  };
});
