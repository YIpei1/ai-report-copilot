<template>
    <div class="layout-default" :class="{ 'layout-default--collapsed': isSidebarCollapsed }">
        <Sidebar :collapsed="isSidebarCollapsed" @toggle-collapse="toggleSidebar" />

        <div class="layout-default__body">
            <TabsNav
                :collapsed="isSidebarCollapsed"
                @refresh-tab="refreshTab"
                @toggle-collapse="toggleSidebar"
            />

            <main class="layout-default__content">
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

const route = useRoute()
const router = useRouter()
const isSidebarCollapsed = ref(false)
const routeCacheVersions = reactive<Record<string, number>>({})

const toggleSidebar = (): void => {
    isSidebarCollapsed.value = !isSidebarCollapsed.value
}

const getRouteCacheKey = (path: string): string => {
    return `${path}:${routeCacheVersions[path] || 0}`
}

const refreshTab = async (path: string): Promise<void> => {
    if (path !== route.path) {
        await router.push(path)
    }
    await nextTick()
    routeCacheVersions[path] = (routeCacheVersions[path] || 0) + 1
}
</script>

<style scoped lang="scss">
.layout-default {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    height: 100vh;
    overflow: hidden;
    background:
        radial-gradient(circle at top left, var(--page-accent-bg), transparent 28%),
        linear-gradient(180deg, var(--page-bg) 0%, var(--page-bg-secondary) 100%);
}

.layout-default__body {
    display: grid;
    grid-template-rows: $header-height minmax(0, 1fr);
    min-width: 0;
    min-height: 0;
}

.layout-default__content {
    box-sizing: border-box;
    min-width: 0;
    min-height: 0;
    padding: $space-lg;
    overflow: auto;
    background-color: var(--page-bg);
}

@media (width <= $breakpoint-tablet) {
    .layout-default {
        grid-template-columns: 1fr;
    }

    .layout-default__content {
        padding: 0 $space-md $space-md;
    }
}
</style>
