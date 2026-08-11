import request from '@/http/request'
import type { ApiResponse } from '@/http/requestType'
import type {
    Device,
    DeviceFormParams,
    DeviceListData,
    DeviceListParams,
    UpdateDeviceParams,
} from './types'

// 分页查询设备台账，可按关键字和设备状态筛选。
export const getDeviceList = (params: DeviceListParams) => {
    return request<ApiResponse<DeviceListData>>({
        url: '/base-data/devices',
        method: 'get',
        params,
    })
}

// 根据设备 id 查询完整台账信息，用于创建检测和生成报告快照。
export const getDeviceDetail = (id: string) => {
    return request<ApiResponse<Device>>({
        url: `/base-data/devices/${id}`,
        method: 'get',
    })
}

// 新增一条设备台账记录。
export const createDevice = (data: DeviceFormParams) => {
    return request<ApiResponse<Device>, DeviceFormParams>({
        url: '/base-data/devices',
        method: 'post',
        data,
    })
}

// 根据设备 id 更新对应的台账信息。
export const updateDevice = ({ id, ...data }: UpdateDeviceParams) => {
    return request<ApiResponse<Device>, DeviceFormParams>({
        url: `/base-data/devices/${id}`,
        method: 'put',
        data,
    })
}

// 根据设备 id 删除对应的台账记录。
export const deleteDevice = (id: string) => {
    return request<ApiResponse<null>>({
        url: `/base-data/devices/${id}`,
        method: 'delete',
    })
}

export * from './types'
