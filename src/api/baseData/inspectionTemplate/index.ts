import request from '@/http/request'
import type { ApiResponse } from '@/http/requestType'
import type {
    InspectionTemplate,
    InspectionTemplateFormParams,
    InspectionTemplateListData,
    InspectionTemplateListParams,
    UpdateTemplateComponentsData,
    UpdateTemplateComponentsParams,
} from './types'

// 分页查询检测模板，可按模板名称、编号和版本筛选。
export const getInspectionTemplateList = (params: InspectionTemplateListParams) => {
    return request<ApiResponse<InspectionTemplateListData>>({
        url: '/base-data/templates',
        method: 'get',
        params,
    })
}

// 新增检测模板基础信息，组件配置通过独立接口保存。
export const createInspectionTemplate = (data: InspectionTemplateFormParams) => {
    return request<ApiResponse<InspectionTemplate>, InspectionTemplateFormParams>({
        url: '/base-data/templates',
        method: 'post',
        data,
    })
}

// 根据模板 id 查询模板详情及已配置的报表组件。
export const getInspectionTemplateDetail = (id: string) => {
    return request<ApiResponse<InspectionTemplate>>({
        url: `/base-data/templates/${id}`,
        method: 'get',
    })
}

// 根据模板 id 删除对应的检测模板。
export const deleteInspectionTemplate = (id: string) => {
    return request<ApiResponse<null>>({
        url: `/base-data/templates/${id}`,
        method: 'delete',
    })
}

// 保存检测模板选择的报表组件及最终排列顺序。
export const updateInspectionTemplateComponents = ({
    id,
    components,
}: UpdateTemplateComponentsParams) => {
    return request<ApiResponse<InspectionTemplate>, UpdateTemplateComponentsData>({
        url: `/base-data/templates/${id}/components`,
        method: 'put',
        data: { components },
    })
}

export * from './types'
