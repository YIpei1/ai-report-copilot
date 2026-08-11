<template>
    <div v-loading="loading" class="statement-page">
        <header class="statement-page__header">
            <el-button class="back-btn" @click="returnToPreviousPage"> 返回 </el-button>
            <strong class="statement-page__title">{{ currentTemplateName || '检测报表' }}</strong>
            <el-button :loading="saving" type="primary" @click="saveReport">保存</el-button>
        </header>

        <div class="statement-page__content">
            <!-- 左侧目录根据检测模板配置生成。 -->
            <div class="left-menu">
                <LeftMenu
                    v-model:doc-data="sortedDocData"
                    :is-template="isTemplate"
                    :select-menu-model-id="activeTemplateId"
                    @select="selectLeftMenu"
                    @select-p-d-f="handleSelectPDF"
                />
            </div>

            <!-- 中间区域按照模板配置的组件和顺序动态渲染。 -->
            <div class="content-template">
                <ContentTemplate
                    v-if="!loading && sortedDocData.length"
                    v-model="sortedDocData"
                    :active-id="activeTemplateId"
                    :scroll-request-key="scrollRequestKey"
                    :scroll-target-id="scrollTargetId"
                    @active-change="activeChange"
                />
                <el-empty v-else-if="!loading" description="当前检测模板未配置报表组件" />
            </div>

            <!-- 右侧保留报告问题提示区域。 -->
            <div class="right-tips">
                <RightTips />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts" name="StatementMode">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
    getDeviceDetail,
    getInspectionTemplateDetail,
    getInstrumentOptions,
    getReportComponentList,
    getToolboxDetail,
    type Device,
    type InspectionTemplate,
    type Instrument,
    type Toolbox,
} from '@/api/baseData'
import {
    createInspectionReport,
    getInspectionReportDetail,
    updateInspectionReport,
    type SaveInspectionReportParams,
} from '@/api/report'
import { useUserStore } from '@/stores/modules/user'
import ContentTemplate from './components/ContentTemplate/index.vue'
import LeftMenu from './components/LeftMenu/index.vue'
import RightTips from './components/RightTips/index.vue'
import { validateReportDocument } from './reportDocumentValidation'
import { createTemplateDocument } from './templateDocument'
import type { DocumentChild, DocumentSection } from './types'

interface ReportSnapshotContext {
    template: InspectionTemplate
    device: Device
    toolbox: Toolbox
    instruments: Instrument[]
}

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const loading = ref(true)
const saving = ref(false)
const isTemplate = ref(true)
const currentTemplateName = ref('')
const currentReportId = ref('')
const currentReportCode = ref('')
const reportSnapshotContext = ref<ReportSnapshotContext>()
const activeTemplateId = ref('')
const selectSortPDF = ref(1)
const scrollTargetId = ref('')
const scrollRequestKey = ref(0)
const docData = ref<DocumentSection[]>([])

const selectLeftMenu = (id: string): void => {
    activeTemplateId.value = id
    scrollTargetId.value = id
    scrollRequestKey.value += 1
}

const handleSelectPDF = (index: number): void => {
    selectSortPDF.value = index
}

const activeChange = (id: string): void => {
    activeTemplateId.value = id
}

// 返回模板列表，不在报表组件内部耦合固定页面地址。
const returnToPreviousPage = (): void => {
    router.back()
}

const sortFallback = Number.MAX_SAFE_INTEGER

const getSortValue = (item: { sort?: number }, index: number): number => {
    return Number.isFinite(item.sort) ? item.sort! : sortFallback + index
}

const sortDocumentChildren = (children: DocumentChild[]): DocumentChild[] => {
    return children
        .map((child, index) => ({ child, index }))
        .sort(
            (first, second) =>
                getSortValue(first.child, first.index) - getSortValue(second.child, second.index) ||
                first.index - second.index,
        )
        .map(({ child }) => child)
}

const sortDocumentSections = (sections: DocumentSection[]): DocumentSection[] => {
    return sections
        .map((section, index) => ({ section, index }))
        .sort(
            (first, second) =>
                getSortValue(first.section, first.index) -
                    getSortValue(second.section, second.index) || first.index - second.index,
        )
        .map(({ section }) => ({
            ...section,
            children: sortDocumentChildren(section.children),
        }))
}

