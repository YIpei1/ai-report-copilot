import { delay, http, HttpResponse } from 'msw'
import type { ApiResponse } from '@/http/requestType'
import { mockInspectionReports } from './data/reports'

export const reportHandlers = [
    http.get('/api/reports', async () => {
        await delay(200)

        return HttpResponse.json({
            code: 0,
            message: '获取报告列表成功',
            data: mockInspectionReports,
        } satisfies ApiResponse<typeof mockInspectionReports>)
    }),
]
