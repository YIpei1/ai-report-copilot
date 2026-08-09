import { delay, http, HttpResponse } from 'msw'
import type { InspectionReportListResult } from '@/api/report'
import type { ApiResponse } from '@/http/requestType'
import { mockInspectionReports } from './data/reports'

export const reportHandlers = [
    http.get('/api/reports', async ({ request }) => {
        await delay(200)

        const url = new URL(request.url)
        const keyword = (url.searchParams.get('keyword') || '').trim().toLowerCase()
        const source = url.searchParams.get('source') || ''
        const status = url.searchParams.get('status') || ''
        const createdBy = (url.searchParams.get('createdBy') || '').trim().toLowerCase()
        const createdAtStart = url.searchParams.get('createdAtStart') || ''
        const createdAtEnd = url.searchParams.get('createdAtEnd') || ''
        const templateName = url.searchParams.get('templateName') || ''
        const page = Math.max(1, Number(url.searchParams.get('page') || 1))
        const pageSize = Math.max(1, Number(url.searchParams.get('pageSize') || 10))

        const filteredReports = mockInspectionReports.filter((report) => {
            const matchesKeyword =
                !keyword ||
                [report.reportName, report.reportCode, report.deviceName].some((value) =>
                    value.toLowerCase().includes(keyword),
                )
            const matchesSource = !source || report.source === source
            const matchesStatus = !status || report.status === status
            const matchesCreatedBy =
                !createdBy || report.createdBy.toLowerCase().includes(createdBy)
            const matchesCreatedAtStart = !createdAtStart || report.createdAt >= createdAtStart
            const matchesCreatedAtEnd = !createdAtEnd || report.createdAt <= createdAtEnd
            const matchesTemplate = !templateName || report.templateName === templateName

            return (
                matchesKeyword &&
                matchesSource &&
                matchesStatus &&
                matchesCreatedBy &&
                matchesCreatedAtStart &&
                matchesCreatedAtEnd &&
                matchesTemplate
            )
        })
        const startIndex = (page - 1) * pageSize
        const data: InspectionReportListResult = {
            items: filteredReports.slice(startIndex, startIndex + pageSize),
            total: filteredReports.length,
        }

        return HttpResponse.json({
            code: 0,
            message: '获取报告列表成功',
            data,
        } satisfies ApiResponse<InspectionReportListResult>)
    }),
]
