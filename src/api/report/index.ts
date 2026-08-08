import request from '@/http/request'
import type { ApiResponse } from '@/http/requestType'
import type { InspectionReportSummary } from './types'

export const getInspectionReportList = () => {
    return request<ApiResponse<InspectionReportSummary[]>>({
        url: '/reports',
        method: 'get',
    })
}

export * from './types'
