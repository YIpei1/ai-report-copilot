<template>
    <aside class="layout-sidebar" :class="{ 'layout-sidebar--collapsed': collapsed }">
        <div class="layout-sidebar__brand">
            <div class="layout-sidebar__brand-mark">IR</div>
            <div v-show="!collapsed" class="layout-sidebar__brand-copy">
                <strong>{{ APP_NAME }}</strong>
                <span>Inspection Admin Console</span>
            </div>
        </div>
        <el-scrollbar class="layout-sidebar__scrollbar">
            <nav class="layout-sidebar__menu" aria-label="主菜单">
                <SidebarItem
                    v-for="menu in sidebarMenus"
                    :key="menu.path"
                    :active-path="activeMenuPath"
                    :collapsed="collapsed"
                    :depth="0"
                    :item="menu"
                    :opened-paths="openedMenuPaths"
                    @navigate="navigateMenu"
                    @toggle="toggleMenu"
                />
            </nav>
        </el-scrollbar>
        <div class="layout-sidebar__footer">
            <el-popover
                v-model:visible="userMenuVisible"
                :placement="collapsed ? 'right-end' : 'top-start'"
                popper-class="layout-sidebar__popover"
                trigger="click"
                :teleported="false"
                :width="184"
            >
                <template #reference>
                    <button
                        class="layout-sidebar__user"
                        type="button"
                        :aria-expanded="userMenuVisible"
                        aria-label="打开用户菜单"
                    >
                        <span class="layout-sidebar__user-avatar">
                            <el-icon>
                                <UserFilled />
                            </el-icon>
                            <i aria-hidden="true" />
                        </span>
                        <span v-show="!collapsed" class="layout-sidebar__user-copy">
                            <strong>管理员</strong>
                            <small>系统管理员</small>
                        </span>
                        <el-icon v-show="!collapsed" class="layout-sidebar__user-arrow">
                            <ArrowUpBold />
                        </el-icon>
                    </button>
                </template>

                <div class="layout-sidebar__popover-profile">
                    <strong>管理员</strong>
                    <small>当前登录账号</small>
                </div>
                <div class="layout-sidebar__popover-divider" />
                <div class="layout-sidebar__popover-menu">
                    <button type="button" @click="showProfileMessage">
                        <el-icon>
                            <UserFilled />
                        </el-icon>
                        <span>个人中心</span>
                    </button>
                    <button type="button" @click="confirmLogout">
                        <el-icon>
                            <SwitchButton />
                        </el-icon>
                        <span>退出登录</span>
                    </button>
                </div>
            </el-popover>

            <button
                class="layout-sidebar__collapse"
                type="button"
                :aria-label="collapsed ? '展开侧边栏' : '收起侧边栏'"
                :title="collapsed ? '展开侧边栏' : '收起侧边栏'"
                @click="$emit('toggleCollapse')"
            >
                <el-icon>
                    <ArrowRightBold v-if="collapsed" />
                    <ArrowLeftBold v-else />
                </el-icon>
                <span v-show="!collapsed">收起侧边栏</span>
            </button>
        </div>
    </aside>
</template>

<script setup lang="ts" name="LayoutSidebar">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
    ArrowLeftBold,
    ArrowRightBold,
    ArrowUpBold,
    SwitchButton,
    UserFilled,
} from '@element-plus/icons-vue'

import { useAppStore } from '@/stores/index'
import { APP_NAME, LOGIN_URL } from '@/constants'
import { useLayoutMenus } from '@/hooks'
import store, { useAuthStore } from '@/stores'
import SidebarItem from './components/SidebarItem/index.vue'

defineProps<{
    collapsed: boolean
}>()

defineEmits<{
    toggleCollapse: []
}>()

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore(store)
const { sidebarMenus } = useLayoutMenus(router)
const userMenuVisible = ref(false)

const activeMenuPath = computed(() => {
    return route.matched.at(-1)?.path || route.path
})

const getOpenedMenuPaths = (): string[] => {
    return route.matched
        .map((item) => item.path)
        .filter((path) => path !== '/' && path !== route.path)
}
const openedMenuPaths = ref<string[]>(getOpenedMenuPaths())

