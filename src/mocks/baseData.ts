import { delay, http, HttpResponse } from 'msw'
import type {
    DataStatus,
    Device,
    DeviceFormParams,
    DeviceListData,
    InspectionTemplate,
    InspectionTemplateFormParams,
    InspectionTemplateSummary,
    Instrument,
    InstrumentFormParams,
    TemplateComponentConfig,
    Toolbox,
    ToolboxFormParams,
} from '@/api/baseData'
import type { ApiResponse } from '@/http/requestType'
import {
    mockDevices,
    mockInspectionTemplates,
    mockInstruments,
    mockReportComponents,
    mockToolboxes,
} from './data/baseData'

const createSuccessResponse = <T>(message: string, data: T): ApiResponse<T> => ({
    code: 0,
    message,
    data,
})

const createNotFoundResponse = (message: string) => {
    return HttpResponse.json(
        {
            code: 10004,
            message,
            data: null,
        } satisfies ApiResponse<null>,
        { status: 404 },
    )
}

const createTimestamp = (): string => {
    return new Date().toLocaleString('zh-CN', { hour12: false })
}

const getTemplateSummary = (template: InspectionTemplate): InspectionTemplateSummary => ({
    id: template.id,
    code: template.code,
    name: template.name,
    version: template.version,
    standard: template.standard,
    applicableType: template.applicableType,
    status: template.status,
    componentCount: template.components.length,
    updatedAt: template.updatedAt,
})

