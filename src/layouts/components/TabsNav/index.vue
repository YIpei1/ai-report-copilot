<template>
    <div class="tabs-page">
        <!-- 页签功能待重新实现。 -->
        <div class="tabs-scroll-shell">
            <button class="tabs-scroll-button" disabled type="button" aria-label="向左滚动标签">
                <el-icon>
                    <ArrowLeft />
                </el-icon>
            </button>

            <nav class="tabs-nav" aria-label="页面标签">
                <button
                    v-for="item in visitedTabs"
                    :key="item.path"
                    class="tabs-nav__item"
                    :class="{ 'tabs-nav__item--active': item.path === activePath }"
                    type="button"
                    @click="activeTabsNavItem(item.path)"
                >
                    <span class="tabs-nav__title">{{ item.title }}</span>
                    <el-icon
                        v-if="item.path !== dashboardPath"
                        class="tabs-nav__close"
                        @click.stop="closeTabsNavItem(item.path)"
                    >
                        <Close />
                    </el-icon>
                </button>
            </nav>

            <button class="tabs-scroll-button" disabled type="button" aria-label="向右滚动标签">
                <el-icon>
                    <ArrowRight />
                </el-icon>
            </button>
        </div>

        <!-- 明暗主题切换。 -->
        <div class="tabs-right">
            <button
                class="theme-toggle"
                :class="{ 'is-dark': isDark }"
                type="button"
                :aria-label="isDark ? '切换为浅色模式' : '切换为暗色模式'"
                :aria-pressed="isDark"
                @click="toggleTheme"
            >
                <span class="theme-toggle__icon theme-toggle__icon--sun">
                    <el-icon>
                        <Sunny />
                    </el-icon>
                </span>
                <span class="theme-toggle__icon theme-toggle__icon--moon">
                    <el-icon>
                        <Moon />
                    </el-icon>
                </span>
                <span class="theme-toggle__thumb">
                    <el-icon class="theme-toggle__thumb-icon">
                        <component :is="isDark ? Moon : Sunny" />
                    </el-icon>
                </span>
            </button>
        </div>
    </div>
</template>

<script setup lang="ts" name="TabsNav">
import { ArrowLeft, ArrowRight, Close, Moon, Sunny } from '@element-plus/icons-vue'
import { useAppStore } from '@/stores/modules/app'
import { useTabsNavStore } from '@/stores/modules/tabsNav'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const tabsNavStore = useTabsNavStore()
const { isDark } = storeToRefs(appStore)
const { visitedTabs, activePath } = storeToRefs(tabsNavStore)
const dashboardPath = tabsNavStore.dashboardPath

const activeTabsNavItem = async (path: string) => {
    if (route.path === path) {
        return
    }
    await router.push(path)
}

// 切换明暗主题，主题状态和本地缓存由 useDark 统一维护。
const toggleTheme = (): void => {
    appStore.toggleDark()
}

const closeTabsNavItem = async (path: string): Promise<void> => {
    if (path === dashboardPath) {
        return
    }

    const tabIndex = visitedTabs.value.findIndex((item) => item.path === path)

    if (tabIndex === -1) {
        return
    }

    const isActiveTab = path === activePath.value

    const nextTab = visitedTabs.value[tabIndex + 1] || visitedTabs.value[tabIndex - 1]

    tabsNavStore.removeVisitedTab(path)

    if (isActiveTab && nextTab) {
        await router.push(nextTab.path)
    }
}
</script>

<style scoped lang="scss">
.tabs-page {
    display: flex;
    justify-content: space-between;
    min-width: 0;
}

.tabs-scroll-shell {
    display: grid;
    grid-template-columns: $tabs-scroll-button-width minmax(0, 1fr) $tabs-scroll-button-width;
    flex: 1;
    min-width: 0;
    background: var(--header-bg);
    border-bottom: 1px solid var(--header-border);
}

.tabs-scroll-button {
    display: grid;
    width: $tabs-scroll-button-width;
    height: $header-height;
    color: var(--text-secondary);
    cursor: pointer;
    background: var(--header-bg);
    border: none;
    place-items: center;
}

.tabs-scroll-button:hover:not(:disabled) {
    color: var(--header-text);
    background: var(--surface-hover-bg);
}

.tabs-scroll-button:disabled {
    color: var(--text-disabled);
    cursor: default;
    opacity: 0.45;
}

.tabs-right {
    height: 100%;
    padding-right: $space-lg;
    display: flex;
    align-items: center;
    background-color: var(--header-bg);
    border-bottom: 1px solid var(--header-border);
}

