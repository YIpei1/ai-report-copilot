<template>
    <section class="template-page">
        <header class="template-page__header">
            <div>
                <span>BASE DATA</span>
                <h1>检测模板</h1>
                <p>通过勾选和排列固定报表组件，组合出不同的检测报告模板。</p>
            </div>
            <el-button type="primary" @click="openCreateDialog">新增模板</el-button>
        </header>

        <el-card class="template-filter-card" shadow="never">
            <SearchFilterCard
                v-model:model="filters"
                :fields="searchFields"
                :loading="loading"
                @reset="handleReset"
                @search="handleSearch"
            />
        </el-card>

        <el-card class="template-card" shadow="never">
            <el-table v-loading="loading" :data="templates" row-key="id">
                <el-table-column label="模板名称" min-width="250" prop="name" />
                <el-table-column label="模板编号" min-width="190" prop="code" />
                <el-table-column label="版本" width="110" prop="version" />
                <el-table-column label="报表组件" width="100">
                    <template #default="{ row }">{{ row.componentCount }} 个</template>
                </el-table-column>
                <el-table-column fixed="right" label="操作" width="240">
                    <template #default="{ row }">
                        <el-button link type="primary" @click="openConfigDialog(row)">
                            配置组件
                        </el-button>
                        <el-button link type="primary" @click="createInspection(row)"
                            >创建检测</el-button
                        >
                        <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>

            <div class="template-pagination">
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
            v-model="createDialogVisible"
            destroy-on-close
            title="新增检测模板"
            width="680px"
        >
            <el-form :model="templateForm" label-width="110px">
                <el-row :gutter="16">
                    <el-col :span="12">
                        <el-form-item label="模板名称" required>
                            <el-input v-model="templateForm.name" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="模板编号" required>
                            <el-input v-model="templateForm.code" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="模板版本" required>
                            <el-input v-model="templateForm.version" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="24">
                        <el-form-item label="模板说明">
                            <el-input
                                v-model="templateForm.description"
                                :rows="3"
                                type="textarea"
                            />
                        </el-form-item>
                    </el-col>
                </el-row>
            </el-form>

            <template #footer>
                <el-button @click="createDialogVisible = false">取消</el-button>
                <el-button :loading="creating" type="primary" @click="submitTemplate">
                    创建并配置组件
                </el-button>
            </template>
        </el-dialog>

        <el-dialog
            v-model="inspectionDialogVisible"
            destroy-on-close
            :title="`创建检测：${currentInspectionTemplate?.name || ''}`"
            width="520px"
        >
            <el-form label-width="90px">
                <el-form-item label="检测设备" required>
                    <el-select
                        v-model="selectedDeviceId"
                        filterable
                        :loading="deviceLoading"
                        placeholder="请选择设备台账"
                    >
                        <el-option
                            v-for="device in deviceOptions"
                            :key="device.id"
                            :label="`${device.name}（${device.code}）`"
                            :value="device.id"
                        />
                    </el-select>
                </el-form-item>
                <el-form-item label="工具箱" required>
                    <el-select
                        v-model="selectedToolboxId"
                        filterable
                        :loading="toolboxLoading"
                        placeholder="请选择当前可用的工具箱"
                    >
                        <el-option
                            v-for="toolbox in toolboxOptions"
                            :key="toolbox.id"
                            :label="`${toolbox.name}（${toolbox.code}）`"
                            :value="toolbox.id"
                        />
                    </el-select>
                </el-form-item>
            </el-form>

            <template #footer>
                <el-button @click="inspectionDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="confirmCreateInspection">下一步</el-button>
            </template>
        </el-dialog>

        <el-dialog
            v-model="configDialogVisible"
            destroy-on-close
            :title="`配置报表组件：${currentTemplateName}`"
            width="780px"
        >
            <div v-loading="configLoading" class="component-config">
                <section>
                    <h3>选择并排序报表组件</h3>
                    <p>点击选项进行勾选，拖动整个选项调整最终报告中的页面顺序。</p>
                    <div class="component-options">
                        <article
                            v-if="fixedCoverComponent"
                            class="component-option component-option--fixed"
                        >
                            <span class="component-option__order">1</span>
                            <el-checkbox border disabled :model-value="true">
                                <strong>{{ fixedCoverComponent.name }}</strong>
                                <el-tooltip
                                    :content="fixedCoverComponent.description"
                                    placement="top"
                                    :show-after="300"
                                >
                                    <small>{{ fixedCoverComponent.description }}</small>
                                </el-tooltip>
                            </el-checkbox>
                        </article>

                        <VueDraggable
                            v-model="sortableReportComponents"
                            :animation="180"
                            class="component-options__sortable"
                        >
                            <article
                                v-for="component in sortableReportComponents"
                                :key="component.id"
                                class="component-option"
                            >
                                <span class="component-option__order">
                                    {{ getSelectedOrder(component.id) || '-' }}
                                </span>
                                <el-checkbox
                                    border
                                    :disabled="component.status === 'disabled'"
                                    :model-value="isComponentSelected(component.id)"
                                    @change="toggleReportComponent(component, $event)"
                                >
                                    <strong>{{ component.name }}</strong>
                                    <el-tooltip
                                        :content="component.description"
                                        placement="top"
                                        :show-after="300"
                                    >
                                        <small>{{ component.description }}</small>
                                    </el-tooltip>
                                </el-checkbox>
                            </article>
                        </VueDraggable>
                    </div>
                </section>
            </div>

            <template #footer>
                <el-button @click="configDialogVisible = false">取消</el-button>
                <el-button :loading="savingConfig" type="primary" @click="saveComponentConfig">
                    保存配置
                </el-button>
            </template>
        </el-dialog>
    </section>
