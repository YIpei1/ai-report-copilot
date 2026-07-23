import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import AutoImport from 'unplugin-auto-import/vite'
import {
  ElementPlusResolver
} from 'unplugin-vue-components/resolvers'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(),
  AutoImport({
    resolvers: [
      ElementPlusResolver()
    ],
  }),

  Components({
    dirs: [
      'src/components'
    ],
    resolvers: [
      ElementPlusResolver()
    ],
  }),],

  css: {
    preprocessorOptions: {
      scss: {
        // 自动引入scss变量文件
        additionalData: `
          @use "@/styles/variables.scss" as *;
        `
      }
    }
  }
})
