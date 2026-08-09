<template>
    <section class="base-data-page">
        <header class="base-data-page__header">
            <div>
                <span>BASE DATA</span>
                <h1>工具箱</h1>
                <p>组合仪器设备，创建检测任务时可一次选择整套检测工具。</p>
            </div>
            <el-button type="primary" @click="openCreateDialog">新增工具箱</el-button>
        </header>

        <el-card class="base-data-filter-card" shadow="never">
            <SearchFilterCard
                v-model:model="filters"
                :fields="searchFields"
                :loading="loading"
                @reset="handleReset"
                @search="handleSearch"
            />
        </el-card>

        <el-card class="base-data-card" shadow="never">
            <el-table v-loading="loading" :data="toolboxes" row-key="id">
                <el-table-column label="工具箱名称" min-width="190" prop="name" />
                <el-table-column label="工具箱编号" width="130" prop="code" />
                <el-table-column label="适用检测类型" min-width="190" prop="applicableType" />
                <el-table-column label="仪器设备" min-width="260">
                    <template #default="{ row }">
                        <el-tag
                            v-for="instrumentName in getInstrumentNames(row.instrumentIds)"
                            :key="instrumentName"
                            class="instrument-tag"
                            effect="plain"
                        >
                            {{ instrumentName }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="备注" min-width="180" prop="remark" show-overflow-tooltip />
                <el-table-column label="状态" width="90">
                    <template #default="{ row }">
                        <el-tag :type="row.status === 'enabled' ? 'success' : 'info'">
                            {{ row.status === 'enabled' ? '启用' : '停用' }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column fixed="right" label="操作" width="140">
                    <template #default="{ row }">
                        <el-button link type="primary" @click="openEditDialog(row)">编辑</el-button>
                        <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>

            <div class="base-data-pagination">
                <MyPagination
                    v-model:current-page="pagination.page"
                    v-model:page-size="pagination.pageSize"
                    :total="total"
                    @current-change="handleCurrentPageChange"
                    @size-change="handlePageSizeChange"
                />
            </div>
        </el-card>

        <el-dialog
            v-model="dialogVisible"
            destroy-on-close
            :title="editingId ? '编辑工具箱' : '新增工具箱'"
            width="660px"
        >
            <el-form :model="toolboxForm" label-width="110px">
                <el-form-item label="工具箱名称" required>
                    <el-input v-model="toolboxForm.name" />
                </el-form-item>
                <el-form-item label="工具箱编号" required>
                    <el-input v-model="toolboxForm.code" />
                </el-form-item>
                <el-form-item label="适用检测类型" required>
                    <el-input v-model="toolboxForm.applicableType" />
                </el-form-item>
                <el-form-item label="包含仪器" required>
                    <el-select
                        v-model="toolboxForm.instrumentIds"
                        collapse-tags
                        collapse-tags-tooltip
                        filterable
                        multiple
                        placeholder="请选择仪器设备"
                    >
                        <el-option
                            v-for="instrument in availableInstruments"
                            :key="instrument.id"
                            :label="`${instrument.name}（${instrument.code}）`"
                            :value="instrument.id"
                        />
                    </el-select>
                </el-form-item>
                <el-form-item label="状态">
                    <el-radio-group v-model="toolboxForm.status">
                        <el-radio value="enabled">启用</el-radio>
                        <el-radio value="disabled">停用</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="备注">
                    <el-input v-model="toolboxForm.remark" :rows="3" type="textarea" />
                </el-form-item>
            </el-form>

            <template #footer>
                <el-button @click="dialogVisible = false">取消</el-button>
                <el-button :loading="submitting" type="primary" @click="submitToolbox">
                    保存
                </el-button>
            </template>
        </el-dialog>
    </section>
</template>

<script setup lang="ts" name="ToolboxList">
import { computed, onMounted, reactive, ref } from 'vue'
import {
    createToolbox,
    deleteToolbox,
    getInstrumentOptions,
    getToolboxList,
    updateToolbox,
    type DataStatus,
    type Instrument,
    type Toolbox,
    type ToolboxFormParams,
} from '@/api/baseData'
import type { SearchFilterField } from '@/components/SearchFilterCard/types'

type ToolboxFilters = {
    keyword: string
    status: DataStatus | ''
    remark: string
}

const createEmptyFilters = (): ToolboxFilters => ({
    keyword: '',
    status: '',
    remark: '',
})

// 工具箱搜索项统一配置名称或编号、状态和备注。
const searchFields: SearchFilterField[] = [
    {
        prop: 'keyword',
        label: '关键词',
        type: 'input',
        placeholder: '工具箱名称或编号',
    },
    {
        prop: 'status',
        label: '状态',
        type: 'select',
        placeholder: '全部状态',
        options: [
            { label: '启用', value: 'enabled' },
            { label: '停用', value: 'disabled' },
        ],
    },
    {
        prop: 'remark',
        label: '备注',
        type: 'input',
        placeholder: '请输入备注内容',
    },
]

const createEmptyForm = (): ToolboxFormParams => ({
    code: '',
    name: '',
    applicableType: '曳引驱动电梯自行检测',
    instrumentIds: [],
    status: 'enabled',
    remark: '',
})

const loading = ref(false)
const submitting = ref(false)
const dialogVisible = ref(false)
const editingId = ref('')
const filters = ref<ToolboxFilters>(createEmptyFilters())
const instruments = ref<Instrument[]>([])
const toolboxes = ref<Toolbox[]>([])
const total = ref(0)
const pagination = reactive({
    page: 1,
    pageSize: 10,
})
const toolboxForm = reactive<ToolboxFormParams>(createEmptyForm())

const availableInstruments = computed(() => {
    return instruments.value.filter((instrument) => instrument.status === 'available')
})

const getInstrumentNames = (instrumentIds: string[]): string[] => {
    return instrumentIds.map((id) => instruments.value.find((item) => item.id === id)?.name || id)
}

const loadToolboxes = async (): Promise<void> => {
    loading.value = true
    try {
        const response = await getToolboxList({
            keyword: filters.value.keyword,
            status: filters.value.status,
            remark: filters.value.remark,
            page: pagination.page,
            pageSize: pagination.pageSize,
        })
        toolboxes.value = response.data.items
        total.value = response.data.total
    } finally {
        loading.value = false
    }
}

const loadBaseData = async (): Promise<void> => {
    const [instrumentResponse] = await Promise.all([getInstrumentOptions(), loadToolboxes()])
    instruments.value = instrumentResponse.data
}

const handleSearch = (): void => {
    pagination.page = 1
    void loadToolboxes()
}

const handleReset = (): void => {
    filters.value = createEmptyFilters()
    pagination.page = 1
    void loadToolboxes()
}

const handleCurrentPageChange = (): void => {
    void loadToolboxes()
}

const handlePageSizeChange = (): void => {
    pagination.page = 1
    void loadToolboxes()
}

const openCreateDialog = (): void => {
    editingId.value = ''
    Object.assign(toolboxForm, createEmptyForm())
    dialogVisible.value = true
}

const openEditDialog = (tableRow: unknown): void => {
    // Element Plus 表格插槽只提供通用行类型，此处根据绑定的数据源收窄为工具箱类型。
    const toolbox = tableRow as Toolbox
    editingId.value = toolbox.id
    Object.assign(toolboxForm, {
        code: toolbox.code,
        name: toolbox.name,
        applicableType: toolbox.applicableType,
        instrumentIds: [...toolbox.instrumentIds],
        status: toolbox.status,
        remark: toolbox.remark,
    })
    dialogVisible.value = true
}

const submitToolbox = async (): Promise<void> => {
    if (
        !toolboxForm.code.trim() ||
        !toolboxForm.name.trim() ||
        !toolboxForm.applicableType.trim() ||
        toolboxForm.instrumentIds.length === 0
    ) {
        ElMessage.warning('请完整填写工具箱必填信息')
        return
    }

    submitting.value = true
    try {
        if (editingId.value) {
            await updateToolbox({ id: editingId.value, ...toolboxForm })
            ElMessage.success('工具箱编辑成功')
        } else {
            await createToolbox({ ...toolboxForm })
            ElMessage.success('工具箱新增成功')
        }
        dialogVisible.value = false
        await loadToolboxes()
    } finally {
        submitting.value = false
    }
}

const handleDelete = async (tableRow: unknown): Promise<void> => {
    const toolbox = tableRow as Toolbox
    try {
        await ElMessageBox.confirm(`确认删除工具箱“${toolbox.name}”吗？`, '删除工具箱', {
            cancelButtonText: '取消',
            confirmButtonText: '删除',
            type: 'warning',
        })
        await deleteToolbox(toolbox.id)
        ElMessage.success('工具箱删除成功')

        if (toolboxes.value.length === 1 && pagination.page > 1) {
            pagination.page -= 1
        }

        await loadToolboxes()
    } catch {
        // 用户取消删除时保留当前数据。
    }
}

onMounted(() => {
    void loadBaseData()
})
</script>

<style scoped lang="scss">
.base-data-page {
    display: grid;
    gap: $space-lg;
}

.base-data-page__header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
}

.base-data-page__header span {
    font-size: $font-size-xs;
    font-weight: $font-weight-bold;
    color: var(--sidebar-active-bg);
    letter-spacing: 0.08em;
}

.base-data-page__header h1 {
    margin: $space-xs 0;
    font-size: $font-size-xl;
    color: var(--text-primary);
}

.base-data-page__header p {
    margin: 0;
    font-size: $font-size-sm;
    color: var(--text-secondary);
}

.base-data-filter-card,
.base-data-card {
    border-color: var(--header-border);
}

.instrument-tag {
    margin: $space-xs $space-xs $space-xs 0;
}

.base-data-pagination {
    display: flex;
    justify-content: flex-end;
    margin-top: $space-lg;
}

:deep(.el-select) {
    width: 100%;
}
</style>
