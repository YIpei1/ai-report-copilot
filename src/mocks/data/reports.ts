import type { InspectionReportSummary } from '@/api/report'

// 报告列表暂时只提供展示数据，后续由 AI 会话确认或手动创建接口写入。
export const mockInspectionReports: InspectionReportSummary[] = [
    {
        id: 'report-001',
        reportCode: 'BG-2026-0001',
        reportName: '研发中心 1 号客梯自行检测报告',
        deviceName: '研发中心 1 号客梯',
        userOrganization: '中安科技有限公司',
        templateName: '曳引驱动电梯自行检测模板（演示版）',
        source: 'ai',
        status: 'draft',
        createdBy: '管理员',
        createdAt: '2026-08-06 14:30:00',
    },
    {
        id: 'report-002',
        reportCode: 'BG-2026-0002',
        reportName: '物流中心载货电梯自行检测报告',
        deviceName: '物流中心载货电梯',
        userOrganization: '中安物流有限公司',
        templateName: '曳引驱动电梯自行检测模板（演示版）',
        source: 'manual',
        status: 'pending_review',
        createdBy: '管理员',
        createdAt: '2026-08-06 15:10:00',
    },
]