const addOpenedMenuPaths = (paths: string[]): void => {
    const nextOpenedPaths = new Set(openedMenuPaths.value)

    paths.forEach((path) => nextOpenedPaths.add(path))

    if (nextOpenedPaths.size !== openedMenuPaths.value.length) {
        openedMenuPaths.value = [...nextOpenedPaths]
    }
}

const toggleMenu = (path: string): void => {
    const nextOpenedPaths = new Set(openedMenuPaths.value)

    if (nextOpenedPaths.has(path)) {
        nextOpenedPaths.delete(path)
    } else {
        nextOpenedPaths.add(path)
    }

    openedMenuPaths.value = [...nextOpenedPaths]
}

const navigateMenu = async (path: string): Promise<void> => {
    if (path !== route.path) {
        await router.push(path)
    }
}

watch(
    () => route.fullPath,
    () => {
        addOpenedMenuPaths(getOpenedMenuPaths())
    },
)

const showProfileMessage = (): void => {
    userMenuVisible.value = false
    ElMessage.info('个人中心页面暂未接入')
}

const confirmLogout = async (): Promise<void> => {
    userMenuVisible.value = false

    try {
        await ElMessageBox.confirm('确认退出登录吗？', '提示', {
            cancelButtonText: '取消',
            confirmButtonText: '确认',
            type: 'warning',
        })
        authStore.clearTokens()
        if (useAppStore().getIsDark) {
            useAppStore().toggleDark()
        }
        await router.replace(LOGIN_URL)
    } catch {
        // 用户取消退出，不做处理。
    }
}
</script>

<style scoped lang="scss">
.layout-sidebar {
    display: grid;
    grid-template-rows: auto minmax(0, 1fr) auto;
    width: $sidebar-width;
    min-height: 100vh;
    overflow: hidden;
    color: var(--sidebar-text);
    background: linear-gradient(180deg, var(--sidebar-bg) 0%, var(--sidebar-bg-secondary) 100%);
    border-right: 1px solid var(--sidebar-border);
    box-shadow: 12px 0 30px var(--layout-shadow);
}

.layout-sidebar--collapsed {
    width: $sidebar-collapse-width;
}

.layout-sidebar__brand {
    display: flex;
    gap: $space-md;
    align-items: center;
    min-height: $sidebar-brand-height;
    padding: 10px $space-sm 8px;
}

.layout-sidebar__brand-mark {
    display: grid;
    flex: 0 0 $sidebar-brand-mark-size;
    width: $sidebar-brand-mark-size;
    height: $sidebar-brand-mark-size;
    font-size: $font-size-md;
    font-weight: $font-weight-bold;
    color: var(--sidebar-brand-text);
    letter-spacing: 0.08em;
    background: var(--sidebar-brand-bg);
    border-radius: $radius-lg;
    place-items: center;
}

.layout-sidebar__brand-copy {
    display: grid;
    gap: $space-xs;
    min-width: 0;
}

.layout-sidebar__brand-copy strong {
    overflow: hidden;
    font-size: $font-size-sm;
    color: var(--sidebar-text);
    text-overflow: ellipsis;
    white-space: nowrap;
}

.layout-sidebar__brand-copy span {
    font-size: $font-size-xs;
    color: var(--sidebar-text-muted);
}

.layout-sidebar__scrollbar {
    min-height: 0;
}

.layout-sidebar__menu {
    display: grid;
    gap: $space-xs;
    padding: $space-xs $space-sm $space-md;
}

.layout-sidebar__footer {
    display: grid;
    gap: $space-xs;
    padding: $space-md $space-sm $space-sm;
    border-top: 1px solid var(--sidebar-border);
}

.layout-sidebar--collapsed .layout-sidebar__footer {
    justify-items: stretch;
    padding-inline: $space-sm;
}

