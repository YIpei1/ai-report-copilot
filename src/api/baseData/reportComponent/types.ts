import type { DataStatus } from '../types'

// 报表组件所属的业务分类。
export type ReportComponentCategory =
    'cover' | 'inspection-record' | 'conditions-instruments' | 'inspection-items'

// 报表组件中单个字段的配置定义。
export interface ReportFieldDefinition {
    key: string
    label: string
    dataSource: string
    required: boolean
}

// 检测项目的固定题目定义。
export interface InspectionItemDefinition {
    sequence: number
    code: string
    title: string
    requirement: string
}

// 可被检测模板选择和排序的报表组件定义。
export interface ReportComponentDefinition {
    id: string
    code: string
    name: string
    category: ReportComponentCategory
    description: string
    fields: ReportFieldDefinition[]
    inspectionItems: InspectionItemDefinition[]
    status: DataStatus
    updatedAt: string
}
