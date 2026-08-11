import request from '@/http/request'
import type { ApiResponse } from '@/http/requestType'
import type {
    Toolbox,
    ToolboxFormParams,
    ToolboxListData,
    ToolboxListParams,
    UpdateToolboxParams,
} from './types'

// 分页查询工具箱，可按名称或编号、状态和备注筛选。
export const getToolboxList = (params: ToolboxListParams) => {
    return request<ApiResponse<ToolboxListData>>({
        url: '/base-data/toolboxes',
        method: 'get',
        params,
    })
}

// 查询创建检测时可选择的工具箱，只返回自身启用且关联仪器均可用的记录。
export const getAvailableToolboxOptions = () => {
    return request<ApiResponse<Toolbox[]>>({
        url: '/base-data/toolboxes/options/available',
        method: 'get',
    })
}

// 根据工具箱 id 查询关联的仪器设备 id。
export const getToolboxDetail = (id: string) => {
    return request<ApiResponse<Toolbox>>({
        url: `/base-data/toolboxes/${id}`,
        method: 'get',
    })
}

// 新增工具箱，并保存所选仪器之间的关联关系。
export const createToolbox = (data: ToolboxFormParams) => {
    return request<ApiResponse<Toolbox>, ToolboxFormParams>({
        url: '/base-data/toolboxes',
        method: 'post',
        data,
    })
}

// 根据工具箱 id 更新基础信息和关联仪器。
export const updateToolbox = ({ id, ...data }: UpdateToolboxParams) => {
    return request<ApiResponse<Toolbox>, ToolboxFormParams>({
        url: `/base-data/toolboxes/${id}`,
        method: 'put',
        data,
    })
}

// 根据工具箱 id 删除对应的工具箱记录。
export const deleteToolbox = (id: string) => {
    return request<ApiResponse<null>>({
        url: `/base-data/toolboxes/${id}`,
        method: 'delete',
    })
}

export * from './types'