.tabs-nav {
    display: flex;
    align-items: flex-end;
    height: $header-height;
    min-width: 0;
    padding: 0 $space-sm;
    overflow: auto hidden;
    background: var(--header-bg);
    scroll-behavior: smooth;
    scrollbar-width: none;
}

.tabs-nav::-webkit-scrollbar {
    display: none;
}

.tabs-nav__item {
    display: inline-flex;
    flex: 0 0 $tabs-item-width;
    gap: $space-sm;
    align-items: center;
    justify-content: center;
    height: $tabs-item-height;
    padding: 0 $space-md;
    margin: 0 0 0 -1px;
    font-size: $font-size-xs;
    color: var(--text-secondary);
    cursor: pointer;
    background: var(--header-item-bg);
    border: 1px solid var(--header-border);
    border-bottom: 0;
    border-top-left-radius: $radius-md;
    border-top-right-radius: $radius-md;
    outline: none;
}

.tabs-nav__item:first-child {
    margin-left: 0;
}

.tabs-nav__item:hover {
    color: var(--header-text);
    background: var(--surface-hover-bg);
}

.tabs-nav__item--active {
    position: relative;
    z-index: 1;
    height: $control-height-sm;
    font-weight: 600;
    color: var(--header-text);
    background: var(--surface-hover-bg);
    border-bottom-color: var(--surface-hover-bg);
}

.tabs-nav__title {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.tabs-nav__close {
    display: inline-grid;
    flex: 0 0 $font-size-md;
    width: $font-size-md;
    height: $font-size-md;
    font-size: $font-size-xs;
    color: var(--tabs-close-text);
    cursor: pointer;
    border-radius: 50%;
    opacity: 0.8;
    place-items: center;
    transition:
        color $transition-fast ease,
        background-color $transition-fast ease,
        opacity $transition-fast ease;
}

.tabs-nav__item--active .tabs-nav__close {
    color: var(--header-text);
}

.tabs-nav__close:hover {
    color: var(--header-text);
    background: var(--surface-hover-bg);
    opacity: 1;
}

.tabs-nav-context-menu {
    position: fixed;
    z-index: $z-dropdown;
    display: grid;
    width: $tabs-context-menu-width;
    padding: $space-xs;
    background: var(--header-item-bg);
    border: 1px solid var(--header-border);
    border-radius: $radius-sm;
    box-shadow: 0 8px 24px var(--layout-shadow);
}

.tabs-nav-context-menu button {
    height: $control-height-sm;
    padding: 0 $space-sm;
    font-size: $font-size-xs;
    color: var(--text-secondary);
    text-align: left;
    cursor: pointer;
    background: transparent;
    border: none;
    border-radius: $radius-sm;
}

.tabs-nav-context-menu button:hover:not(:disabled) {
    background: var(--surface-hover-bg);
}

.tabs-nav-context-menu button:disabled {
    color: var(--text-disabled);
    cursor: not-allowed;
}

.theme-toggle {
    width: $theme-toggle-width;
    height: $theme-toggle-height;
    border: 1px solid var(--header-border);
    border-radius: $theme-toggle-height;
    background: var(--surface-hover-bg);
    display: grid;
    grid-template-columns: 1fr 1fr;
    align-items: center;
    position: relative;
    padding: 0 3px;
    cursor: pointer;
    transition:
        background-color $transition-normal ease,
        border-color $transition-normal ease;
}

.theme-toggle__icon {
    z-index: 1;
    display: grid;
    place-items: center;
    font-size: $font-size-xs;
    color: var(--icon-muted);
}

.theme-toggle__thumb {
    width: $theme-toggle-thumb-size;
    height: $theme-toggle-thumb-size;
    border-radius: 50%;
    background: var(--theme-toggle-thumb-bg);
    box-shadow: 0 1px 2px var(--theme-toggle-thumb-shadow);
    display: grid;
    place-items: center;
    position: absolute;
    left: 3px;
    top: 2px;
    transition:
        transform $transition-normal ease,
        background-color $transition-normal ease;
}

.theme-toggle__thumb-icon {
    font-size: $font-size-xs;
    color: var(--theme-toggle-thumb-text);
}

.theme-toggle.is-dark {
    background: var(--surface-hover-bg);
    border-color: var(--surface-hover-bg);
}

.theme-toggle.is-dark .theme-toggle__icon {
    color: var(--icon-muted);
}

.theme-toggle.is-dark .theme-toggle__thumb {
    transform: translateX(20px);
    background: var(--theme-toggle-thumb-bg);
}

.theme-toggle.is-dark .theme-toggle__thumb-icon {
    color: var(--theme-toggle-thumb-text);
}
</style>
