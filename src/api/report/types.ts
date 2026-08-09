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
