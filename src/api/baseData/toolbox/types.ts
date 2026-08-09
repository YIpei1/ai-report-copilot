import type { DataStatus } from '../types'

// 工具箱完整数据，通过 instrumentIds 关联多台仪器。
export interface Toolbox {
    id: string
    code: string
    name: string
    applicableType: string
    instrumentIds: string[]
    status: DataStatus
    remark: string
    createdAt: string
    updatedAt: string
}

// 工具箱分页查询参数。
export interface ToolboxListParams {
    keyword?: string
    status?: DataStatus | ''
    remark?: string
    page: number
    pageSize: number
}

// 工具箱分页查询结果。
export interface ToolboxListData {
    items: Toolbox[]
    total: number
}

// 新增或编辑工具箱时提交的表单数据。
export interface ToolboxFormParams {
    code: string
    name: string
    applicableType: string
    instrumentIds: string[]
    status: DataStatus
    remark: string
}

// 编辑工具箱时额外携带工具箱 id。
export interface UpdateToolboxParams extends ToolboxFormParams {
    id: string
}
