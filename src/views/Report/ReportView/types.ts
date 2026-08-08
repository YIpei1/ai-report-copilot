// 报表组件通过 TypeScript 模块扩展向该映射注册自身的数据类型。
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface TemplateDataMap {}

type BaseDocumentChild<ID extends string, Data> = {
    label: string
    fixed: boolean
    id: string
    templateId?: ID
    pid: number
    sort: number
} & (Data extends undefined ? { data?: undefined } : { data: Data })

export type DocumentChild = {
    [K in keyof TemplateDataMap]: BaseDocumentChild<K, TemplateDataMap[K]>
}[keyof TemplateDataMap]

export type DocumentSection = {
    label: string
    fixed: boolean
    id: string
    sort?: number
    children: DocumentChild[]
}
