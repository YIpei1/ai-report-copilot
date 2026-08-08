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

        <el-card class="template-card" shadow="never">
            <el-table v-loading="loading" :data="templates" row-key="id">
                <el-table-column label="模板名称" min-width="250" prop="name" />
                <el-table-column label="模板编号" min-width="190" prop="code" />
                <el-table-column label="版本" width="110" prop="version" />
                <el-table-column label="适用设备类型" min-width="190" prop="applicableType" />
                <el-table-column label="报表组件" width="100">
                    <template #default="{ row }">{{ row.componentCount }} 个</template>
                </el-table-column>
                <el-table-column label="状态" width="90">
                    <template #default="{ row }">
                        <el-tag :type="row.status === 'enabled' ? 'success' : 'info'">
                            {{ row.status === 'enabled' ? '启用' : '停用' }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column fixed="right" label="操作" width="280">
                    <template #default="{ row }">
                        <el-button link type="primary" @click="openConfigDialog(row)">
                            配置组件
                        </el-button>
                        <el-button link type="primary" @click="toggleTemplateStatus(row)">
                            {{ row.status === 'enabled' ? '停用' : '启用' }}
                        </el-button>
                        <el-button link type="primary" @click="createInspection"
                            >创建检测</el-button
                        >
                        <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
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
                    <el-col :span="12">
                        <el-form-item label="模板状态">
                            <el-select v-model="templateForm.status">
                                <el-option label="启用" value="enabled" />
                                <el-option label="停用" value="disabled" />
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="24">
                        <el-form-item label="适用设备类型" required>
                            <el-input v-model="templateForm.applicableType" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="24">
                        <el-form-item label="参考依据" required>
                            <el-input v-model="templateForm.standard" />
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
            v-model="configDialogVisible"
            destroy-on-close
            :title="`配置报表组件：${currentTemplateName}`"
            width="780px"
        >
            <div v-loading="configLoading" class="component-config">
                <section>
                    <h3>选择报表组件</h3>
                    <p>勾选需要组合到当前检测模板中的组件。</p>
                    <div class="component-options">
                        <el-checkbox
                            v-for="component in reportComponents"
                            :key="component.id"
                            border
                            :disabled="component.status === 'disabled'"
                            :model-value="isComponentSelected(component.id)"
                            @change="toggleReportComponent(component, $event)"
                        >
                            <strong>{{ component.name }}</strong>
                            <small>{{ component.description }}</small>
                        </el-checkbox>
                    </div>
                </section>

                <section>
                    <h3>组件顺序</h3>
                    <p>按住左侧拖拽手柄调整最终报告的页面顺序。</p>
                    <el-empty
                        v-if="selectedComponents.length === 0"
                        description="暂未选择报表组件"
                    />
                    <VueDraggable
                        v-else
                        v-model="selectedComponents"
                        :animation="180"
                        class="selected-components"
                        handle=".drag-handle"
                    >
                        <article
                            v-for="(component, index) in selectedComponents"
                            :key="component.id"
                            class="selected-component"
                        >
                            <el-icon class="drag-handle"><Rank /></el-icon>
                            <span>{{ index + 1 }}</span>
                            <div>
                                <strong>{{ component.name }}</strong>
                                <small>{{ component.code }}</small>
                            </div>
                            <el-button link type="danger" @click="removeComponent(component.id)">
                                移除
                            </el-button>
                        </article>
                    </VueDraggable>
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
import { onMounted, reactive, ref } from 'vue'
import { VueDraggable } from 'vue-draggable-plus'
import {
    createInspectionTemplate,
    deleteInspectionTemplate,
    getInspectionTemplateDetail,
    getInspectionTemplateList,
    getReportComponentList,
    updateInspectionTemplateComponents,
    updateInspectionTemplateStatus,
    type InspectionTemplateFormParams,
    type InspectionTemplateSummary,
    type ReportComponentDefinition,
} from '@/api/baseData'

const createEmptyTemplateForm = (): InspectionTemplateFormParams => ({
    code: '',
    name: '',
    version: '1.0',
    standard: '参考 TSG T7008-2023',
    applicableType: '曳引与强制驱动电梯',
    description: '',
    status: 'enabled',
})

const loading = ref(false)
const creating = ref(false)
const configLoading = ref(false)
const savingConfig = ref(false)
const createDialogVisible = ref(false)
const configDialogVisible = ref(false)
const currentTemplateId = ref('')
const currentTemplateName = ref('')
const templates = ref<InspectionTemplateSummary[]>([])
const reportComponents = ref<ReportComponentDefinition[]>([])
const selectedComponents = ref<ReportComponentDefinition[]>([])
const templateForm = reactive<InspectionTemplateFormParams>(createEmptyTemplateForm())

const loadTemplates = async (): Promise<void> => {
    loading.value = true
    try {
        const response = await getInspectionTemplateList()
        templates.value = response.data
    } finally {
        loading.value = false
    }
}

const openCreateDialog = (): void => {
    Object.assign(templateForm, createEmptyTemplateForm())
    createDialogVisible.value = true
}

const submitTemplate = async (): Promise<void> => {
    const requiredValues = [
        templateForm.code,
        templateForm.name,
        templateForm.version,
        templateForm.standard,
        templateForm.applicableType,
    ]
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
        reportComponents.value = componentResponse.data
        selectedComponents.value = [...templateResponse.data.components]
            .sort((first, second) => first.sort - second.sort)
            .map((config) =>
                componentResponse.data.find(
                    (component) => component.id === config.reportComponentId,
                ),
            )
            .filter((component): component is ReportComponentDefinition => Boolean(component))
    } finally {
        configLoading.value = false
    }
}

