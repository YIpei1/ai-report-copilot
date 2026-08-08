<template>
    <div class="statement-page">
        <header class="statement-page__header">
            <el-button @click="returnToPreviousPage">
                <el-icon><ArrowLeft /></el-icon>
                返回
            </el-button>
            <el-button type="primary" @click="saveReportDraft">保存</el-button>
        </header>

        <div class="statement-page__content">
            <!-- 左侧菜单 -->
            <div class="left-menu">
                <LeftMenu
                    v-model:doc-data="sortedDocData"
                    :is-template="isTemplate"
                    :select-menu-model-id="activeTemplateId"
                    @select="selectLeftMenu"
                    @select-p-d-f="handleSelectPDF"
                />
            </div>
            <!-- 表单模板组件/pdf预览 -->
            <div class="content-template">
                <ContentTemplate
                    v-if="isTemplate"
                    v-model="sortedDocData"
                    :active-id="activeTemplateId"
                    :scroll-request-key="scrollRequestKey"
                    :scroll-target-id="scrollTargetId"
                    @active-change="activeChange"
                />
            </div>
            <!-- 提交报告问题集 -->
            <div class="right-tips">
                <RightTips />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts" name="StatementMode">
import RightTips from './components/RightTips/index.vue'
import ContentTemplate from './components/ContentTemplate/index.vue'
import LeftMenu from './components/LeftMenu/index.vue'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import type { DocumentChild, DocumentSection } from './types'

const router = useRouter()
// 是模板吗
const isTemplate = ref<boolean>(true)
// 当前滚动或选中的模板 id，只用于左侧菜单高亮。
const activeTemplateId = ref<string>('')
const selectSortPDF = ref<number>(1)
// 菜单点击的滚动目标；配合 scrollRequestKey，让重复点击同一项也能触发滚动。
// 滚动监听只更新 activeTemplateId，不触发 scrollIntoView，避免来回跳动。
const scrollTargetId = ref<string>('')
const scrollRequestKey = ref(0)

const selectLeftMenu = (data: string) => {
    activeTemplateId.value = data
    scrollTargetId.value = data
    scrollRequestKey.value += 1
}

const handleSelectPDF = (index: number) => {
    selectSortPDF.value = index
}
const activeChange = (data: string) => {
    activeTemplateId.value = data
}

// 返回上一页，不在报表组件内部耦合具体路由地址。
const returnToPreviousPage = () => {
    router.back()
}

const sortFallback = Number.MAX_SAFE_INTEGER

const getSortValue = (item: { sort?: number }, index: number) => {
    return Number.isFinite(item.sort) ? item.sort! : sortFallback + index
}

const sortDocumentChildren = (children: DocumentChild[]) => {
    return children
        .map((child, index) => ({ child, index }))
        .sort(
            (a, b) =>
                getSortValue(a.child, a.index) - getSortValue(b.child, b.index) ||
                a.index - b.index,
        )
        .map(({ child }) => child)
}

const sortDocumentSections = (sections: DocumentSection[]) => {
    return sections
        .map((section, index) => ({ section, index }))
        .sort(
            (a, b) =>
                getSortValue(a.section, a.index) - getSortValue(b.section, b.index) ||
                a.index - b.index,
        )
        .map(({ section }) => ({
            ...section,
            children: sortDocumentChildren(section.children),
        }))
}

