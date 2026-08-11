import request from '@/http/request'
import type { ApiResponse } from '@/http/requestType'
import type {
    InspectionReport,
    InspectionReportListParams,
    InspectionReportListResult,
    SaveInspectionReportParams,
    UpdateInspectionReportParams,
} from './types'

// 按搜索条件分页查询检测报告。
export const getInspectionReportList = (params: InspectionReportListParams) => {
    return request<ApiResponse<InspectionReportListResult>>({
        url: '/reports',
        method: 'get',
        params,
    })
}

// 根据报告 id 获取保存时的完整文档和基础数据快照。
export const getInspectionReportDetail = (id: string) => {
    return request<ApiResponse<InspectionReport>>({
        url: `/reports/${id}`,
        method: 'get',
    })
}

// 首次保存检测报告。
export const createInspectionReport = (data: SaveInspectionReportParams) => {
    return request<ApiResponse<InspectionReport>, SaveInspectionReportParams>({
        url: '/reports',
        method: 'post',
        data,
    })
}

// 更新已保存的报告草稿或完整报告。
export const updateInspectionReport = ({ id, ...data }: UpdateInspectionReportParams) => {
    return request<ApiResponse<InspectionReport>, SaveInspectionReportParams>({
        url: `/reports/${id}`,
        method: 'put',
        data,
    })
}

export * from './types'
