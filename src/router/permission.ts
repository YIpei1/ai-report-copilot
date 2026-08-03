import type { RouteLocationMatched, RouteRecordRaw } from 'vue-router'

export type PermissionChecker = (codes: string[]) => boolean

// 拼接父子路由路径，统一生成用于菜单跳转和权限计算的完整路径。
export const getFullRoutePath = (parentPath: string, childPath: string): string => {
    if (!childPath) {
        return parentPath || '/'
    }

    if (childPath.startsWith('/')) {
        return childPath
    }

    if (parentPath === '/' || !parentPath) {
        return `/${childPath}`
    }

    return `${parentPath}/${childPath}`.replace(/\/+/g, '/')
}

// 读取路由元信息中的权限码，支持字符串
export const getRoutePermissionCodes = (routeRecord: Pick<RouteRecordRaw, 'meta'>): string[] => {
    const permission = routeRecord.meta?.permission
    if (typeof permission === 'string') {
        return permission.trim() ? [permission.trim()] : []
    }
    return []
}

// 基于用户权限判断当前路由是否允许访问。
export const hasRoutePermission = (
    routeRecord: Pick<RouteRecordRaw, 'meta'>,
    hasAnyPermission: PermissionChecker,
): boolean => {
    const permissionCodes = getRoutePermissionCodes(routeRecord)

    if (permissionCodes.length === 0) {
        return true
    }

    return hasAnyPermission(permissionCodes)
}

// 判断是否参与后台左侧菜单渲染。
export const isVisibleMenuRoute = (routeRecord: RouteRecordRaw): boolean => {
    if (routeRecord.meta?.hidden) {
        return false
    }

    return Boolean(routeRecord.meta?.title || routeRecord.children?.length)
}

// 判断当前匹配到的最终路由记录是否有访问权限。
export const canAccessMatchedRoute = (
    matchedRoutes: RouteLocationMatched[],
    hasAnyPermission: PermissionChecker,
): boolean => {
    const targetRoute = matchedRoutes.at(-1)

    if (!targetRoute) {
        return true
    }

    return hasRoutePermission(targetRoute, hasAnyPermission)
}

// 在指定路由树中查找当前用户可访问的第一个叶子路由路径。
export const findFirstAccessibleRoutePath = (
    routes: readonly RouteRecordRaw[],
    hasAnyPermission: PermissionChecker,
    parentPath = '',
): string | null => {
    for (const routeRecord of routes) {
        const currentPath = getFullRoutePath(parentPath, routeRecord.path)
        const children = routeRecord.children || []

        if (children.length > 0) {
            const childPath = findFirstAccessibleRoutePath(children, hasAnyPermission, currentPath)

            if (childPath) {
                return childPath
            }
        }

        if (hasRoutePermission(routeRecord, hasAnyPermission) && routeRecord.component) {
            return currentPath
        }
    }

    return null
}

// 根据目标路径查找所在的顶级模块路由，用于无权限时优先跳转同模块下其他可访问菜单。
export const findTopLevelRouteByPath = (
    routes: readonly RouteRecordRaw[],
    targetPath: string,
): RouteRecordRaw | null => {
    return (
        routes.find((routeRecord) => {
            if (routeRecord.path === '/') {
                return targetPath === '/' || targetPath.startsWith('/dashboard')
            }

            return (
                routeRecord.path !== '/:pathMatch(.*)*' && targetPath.startsWith(routeRecord.path)
            )
        }) || null
    )
}
