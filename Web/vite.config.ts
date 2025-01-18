import path from 'path';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import vue from '@vitejs/plugin-vue';
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite';
import svgLoader from 'vite-svg-loader';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';

import { vitePluginFakeServer } from 'vite-plugin-fake-server';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
import { resolve } from 'path';
import { defineConfig, loadEnv } from 'vite';
import type { UserConfig, ConfigEnv } from 'vite';

// https://vitejs.dev/config/
export default defineConfig(({ mode }: ConfigEnv): UserConfig => {
  const { VITE_PUBLIC_PATH, VITE_PORT } = loadEnv(mode, process.cwd());
  return {
    base: VITE_PUBLIC_PATH,
    // 代理服务器
    server: {
      port: +VITE_PORT,
      host: '0.0.0.0',
      proxy: {
        '^/api/.*': {
          // 这里填写后端地址
          target: 'http://127.0.0.1:3000',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
    // 插件
    plugins: [
      vue(),
      VueI18nPlugin({
        // locales要放入src内
        runtimeOnly: false,
        include: [resolve(__dirname, './locales/src/**')],
      }),
      svgLoader(),
      // mock支持
      vitePluginFakeServer({
        logger: false,
        include: 'mock',
        infixName: false,
        enableProd: true,
      }),
      AutoImport({
        resolvers: [ElementPlusResolver()],
      }),
      Components({
        resolvers: [ElementPlusResolver()],
      }),
    ],
    // 配置别名
    resolve: {
      alias: {
        '@': path.resolve('./src'), // @代替src
        '#': path.resolve('./types'), // #代替types
      },
    },
    // 配置样式
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
        },
      },
      postcss: {
        // @ts-ignore
        plugins: [tailwindcss(), autoprefixer()],
      },
    },
    build: {
      // https://cn.vitejs.dev/guide/build.html#browser-compatibility
      target: 'es2015',
      sourcemap: false,
      // 消除打包大小超过500kb警告
      chunkSizeWarningLimit: 4000,
      rollupOptions: {
        input: {
          index: resolve(__dirname, './index.html'),
        },
        // 静态资源分类打包
        output: {
          chunkFileNames: 'static/js/[name]-[hash].js',
          entryFileNames: 'static/js/[name]-[hash].js',
          assetFileNames: 'static/[ext]/[name]-[hash].[ext]',
        },
      },
    },
  };
});
