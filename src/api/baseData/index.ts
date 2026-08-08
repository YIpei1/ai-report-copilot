import request from '@/http/request'
import type { ApiResponse } from '@/http/requestType'
import type {
    Device,
    DeviceFormParams,
    DeviceListData,
    DeviceListParams,
    InspectionTemplate,
    InspectionTemplateFormParams,
    InspectionTemplateSummary,
    Instrument,
    InstrumentFormParams,
    ReportComponentDefinition,
    Toolbox,
    ToolboxFormParams,
    UpdateDeviceParams,
    UpdateInstrumentParams,
    UpdateTemplateComponentsParams,
    UpdateTemplateStatusParams,
    UpdateToolboxParams,
} from './types'

export const getDeviceList = (params: DeviceListParams) => {
    return request<ApiResponse<DeviceListData>>({
        url: '/base-data/devices',
        method: 'get',
        params,
    })
}

export const createDevice = (data: DeviceFormParams) => {
    return request<ApiResponse<Device>, DeviceFormParams>({
        url: '/base-data/devices',
        method: 'post',
        data,
    })
}

export const updateDevice = ({ id, ...data }: UpdateDeviceParams) => {
    return request<ApiResponse<Device>, DeviceFormParams>({
        url: `/base-data/devices/${id}`,
        method: 'put',
        data,
    })
}

export const deleteDevice = (id: string) => {
    return request<ApiResponse<null>>({
        url: `/base-data/devices/${id}`,
        method: 'delete',
    })
}

export const getInstrumentList = () => {
    return request<ApiResponse<Instrument[]>>({
        url: '/base-data/instruments',
        method: 'get',
    })
}

export const createInstrument = (data: InstrumentFormParams) => {
    return request<ApiResponse<Instrument>, InstrumentFormParams>({
        url: '/base-data/instruments',
        method: 'post',
        data,
    })
}

export const updateInstrument = ({ id, ...data }: UpdateInstrumentParams) => {
    return request<ApiResponse<Instrument>, InstrumentFormParams>({
        url: `/base-data/instruments/${id}`,
        method: 'put',
        data,
    })
}

export const deleteInstrument = (id: string) => {
    return request<ApiResponse<null>>({
        url: `/base-data/instruments/${id}`,
        method: 'delete',
    })
}

export const getToolboxList = () => {
    return request<ApiResponse<Toolbox[]>>({
        url: '/base-data/toolboxes',
        method: 'get',
    })
}

export const createToolbox = (data: ToolboxFormParams) => {
    return request<ApiResponse<Toolbox>, ToolboxFormParams>({
        url: '/base-data/toolboxes',
        method: 'post',
        data,
    })
}

export const updateToolbox = ({ id, ...data }: UpdateToolboxParams) => {
    return request<ApiResponse<Toolbox>, ToolboxFormParams>({
        url: `/base-data/toolboxes/${id}`,
        method: 'put',
        data,
    })
}

export const deleteToolbox = (id: string) => {
    return request<ApiResponse<null>>({
        url: `/base-data/toolboxes/${id}`,
        method: 'delete',
    })
}

export const getReportComponentList = () => {
    return request<ApiResponse<ReportComponentDefinition[]>>({
        url: '/base-data/report-components',
        method: 'get',
    })
}

export const getInspectionTemplateList = () => {
    return request<ApiResponse<InspectionTemplateSummary[]>>({
        url: '/base-data/templates',
        method: 'get',
    })
}

export const createInspectionTemplate = (data: InspectionTemplateFormParams) => {
    return request<ApiResponse<InspectionTemplate>, InspectionTemplateFormParams>({
        url: '/base-data/templates',
        method: 'post',
        data,
    })
}

export const deleteInspectionTemplate = (id: string) => {
    return request<ApiResponse<null>>({
        url: `/base-data/templates/${id}`,
        method: 'delete',
    })
}

export const getInspectionTemplateDetail = (id: string) => {
    return request<ApiResponse<InspectionTemplate>>({
        url: `/base-data/templates/${id}`,
        method: 'get',
    })
}

export const updateInspectionTemplateStatus = ({ id, status }: UpdateTemplateStatusParams) => {
    return request<ApiResponse<InspectionTemplate>, Pick<UpdateTemplateStatusParams, 'status'>>({
        url: `/base-data/templates/${id}/status`,
        method: 'patch',
        data: { status },
    })
}

export const updateInspectionTemplateComponents = ({
    id,
    components,
}: UpdateTemplateComponentsParams) => {
    return request<
        ApiResponse<InspectionTemplate>,
        Pick<UpdateTemplateComponentsParams, 'components'>
    >({
        url: `/base-data/templates/${id}/components`,
        method: 'put',
        data: { components },
    })
}

export * from './types'
