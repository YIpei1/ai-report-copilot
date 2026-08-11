import type { Device, InspectionTemplate, Instrument, Toolbox } from '@/api/baseData'

export type ReportSource = 'ai' | 'manual'
export type ReportStatus = 'approved' | 'draft' | 'pending_review' | 'rejected'

export interface InspectionReportSummary {
    id: string
    reportCode: string
    reportName: string
    deviceName: string
    userOrganization: string
    templateName: string
    source: ReportSource
    status: ReportStatus
    createdBy: string
    createdAt: string
}

// 保存时记录报告完整性结果，便于草稿列表和后续审核流程展示问题。
export interface InspectionReportValidation {
    invalidFieldLabels: string[]
    missingFieldLabels: string[]
    nonConformingItemLabels: string[]
    unavailableInstrumentLabels: string[]
}

// 检测报告完整数据包含创建时的基础数据快照，后续编辑不再读取实时基础数据。
export interface InspectionReport extends InspectionReportSummary {
    templateSnapshot: InspectionTemplate
    deviceSnapshot: Device
    toolboxSnapshot: Toolbox
    instrumentSnapshots: Instrument[]
    documentData: unknown
    validation: InspectionReportValidation
    updatedAt: string
}

// 新增报告时由服务端生成 id 和时间字段。
export type SaveInspectionReportParams = Omit<InspectionReport, 'id' | 'createdAt' | 'updatedAt'>

// 更新报告时携带已保存的报告 id。
export type UpdateInspectionReportParams = SaveInspectionReportParams & {
    id: string
}

// 报告管理列表的搜索与分页参数。
export interface InspectionReportListParams {
    keyword: string
    source: ReportSource | ''
    status: ReportStatus | ''
    createdBy: string
    createdAtStart: string
    createdAtEnd: string
    templateName: string
    page: number
    pageSize: number
}

// 报告管理列表的分页响应数据。
export interface InspectionReportListResult {
    items: InspectionReportSummary[]
    total: number
}
