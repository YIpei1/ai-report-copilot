import request from '@/http/request'
import type { ApiResponse } from '@/http/requestType'
import type { ReportComponentDefinition } from './types'

// 查询可用于组合检测模板的固定报表组件。
export const getReportComponentList = () => {
    return request<ApiResponse<ReportComponentDefinition[]>>({
        url: '/base-data/report-components',
        method: 'get',
    })
}

export * from './types'
