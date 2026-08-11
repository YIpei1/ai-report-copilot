import { createApp } from 'vue'
import './styles/index.scss'
import App from './App.vue'
import router from './router'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import pinia from './stores'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'

async function enableMocking() {
    // 判断启动环境
    if (!import.meta.env.DEV || import.meta.env.VITE_ENABLE_MOCK !== 'true') {
        return
    }
    const { startMockWorker } = await import('./mocks/browser')
    await startMockWorker()
}

async function bootstrap() {
    // mocks启动后在启动应用，确保mock接口生效
    await enableMocking()

    createApp(App)
        .use(ElementPlus, {
            locale: zhCn,
        })
        .use(pinia)
        .use(router)
        .mount('#app')
}

void bootstrap()
