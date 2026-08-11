<template>
    <section class="dashboard-page">
        <header class="dashboard-page__header">
            <span>WORKBENCH</span>
            <h1>工作台</h1>
            <p>查看项目开发入口和本地演示数据维护工具。</p>
        </header>

        <el-card v-if="isMockEnabled" class="dashboard-page__card" shadow="never">
            <div class="dashboard-page__database">
                <div>
                    <h2>IndexedDB 演示数据</h2>
                    <p>清空当前浏览器中维护的数据，并恢复项目预设的仪器、工具箱和报表组件。</p>
                </div>
                <el-button :loading="resettingDatabase" plain type="danger" @click="resetDatabase">
                    恢复初始化数据
                </el-button>
            </div>
        </el-card>
    </section>
</template>

<script setup lang="ts" name="DashboardView">
import { ref } from 'vue'

// IndexedDB 重置入口只在启用了 MSW 的开发环境中展示。
const isMockEnabled = import.meta.env.DEV && import.meta.env.VITE_ENABLE_MOCK === 'true'
const resettingDatabase = ref(false)

const resetDatabase = async (): Promise<void> => {
    try {
        await ElMessageBox.confirm(
            '该操作会清空当前浏览器中自行创建的设备、模板和报告数据，是否继续？',
            '恢复初始化数据',
            {
                cancelButtonText: '取消',
                confirmButtonText: '确认恢复',
                type: 'warning',
            },
        )
    } catch {
        return
    }

    resettingDatabase.value = true

    try {
        const { resetMockDatabase } = await import('@/mocks/database')
        await resetMockDatabase()
        ElMessage.success('IndexedDB 数据已恢复为初始状态')
    } finally {
        resettingDatabase.value = false
    }
}
</script>

<style scoped lang="scss">
.dashboard-page {
    display: grid;
    gap: $space-lg;

    &__header {
        span {
            color: var(--sidebar-active-bg);
            font-size: $font-size-xs;
            font-weight: $font-weight-bold;
            letter-spacing: 0.08em;
        }

        h1 {
            margin: $space-xs 0;
            color: var(--text-primary);
            font-size: $font-size-xl;
        }

        p {
            margin: 0;
            color: var(--text-secondary);
            font-size: $font-size-sm;
        }
    }

    &__card {
        border-color: var(--header-border);
    }

    &__database {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: $space-lg;

        h2 {
            margin: 0 0 $space-xs;
            color: var(--text-primary);
            font-size: $font-size-md;
        }

        p {
            margin: 0;
            color: var(--text-secondary);
            font-size: $font-size-sm;
        }
    }
}

@media (width <= 720px) {
    .dashboard-page__database {
        align-items: flex-start;
        flex-direction: column;
    }
}
</style>
