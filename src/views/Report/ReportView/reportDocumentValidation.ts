import type { DocumentChild, DocumentSection } from './types'
import { validateReportBusinessValue } from './reportBusinessRules'

export interface ReportDocumentValidationResult {
    invalidFieldLabels: string[]
    missingFieldLabels: string[]
    nonConformingItemLabels: string[]
    unavailableInstrumentLabels: string[]
    isComplete: boolean
}

type RequiredField = {
    key: string
    label: string
}

const requiredFieldsByTemplate: Record<string, RequiredField[]> = {
    StartModel: [
        { key: 'reportName', label: '首页-报告名称' },
        { key: 'userOrganization', label: '首页-使用单位' },
        { key: 'deviceName', label: '首页-设备名称' },
        { key: 'inspectionDate', label: '首页-检测日期' },
    ],
    SelfInspectionRecordModel: [
        { key: 'recordNo', label: '自行检测记录-记录编号' },
        { key: 'userOrganization', label: '自行检测记录-使用单位' },
        { key: 'location', label: '自行检测记录-安装地点' },
        { key: 'deviceCode', label: '自行检测记录-设备编号' },
        { key: 'registrationCode', label: '自行检测记录-注册代码' },
        { key: 'deviceCategory', label: '自行检测记录-设备类别' },
        { key: 'productModel', label: '自行检测记录-产品型号' },
        { key: 'manufacturer', label: '自行检测记录-制造单位' },
        { key: 'maintenanceOrganization', label: '自行检测记录-维护保养单位' },
        { key: 'ratedLoad', label: '自行检测记录-额定载重量' },
        { key: 'ratedSpeed', label: '自行检测记录-额定速度' },
        { key: 'floorStationDoor', label: '自行检测记录-层站门数量' },
        { key: 'inspectionDate', label: '自行检测记录-检测日期' },
        { key: 'inspectionBasis', label: '自行检测记录-检测依据' },
        { key: 'inspectorNames', label: '自行检测记录-检测人员' },
        { key: 'conclusion', label: '自行检测记录-检测结论' },
    ],
    InspectionConditionModel: [
        { key: 'temperature', label: '检测条件-温度' },
        { key: 'humidity', label: '检测条件-湿度' },
        { key: 'supplyVoltage', label: '检测条件-供电电压' },
        { key: 'inspectionLocation', label: '检测条件-检测地点' },
    ],
}

const toRecord = (value: unknown): Record<string, unknown> | undefined => {
    return typeof value === 'object' && value !== null
        ? (value as Record<string, unknown>)
        : undefined
}

const isBlank = (value: unknown): boolean => {
    return typeof value !== 'string' || value.trim().length === 0
}

const getTemplateId = (child: DocumentChild): string => {
    return child.templateId || child.id
}

const validateRequiredFields = (child: DocumentChild, missingFieldLabels: string[]): void => {
    const templateId = getTemplateId(child)
    const requiredFields = requiredFieldsByTemplate[templateId]
    const data = toRecord(child.data)

    if (!requiredFields) return

    requiredFields.forEach((field) => {
        if (!data || isBlank(data[field.key])) {
            missingFieldLabels.push(field.label)
        }
    })
}

const validateInspectionItems = (
    child: DocumentChild,
    invalidFieldLabels: string[],
    missingFieldLabels: string[],
    nonConformingItemLabels: string[],
): void => {
    if (getTemplateId(child) !== 'InspectionItemsModel') return

    const data = toRecord(child.data)
    const items = Array.isArray(data?.items) ? data.items : []

    if (items.length === 0) {
        missingFieldLabels.push('检测项目-未配置检测项')
        return
    }

    items.forEach((item, index) => {
        const itemRecord = toRecord(item)
        const itemCode = String(itemRecord?.code || index + 1)
        const itemLabel = `检测项目-${itemCode}`
        const result = itemRecord?.result
        const conclusion = itemRecord?.conclusion
        const conclusionStatus = validateReportBusinessValue('inspectionConclusion', conclusion)

        // 检测结果允许填写任意现场数据或说明，但不能为空。
        if (isBlank(result)) {
            missingFieldLabels.push(`${itemLabel}-检测结果`)
        }

        if (conclusionStatus === 'empty') {
            missingFieldLabels.push(`${itemLabel}-单项结论`)
        }

        if (conclusionStatus === 'invalid') {
            invalidFieldLabels.push(`${itemLabel}-单项结论`)
        }

        if (conclusionStatus === 'failed') {
            nonConformingItemLabels.push(itemLabel)
        }
    })
}

const validateInstrumentStatuses = (
    child: DocumentChild,
    invalidFieldLabels: string[],
    missingFieldLabels: string[],
    unavailableInstrumentLabels: string[],
): void => {
    const templateId = getTemplateId(child)
    if (!['InspectionConditionModel', 'InspectionConditionAddModel'].includes(templateId)) return

    const data = toRecord(child.data)
    const instruments = Array.isArray(data?.instruments) ? data.instruments : []

    instruments.forEach((instrument, index) => {
        const instrumentRecord = toRecord(instrument)
        if (!instrumentRecord) return

        const rowValues = ['sequence', 'name', 'code', 'status'].map((key) => instrumentRecord[key])
        if (rowValues.every(isBlank)) return

        const instrumentName = String(instrumentRecord.name || `第 ${index + 1} 行仪器`)
        const fieldLabel = `主要检测仪器设备-${instrumentName}-状态`
        const status = validateReportBusinessValue('instrumentStatus', instrumentRecord.status)

        if (status === 'empty') {
            missingFieldLabels.push(fieldLabel)
        } else if (status === 'invalid') {
            invalidFieldLabels.push(fieldLabel)
        } else if (status === 'failed') {
            unavailableInstrumentLabels.push(instrumentName)
        }
    })
}

// 校验报告中的必填字段、未测试项和不符合项，决定保存为草稿还是待审核报告。
export const validateReportDocument = (
    documentData: DocumentSection[],
): ReportDocumentValidationResult => {
    const invalidFieldLabels: string[] = []
    const missingFieldLabels: string[] = []
    const nonConformingItemLabels: string[] = []
    const unavailableInstrumentLabels: string[] = []

    documentData
        .flatMap((section) => section.children)
        .forEach((child) => {
            validateRequiredFields(child, missingFieldLabels)
            validateInspectionItems(
                child,
                invalidFieldLabels,
                missingFieldLabels,
                nonConformingItemLabels,
            )
            validateInstrumentStatuses(
                child,
                invalidFieldLabels,
                missingFieldLabels,
                unavailableInstrumentLabels,
            )
        })

    return {
        invalidFieldLabels,
        missingFieldLabels,
        nonConformingItemLabels,
        unavailableInstrumentLabels,
        isComplete:
            invalidFieldLabels.length === 0 &&
            missingFieldLabels.length === 0 &&
            nonConformingItemLabels.length === 0 &&
            unavailableInstrumentLabels.length === 0,
    }
}
