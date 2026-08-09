import type { Component } from 'vue'

// 搜索表单字段允许保存的通用值类型。
export type SearchFilterValue =
    string | number | boolean | Date | string[] | Date[] | null | undefined

// 下拉选项支持的基础值类型。
export type SearchFilterOptionValue = string | number | boolean

// 普通下拉框的选项配置。
export type SearchFilterOption = {
    label: string
    value: SearchFilterOptionValue
    disabled?: boolean
}

// 组件内置支持的搜索控件类型。
export type SearchFilterFieldType =
    'input' | 'select' | 'date-range' | 'datetime' | 'datetime-range'

// 单个搜索字段对应的 Element Plus 响应式栅格配置。
export type SearchFilterCol = {
    span?: number
    xs?: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
}

// 搜索字段配置；页面通过 fields 数组声明搜索项，无需重复编写表单结构。
export type SearchFilterField = {
    // 字段名称，同时作为搜索对象和表单校验中的属性名。
    prop: string
    // 搜索项显示名称。
    label: string
    // 搜索控件类型，未填写时默认使用 input。
    type?: SearchFilterFieldType
    placeholder?: string
    clearable?: boolean
    disabled?: boolean
    // 普通 select 使用的静态选项。
    options?: SearchFilterOption[]
    prefixIcon?: Component
    // 覆盖组件默认的字段栅格宽度。
    col?: SearchFilterCol
    // 日期范围控件的展示和数据格式配置。
    rangeSeparator?: string
    startPlaceholder?: string
    endPlaceholder?: string
    // 时间范围拆分保存时对应的开始字段和结束字段。
    startProp?: string
    endProp?: string
    format?: string
    valueFormat?: string
}
