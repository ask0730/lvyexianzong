import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
import viteCompression from 'vite-plugin-compression';
import legacy from '@vitejs/plugin-legacy'

// https://vitejs.dev/config/
export default defineConfig(() => {
  return {
    plugins: [
      vue(),
      legacy({
        targets: ['defaults', 'IE 11'],
        additionalLegacyPolyfills: ['regenerator-runtime/runtime']
      }),
      viteCompression({
        verbose: true, // 输出压缩结果
        disable: false, // 是否禁用
        threshold: 10240, // 只压缩大于10kb的文件
        algorithm: 'gzip', // 使用gzip压缩
        ext: '.gz', // 生成的压缩包后缀
      })
    ],
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
        comps: resolve(__dirname, './src/components'),
        store: resolve(__dirname, './src/store'),
        '~': resolve(__dirname, './'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 8081,
      force: true,
      proxy: {
        // 选项写法
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