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
