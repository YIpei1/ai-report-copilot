// 仪器设备当前使用状态。
export type InstrumentStatus = 'available' | 'disabled' | 'expired'

// 仪器设备完整数据。
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

// 仪器设备分页查询参数。
export interface InstrumentListParams {
    keyword?: string
    verificationExpiresAtStart?: string
    verificationExpiresAtEnd?: string
    status?: InstrumentStatus | ''
    page: number
    pageSize: number
}

// 仪器设备分页查询结果。
export interface InstrumentListData {
    items: Instrument[]
    total: number
}

// 新增或编辑仪器时提交的表单数据。
export interface InstrumentFormParams {
    code: string
    name: string
    model: string
    serialNumber: string
    purpose: string
    verificationExpiresAt: string
    status: InstrumentStatus
}

// 编辑仪器时额外携带仪器 id。
export interface UpdateInstrumentParams extends InstrumentFormParams {
    id: string
}
