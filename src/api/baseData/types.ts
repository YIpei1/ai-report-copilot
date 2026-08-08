export type DataStatus = 'enabled' | 'disabled'
export type DeviceStatus = 'active' | 'disabled'

export interface Device {
    id: string
    name: string
    code: string
    category: string
    model: string
    registrationCode: string
    location: string
    userOrganization: string
    maintenanceOrganization: string
    ratedLoad: number
    ratedSpeed: number
    floors: number
    stations: number
    doors: number
    status: DeviceStatus
    createdAt: string
    updatedAt: string
}

export interface DeviceListParams {
    keyword?: string
    status?: DeviceStatus | ''
    page: number
    pageSize: number
}

export interface DeviceListData {
    items: Device[]
    total: number
}

export interface DeviceFormParams {
    name: string
    code: string
    category: string
    model: string
    registrationCode: string
    location: string
    userOrganization: string
    maintenanceOrganization: string
    ratedLoad: number
    ratedSpeed: number
    floors: number
    stations: number
    doors: number
    status: DeviceStatus
}

export interface UpdateDeviceParams extends DeviceFormParams {
    id: string
}

export type InstrumentStatus = 'available' | 'disabled' | 'expired'

export interface Instrument {
    id: string
    code: string
    name: string
    model: string
    serialNumber: string
    purpose: string
    verificationExpiresAt: string
    status: InstrumentStatus
    createdAt: string
    updatedAt: string
}

export interface InstrumentFormParams {
    code: string
    name: string
    model: string
    serialNumber: string
    purpose: string
    verificationExpiresAt: string
    status: InstrumentStatus
}

export interface UpdateInstrumentParams extends InstrumentFormParams {
    id: string
}

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

export interface ToolboxFormParams {
    code: string
    name: string
    applicableType: string
    instrumentIds: string[]
    status: DataStatus
    remark: string
}

export interface UpdateToolboxParams extends ToolboxFormParams {
    id: string
}

export type ReportComponentCategory =
    'cover' | 'inspection-record' | 'conditions-instruments' | 'inspection-items'

export interface ReportFieldDefinition {
    key: string
    label: string
    dataSource: string
    required: boolean
}

export interface InspectionItemDefinition {
    sequence: number
    code: string
    title: string
    requirement: string
}

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

export interface TemplateComponentConfig {
    reportComponentId: string
    sort: number
    title: string
}

export interface InspectionTemplate {
    id: string
    code: string
    name: string
    version: string
    standard: string
    applicableType: string
    description: string
    status: DataStatus
    isDemo: boolean
    components: TemplateComponentConfig[]
    createdAt: string
    updatedAt: string
}

export interface InspectionTemplateSummary {
    id: string
    code: string
    name: string
    version: string
    standard: string
    applicableType: string
    status: DataStatus
    componentCount: number
    updatedAt: string
}

export interface InspectionTemplateFormParams {
    code: string
    name: string
    version: string
    standard: string
    applicableType: string
    description: string
    status: DataStatus
}

export interface UpdateTemplateStatusParams {
    id: string
    status: DataStatus
}

export interface UpdateTemplateComponentsParams {
    id: string
    components: TemplateComponentConfig[]
}
