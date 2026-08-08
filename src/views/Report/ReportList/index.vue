<template>
    <section class="report-page">
        <header class="report-page__header">
            <div>
                <span>REPORT CENTER</span>
                <h1>报告管理</h1>
                <p>集中展示由 AI 会话确认或手动创建的检测报告。</p>
            </div>
        </header>

        <el-card class="report-card" shadow="never">
            <el-table v-loading="loading" :data="reports" row-key="id">
                <el-table-column label="报告编号" min-width="140" prop="reportCode" />
                <el-table-column label="报告名称" min-width="250" prop="reportName" />
                <el-table-column label="检测设备" min-width="180" prop="deviceName" />
                <el-table-column label="使用单位" min-width="190" prop="userOrganization" />
                <el-table-column label="检测模板" min-width="250" prop="templateName" />
                <el-table-column label="创建方式" width="100">
                    <template #default="{ row }">
                        <el-tag effect="plain" :type="row.source === 'ai' ? 'primary' : 'info'">
                            {{ row.source === 'ai' ? 'AI 创建' : '手动创建' }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="报告状态" width="100">
                    <template #default="{ row }">
                        <el-tag :type="getStatusType(row.status)">
                            {{ getStatusText(row.status) }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="创建人员" width="110" prop="createdBy" />
                <el-table-column label="创建时间" width="170" prop="createdAt" />
            </el-table>
        </el-card>
    </section>
</template>

<script setup lang="ts" name="ReportList">
import { onMounted, ref } from 'vue'
import {
    getInspectionReportList,
    type InspectionReportSummary,
    type ReportStatus,
} from '@/api/report'

const loading = ref(false)
const reports = ref<InspectionReportSummary[]>([])

const statusTextMap: Record<ReportStatus, string> = {
    draft: '草稿',
    pending_review: '待审核',
    approved: '已通过',
    rejected: '已驳回',
}

const statusTypeMap: Record<ReportStatus, 'danger' | 'info' | 'success' | 'warning'> = {
    draft: 'info',
    pending_review: 'warning',
    approved: 'success',
    rejected: 'danger',
}

const getStatusText = (status: ReportStatus): string => statusTextMap[status]

const getStatusType = (status: ReportStatus): 'danger' | 'info' | 'success' | 'warning' => {
    return statusTypeMap[status]
}

const loadReports = async (): Promise<void> => {
    loading.value = true
    try {
        const response = await getInspectionReportList()
        reports.value = response.data
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    void loadReports()
})
</script>

<style scoped lang="scss">
.report-page {
    display: grid;
    gap: $space-lg;
}

.report-page__header span {
    font-size: $font-size-xs;
    font-weight: $font-weight-bold;
    color: var(--sidebar-active-bg);
    letter-spacing: 0.08em;
}

.report-page__header h1 {
    margin: $space-xs 0;
    font-size: $font-size-xl;
    color: var(--text-primary);
}

.report-page__header p {
    margin: 0;
    font-size: $font-size-sm;
    color: var(--text-secondary);
}

.report-card {
    border-color: var(--header-border);
}
</style>
