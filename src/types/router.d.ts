import 'vue-router'

declare module 'vue-router' {
    interface RouteMeta {
        title: string

        icon?: string
        // 权限标识
        permission?: string
        // 是否在侧边栏隐藏
        hidden?: boolean
        // 是否保留头部页签 TabsNav
        isTabsNav?: boolean
        /***
         *  是否无需登录即可访问
         *  暂时未启用
         */
        withoutAuth?: boolean
    }
}
