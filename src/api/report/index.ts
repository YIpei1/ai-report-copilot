import request from '@/http/request'
import type { ApiResponse } from '@/http/requestType'
import type { InspectionReportListParams, InspectionReportListResult } from './types'

// 按搜索条件分页查询检测报告。
export const getInspectionReportList = (params: InspectionReportListParams) => {
    return request<ApiResponse<InspectionReportListResult>>({
        url: '/reports',
        method: 'get',
        params,
    })
}

export * from './types'
