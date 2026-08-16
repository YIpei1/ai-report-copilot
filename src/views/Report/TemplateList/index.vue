<template>
    <section class="template-page">
        <header class="template-page__header">
            <div>
                <span>REPORT</span>
                <h1>检测模板</h1>
                <p>用于维护检测模板及其报表组件配置。</p>
            </div>
            <el-button type="primary" @click="createDialogVisible = true">新增模板</el-button>
        </header>

        <!-- 搜索模块 -->
        <el-card class="template-filter-card" shadow="never">
            <SearchFilterCard
                v-model:model="searchData"
                :fields="searchFields"
                :loading="loading"
                @reset="handleReset"
                @search="handleSearch"
            />
        </el-card>

        <!-- 列表和分页模块 -->
        <el-card class="template-card" shadow="never">
            <el-table v-loading="loading" :data="tableData" row-key="id">
                <el-table-column label="模板名称" min-width="240" prop="name" />
                <el-table-column label="模板编号" min-width="180" prop="code" />
                <el-table-column label="版本" width="110" prop="version" />
                <el-table-column label="报表组件" width="120">
                    <template #default="{ row }">{{ row.componentCount }} 个</template>
                </el-table-column>
                <el-table-column label="更新时间" min-width="170" prop="updatedAt" />
                <el-table-column fixed="right" label="操作" width="240">
                    <template #default="{ row }">
                        <el-button
                            link
                            type="primary"
                            @click="handleTemplateAction('configure', row)"
                        >
                            配置组件
                        </el-button>
                        <el-button
                            link
                            type="primary"
                            @click="handleTemplateAction('inspection', row)"
                        >
                            创建检测
                        </el-button>
                        <el-button link type="danger" @click="handleTemplateAction('delete', row)">
                            删除
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>

            <div class="template-pagination">
                <MyPagination
                    v-model:current-page="searchData.page"
                    v-model:page-size="searchData.pageSize"
                    :total="total"
                    @current-change="handlePageChange"
                    @size-change="handlePageSizeChange"
                />
            </div>
        </el-card>

        <CreateTemplate v-model="createDialogVisible" @created="handleTemplateCreated" />
        <ConfigTemplate
            v-model="configDialogVisible"
            :template="selectedTemplate"
            @saved="handleTemplateSaved"
        />
        <CreateInspection v-model="inspectionDialogVisible" :template="selectedTemplate" />
    </section>
</template>

<script setup lang="ts" name="ReportTemplateList">
import { ref } from 'vue'
import {
    deleteInspectionTemplate,
    getInspectionTemplateList,
    type InspectionTemplate,
    type InspectionTemplateItem,
    type InspectionTemplateListParams,
} from '@/api/baseData'
import type { SearchFilterField } from '@/components/SearchFilterCard/types'
import ConfigTemplate from './components/ConfigTemplate/index.vue'
import CreateInspection from './components/CreateInspection/index.vue'
import CreateTemplate from './components/CreateTemplate/index.vue'

type TemplateAction = 'configure' | 'inspection' | 'delete'

const searchFields: SearchFilterField[] = [
    {
        prop: 'keyword',
        label: '关键词',
        type: 'input',
        placeholder: '请输入模板名称或编号',
    },
    {
        prop: 'version',
        label: '版本',
        type: 'input',
        placeholder: '请输入模板版本',
    },
]

// 列表状态。
const loading = ref(false)
const total = ref(0)
const tableData = ref<InspectionTemplateItem[]>([])
const searchData = ref<InspectionTemplateListParams>({
    page: 1,
    pageSize: 10,
    keyword: '',
    version: '',
})

// 弹窗状态和当前操作模板。
const createDialogVisible = ref(false)
const configDialogVisible = ref(false)
const inspectionDialogVisible = ref(false)
const selectedTemplate = ref<InspectionTemplateItem>()

// 根据搜索条件和分页参数加载检测模板列表。
const loadTemplateList = async (): Promise<void> => {
    loading.value = true

    try {
        const response = await getInspectionTemplateList(searchData.value)
        tableData.value = response.data.items
        total.value = response.data.total
    } finally {
        loading.value = false
    }
}

// 搜索时从第一页重新查询。
const handleSearch = (): void => {
    searchData.value.page = 1
    void loadTemplateList()
}

// 重置搜索条件后从第一页重新查询。
const handleReset = (): void => {
    searchData.value.keyword = ''
    searchData.value.version = ''
    searchData.value.page = 1
    void loadTemplateList()
}

// 页码变化时加载对应分页数据。
const handlePageChange = (): void => {
    void loadTemplateList()
}

// 每页数量变化后回到第一页重新查询。
const handlePageSizeChange = (): void => {
    searchData.value.page = 1
    void loadTemplateList()
}

// 统一接收 Element Plus 表格行，并将类型转换限制在表格边界。
const handleTemplateAction = (action: TemplateAction, tableRow: unknown): void => {
    const template = tableRow as InspectionTemplateItem
    selectedTemplate.value = template

    if (action === 'configure') {
        configDialogVisible.value = true
        return
    }

    if (action === 'inspection') {
        inspectionDialogVisible.value = true
        return
    }

    void deleteTemplate(template)
}

// 删除模板前进行二次确认，删除成功后修正分页并刷新列表。
const deleteTemplate = async (template: InspectionTemplateItem): Promise<void> => {
    try {
        await ElMessageBox.confirm(`确认删除检测模板“${template.name}”吗？`, '删除模板', {
            cancelButtonText: '取消',
            confirmButtonText: '删除',
            type: 'warning',
        })
    } catch {
        return
    }

    await deleteInspectionTemplate(template.id)
    ElMessage.success('检测模板删除成功')

    if (tableData.value.length === 1 && searchData.value.page > 1) {
        searchData.value.page -= 1
    }

    await loadTemplateList()
}

// 新模板创建后刷新列表，并直接打开该模板的组件配置弹窗。
const handleTemplateCreated = (template: InspectionTemplate): void => {
    selectedTemplate.value = {
        id: template.id,
        code: template.code,
        name: template.name,
        version: template.version,
        componentCount: template.components.length,
        updatedAt: template.updatedAt,
    }
    configDialogVisible.value = true
    void loadTemplateList()
}

// 组件配置保存后刷新列表中的组件数量和更新时间。
const handleTemplateSaved = (): void => {
    void loadTemplateList()
}

// 页面首次创建时执行一次列表初始化；缓存恢复时不重复请求。
const initializePage = async (): Promise<void> => {
    await loadTemplateList()
}

void initializePage()
</script>

<style scoped lang="scss">
.template-page {
    display: grid;
    gap: $space-lg;
}

.template-page__header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
}

.template-page__header span {
    font-size: $font-size-xs;
    font-weight: $font-weight-bold;
    color: var(--sidebar-active-bg);
    letter-spacing: 0.08em;
}

.template-page__header h1 {
    margin: $space-xs 0;
    font-size: $font-size-xl;
    color: var(--text-primary);
}

.template-page__header p {
    margin: 0;
    font-size: $font-size-sm;
    color: var(--text-secondary);
}

.template-filter-card,
.template-card {
    border-color: var(--header-border);
}

.template-pagination {
    display: flex;
    justify-content: flex-end;
    margin-top: $space-lg;
}
</style>
