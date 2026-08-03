<template>
    <div class="tabs-page">
        <div class="tabs-scroll-shell">
            <button
                class="tabs-scroll-button"
                :disabled="!canScrollLeft"
                type="button"
                aria-label="向左滚动标签"
                @click="scrollTabs('left')"
            >
                <el-icon>
                    <ArrowLeft />
                </el-icon>
            </button>

            <nav
                ref="tabsNavRef"
                class="tabs-nav"
                aria-label="页面标签"
                @click="hideContextMenu"
                @scroll="updateScrollState"
            >
                <button
                    v-for="tab in visitedTabs"
                    :key="tab.path"
                    :class="{ 'tabs-nav__item--active': tab.path === activeTabPath }"
                    class="tabs-nav__item"
                    type="button"
                    :data-tab-path="tab.path"
                    @click="goTab(tab.path)"
                    @contextmenu.prevent="showContextMenu($event, tab)"
                >
                    <span class="tabs-nav__title">{{ tab.title }}</span>
                    <el-icon
                        v-if="tab.path !== dashboardPath"
                        class="tabs-nav__close"
                        @click.stop="closeTab(tab.path)"
                    >
                        <Close />
                    </el-icon>
                </button>

                <Teleport to="body">
                    <div
                        v-if="contextMenu.visible"
                        class="tabs-nav-context-menu"
                        :style="contextMenuStyle"
                        @click.stop
                    >
                        <button type="button" @click="refreshContextTab">刷新当前</button>
                        <button
                            type="button"
                            :disabled="contextMenu.targetPath === dashboardPath"
                            @click="closeContextTab"
                        >
                            关闭当前
                        </button>
                        <button type="button" @click="closeOtherTabs">关闭其他</button>
                        <button type="button" @click="closeLeftTabs">关闭左侧</button>
                        <button type="button" @click="closeRightTabs">关闭右侧</button>
                        <button type="button" @click="closeAllTabs">关闭全部</button>
                    </div>
                </Teleport>
            </nav>

            <button
                class="tabs-scroll-button"
                :disabled="!canScrollRight"
                type="button"
                aria-label="向右滚动标签"
                @click="scrollTabs('right')"
            >
                <el-icon>
                    <ArrowRight />
                </el-icon>
            </button>
        </div>
        <div class="tabs-right">
            <button
                class="theme-toggle"
                :class="{ 'is-dark': appStore.getIsDark }"
                aria-label="Toggle theme"
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
                        <component :is="appStore.getIsDark ? Moon : Sunny" />
                    </el-icon>
                </span>
            </button>
        </div>
    </div>
</template>

<script setup lang="ts" name="TabsNav">
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter, type RouteLocationNormalizedLoaded } from 'vue-router'
import { APP_NAME, HOME_URL } from '@/constants'
import { useAppStore } from '@/stores/modules/app'
import { ArrowLeft, ArrowRight, Close, Moon, Sunny } from '@element-plus/icons-vue'
interface VisitedTab {
    path: string
    title: string
}

defineProps<{
    collapsed: boolean
}>()

const emit = defineEmits<{
    refreshTab: [path: string]
    toggleCollapse: []
}>()
const appStore = useAppStore()
const route = useRoute()
const router = useRouter()
const dashboardPath = '/dashboard'
const tabsNavRef = ref<HTMLElement>()
const canScrollLeft = ref(false)
const canScrollRight = ref(false)
const visitedTabs = ref<VisitedTab[]>([
    {
        path: dashboardPath,
        title: '工作台',
    },
])
const contextMenu = reactive({
    left: 0,
    targetPath: '',
    top: 0,
    visible: false,
})

const activeTabPath = computed(() => {
    return route.path === HOME_URL ? dashboardPath : route.path
})

const getRouteTitle = (targetRoute: RouteLocationNormalizedLoaded): string => {
    const title = targetRoute.meta.title
    return typeof title === 'string' && title ? title : APP_NAME
}

const contextMenuStyle = computed(() => ({
    left: `${contextMenu.left}px`,
    top: `${contextMenu.top}px`,
}))

const updateScrollState = (): void => {
    const tabsNav = tabsNavRef.value

    if (!tabsNav) return

    const maxScrollLeft = tabsNav.scrollWidth - tabsNav.clientWidth

    canScrollLeft.value = tabsNav.scrollLeft > 1
    canScrollRight.value = tabsNav.scrollLeft < maxScrollLeft - 1
}

const scrollTabs = (direction: 'left' | 'right'): void => {
    const tabsNav = tabsNavRef.value

    if (!tabsNav) return

    tabsNav.scrollBy({
        behavior: 'smooth',
        left: direction === 'left' ? -tabsNav.clientWidth * 0.8 : tabsNav.clientWidth * 0.8,
    })
}

const scrollActiveTabIntoView = async (): Promise<void> => {
    await nextTick()

    const tabsNav = tabsNavRef.value
    const activeTab = tabsNav?.querySelector<HTMLElement>(
        `[data-tab-path="${CSS.escape(activeTabPath.value)}"]`,
    )

    activeTab?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest',
    })

    requestAnimationFrame(updateScrollState)
}

