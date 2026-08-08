import { computed, markRaw, type Component, type ComputedRef } from 'vue'
import type { RouteRecordRaw, Router } from 'vue-router'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import { getFullRoutePath, hasRoutePermission, isVisibleMenuRoute } from '@/router/permission'
import store, { useUserStore } from '@/stores'

export interface LayoutMenuItem {
    badge: string
    children: LayoutMenuItem[]
    icon?: Component
    path: string
    title: string
}

const iconCache = new Map<string, Component>()

const toPascalCase = (value: string): string => {
    return value
        .split(/[-_\s]+/)
        .filter(Boolean)
        .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
        .join('')
}

const resolveMenuIcon = (icon: unknown): Component | undefined => {
    if (typeof icon !== 'string' || !icon.trim()) {
        return undefined
    }

    const iconName = toPascalCase(icon.trim())
    const cachedIcon = iconCache.get(iconName)

    if (cachedIcon) {
        return cachedIcon
    }

    const iconComponent = ElementPlusIconsVue[iconName as keyof typeof ElementPlusIconsVue]

    if (!iconComponent) {
        return undefined
    }

    const rawIcon = markRaw(iconComponent)
    iconCache.set(iconName, rawIcon)

    return rawIcon
}

// 提取路由标题，缺失时兜底为默认文案，避免菜单显示空白。
const getRouteTitle = (routeRecord: RouteRecordRaw): string => {
    return typeof routeRecord.meta?.title === 'string' && routeRecord.meta.title
        ? routeRecord.meta.title
        : '未命名菜单'
}

// 菜单徽标默认取标题首字符，便于在没有图标时占位展示。
const createBadge = (title: string): string => {
    return title.slice(0, 1)
}

// 递归构建菜单树；当父级自身无权限但子级仍可见时，保留父级分组。
const createMenuItem = (
    routeRecord: RouteRecordRaw,
    hasAnyPermission: (codes: string[]) => boolean,
    parentPath = '',
): LayoutMenuItem | null => {
    if (!isVisibleMenuRoute(routeRecord)) {
        return null
    }

    const currentPath = getFullRoutePath(parentPath, routeRecord.path)
    const hasChildren = (routeRecord.children || []).length > 0
    const children = (routeRecord.children || [])
        .map((child) => createMenuItem(child, hasAnyPermission, currentPath))
        .filter((item): item is LayoutMenuItem => item !== null)

    if (hasChildren && children.length === 0) {
        return null
    }

    if (!hasChildren && !hasRoutePermission(routeRecord, hasAnyPermission)) {
        return null
    }

    if (children.length > 0 || hasRoutePermission(routeRecord, hasAnyPermission)) {
        return {
            badge: createBadge(getRouteTitle(routeRecord)),
            children,
            icon: resolveMenuIcon(routeRecord.meta?.icon),
            path: currentPath,
            title: getRouteTitle(routeRecord),
        }
    }

    return null
}

// 根据路由配置和后端权限码生成左侧菜单树。
export const useLayoutMenus = (router: Router): { sidebarMenus: ComputedRef<LayoutMenuItem[]> } => {
    const authStore = useUserStore(store)
    const sidebarMenus = computed<LayoutMenuItem[]>(() => {
        if (authStore.permissionCodes.length === 0) {
            return []
        }

        return (router.options.routes as RouteRecordRaw[])
            .filter((routeRecord) => isVisibleMenuRoute(routeRecord))
            .flatMap((routeRecord) => {
                if (routeRecord.path === '/' && routeRecord.children?.length) {
                    return routeRecord.children
                        .map((child) => createMenuItem(child, authStore.hasAnyPermission, '/'))
                        .filter((item): item is LayoutMenuItem => item !== null)
                }

                const menuItem = createMenuItem(routeRecord, authStore.hasAnyPermission)

                return menuItem ? [menuItem] : []
            })
    })

    return {
        sidebarMenus,
    }
}