export const baseDataHandlers = [
    http.get('/api/base-data/devices', async ({ request }) => {
        await delay(200)

        const url = new URL(request.url)
        const keyword = url.searchParams.get('keyword')?.trim().toLowerCase() ?? ''
        const status = url.searchParams.get('status') ?? ''
        const page = Number(url.searchParams.get('page') || 1)
        const pageSize = Number(url.searchParams.get('pageSize') || 10)
        const filteredDevices = mockDevices.filter((device) => {
            const matchesKeyword =
                !keyword ||
                [device.name, device.code, device.registrationCode, device.location].some((value) =>
                    value.toLowerCase().includes(keyword),
                )

            return matchesKeyword && (!status || device.status === status)
        })
        const startIndex = (page - 1) * pageSize
        const data: DeviceListData = {
            items: filteredDevices.slice(startIndex, startIndex + pageSize),
            total: filteredDevices.length,
        }

        return HttpResponse.json(createSuccessResponse('获取设备列表成功', data))
    }),

    http.post('/api/base-data/devices', async ({ request }) => {
        await delay(200)
        const params = (await request.json()) as DeviceFormParams
        const now = createTimestamp()
        const device: Device = {
            ...params,
            id: `device-${Date.now()}`,
            createdAt: now,
            updatedAt: now,
        }
        mockDevices.unshift(device)
        return HttpResponse.json(createSuccessResponse('新增设备成功', device))
    }),

    http.put('/api/base-data/devices/:id', async ({ params, request }) => {
        await delay(200)
        const device = mockDevices.find((item) => item.id === params.id)
        if (!device) return createNotFoundResponse('设备不存在')

        Object.assign(device, (await request.json()) as DeviceFormParams, {
            updatedAt: createTimestamp(),
        })
        return HttpResponse.json(createSuccessResponse('编辑设备成功', device))
    }),

    http.delete('/api/base-data/devices/:id', async ({ params }) => {
        await delay(150)
        const index = mockDevices.findIndex((item) => item.id === params.id)
        if (index === -1) return createNotFoundResponse('设备不存在')

        mockDevices.splice(index, 1)
        return HttpResponse.json(createSuccessResponse('删除设备成功', null))
    }),

    http.get('/api/base-data/instruments', async () => {
        await delay(200)
        return HttpResponse.json(createSuccessResponse('获取仪器设备成功', mockInstruments))
    }),

    http.post('/api/base-data/instruments', async ({ request }) => {
        await delay(200)
        const params = (await request.json()) as InstrumentFormParams
        const now = createTimestamp()
        const instrument: Instrument = {
            ...params,
            id: `instrument-${Date.now()}`,
            createdAt: now,
            updatedAt: now,
        }
        mockInstruments.unshift(instrument)
        return HttpResponse.json(createSuccessResponse('新增仪器成功', instrument))
    }),

    http.put('/api/base-data/instruments/:id', async ({ params, request }) => {
        await delay(200)
        const instrument = mockInstruments.find((item) => item.id === params.id)
        if (!instrument) return createNotFoundResponse('仪器不存在')

        Object.assign(instrument, (await request.json()) as InstrumentFormParams, {
            updatedAt: createTimestamp(),
        })
        return HttpResponse.json(createSuccessResponse('编辑仪器成功', instrument))
    }),

    http.delete('/api/base-data/instruments/:id', async ({ params }) => {
        await delay(150)
        const index = mockInstruments.findIndex((item) => item.id === params.id)
        if (index === -1) return createNotFoundResponse('仪器不存在')

        const isUsed = mockToolboxes.some((toolbox) =>
            toolbox.instrumentIds.includes(String(params.id)),
        )
        if (isUsed) {
            return HttpResponse.json(
                { code: 10005, message: '仪器已被工具箱使用，无法删除', data: null },
                { status: 409 },
            )
        }

        mockInstruments.splice(index, 1)
        return HttpResponse.json(createSuccessResponse('删除仪器成功', null))
    }),

    http.get('/api/base-data/toolboxes', async () => {
        await delay(200)
        return HttpResponse.json(createSuccessResponse('获取工具箱成功', mockToolboxes))
    }),

    http.post('/api/base-data/toolboxes', async ({ request }) => {
        await delay(200)
        const params = (await request.json()) as ToolboxFormParams
        const now = createTimestamp()
        const toolbox: Toolbox = {
            ...params,
            id: `toolbox-${Date.now()}`,
            createdAt: now,
            updatedAt: now,
        }
        mockToolboxes.unshift(toolbox)
        return HttpResponse.json(createSuccessResponse('新增工具箱成功', toolbox))
    }),

    http.put('/api/base-data/toolboxes/:id', async ({ params, request }) => {
        await delay(200)
        const toolbox = mockToolboxes.find((item) => item.id === params.id)
        if (!toolbox) return createNotFoundResponse('工具箱不存在')

        Object.assign(toolbox, (await request.json()) as ToolboxFormParams, {
            updatedAt: createTimestamp(),
        })
        return HttpResponse.json(createSuccessResponse('编辑工具箱成功', toolbox))
    }),

    http.delete('/api/base-data/toolboxes/:id', async ({ params }) => {
        await delay(150)
        const index = mockToolboxes.findIndex((item) => item.id === params.id)
        if (index === -1) return createNotFoundResponse('工具箱不存在')

        mockToolboxes.splice(index, 1)
        return HttpResponse.json(createSuccessResponse('删除工具箱成功', null))
    }),

    http.get('/api/base-data/report-components', async () => {
        await delay(200)
        return HttpResponse.json(createSuccessResponse('获取报表组件成功', mockReportComponents))
    }),

    http.get('/api/base-data/templates', async () => {
        await delay(200)
        return HttpResponse.json(
            createSuccessResponse(
                '获取检测模板列表成功',
                mockInspectionTemplates.map(getTemplateSummary),
            ),
        )
    }),

    http.post('/api/base-data/templates', async ({ request }) => {
        await delay(200)
        const params = (await request.json()) as InspectionTemplateFormParams
        const now = createTimestamp()
        const template: InspectionTemplate = {
            ...params,
            id: `template-${Date.now()}`,
            isDemo: true,
            components: [],
            createdAt: now,
            updatedAt: now,
        }
        mockInspectionTemplates.unshift(template)
        return HttpResponse.json(createSuccessResponse('新增检测模板成功', template))
    }),

    http.get('/api/base-data/templates/:id', async ({ params }) => {
        await delay(200)
        const template = mockInspectionTemplates.find((item) => item.id === params.id)
        return template
            ? HttpResponse.json(createSuccessResponse('获取检测模板详情成功', template))
            : createNotFoundResponse('检测模板不存在')
    }),

    http.delete('/api/base-data/templates/:id', async ({ params }) => {
        await delay(150)
        const index = mockInspectionTemplates.findIndex((item) => item.id === params.id)
        if (index === -1) return createNotFoundResponse('检测模板不存在')

        mockInspectionTemplates.splice(index, 1)
        return HttpResponse.json(createSuccessResponse('删除检测模板成功', null))
    }),

    http.patch('/api/base-data/templates/:id/status', async ({ params, request }) => {
        await delay(200)
        const template = mockInspectionTemplates.find((item) => item.id === params.id)
        if (!template) return createNotFoundResponse('检测模板不存在')

        const data = (await request.json()) as { status: DataStatus }
        template.status = data.status
        template.updatedAt = createTimestamp()
        return HttpResponse.json(createSuccessResponse('更新模板状态成功', template))
    }),

    http.put('/api/base-data/templates/:id/components', async ({ params, request }) => {
        await delay(200)
        const template = mockInspectionTemplates.find((item) => item.id === params.id)
        if (!template) return createNotFoundResponse('检测模板不存在')

        const data = (await request.json()) as { components: TemplateComponentConfig[] }
        template.components = data.components
        template.updatedAt = createTimestamp()
        return HttpResponse.json(createSuccessResponse('保存模板组件成功', template))
    }),
]
