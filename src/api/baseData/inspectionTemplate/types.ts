// 检测模板与报表组件之间的配置关系。
export interface TemplateComponentConfig {
    reportComponentId: string
    sort: number
    title: string
}

// 检测模板完整数据。
export interface InspectionTemplate {
    id: string
    code: string
    name: string
    version: string
    standard: string
    applicableType: string
    description: string
    isDemo: boolean
    components: TemplateComponentConfig[]
    createdAt: string
    updatedAt: string
}

// 检测模板列表使用的精简数据。
export interface InspectionTemplateSummary {
    id: string
    code: string
    name: string
    version: string
    standard: string
    applicableType: string
    componentCount: number
    updatedAt: string
}

// 新增检测模板时提交的基础信息。
export interface InspectionTemplateFormParams {
    code: string
    name: string
    version: string
    standard: string
    applicableType: string
    description: string
}

// 检测模板列表的搜索参数。
export interface InspectionTemplateListParams {
    keyword: string
    version: string
    applicableType: string
}

// 保存模板组件及排列顺序时提交的参数。
export interface UpdateTemplateComponentsParams {
    id: string
    components: TemplateComponentConfig[]
}
