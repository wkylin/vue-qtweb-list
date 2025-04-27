import path from 'path'
import { defineConfig, loadEnv } from 'vite'
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [
      vue(),
      Icons({
        autoInstall: true,
      }),
      AutoImport({
        resolvers: [
          ElementPlusResolver(),
          IconsResolver({
            prefix: 'Icon',
          }),
        ],
      }),
      Components({
        resolvers: [
          ElementPlusResolver(),
          IconsResolver({
            enabledCollections: ['ep'],
          }),
        ],
      }),
    ],
    base: env.VITE_BASE || '/',
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    // build: {
    //   // target: 'es2015',
    //   cssTarget: 'chrome52'
    // },
    server: {
      host: '0.0.0.0',
      proxy: {
        '/video': {
          target: 'http://10.0.107.154',
          changeOrigin: true,
          // rewrite: (path) => path.replace(/^\/venues/, ''), // 重写路径，去掉 /api 前缀
        },
      },
    },
  }
})
