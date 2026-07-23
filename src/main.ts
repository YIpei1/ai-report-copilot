import { createApp } from 'vue'
import './styles/index.scss'
import App from './App.vue'
import router from './router'
import 'element-plus/dist/index.css'
import { createPinia } from 'pinia'

createApp(App).use(router).use(createPinia()).mount('#app')
