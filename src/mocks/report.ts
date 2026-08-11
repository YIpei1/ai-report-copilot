import { delay, http, HttpResponse } from 'msw'
import type {
    InspectionReport,
    InspectionReportListResult,
    SaveInspectionReportParams,
} from '@/api/report'
import type { ApiResponse } from '@/http/requestType'
import { getAllMockRecords, getMockRecord, mockDatabaseStores, putMockRecord } from './database'

const createTimestamp = (): string => {
    return new Date().toLocaleString('zh-CN', { hour12: false })
}

const createSuccessResponse = <T>(message: string, data: T): ApiResponse<T> => ({
    code: 0,
    message,
    data,
})

export const reportHandlers = [
    http.get('/api/reports', async ({ request }) => {
        await delay(200)

        const inspectionReports = await getAllMockRecords(mockDatabaseStores.inspectionReports)
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

        const filteredReports = inspectionReports.filter((report) => {
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

    http.get('/api/reports/:id', async ({ params }) => {
        await delay(150)
        const report = await getMockRecord(mockDatabaseStores.inspectionReports, String(params.id))

        if (!report) {
            return HttpResponse.json(
                { code: 10004, message: '检测报告不存在', data: null },
                { status: 404 },
            )
        }

        return HttpResponse.json(createSuccessResponse('获取检测报告详情成功', report))
    }),

    http.post('/api/reports', async ({ request }) => {
        await delay(200)
        const params = (await request.json()) as SaveInspectionReportParams
        const now = createTimestamp()
        const report: InspectionReport = {
            ...params,
            id: `report-${Date.now()}`,
            createdAt: now,
            updatedAt: now,
        }

        await putMockRecord(mockDatabaseStores.inspectionReports, report)
        return HttpResponse.json(createSuccessResponse('保存检测报告成功', report))
    }),

    http.put('/api/reports/:id', async ({ params, request }) => {
        await delay(200)
        const id = String(params.id)
        const report = await getMockRecord(mockDatabaseStores.inspectionReports, id)

        if (!report) {
            return HttpResponse.json(
                { code: 10004, message: '检测报告不存在', data: null },
                { status: 404 },
            )
        }

        const updatedReport: InspectionReport = {
            ...report,
            ...((await request.json()) as SaveInspectionReportParams),
            id,
            createdAt: report.createdAt,
            updatedAt: createTimestamp(),
        }

        await putMockRecord(mockDatabaseStores.inspectionReports, updatedReport)
        return HttpResponse.json(createSuccessResponse('更新检测报告成功', updatedReport))
    }),
]
