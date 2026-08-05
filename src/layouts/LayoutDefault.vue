<template>
    <!-- 后台默认布局：左侧为侧边栏，右侧为页签导航和路由内容区域。 -->
    <div class="layout-default" :class="{ 'layout-default--collapsed': isSidebarCollapsed }">
        <!-- 侧边栏通过事件通知父布局切换展开状态。 -->
        <Sidebar :collapsed="isSidebarCollapsed" @toggle-collapse="toggleSidebar" />

        <div class="layout-default__body">
            <!-- 页签导航负责页面切换，并把刷新页面的请求交给父布局处理。 -->
            <TabsNav
                :collapsed="isSidebarCollapsed"
                @refresh-tab="refreshTab"
                @toggle-collapse="toggleSidebar"
            />

            <main class="layout-default__content">
                <!-- KeepAlive 缓存访问过的页面；动态 key 用于按页签主动刷新组件实例。 -->
                <RouterView v-slot="{ Component, route: routeView }">
                    <KeepAlive :max="20">
                        <component :is="Component" :key="getRouteCacheKey(routeView.path)" />
                    </KeepAlive>
                </RouterView>
            </main>
        </div>
    </div>
</template>

<script setup lang="ts" name="LayoutDefault">
import { nextTick, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Sidebar from './components/Sidebar/index.vue'
import TabsNav from './components/TabsNav/index.vue'

// 当前路由用于判断待刷新的页签是否已经处于激活状态。
const route = useRoute()
const router = useRouter()

// 侧边栏折叠状态由布局统一维护，再通过 Props 传递给子组件。
const isSidebarCollapsed = ref(false)

// 为每个路由维护独立缓存版本；版本递增会改变组件 key 并触发重新创建。
const routeCacheVersions = reactive<Record<string, number>>({})

// 在展开和收起状态之间切换侧边栏。
const toggleSidebar = (): void => {
    isSidebarCollapsed.value = !isSidebarCollapsed.value
}

// 路由路径和缓存版本共同组成组件 key，确保不同页面拥有独立缓存。
const getRouteCacheKey = (path: string): string => {
    return `${path}:${routeCacheVersions[path] || 0}`
}

// 刷新指定页签：先进入目标路由，再递增版本让 Vue 重建对应页面组件。
const refreshTab = async (path: string): Promise<void> => {
    if (path !== route.path) {
        await router.push(path)
    }
    await nextTick()
    routeCacheVersions[path] = (routeCacheVersions[path] || 0) + 1
}
</script>

<style scoped lang="scss">
// 桌面端采用左右两列布局，侧边栏宽度由 Sidebar 自身状态控制。
.layout-default {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    height: 100vh;
    overflow: hidden;
    background:
        radial-gradient(circle at top left, var(--page-accent-bg), transparent 28%),
        linear-gradient(180deg, var(--page-bg) 0%, var(--page-bg-secondary) 100%);
}

// 右侧主体分为固定高度的页签导航和自适应内容区域。
.layout-default__body {
    display: grid;
    grid-template-rows: $header-height minmax(0, 1fr);
    min-width: 0;
    min-height: 0;
}

// 业务页面只在内容区域滚动，避免整个后台布局随页面滚动。
.layout-default__content {
    box-sizing: border-box;
    min-width: 0;
    min-height: 0;
    padding: $space-lg;
    overflow: auto;
    background-color: var(--page-bg);
}

// 平板及更小尺寸下隐藏侧边栏占位，仅保留单列内容布局。
@media (width <= $breakpoint-tablet) {
    .layout-default {
        grid-template-columns: 1fr;
    }

    .layout-default__content {
        padding: 0 $space-md $space-md;
    }
}
</style>
