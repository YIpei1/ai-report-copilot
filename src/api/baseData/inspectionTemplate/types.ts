// 检测模板与报表组件之间的配置关系。
export interface TemplateComponentConfig {
    // 报表组件唯一标识。
    reportComponentId: string
    // 报表组件在检测报告中的显示顺序。
    sort: number
    // 报表组件在当前模板中的显示标题。
    title: string
}

// 检测模板完整数据，用于模板详情和报告快照。
export interface InspectionTemplate {
    id: string
    code: string
    name: string
    version: string
    description: string
    // 标记是否为系统提供的演示模板。
    isDemo: boolean
    // 当前模板已选择并排序的报表组件。
    components: TemplateComponentConfig[]
    createdAt: string
    updatedAt: string
}

// 检测模板列表中的单条精简数据。
export interface InspectionTemplateItem {
    id: string
    code: string
    name: string
    version: string
    componentCount: number
    updatedAt: string
}

// 检测模板分页查询参数。
export interface InspectionTemplateListParams {
    // 按模板名称或模板编号模糊搜索。
    keyword?: string
    // 按模板版本模糊搜索。
    version?: string
    page: number
    pageSize: number
}

// 检测模板分页查询结果。
export interface InspectionTemplateListData {
    items: InspectionTemplateItem[]
    total: number
}

// 新增检测模板时提交的基础信息。
export interface InspectionTemplateFormParams {
    code: string
    name: string
    version: string
    description: string
}

// 更新模板报表组件时提交的请求体。
export interface UpdateTemplateComponentsData {
    components: TemplateComponentConfig[]
}

// 更新模板报表组件时使用的完整调用参数。
export interface UpdateTemplateComponentsParams extends UpdateTemplateComponentsData {
    id: string
}
