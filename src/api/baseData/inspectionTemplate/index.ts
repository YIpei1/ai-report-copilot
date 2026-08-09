import request from '@/http/request'
import type { ApiResponse } from '@/http/requestType'
import type {
    InspectionTemplate,
    InspectionTemplateFormParams,
    InspectionTemplateListParams,
    InspectionTemplateSummary,
    UpdateTemplateComponentsParams,
} from './types'

// 查询检测模板列表，用于模板管理页面展示。
export const getInspectionTemplateList = (params?: InspectionTemplateListParams) => {
    return request<ApiResponse<InspectionTemplateSummary[]>>({
        url: '/base-data/templates',
        method: 'get',
        params,
    })
}

// 新增检测模板基础信息，组件配置由后续接口单独保存。
export const createInspectionTemplate = (data: InspectionTemplateFormParams) => {
    return request<ApiResponse<InspectionTemplate>, InspectionTemplateFormParams>({
        url: '/base-data/templates',
        method: 'post',
        data,
    })
}

// 根据模板 id 删除对应的检测模板。
export const deleteInspectionTemplate = (id: string) => {
    return request<ApiResponse<null>>({
        url: `/base-data/templates/${id}`,
        method: 'delete',
    })
}

// 查询检测模板详情及已配置的报表组件。
export const getInspectionTemplateDetail = (id: string) => {
    return request<ApiResponse<InspectionTemplate>>({
        url: `/base-data/templates/${id}`,
        method: 'get',
    })
}

// 保存检测模板选中的报表组件及组件排列顺序。
export const updateInspectionTemplateComponents = ({
    id,
    components,
}: UpdateTemplateComponentsParams) => {
    return request<
        ApiResponse<InspectionTemplate>,
        Pick<UpdateTemplateComponentsParams, 'components'>
    >({
        url: `/base-data/templates/${id}/components`,
        method: 'put',
        data: { components },
    })
}

export * from './types'
