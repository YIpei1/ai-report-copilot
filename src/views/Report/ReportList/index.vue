<template>
    <section class="report-page">
        <header class="report-page__header">
            <div>
                <span>REPORT CENTER</span>
                <h1>报告管理</h1>
                <p>集中展示由 AI 会话确认或手动创建的检测报告。</p>
            </div>
        </header>

        <el-card class="report-filter-card" shadow="never">
            <SearchFilterCard
                v-model:model="filters"
                :fields="searchFields"
                :loading="loading"
                @reset="handleReset"
                @search="handleSearch"
            />
        </el-card>

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
                <el-table-column fixed="right" label="操作" width="90">
                    <template #default="{ row }">
                        <el-button link type="primary" @click="openReport(row)">编辑</el-button>
                    </template>
                </el-table-column>
            </el-table>

            <div class="report-pagination">
                <MyPagination
                    v-model:current-page="pagination.page"
                    v-model:page-size="pagination.pageSize"
                    :total="total"
                    @current-change="handleCurrentPageChange"
                    @size-change="handlePageSizeChange"
                />
            </div>
        </el-card>
    </section>
</template>

<script setup lang="ts" name="ReportList">
import { computed, onActivated, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { getInspectionTemplateList } from '@/api/baseData'
import {
    getInspectionReportList,
    type InspectionReportSummary,
    type ReportSource,
    type ReportStatus,
} from '@/api/report'
import type { SearchFilterField, SearchFilterOption } from '@/components/SearchFilterCard/types'

const router = useRouter()

type ReportFilters = {
    keyword: string
    source: ReportSource | ''
    status: ReportStatus | ''
    createdBy: string
    createdAtStart: string
    createdAtEnd: string
    templateName: string
}

const createEmptyFilters = (): ReportFilters => ({
    keyword: '',
    source: '',
    status: '',
    createdBy: '',
    createdAtStart: '',
    createdAtEnd: '',
    templateName: '',
})

const loading = ref(false)
const reports = ref<InspectionReportSummary[]>([])
const total = ref(0)
const filters = ref<ReportFilters>(createEmptyFilters())
const templateOptions = ref<SearchFilterOption[]>([])
const pagination = reactive({
    page: 1,
    pageSize: 10,
})

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

// 报告管理搜索项统一交由 SearchFilterCard 生成和布局。
const searchFields = computed<SearchFilterField[]>(() => [
    {
        prop: 'keyword',
        label: '关键词',
        type: 'input',
        placeholder: '报告名称、编号或检测设备',
    },
    {
        prop: 'source',
        label: '创建方式',
        type: 'select',
        placeholder: '全部方式',
        options: [
            { label: 'AI 创建', value: 'ai' },
            { label: '手动创建', value: 'manual' },
        ],
    },
    {
        prop: 'status',
        label: '报告状态',
        type: 'select',
        placeholder: '全部状态',
        options: [
            { label: '草稿', value: 'draft' },
            { label: '待审核', value: 'pending_review' },
            { label: '已通过', value: 'approved' },
            { label: '已驳回', value: 'rejected' },
        ],
    },
    {
        prop: 'createdBy',
        label: '创建人员',
        type: 'input',
        placeholder: '请输入创建人员',
    },
    {
        prop: 'createdAtRange',
        label: '创建时间',
        type: 'datetime-range',
        startProp: 'createdAtStart',
        endProp: 'createdAtEnd',
        startPlaceholder: '开始时间',
        endPlaceholder: '结束时间',
        valueFormat: 'YYYY-MM-DD HH:mm:ss',
        col: { xs: 24, sm: 24, md: 16, lg: 12, xl: 12 },
    },
    {
        prop: 'templateName',
        label: '检测模板',
        type: 'select',
        placeholder: '全部模板',
        options: templateOptions.value,
    },
])

const getStatusText = (status: ReportStatus): string => statusTextMap[status]

const getStatusType = (status: ReportStatus): 'danger' | 'info' | 'success' | 'warning' => {
    return statusTypeMap[status]
}

// 加载检测模板作为报告筛选项。
const loadTemplateOptions = async (): Promise<void> => {
    const response = await getInspectionTemplateList({
        keyword: '',
        version: '',
        page: 1,
        pageSize: 100,
    })
    templateOptions.value = response.data.items.map((template) => ({
        label: template.name,
        value: template.name,
    }))
}

const loadReports = async (): Promise<void> => {
    loading.value = true
    try {
        const response = await getInspectionReportList({
            ...filters.value,
            page: pagination.page,
            pageSize: pagination.pageSize,
        })
        reports.value = response.data.items
        total.value = response.data.total
    } finally {
        loading.value = false
    }
}

const handleSearch = (): void => {
    pagination.page = 1
    void loadReports()
}

const handleReset = (): void => {
    filters.value = createEmptyFilters()
    pagination.page = 1
    void loadReports()
}

const handleCurrentPageChange = (): void => {
    void loadReports()
}

const handlePageSizeChange = (): void => {
    pagination.page = 1
    void loadReports()
}

// 从报告编辑页返回时打开已保存的报告快照，不再重新组合基础数据。
const openReport = (tableRow: unknown): void => {
    const report = tableRow as InspectionReportSummary

    void router.push({
        name: 'ReportEdit',
        params: { reportId: report.id },
    })
}

// 报告管理被 KeepAlive 缓存，重新进入时刷新刚保存的报告数据。
onActivated(() => {
    void loadReports()
    void loadTemplateOptions()
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

.report-filter-card,
.report-card {
    border-color: var(--header-border);
}

.report-pagination {
    display: flex;
    justify-content: flex-end;
    margin-top: $space-lg;
}
</style>