const sortedDocData = computed<DocumentSection[]>({
    get: () => sortDocumentSections(docData.value),
    set: (value) => {
        docData.value = sortDocumentSections(value)
    },
})

const getRouteParam = (key: string): string => {
    const value = route.params[key]

    return Array.isArray(value) ? value[0] || '' : value || ''
}

// 报告数据均为 JSON 可序列化结构，通过序列化移除 Vue Proxy 后再保存快照。
const cloneSerializableData = <T,>(data: T): T => {
    return JSON.parse(JSON.stringify(data)) as T
}

const restoreDocumentData = (data: unknown): DocumentSection[] => {
    return Array.isArray(data) ? cloneSerializableData(data) : []
}

// 首次创建报告时读取模板和基础数据，并生成本次报告的初始快照。
const loadTemplateDocument = async (): Promise<void> => {
    const templateId = getRouteParam('templateId')
    const deviceId = getRouteParam('deviceId')
    const toolboxId = getRouteParam('toolboxId')

    if (!templateId || !deviceId || !toolboxId) {
        loading.value = false
        ElMessage.warning('缺少检测模板、设备或工具箱 ID')
        return
    }

    loading.value = true

    try {
        const [templateResponse, componentResponse, deviceResponse] = await Promise.all([
            getInspectionTemplateDetail(templateId),
            getReportComponentList(),
            getDeviceDetail(deviceId),
        ])
        const template = templateResponse.data
        const [toolboxResponse, instrumentResponse] = await Promise.all([
            getToolboxDetail(toolboxId),
            getInstrumentOptions(),
        ])
        const instrumentMap = new Map(
            instrumentResponse.data.map((instrument) => [instrument.id, instrument]),
        )
        const selectedInstruments = toolboxResponse.data.instrumentIds
            .map((id) => instrumentMap.get(id))
            .filter((instrument) => instrument !== undefined)

        reportSnapshotContext.value = {
            template,
            device: deviceResponse.data,
            toolbox: toolboxResponse.data,
            instruments: selectedInstruments,
        }

        currentTemplateName.value = template.name
        docData.value = createTemplateDocument(
            template,
            componentResponse.data,
            selectedInstruments,
            deviceResponse.data,
        )
        activeTemplateId.value = docData.value[0]?.children[0]?.id ?? ''

        if (!activeTemplateId.value) {
            ElMessage.warning('当前检测模板未配置可用的报表组件')
        }
    } catch {
        docData.value = []
    } finally {
        loading.value = false
    }
}

// 编辑已保存报告时只读取报告快照，不再访问可能已经变化的基础数据。
const loadSavedReportDocument = async (reportId: string): Promise<void> => {
    loading.value = true

    try {
        const response = await getInspectionReportDetail(reportId)
        const report = response.data
        const savedDocumentData = restoreDocumentData(report.documentData)

        if (savedDocumentData.length === 0) {
            ElMessage.warning('当前报告没有可编辑的文档数据')
        }

        currentReportId.value = report.id
        currentReportCode.value = report.reportCode
        currentTemplateName.value = report.templateName
        reportSnapshotContext.value = {
            template: report.templateSnapshot,
            device: report.deviceSnapshot,
            toolbox: report.toolboxSnapshot,
            instruments: report.instrumentSnapshots,
        }
        docData.value = savedDocumentData
        activeTemplateId.value = docData.value[0]?.children[0]?.id ?? ''
    } catch {
        docData.value = []
    } finally {
        loading.value = false
    }
}

const getDocumentChildData = (templateId: string): Record<string, unknown> | undefined => {
    const child = docData.value
        .flatMap((section) => section.children)
        .find((item) => (item.templateId || item.id) === templateId)

    return typeof child?.data === 'object' && child.data !== null
        ? (child.data as Record<string, unknown>)
        : undefined
}

const getStringField = (data: Record<string, unknown> | undefined, key: string): string => {
    const value = data?.[key]

    return typeof value === 'string' ? value.trim() : ''
}

const createReportCode = (): string => {
    return `REPORT-${Date.now()}`
}

