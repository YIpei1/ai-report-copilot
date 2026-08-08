import type { RouteRecordRaw } from 'vue-router'
import LayoutDefault from '@/layouts/LayoutDefault.vue'
// 报表模块包含报告实例管理和检测模板配置。
const reportRoutes: RouteRecordRaw = {
    path: 'reports',
    name: 'ReportModule',
    redirect: '/reports/manage',
    meta: { title: '报表模块', icon: 'DocumentCopy' },
    children: [
        {
            path: 'manage',
            name: 'ReportList',
            component: () => import('@/views/Report/ReportList/index.vue'),
            meta: { title: '报告管理', icon: 'Files', permission: 'report:reportView' },
        },
        {
            path: 'templates',
            name: 'ReportTemplateList',
            component: () => import('@/views/Report/TemplateList/index.vue'),
            meta: { title: '检测模板', icon: 'Document', permission: 'report:template' },
        },
    ],
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
            {
                path: 'chat',
                name: 'ChatView',
                component: () => import('@/views/ChatView/index.vue'),
                meta: { title: 'AI 会话', icon: 'ChatDotRound' },
            },
            {
                path: 'base-data',
                name: 'BaseData',
                redirect: '/base-data/devices',
                meta: { title: '基础数据', icon: 'Collection' },
                children: [
                    {
                        path: 'devices',
                        name: 'DeviceList',
                        component: () => import('@/views/BaseData/DeviceList/index.vue'),
                        meta: { title: '设备台账', icon: 'Monitor' },
                    },
                    {
                        path: 'instruments',
                        name: 'InstrumentList',
                        component: () => import('@/views/BaseData/InstrumentList/index.vue'),
                        meta: { title: '仪器设备', icon: 'Stopwatch' },
                    },
                    {
                        path: 'toolboxes',
                        name: 'ToolboxList',
                        component: () => import('@/views/BaseData/ToolboxList/index.vue'),
                        meta: { title: '工具箱', icon: 'Briefcase' },
                    },
                ],
            },
            reportRoutes,
        ],
    },
    {
        path: '/reportView',
        name: 'ReportView',
        component: () => import('@/views/Report/ReportView/index.vue'),
        meta: { title: '检测报表', icon: 'Document', permission: 'report:template' },
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
