<!--
/**
 * Author: YiPei
 * Date: 2026-08-16 10:04
 * Desc: 配置检测模板包含的报表组件及页面顺序
 */
-->
<template>
    <el-dialog
        v-model="dialogVisible"
        destroy-on-close
        :title="dialogTitle"
        width="780px"
        @closed="resetConfigData"
        @open="loadConfigData"
    >
        <div v-loading="loading" class="component-config">
            <section>
                <h3>选择并排序报表组件</h3>
                <p>勾选模板需要的组件，拖动组件卡片调整最终报告中的页面顺序。</p>

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
                        v-model="sortableComponents"
                        :animation="180"
                        class="component-options__sortable"
                    >
                        <article
                            v-for="component in sortableComponents"
                            :key="component.id"
                            class="component-option"
                        >
                            <span class="component-option__order">
                                {{ getSelectedOrder(component.id) }}
                            </span>
                            <el-checkbox
                                v-model="component.selected"
                                border
                                :disabled="component.status === 'disabled'"
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
            <el-button @click="closeDialog">取消</el-button>
            <el-button :loading="saving" type="primary" @click="saveConfig">保存配置</el-button>
        </template>
    </el-dialog>
</template>

<script setup lang="ts" name="ReportTemplateConfig">
import { computed, ref } from 'vue'
import { VueDraggable } from 'vue-draggable-plus'
import {
    getInspectionTemplateDetail,
    getReportComponentList,
    updateInspectionTemplateComponents,
    type InspectionTemplate,
    type InspectionTemplateItem,
    type ReportComponentDefinition,
} from '@/api/baseData'

// 弹窗使用的数据结构：在报表组件定义上增加选中状态和原始排序。
interface ConfigurableReportComponent extends ReportComponentDefinition {
    selected: boolean
    sort: number
}

const dialogVisible = defineModel<boolean>({ default: false })

const props = defineProps<{
    template?: InspectionTemplateItem
}>()

const emit = defineEmits<{
    (event: 'saved'): void
}>()

const loading = ref(false)
const saving = ref(false)
const componentOptions = ref<ConfigurableReportComponent[]>([])

const dialogTitle = computed(() => {
    return props.template ? `配置报表组件：${props.template.name}` : '配置报表组件'
})

// 首页固定展示在第一项，不允许取消选择或参与拖拽。
const fixedCoverComponent = computed(() => {
    return componentOptions.value.find((component) => component.category === 'cover')
})

// 首页之外的组件参与拖拽，拖拽完成后重新与首页组成完整列表。
const sortableComponents = computed<ConfigurableReportComponent[]>({
    get: () => componentOptions.value.filter((component) => component.category !== 'cover'),
    set: (components) => {
        componentOptions.value = fixedCoverComponent.value
            ? [fixedCoverComponent.value, ...components]
            : components
    },
})

// 弹窗打开时获取当前模板详情和全部可配置报表组件。
const loadConfigData = async (): Promise<void> => {
    if (!props.template) {
        return
    }

    loading.value = true

    try {
        const [templateResponse, componentResponse] = await Promise.all([
            getInspectionTemplateDetail(props.template.id),
            getReportComponentList(),
        ])
        componentOptions.value = createComponentOptions(
            templateResponse.data,
            componentResponse.data,
        )
    } finally {
        loading.value = false
    }
}

// 将两个接口的数据转换为弹窗能够直接渲染和修改的组件列表。
const createComponentOptions = (
    template: InspectionTemplate,
    components: ReportComponentDefinition[],
): ConfigurableReportComponent[] => {
    const sortMap = new Map(
        template.components.map((component) => [component.reportComponentId, component.sort]),
    )

    return components
        .map((component) => ({
            ...component,
            selected: component.category === 'cover' || sortMap.has(component.id),
            sort: component.category === 'cover' ? 0 : (sortMap.get(component.id) ?? Infinity),
        }))
        .sort((firstComponent, secondComponent) => firstComponent.sort - secondComponent.sort)
}

// 根据当前组件顺序计算已选组件的最终页码，未选组件显示横线。
const getSelectedOrder = (componentId: string): number | string => {
    const selectedIndex = componentOptions.value
        .filter((component) => component.selected)
        .findIndex((component) => component.id === componentId)

    return selectedIndex === -1 ? '-' : selectedIndex + 1
}

// 保存已选组件和拖拽顺序，成功后通知父页面刷新列表。
const saveConfig = async (): Promise<void> => {
    if (!props.template) {
        return
    }

    const selectedComponents = componentOptions.value.filter((component) => component.selected)

    if (selectedComponents.length === 0) {
        ElMessage.warning('检测模板至少需要一个报表组件')
        return
    }

    saving.value = true

    try {
        await updateInspectionTemplateComponents({
            id: props.template.id,
            components: selectedComponents.map((component, index) => ({
                reportComponentId: component.id,
                sort: index + 1,
                title: component.name,
            })),
        })
        ElMessage.success('报表组件配置已保存')
        closeDialog()
        emit('saved')
    } finally {
        saving.value = false
    }
}

// 统一关闭弹窗，模板数据在 closed 事件中清理。
const closeDialog = (): void => {
    dialogVisible.value = false
}

// 清理上一次模板数据，避免下次打开时短暂展示旧内容。
const resetConfigData = (): void => {
    componentOptions.value = []
}
</script>

<style scoped lang="scss">
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

.component-config section > p {
    margin: 0;
    font-size: $font-size-sm;
    color: var(--text-secondary);
}

.component-options,
.component-options__sortable {
    display: grid;
    gap: $space-sm;
}

.component-options {
    margin-top: $space-md;
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
    font-size: $font-size-xs;
    color: var(--text-secondary);
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
