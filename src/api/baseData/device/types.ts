// 设备当前可用状态。
export type DeviceStatus = 'active' | 'disabled'

// 设备台账完整数据。
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

// 设备台账分页查询参数。
export interface DeviceListParams {
    keyword?: string
    status?: DeviceStatus | ''
    page: number
    pageSize: number
}

// 设备台账分页查询结果。
export interface DeviceListData {
    items: Device[]
    total: number
}

// 新增或编辑设备时提交的表单数据。
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

// 编辑设备时额外携带设备 id。
export interface UpdateDeviceParams extends DeviceFormParams {
    id: string
}