const isComponentSelected = (id: string): boolean => {
    return selectedComponents.value.some((component) => component.id === id)
}

const toggleReportComponent = (component: ReportComponentDefinition, checked: unknown): void => {
    if (checked) {
        if (!isComponentSelected(component.id)) selectedComponents.value.push(component)
        return
    }

    removeComponent(component.id)
}

const removeComponent = (id: string): void => {
    selectedComponents.value = selectedComponents.value.filter((component) => component.id !== id)
}

const saveComponentConfig = async (): Promise<void> => {
    if (selectedComponents.value.length === 0) {
        ElMessage.warning('检测模板至少需要一个报表组件')
        return
    }

    savingConfig.value = true
    try {
        await updateInspectionTemplateComponents({
            id: currentTemplateId.value,
            components: selectedComponents.value.map((component, index) => ({
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

const toggleTemplateStatus = async (tableRow: unknown): Promise<void> => {
    const template = tableRow as InspectionTemplateSummary
    const status = template.status === 'enabled' ? 'disabled' : 'enabled'
    await updateInspectionTemplateStatus({ id: template.id, status })
    ElMessage.success(status === 'enabled' ? '模板已启用' : '模板已停用')
    await loadTemplates()
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
        await loadTemplates()
    } catch {
        // 用户取消删除时保留当前数据。
    }
}

const createInspection = (): void => {
    ElMessage.info('创建检测功能暂未接入')
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

.template-card {
    border-color: var(--header-border);
}

:deep(.el-select) {
    width: 100%;
}

.component-config {
    display: grid;
    grid-template-columns: minmax(260px, 0.8fr) minmax(340px, 1.2fr);
    gap: $space-lg;
    min-height: 320px;
}

.component-config h3 {
    margin: 0 0 $space-xs;
    font-size: $font-size-md;
    color: var(--text-primary);
}

.component-options,
.selected-components {
    display: grid;
    gap: $space-sm;
    margin-top: $space-md;
}

.component-options :deep(.el-checkbox) {
    width: 100%;
    height: auto;
    min-height: 62px;
    margin: 0;
    padding: $space-sm $space-md;
}

.component-options :deep(.el-checkbox__label) {
    display: flex;
    flex-direction: column;
    gap: $space-xs;
    overflow: hidden;
    white-space: normal;
}

.component-options small,
.selected-component small {
    overflow: hidden;
    font-size: $font-size-xs;
    color: var(--text-secondary);
    text-overflow: ellipsis;
    white-space: nowrap;
}

.selected-component {
    display: grid;
    grid-template-columns: auto 24px minmax(0, 1fr) auto;
    gap: $space-sm;
    align-items: center;
    padding: $space-sm $space-md;
    background: var(--surface-hover-bg);
    border: 1px solid var(--header-border);
    border-radius: $radius-md;
}

.selected-component > span {
    font-size: $font-size-xs;
    color: var(--text-secondary);
}

.selected-component > div {
    display: flex;
    flex-direction: column;
    gap: $space-xs;
    min-width: 0;
    color: var(--text-primary);
}

.drag-handle {
    color: var(--text-secondary);
    cursor: grab;
}

.drag-handle:active {
    cursor: grabbing;
}

@media (max-width: $breakpoint-tablet) {
    .component-config {
        grid-template-columns: 1fr;
    }
}
</style>
