import request from '@/http/request'
import type { ApiResponse } from '@/http/requestType'
import type {
    Instrument,
    InstrumentFormParams,
    InstrumentListData,
    InstrumentListParams,
    UpdateInstrumentParams,
} from './types'

// 分页查询仪器设备，可按关键字、检定有效期和使用状态筛选。
export const getInstrumentList = (params: InstrumentListParams) => {
    return request<ApiResponse<InstrumentListData>>({
        url: '/base-data/instruments',
        method: 'get',
        params,
    })
}

// 查询工具箱配置所需的全部仪器选项。
export const getInstrumentOptions = () => {
    return request<ApiResponse<Instrument[]>>({
        url: '/base-data/instruments/options',
        method: 'get',
    })
}

// 新增一条仪器设备记录。
export const createInstrument = (data: InstrumentFormParams) => {
    return request<ApiResponse<Instrument>, InstrumentFormParams>({
        url: '/base-data/instruments',
        method: 'post',
        data,
    })
}

// 根据仪器 id 更新对应的仪器信息。
export const updateInstrument = ({ id, ...data }: UpdateInstrumentParams) => {
    return request<ApiResponse<Instrument>, InstrumentFormParams>({
        url: `/base-data/instruments/${id}`,
        method: 'put',
        data,
    })
}

// 根据仪器 id 删除对应的仪器记录。
export const deleteInstrument = (id: string) => {
    return request<ApiResponse<null>>({
        url: `/base-data/instruments/${id}`,
        method: 'delete',
    })
}

export * from './types'