const docData = ref<DocumentSection[]>([
    {
        label: '1. 基础信息卡',
        fixed: true,
        id: '1',
        children: [
            {
                label: '首页',
                fixed: true,
                id: 'StartModel',
                pid: 1,
                sort: 1,
                data: {
                    reportName: '电梯自行检测记录',
                    userOrganization: '',
                    deviceName: '',
                    inspectionDate: '',
                },
            },

            {
                label: '注意事项',
                fixed: true,
                id: 'AnnouncementsModel',
                pid: 1,
                sort: 2,
            },
            {
                label: '电梯自行检测记录',
                fixed: false,
                id: 'SelfInspectionRecordModel',
                sort: 3,
                pid: 1,
                data: {
                    recordNo: '',
                    userOrganization: '',
                    location: '',
                    deviceCode: '',
                    registrationCode: '',
                    deviceCategory: '',
                    productModel: '',
                    manufacturer: '',
                    maintenanceOrganization: '',
                    ratedLoad: '',
                    ratedSpeed: '',
                    floorStationDoor: '',
                    inspectionDate: '',
                    inspectionBasis: '《电梯自行检测规则》(TSG T7008—2023)',
                    inspectorNames: '',
                    conclusion: '',
                    remark: '',
                },
            },
            {
                label: '检测条件及主要检测仪器设备',
                fixed: false,
                id: 'InspectionConditionModel',
                pid: 1,
                sort: 4,
                data: {
                    temperature: '',
                    humidity: '',
                    supplyVoltage: '',
                    inspectionLocation: '',
                    instruments: [
                        {
                            rowKey: 1,
                            sequence: '1',
                            name: '激光测距仪',
                            code: 'YQ-001',
                            status: '可用',
                        },
                        {
                            rowKey: 2,
                            sequence: '2',
                            name: '绝缘电阻测试仪',
                            code: 'YQ-002',
                            status: '可用',
                        },
                        {
                            rowKey: 3,
                            sequence: '3',
                            name: '钳形电流表',
                            code: 'YQ-003',
                            status: '可用',
                        },
                    ],
                },
            },
            {
                label: '检测项目、内容和要求',
                fixed: false,
                id: 'InspectionItemsModel',
                pid: 1,
                sort: 5,
                data: {
                    items: [
                        {
                            sequence: 1,
                            code: 'A1.1',
                            title: '使用资料',
                            requirement: '确认使用维护说明和维护保养记录等资料齐全。',
                            result: '',
                            conclusion: '',
                        },
                        {
                            sequence: 2,
                            code: 'A1.2',
                            title: '通道及照明',
                            requirement: '确认通往机器空间的通道畅通并设置永久照明。',
                            result: '',
                            conclusion: '',
                        },
                        {
                            sequence: 3,
                            code: 'A1.3',
                            title: '制动器',
                            requirement: '确认制动器动作灵活且制动部件工作正常。',
                            result: '',
                            conclusion: '',
                        },
                        {
                            sequence: 4,
                            code: 'A1.4',
                            title: '门间隙',
                            requirement: '测量门扇及门扇与立柱、门楣和地坎之间的间隙。',
                            result: '',
                            conclusion: '',
                        },
                        {
                            sequence: 5,
                            code: 'A1.5',
                            title: '应急救援试验',
                            requirement: '确认能够按照应急救援程序安全及时完成救援。',
                            result: '',
                            conclusion: '',
                        },
                    ],
                },
            },
        ],
    },
])

const sortedDocData = computed<DocumentSection[]>({
    get: () => sortDocumentSections(docData.value),
    set: (value) => {
        docData.value = sortDocumentSections(value)
    },
})

// 当前先暂存到页面状态，后续接入报告草稿保存接口时替换此方法。
const saveReportDraft = () => {
    docData.value = sortDocumentSections(docData.value)
    ElMessage.success('报表草稿已暂存')
}
</script>
<style lang="scss" scoped>
.statement-page {
    height: 100vh;
    display: flex;
    flex-direction: column;

    &__header {
        position: relative;
        z-index: $z-header;
        display: flex;
        flex: 0 0 auto;
        align-items: center;
        justify-content: space-between;
        height: $report-panel-header-height;
        padding: 0 $space-md;
        background: var(--card-bg);
        border-bottom: 1px solid var(--header-border);
        box-shadow: 0 4px 12px var(--layout-shadow);
    }

    &__content {
        flex: 1;
        display: grid;
        grid-template-columns: $report-left-menu-width minmax(0, 1fr) $report-right-panel-width;
        min-height: 0;

        .content-template {
            background-color: var(--report-workspace-bg);
        }
    }
}
</style>