</template>

<script setup lang="ts" name="ReportTemplateList">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { VueDraggable } from 'vue-draggable-plus'
import {
    createInspectionTemplate,
    deleteInspectionTemplate,
    getAvailableToolboxOptions,
    getDeviceList,
    getInspectionTemplateDetail,
    getInspectionTemplateList,
    getReportComponentList,
    updateInspectionTemplateComponents,
    type Device,
    type InspectionTemplateFormParams,
    type InspectionTemplateListParams,
    type InspectionTemplateSummary,
    type ReportComponentDefinition,
    type Toolbox,
} from '@/api/baseData'
import type { SearchFilterField } from '@/components/SearchFilterCard/types'

const router = useRouter()

type TemplateFilters = Pick<InspectionTemplateListParams, 'keyword' | 'version'>

const createEmptyFilters = (): TemplateFilters => ({
    keyword: '',
    version: '',
})

// 检测模板搜索项统一交由 SearchFilterCard 生成和布局。
const searchFields: SearchFilterField[] = [
    {
        prop: 'keyword',
        label: '关键词',
        type: 'input',
        placeholder: '模板名称或编号',
    },
    {
        prop: 'version',
        label: '版本',
        type: 'input',
        placeholder: '请输入模板版本',
    },
]

const createEmptyTemplateForm = (): InspectionTemplateFormParams => ({
    code: '',
    name: '',
    version: '1.0',
    description: '',
})

const loading = ref(false)
const creating = ref(false)
const deviceLoading = ref(false)
const toolboxLoading = ref(false)
const configLoading = ref(false)
const savingConfig = ref(false)
const createDialogVisible = ref(false)
const configDialogVisible = ref(false)
const inspectionDialogVisible = ref(false)
const currentTemplateId = ref('')
const currentTemplateName = ref('')
const templates = ref<InspectionTemplateSummary[]>([])
const total = ref(0)
const deviceOptions = ref<Device[]>([])
const toolboxOptions = ref<Toolbox[]>([])
const filters = ref<TemplateFilters>(createEmptyFilters())
const pagination = reactive({
    page: 1,
    pageSize: 10,
})
const reportComponents = ref<ReportComponentDefinition[]>([])
const selectedComponentIds = ref<string[]>([])
const selectedDeviceId = ref('')
const selectedToolboxId = ref('')
const currentInspectionTemplate = ref<InspectionTemplateSummary>()
const templateForm = reactive<InspectionTemplateFormParams>(createEmptyTemplateForm())

// 首页固定为报告第一项，不参与拖拽排序。
const fixedCoverComponent = computed(() => {
    return reportComponents.value.find((component) => component.category === 'cover')
})

