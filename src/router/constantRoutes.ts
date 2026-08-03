import type { RouteRecordRaw } from 'vue-router'
import LayoutDefault from '@/layouts/LayoutDefault.vue'
// 报表模块
const reportRoutes: RouteRecordRaw = {
    path: '/reportView',
    name: 'ReportView',
    component: () => import('@/views/ReportView/index.vue'),
    meta: {
        title: '报告',
        icon: 'setting',
        permission: 'report:reportView',
    },
}

export const constantRoutes: RouteRecordRaw[] = [
    {
        path: '/',
        component: LayoutDefault,
        redirect: '/dashboard',
        children: [
            {
                path: 'dashboard',
                name: 'Dashboard',
                component: () => import('@/views/Dashboard/index.vue'),
                meta: { title: '工作台', icon: 'Calendar' },
            },
            reportRoutes,
        ],
    },

    {
        path: '/403',
        name: 'Forbidden',
        component: () => import('@/views/Error/403.vue'),
        meta: { title: '无访问权限', hidden: true, isTabsNav: true },
    },
    {
        path: '/404',
        name: 'NotFound',
        component: () => import('@/views/Error/404.vue'),
        meta: { title: '页面不存在', hidden: true, isTabsNav: true },
    },
    {
        path: '/login',
        name: 'Login',
        component: () => import('@/views/LoginView/index.vue'),
        meta: { title: '登录', hidden: true, isTabsNav: true },
    },
]
