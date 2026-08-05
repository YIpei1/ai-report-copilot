import { defineStore } from 'pinia'
import { ref } from 'vue'

// 工作台作为固定页签，始终保留且不允许关闭。
export interface VisitedTab {
    path: string
    title: string
}

export const useTabsNavStore = defineStore(
    'tabsNav',
    () => {
        const dashboardPath = '/dashboard'
        // 页签数组
        const visitedTabs = ref<VisitedTab[]>([
            {
                path: dashboardPath,
                title: '工作台',
            },
        ])
        const activePath = ref<string>(dashboardPath)

        function addVisitedTab(tab: VisitedTab) {
            // 判断是否存在，存在就不要重复添加。
            if (!visitedTabs.value.some((item) => item.path === tab.path)) {
                visitedTabs.value.push(tab)
            }
            setActivePath(tab.path)
        }

        function setActivePath(path: string) {
            activePath.value = path
        }

        // 删除指定页签，工作台作为固定页签不参与删除。
        function removeVisitedTab(path: string) {
            if (path === dashboardPath) {
                return
            }

            const tabIndex = visitedTabs.value.findIndex((item) => item.path === path)

            if (tabIndex !== -1) {
                visitedTabs.value.splice(tabIndex, 1)
            }
        }

        return {
            visitedTabs,
            dashboardPath,
            activePath,
            addVisitedTab,
            setActivePath,
            removeVisitedTab,
        }
    },
    {
        persist: true,
    },
)