// 仅允许首页以外的报表组件参与拖拽，拖拽结束后重新与首页合并。
const sortableReportComponents = computed<ReportComponentDefinition[]>({
    get: () => reportComponents.value.filter((component) => component.category !== 'cover'),
    set: (components) => {
        reportComponents.value = fixedCoverComponent.value
            ? [fixedCoverComponent.value, ...components]
            : components
    },
})

const loadTemplates = async (): Promise<void> => {
    loading.value = true
    try {
        const response = await getInspectionTemplateList({
            keyword: filters.value.keyword,
            version: filters.value.version,
            page: pagination.page,
            pageSize: pagination.pageSize,
        })
        templates.value = response.data.items
        total.value = response.data.total
    } finally {
        loading.value = false
    }
}

const handleSearch = (): void => {
    pagination.page = 1
    void loadTemplates()
}

const handleReset = (): void => {
    filters.value = createEmptyFilters()
    pagination.page = 1
    void loadTemplates()
}

const handleCurrentPageChange = (): void => {
    void loadTemplates()
}

const handlePageSizeChange = (): void => {
    pagination.page = 1
    void loadTemplates()
}

// 加载可用工具箱，供创建检测时选择本次任务实际使用的仪器组合。
const loadToolboxOptions = async (): Promise<void> => {
    toolboxLoading.value = true

    try {
        const response = await getAvailableToolboxOptions()
        toolboxOptions.value = response.data
    } finally {
        toolboxLoading.value = false
    }
}

const openCreateDialog = (): void => {
    Object.assign(templateForm, createEmptyTemplateForm())
    createDialogVisible.value = true
}

const submitTemplate = async (): Promise<void> => {
    const requiredValues = [templateForm.code, templateForm.name, templateForm.version]
    if (requiredValues.some((value) => !value.trim())) {
        ElMessage.warning('请完整填写检测模板必填信息')
        return
    }

    creating.value = true
    try {
        const response = await createInspectionTemplate({ ...templateForm })
        createDialogVisible.value = false
        ElMessage.success('检测模板创建成功')
        await loadTemplates()
        await openConfigDialog(response.data)
    } finally {
        creating.value = false
    }
}

const openConfigDialog = async (tableRow: unknown): Promise<void> => {
    const template = tableRow as { id: string; name: string }
    currentTemplateId.value = template.id
    currentTemplateName.value = template.name
    configDialogVisible.value = true
    configLoading.value = true

    try {
        const [templateResponse, componentResponse] = await Promise.all([
            getInspectionTemplateDetail(template.id),
            getReportComponentList(),
        ])
        const orderedSelectedComponents = [...templateResponse.data.components]
            .sort((first, second) => first.sort - second.sort)
            .map((config) =>
                componentResponse.data.find(
                    (component) => component.id === config.reportComponentId,
                ),
            )
            .filter((component): component is ReportComponentDefinition => Boolean(component))
        const coverComponent = componentResponse.data.find(
            (component) => component.category === 'cover',
        )
        const selectedIds = new Set(orderedSelectedComponents.map((component) => component.id))

        if (coverComponent) {
            selectedIds.add(coverComponent.id)
        }

        selectedComponentIds.value = [...selectedIds]
        reportComponents.value = [
            ...(coverComponent ? [coverComponent] : []),
            ...orderedSelectedComponents.filter((component) => component.category !== 'cover'),
            ...componentResponse.data.filter(
                (component) => component.category !== 'cover' && !selectedIds.has(component.id),
            ),
        ]
    } finally {
        configLoading.value = false
    }
}

const isComponentSelected = (id: string): boolean => {
    if (fixedCoverComponent.value?.id === id) {
        return true
    }

    return selectedComponentIds.value.includes(id)
}

const getSelectedOrder = (id: string): number => {
    return (
        reportComponents.value
            .filter((component) => isComponentSelected(component.id))
            .findIndex((component) => component.id === id) + 1
    )
}

const toggleReportComponent = (component: ReportComponentDefinition, checked: unknown): void => {
    if (component.category === 'cover') {
        return
    }

    if (checked) {
        if (!isComponentSelected(component.id)) selectedComponentIds.value.push(component.id)
        return
    }

    selectedComponentIds.value = selectedComponentIds.value.filter((id) => id !== component.id)
}

