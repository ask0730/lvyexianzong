// vite.config.ts
import { defineConfig } from "file:///C:/Users/ask/Desktop/lvyexianzong/web-company/node_modules/vite/dist/node/index.js";
import vue from "file:///C:/Users/ask/Desktop/lvyexianzong/web-company/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import { resolve } from "path";
var __vite_injected_original_dirname = "C:\\Users\\ask\\Desktop\\lvyexianzong\\web-company";
var vite_config_default = defineConfig(() => {
  return {
    plugins: [vue()],
    resolve: {
      alias: {
        "@": resolve(__vite_injected_original_dirname, "./src"),
        comps: resolve(__vite_injected_original_dirname, "./src/components"),
        store: resolve(__vite_injected_original_dirname, "./src/store"),
        "~": resolve(__vite_injected_original_dirname, "./")
      }
    },
    server: {
      port: 8081,
      force: true,
      proxy: {
        // 选项写法
        "/webapi": {
          target: "http://localhost:3000",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\//, "")
        }
      }
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxhc2tcXFxcRGVza3RvcFxcXFxsdnlleGlhbnpvbmdcXFxcd2ViLWNvbXBhbnlcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXGFza1xcXFxEZXNrdG9wXFxcXGx2eWV4aWFuem9uZ1xcXFx3ZWItY29tcGFueVxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvYXNrL0Rlc2t0b3AvbHZ5ZXhpYW56b25nL3dlYi1jb21wYW55L3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XHJcbmltcG9ydCB2dWUgZnJvbSAnQHZpdGVqcy9wbHVnaW4tdnVlJztcclxuaW1wb3J0IHsgcmVzb2x2ZSB9IGZyb20gJ3BhdGgnO1xyXG5cclxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCgpID0+IHtcclxuICByZXR1cm4ge1xyXG4gICAgcGx1Z2luczogW3Z1ZSgpXSxcclxuICAgIHJlc29sdmU6IHtcclxuICAgICAgYWxpYXM6IHtcclxuICAgICAgICAnQCc6IHJlc29sdmUoX19kaXJuYW1lLCAnLi9zcmMnKSxcclxuICAgICAgICBjb21wczogcmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYy9jb21wb25lbnRzJyksXHJcbiAgICAgICAgc3RvcmU6IHJlc29sdmUoX19kaXJuYW1lLCAnLi9zcmMvc3RvcmUnKSxcclxuICAgICAgICAnfic6IHJlc29sdmUoX19kaXJuYW1lLCAnLi8nKSxcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICBzZXJ2ZXI6IHtcclxuICAgICAgcG9ydDogODA4MSxcclxuICAgICAgZm9yY2U6IHRydWUsXHJcbiAgICAgIHByb3h5OiB7XHJcbiAgICAgICAgLy8gXHU5MDA5XHU5ODc5XHU1MTk5XHU2Q0Q1XHJcbiAgICAgICAgJy93ZWJhcGknOiB7XHJcbiAgICAgICAgICB0YXJnZXQ6ICdodHRwOi8vbG9jYWxob3N0OjMwMDAnLFxyXG4gICAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxyXG4gICAgICAgICAgcmV3cml0ZTogcGF0aCA9PiBwYXRoLnJlcGxhY2UoL15cXC8vLCAnJyksXHJcbiAgICAgICAgfSxcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgfTtcclxufSk7XHJcblxyXG4vLyBcdThERThcdTU3REZcdTk1RUVcdTk4OThcdTUzOUZcdTc0MDYiXSwKICAibWFwcGluZ3MiOiAiO0FBQXFVLFNBQVMsb0JBQW9CO0FBQ2xXLE9BQU8sU0FBUztBQUNoQixTQUFTLGVBQWU7QUFGeEIsSUFBTSxtQ0FBbUM7QUFLekMsSUFBTyxzQkFBUSxhQUFhLE1BQU07QUFDaEMsU0FBTztBQUFBLElBQ0wsU0FBUyxDQUFDLElBQUksQ0FBQztBQUFBLElBQ2YsU0FBUztBQUFBLE1BQ1AsT0FBTztBQUFBLFFBQ0wsS0FBSyxRQUFRLGtDQUFXLE9BQU87QUFBQSxRQUMvQixPQUFPLFFBQVEsa0NBQVcsa0JBQWtCO0FBQUEsUUFDNUMsT0FBTyxRQUFRLGtDQUFXLGFBQWE7QUFBQSxRQUN2QyxLQUFLLFFBQVEsa0NBQVcsSUFBSTtBQUFBLE1BQzlCO0FBQUEsSUFDRjtBQUFBLElBQ0EsUUFBUTtBQUFBLE1BQ04sTUFBTTtBQUFBLE1BQ04sT0FBTztBQUFBLE1BQ1AsT0FBTztBQUFBO0FBQUEsUUFFTCxXQUFXO0FBQUEsVUFDVCxRQUFRO0FBQUEsVUFDUixjQUFjO0FBQUEsVUFDZCxTQUFTLFVBQVEsS0FBSyxRQUFRLE9BQU8sRUFBRTtBQUFBLFFBQ3pDO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