.layout-sidebar__user {
    display: grid;
    grid-template-columns: $sidebar-user-avatar-size minmax(0, 1fr) $font-size-md;
    gap: $space-sm;
    align-items: center;
    width: 100%;
    min-width: 0;
    min-height: calc($sidebar-user-avatar-size + $space-md);
    padding: $space-sm;
    color: var(--sidebar-text);
    cursor: pointer;
    background: var(--sidebar-hover-bg);
    border: 1px solid var(--sidebar-border);
    border-radius: $radius-lg;
    transition:
        background-color $transition-normal ease,
        border-color $transition-normal ease,
        transform $transition-normal ease;
}

.layout-sidebar__user:hover {
    transform: translateY(-1px);
}

.layout-sidebar--collapsed .layout-sidebar__user {
    grid-template-columns: 1fr;
    justify-items: center;
    min-height: calc($sidebar-user-avatar-size + $space-sm);
    padding: $space-xs;
}

.layout-sidebar__user-avatar {
    position: relative;
    display: inline-grid;
    width: $sidebar-user-avatar-size;
    height: $sidebar-user-avatar-size;
    color: var(--sidebar-text);
    background: var(--sidebar-hover-bg);
    border-radius: 50%;
    place-items: center;
}

.layout-sidebar__user-avatar i {
    position: absolute;
    right: 0;
    bottom: 1px;
    width: $space-sm;
    height: $space-sm;
    background: var(--status-success);
    border: 2px solid var(--sidebar-bg-secondary);
    border-radius: 50%;
}

.layout-sidebar__user-copy {
    display: grid;
    gap: $space-xs;
    min-width: 0;
    text-align: left;
}

.layout-sidebar__user-copy strong,
.layout-sidebar__user-copy small {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.layout-sidebar__user-copy strong {
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
}

.layout-sidebar__user-copy small {
    font-size: $font-size-xs;
    color: var(--sidebar-text-muted);
}

.layout-sidebar__user-arrow {
    font-size: $font-size-xs;
    color: var(--sidebar-text-muted);
}

.layout-sidebar__collapse {
    display: grid;
    grid-template-columns: $font-size-lg minmax(0, 1fr);
    gap: $space-sm;
    align-items: center;
    width: 100%;
    height: $control-height-md;
    padding: 0 $space-sm;
    color: var(--sidebar-text-muted);
    text-align: left;
    cursor: pointer;
    background: transparent;
    border: none;
    border-radius: $radius-md;
    transition:
        color $transition-normal ease,
        background-color $transition-normal ease;
}

.layout-sidebar__collapse:hover {
    color: var(--sidebar-text);
    background: var(--sidebar-hover-bg);
}

.layout-sidebar--collapsed .layout-sidebar__collapse {
    grid-template-columns: 1fr;
    justify-items: center;
    padding: 0;
}

.layout-sidebar__popover-profile {
    display: grid;
    gap: $space-xs;
    padding: $space-xs $space-xs $space-sm;
    color: var(--text-primary);
}

.layout-sidebar__popover-profile strong {
    font-size: $font-size-sm;
}

.layout-sidebar__popover-profile small {
    font-size: $font-size-xs;
    color: var(--text-secondary);
}

.layout-sidebar__popover-divider {
    height: 1px;
    margin-bottom: $space-xs;
    background: var(--header-border);
}

:deep(.layout-sidebar__popover.el-popover) {
    --el-popover-bg-color: var(--card-bg);
    --el-popover-border-color: var(--header-border);

    color: var(--text-primary);
    background: var(--card-bg);
    border-color: var(--header-border);
}

:deep(.layout-sidebar__popover .el-popper__arrow::before) {
    background: var(--card-bg);
    border-color: var(--header-border);
}

.layout-sidebar__popover-menu {
    display: grid;
    gap: $space-xs;
}

.layout-sidebar__popover-menu button {
    display: grid;
    grid-template-columns: $font-size-md minmax(0, 1fr);
    gap: $space-sm;
    align-items: center;
    height: $control-height-sm;
    padding: 0 $space-sm;
    color: var(--text-primary);
    text-align: left;
    cursor: pointer;
    background: transparent;
    border: none;
    border-radius: $radius-sm;
}

.layout-sidebar__popover-menu button:hover {
    background: var(--surface-hover-bg);
}
</style>