const saveComponentConfig = async (): Promise<void> => {
    const orderedSelectedComponents = reportComponents.value.filter((component) =>
        isComponentSelected(component.id),
    )

    if (orderedSelectedComponents.length === 0) {
        ElMessage.warning('检测模板至少需要一个报表组件')
        return
    }

    savingConfig.value = true
    try {
        await updateInspectionTemplateComponents({
            id: currentTemplateId.value,
            components: orderedSelectedComponents.map((component, index) => ({
                reportComponentId: component.id,
                sort: index + 1,
                title: component.name,
            })),
        })
        configDialogVisible.value = false
        ElMessage.success('报表组件配置已保存')
        await loadTemplates()
    } finally {
        savingConfig.value = false
    }
}

const handleDelete = async (tableRow: unknown): Promise<void> => {
    const template = tableRow as InspectionTemplateSummary
    try {
        await ElMessageBox.confirm(`确认删除检测模板“${template.name}”吗？`, '删除模板', {
            cancelButtonText: '取消',
            confirmButtonText: '删除',
            type: 'warning',
        })
        await deleteInspectionTemplate(template.id)
        ElMessage.success('检测模板删除成功')

        if (templates.value.length === 1 && pagination.page > 1) {
            pagination.page -= 1
        }

        await loadTemplates()
    } catch {
        // 用户取消删除时保留当前数据。
    }
}

// 打开创建检测弹窗，并加载当前可用的设备台账和工具箱。
const createInspection = (tableRow: unknown): void => {
    currentInspectionTemplate.value = tableRow as InspectionTemplateSummary
    selectedDeviceId.value = ''
    selectedToolboxId.value = ''
    inspectionDialogVisible.value = true
    deviceLoading.value = true
    void loadToolboxOptions()

    void getDeviceList({
        keyword: '',
        status: 'active',
        page: 1,
        pageSize: 100,
    })
        .then((response) => {
            deviceOptions.value = response.data.items
        })
        .finally(() => {
            deviceLoading.value = false
        })
}

const confirmCreateInspection = (): void => {
    const template = currentInspectionTemplate.value

    if (!template || !selectedDeviceId.value || !selectedToolboxId.value) {
        ElMessage.warning('请选择本次检测使用的设备和工具箱')
        return
    }

    inspectionDialogVisible.value = false

    void router.push({
        name: 'ReportView',
        params: {
            templateId: template.id,
            deviceId: selectedDeviceId.value,
            toolboxId: selectedToolboxId.value,
        },
    })
}

onMounted(() => {
    void loadTemplates()
})
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

.template-page__header p,
.component-config section > p {
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

:deep(.el-select) {
    width: 100%;
}

.component-config {
    min-height: 320px;
}

.component-config > section,
.component-options,
.component-options__sortable {
    min-width: 0;
}

.component-config h3 {
    margin: 0 0 $space-xs;
    font-size: $font-size-md;
    color: var(--text-primary);
}

.component-options {
    display: grid;
    gap: $space-sm;
    margin-top: $space-md;
}

.component-options__sortable {
    display: grid;
    gap: $space-sm;
}

.component-option {
    display: grid;
    grid-template-columns: 24px minmax(0, 1fr);
    gap: $space-sm;
    align-items: center;
    min-width: 0;
    cursor: grab;
    user-select: none;

    &:active {
        cursor: grabbing;
    }
}

.component-option--fixed {
    cursor: default;

    &:active {
        cursor: default;
    }
}

.component-option__order {
    color: var(--text-secondary);
    font-size: $font-size-xs;
    text-align: center;
}

.component-options :deep(.el-checkbox) {
    width: 100%;
    min-width: 0;
    max-width: 100%;
    height: auto;
    min-height: 62px;
    margin: 0;
    padding: $space-sm $space-md;
}

.component-options :deep(.el-checkbox__label) {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: $space-xs;
    min-width: 0;
    overflow: hidden;
    white-space: normal;
}

.component-options small {
    overflow: hidden;
    font-size: $font-size-xs;
    color: var(--text-secondary);
    text-overflow: ellipsis;
    white-space: nowrap;
}
</style>
