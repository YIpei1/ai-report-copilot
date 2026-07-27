import { defineConfig, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import AutoImport from 'unplugin-auto-import/vite'
import path from 'node:path'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import * as vueSetupExtendModule from 'vite-plugin-vue-setup-extend'

const vueSetupExtend = vueSetupExtendModule.default as unknown as (options?: {
    name?: boolean
}) => Plugin

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        vueSetupExtend(),
        AutoImport({
            resolvers: [ElementPlusResolver()],
        }),

        Components({
            dirs: ['src/components'],
            resolvers: [ElementPlusResolver()],
        }),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src'),
        },
    },

    css: {
        preprocessorOptions: {
            scss: {
                // 自动引入scss变量文件
                additionalData: `
          @use "@/styles/variables.scss" as *;
        `,
            },
        },
    },
})