// 保存时统一判断未填写项和不符合项，并决定保存为草稿还是待审核报告。
const saveReport = async (): Promise<void> => {
    const snapshotContext = reportSnapshotContext.value

    if (!snapshotContext || docData.value.length === 0) {
        ElMessage.warning('当前没有可保存的报告数据')
        return
    }

    docData.value = sortDocumentSections(docData.value)
    const validation = validateReportDocument(docData.value)
    const coverData = getDocumentChildData('StartModel')
    const reportCode = currentReportCode.value || createReportCode()
    const saveParams: SaveInspectionReportParams = {
        reportCode,
        reportName: getStringField(coverData, 'reportName') || snapshotContext.template.name,
        deviceName: snapshotContext.device.name,
        userOrganization: snapshotContext.device.userOrganization,
        templateName: snapshotContext.template.name,
        source: 'manual',
        status: validation.isComplete ? 'pending_review' : 'draft',
        createdBy: userStore.userInfo?.nickname || userStore.userInfo?.username || '当前登录用户',
        templateSnapshot: cloneSerializableData(snapshotContext.template),
        deviceSnapshot: cloneSerializableData(snapshotContext.device),
        toolboxSnapshot: cloneSerializableData(snapshotContext.toolbox),
        instrumentSnapshots: cloneSerializableData(snapshotContext.instruments),
        documentData: cloneSerializableData(docData.value),
        validation: {
            invalidFieldLabels: validation.invalidFieldLabels,
            missingFieldLabels: validation.missingFieldLabels,
            nonConformingItemLabels: validation.nonConformingItemLabels,
            unavailableInstrumentLabels: validation.unavailableInstrumentLabels,
        },
    }

    saving.value = true

    try {
        const response = currentReportId.value
            ? await updateInspectionReport({ id: currentReportId.value, ...saveParams })
            : await createInspectionReport(saveParams)

        currentReportId.value = response.data.id
        currentReportCode.value = response.data.reportCode

        if (!validation.isComplete) {
            const issueMessages = [
                validation.missingFieldLabels.length
                    ? `${validation.missingFieldLabels.length} 个未填写项`
                    : '',
                validation.nonConformingItemLabels.length
                    ? `${validation.nonConformingItemLabels.length} 个不合格项`
                    : '',
                validation.unavailableInstrumentLabels.length
                    ? `${validation.unavailableInstrumentLabels.length} 台不可用仪器`
                    : '',
                validation.invalidFieldLabels.length
                    ? `${validation.invalidFieldLabels.length} 个输入不规范项`
                    : '',
            ].filter(Boolean)

            await ElMessageBox.alert(
                `检测报告存在${issueMessages.join('、')}，已保存为草稿。`,
                '报告未完整',
                { confirmButtonText: '继续填写', type: 'warning' },
            )

            if (route.name !== 'ReportEdit') {
                await router.replace({
                    name: 'ReportEdit',
                    params: { reportId: response.data.id },
                })
            }
            return
        }

        ElMessage.success('检测报告保存成功')
        await router.push({ name: 'ReportList' })
    } finally {
        saving.value = false
    }
}

onMounted(() => {
    const reportId = getRouteParam('reportId')

    if (reportId) {
        void loadSavedReportDocument(reportId)
        return
    }

    void loadTemplateDocument()
})
</script>

<style lang="scss" scoped>
.statement-page {
    height: 100vh;
    display: flex;
    flex-direction: column;

    &__header {
        position: relative;
        z-index: $z-header;
        display: grid;
        grid-template-columns: 1fr auto 1fr;
        flex: 0 0 auto;
        align-items: center;
        height: $report-panel-header-height;
        padding: 0 $space-md;
        background: var(--card-bg);
        border-bottom: 1px solid var(--header-border);
        box-shadow: 0 4px 12px var(--layout-shadow);

        .back-btn {
            width: 68px;
        }

        > :last-child {
            justify-self: end;
        }
    }

    &__title {
        max-width: 520px;
        overflow: hidden;
        color: var(--text-primary);
        font-size: $font-size-md;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    &__content {
        flex: 1;
        display: grid;
        grid-template-columns: $report-left-menu-width minmax(0, 1fr) $report-right-panel-width;
        min-height: 0;

        .content-template {
            min-width: 0;
            background-color: var(--report-workspace-bg);
        }
    }
}
</style>
