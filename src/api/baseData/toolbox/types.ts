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

// 工具箱管理列表额外展示根据关联仪器实时计算的可用状态。
export interface ToolboxListItem extends Toolbox {
    available: boolean
    unavailableReason: string
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
    items: ToolboxListItem[]
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