/**
 * 切换主题
 */
const toggleTheme = () => {
    appStore.toggleDark()
}

const addVisitedTab = (targetRoute: RouteLocationNormalizedLoaded): void => {
    if (targetRoute.meta.isTabsNav) {
        return
    }

    const nextPath = targetRoute.path === HOME_URL ? dashboardPath : targetRoute.path

    if (visitedTabs.value.some((tab) => tab.path === nextPath)) {
        return
    }

    visitedTabs.value.push({
        path: nextPath,
        title: getRouteTitle(targetRoute),
    })
}

const goTab = async (path: string): Promise<void> => {
    if (path !== activeTabPath.value) {
        await router.push(path)
    }
}

const closeTab = async (path: string): Promise<void> => {
    const tabIndex = visitedTabs.value.findIndex((tab) => tab.path === path)

    if (tabIndex === -1 || path === dashboardPath) {
        return
    }

    visitedTabs.value.splice(tabIndex, 1)

    if (path === activeTabPath.value) {
        const nextTab = visitedTabs.value[tabIndex] || visitedTabs.value.at(-1)
        await router.push(nextTab?.path || HOME_URL)
    }
}

const normalizeTabs = (tabs: VisitedTab[]): VisitedTab[] => {
    const dashboardTab = visitedTabs.value.find((tab) => tab.path === dashboardPath) || {
        path: dashboardPath,
        title: '工作台',
    }
    const nextTabs = tabs.filter((tab) => tab.path !== dashboardPath)

    return [dashboardTab, ...nextTabs]
}

const ensureActiveTabVisible = async (): Promise<void> => {
    if (!visitedTabs.value.some((tab) => tab.path === activeTabPath.value)) {
        await router.push(dashboardPath)
    }
}

const hideContextMenu = (): void => {
    contextMenu.visible = false
}

const showContextMenu = (event: MouseEvent, tab: VisitedTab): void => {
    contextMenu.targetPath = tab.path
    contextMenu.left = event.clientX
    contextMenu.top = event.clientY
    contextMenu.visible = true
}

const closeContextTab = async (): Promise<void> => {
    const targetPath = contextMenu.targetPath
    hideContextMenu()
    await closeTab(targetPath)
}

const refreshContextTab = (): void => {
    const targetPath = contextMenu.targetPath
    hideContextMenu()
    emit('refreshTab', targetPath)
}

const closeOtherTabs = async (): Promise<void> => {
    const targetPath = contextMenu.targetPath
    visitedTabs.value = normalizeTabs(visitedTabs.value.filter((tab) => tab.path === targetPath))
    hideContextMenu()

    if (activeTabPath.value !== targetPath) {
        await router.push(targetPath)
    }
}

const closeLeftTabs = async (): Promise<void> => {
    const targetIndex = visitedTabs.value.findIndex((tab) => tab.path === contextMenu.targetPath)

    if (targetIndex > -1) {
        visitedTabs.value = normalizeTabs(visitedTabs.value.slice(targetIndex))
    }

    hideContextMenu()
    await ensureActiveTabVisible()
}

const closeRightTabs = async (): Promise<void> => {
    const targetIndex = visitedTabs.value.findIndex((tab) => tab.path === contextMenu.targetPath)

    if (targetIndex > -1) {
        visitedTabs.value = normalizeTabs(visitedTabs.value.slice(0, targetIndex + 1))
    }

    hideContextMenu()
    await ensureActiveTabVisible()
}

const closeAllTabs = async (): Promise<void> => {
    visitedTabs.value = normalizeTabs([])
    hideContextMenu()

    if (activeTabPath.value !== dashboardPath) {
        await router.push(dashboardPath)
    }
}

watch(
    () => route.fullPath,
    () => {
        addVisitedTab(route)
        void scrollActiveTabIntoView()
    },
    { immediate: true },
)

watch(
    () => visitedTabs.value.length,
    () => {
        void scrollActiveTabIntoView()
    },
)

window.addEventListener('click', hideContextMenu)
window.addEventListener('scroll', hideContextMenu, true)
window.addEventListener('resize', updateScrollState)

onMounted(() => {
    void scrollActiveTabIntoView()
})

onBeforeUnmount(() => {
    window.removeEventListener('click', hideContextMenu)
    window.removeEventListener('scroll', hideContextMenu, true)
    window.removeEventListener('resize', updateScrollState)
})
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
    font-size: $font-size-sm;
    color: var(--text-secondary);
    cursor: pointer;
    border-radius: 50%;
    place-items: center;
    transition:
        color $transition-fast ease,
        background-color $transition-fast ease;
}

.tabs-nav__item--active .tabs-nav__close {
    color: var(--header-text);
}

.tabs-nav__close:hover {
    color: var(--header-text);
    background: var(--header-border);
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
