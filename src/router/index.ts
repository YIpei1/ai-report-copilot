import { createWebHistory, createRouter } from 'vue-router'
import { constantRoutes } from './constantRoutes'
import { useUserStore } from '@/stores'
import { useAuthStore } from '@/stores'
import { useTabsNavStore } from '@/stores'
const router = createRouter({
    history: createWebHistory(),
    routes: constantRoutes,
})

// 路由前置守卫
router.beforeEach(async (to) => {
    const authStore = useAuthStore()
    const userStore = useUserStore()
    const isLoggedIn = authStore.isLoggedIn

    if (!isLoggedIn) {
        return to.path === '/login' ? true : '/login'
    }
    if (to.path === '/login') {
        return '/dashboard'
    }
    if (!userStore.userInfo) {
        try {
            await userStore.setUserInfo()
        } catch {
            await authStore.clearTokens()
            userStore.clearUserInfo()
            return '/login'
        }
    }

    if (to.meta.permission && !userStore.hasPermission(to.meta.permission)) {
        return '/403'
    }

    return true
})
// 路由后置
router.afterEach(async (to) => {
    const tabsNavStore = useTabsNavStore()
    // 跳转成功后添加tabsNav页签
    tabsNavStore.addVisitedTab({
        path: to.path,
        title: to.meta.title,
    })
})
export default router
