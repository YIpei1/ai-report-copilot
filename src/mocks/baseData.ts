import { delay, http, HttpResponse } from 'msw'
import type {
    Device,
    DeviceFormParams,
    DeviceListData,
    InspectionTemplate,
    InspectionTemplateFormParams,
    InspectionTemplateListData,
    InspectionTemplateItem,
    Instrument,
    InstrumentFormParams,
    InstrumentListData,
    TemplateComponentConfig,
    Toolbox,
    ToolboxFormParams,
    ToolboxListData,
    ToolboxListItem,
} from '@/api/baseData'
import type { ApiResponse } from '@/http/requestType'
import {
    deleteMockRecord,
    getAllMockRecords,
    getMockRecord,
    mockDatabaseStores,
    putMockRecord,
} from './database'

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

const getTemplateSummary = (template: InspectionTemplate): InspectionTemplateItem => ({
    id: template.id,
    code: template.code,
    name: template.name,
    version: template.version,
    componentCount: template.components.length,
    updatedAt: template.updatedAt,
})

// 根据工具箱自身状态和关联仪器状态，实时计算创建检测时是否可用。
const getToolboxAvailability = (
    toolbox: Toolbox,
    instruments: Instrument[],
): Pick<ToolboxListItem, 'available' | 'unavailableReason'> => {
    if (toolbox.status !== 'enabled') {
        return { available: false, unavailableReason: '工具箱已停用' }
    }

    if (toolbox.instrumentIds.length === 0) {
        return { available: false, unavailableReason: '未配置仪器设备' }
    }

    const instrumentMap = new Map(instruments.map((instrument) => [instrument.id, instrument]))
    const selectedInstruments = toolbox.instrumentIds
        .map((id) => instrumentMap.get(id))
        .filter((instrument) => instrument !== undefined)

    if (selectedInstruments.length !== toolbox.instrumentIds.length) {
        return { available: false, unavailableReason: '存在已删除的仪器设备' }
    }

    const disabledInstrument = selectedInstruments.find(
        (instrument) => instrument.status === 'disabled',
    )
    if (disabledInstrument) {
        return {
            available: false,
            unavailableReason: `包含停用仪器：${disabledInstrument.name}`,
        }
    }

    const today = new Date().toISOString().slice(0, 10)
    const expiredInstrument = selectedInstruments.find(
        (instrument) => instrument.status === 'expired' || instrument.verificationExpiresAt < today,
    )
    if (expiredInstrument) {
        return {
            available: false,
            unavailableReason: `包含过期仪器：${expiredInstrument.name}`,
        }
    }

    return { available: true, unavailableReason: '' }
}

export const baseDataHandlers = [
    http.get('/api/base-data/devices', async ({ request }) => {
        await delay(200)

        const devices = await getAllMockRecords(mockDatabaseStores.devices)
        const url = new URL(request.url)
        const keyword = url.searchParams.get('keyword')?.trim().toLowerCase() ?? ''
        const status = url.searchParams.get('status') ?? ''
        const page = Number(url.searchParams.get('page') || 1)
        const pageSize = Number(url.searchParams.get('pageSize') || 10)
        const filteredDevices = devices.filter((device) => {
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
        await putMockRecord(mockDatabaseStores.devices, device)
        return HttpResponse.json(createSuccessResponse('新增设备成功', device))
    }),

    http.get('/api/base-data/devices/:id', async ({ params }) => {
        await delay(150)
        const device = await getMockRecord(mockDatabaseStores.devices, String(params.id))

        return device
            ? HttpResponse.json(createSuccessResponse('获取设备详情成功', device))
            : createNotFoundResponse('设备不存在')
    }),

    http.put('/api/base-data/devices/:id', async ({ params, request }) => {
        await delay(200)
        const id = String(params.id)
        const device = await getMockRecord(mockDatabaseStores.devices, id)
        if (!device) return createNotFoundResponse('设备不存在')

        const updatedDevice: Device = {
            ...device,
            ...((await request.json()) as DeviceFormParams),
            updatedAt: createTimestamp(),
        }
        await putMockRecord(mockDatabaseStores.devices, updatedDevice)
        return HttpResponse.json(createSuccessResponse('编辑设备成功', updatedDevice))
    }),

    http.delete('/api/base-data/devices/:id', async ({ params }) => {
        await delay(150)
        const id = String(params.id)
        const device = await getMockRecord(mockDatabaseStores.devices, id)
        if (!device) return createNotFoundResponse('设备不存在')

        await deleteMockRecord(mockDatabaseStores.devices, id)
        return HttpResponse.json(createSuccessResponse('删除设备成功', null))
    }),

    http.get('/api/base-data/instruments', async ({ request }) => {
        await delay(200)

        const instruments = await getAllMockRecords(mockDatabaseStores.instruments)
        const url = new URL(request.url)
        const keyword = url.searchParams.get('keyword')?.trim().toLowerCase() ?? ''
        const status = url.searchParams.get('status') ?? ''
        const verificationExpiresAtStart = url.searchParams.get('verificationExpiresAtStart') ?? ''
        const verificationExpiresAtEnd = url.searchParams.get('verificationExpiresAtEnd') ?? ''
        const page = Number(url.searchParams.get('page') || 1)
        const pageSize = Number(url.searchParams.get('pageSize') || 10)
        const filteredInstruments = instruments.filter((instrument) => {
            const matchesKeyword =
                !keyword ||
                [instrument.code, instrument.name, instrument.model].some((value) =>
                    value.toLowerCase().includes(keyword),
                )
            const matchesStatus = !status || instrument.status === status
            const matchesStartDate =
                !verificationExpiresAtStart ||
                instrument.verificationExpiresAt >= verificationExpiresAtStart
            const matchesEndDate =
                !verificationExpiresAtEnd ||
                instrument.verificationExpiresAt <= verificationExpiresAtEnd

            return matchesKeyword && matchesStatus && matchesStartDate && matchesEndDate
        })
        const startIndex = (page - 1) * pageSize
        const data: InstrumentListData = {
            items: filteredInstruments.slice(startIndex, startIndex + pageSize),
            total: filteredInstruments.length,
        }

        return HttpResponse.json(createSuccessResponse('获取仪器设备成功', data))
    }),

    http.get('/api/base-data/instruments/options', async () => {
        await delay(150)
        const instruments = await getAllMockRecords(mockDatabaseStores.instruments)
        return HttpResponse.json(createSuccessResponse('获取仪器选项成功', instruments))
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
        await putMockRecord(mockDatabaseStores.instruments, instrument)
        return HttpResponse.json(createSuccessResponse('新增仪器成功', instrument))
    }),

    http.put('/api/base-data/instruments/:id', async ({ params, request }) => {
        await delay(200)
        const id = String(params.id)
        const instrument = await getMockRecord(mockDatabaseStores.instruments, id)
        if (!instrument) return createNotFoundResponse('仪器不存在')

        const updatedInstrument: Instrument = {
            ...instrument,
            ...((await request.json()) as InstrumentFormParams),
            updatedAt: createTimestamp(),
        }
        await putMockRecord(mockDatabaseStores.instruments, updatedInstrument)
        return HttpResponse.json(createSuccessResponse('编辑仪器成功', updatedInstrument))
    }),

    http.delete('/api/base-data/instruments/:id', async ({ params }) => {
        await delay(150)
        const id = String(params.id)
        const instrument = await getMockRecord(mockDatabaseStores.instruments, id)
        if (!instrument) return createNotFoundResponse('仪器不存在')

        const toolboxes = await getAllMockRecords(mockDatabaseStores.toolboxes)
        const isUsed = toolboxes.some((toolbox) => toolbox.instrumentIds.includes(id))
        if (isUsed) {
            return HttpResponse.json(
                { code: 10005, message: '仪器已被工具箱使用，无法删除', data: null },
                { status: 409 },
            )
        }

        await deleteMockRecord(mockDatabaseStores.instruments, id)
        return HttpResponse.json(createSuccessResponse('删除仪器成功', null))
    }),

    http.get('/api/base-data/toolboxes', async ({ request }) => {
        await delay(200)

        const [toolboxes, instruments] = await Promise.all([
            getAllMockRecords(mockDatabaseStores.toolboxes),
            getAllMockRecords(mockDatabaseStores.instruments),
        ])
        const url = new URL(request.url)
        const keyword = url.searchParams.get('keyword')?.trim().toLowerCase() ?? ''
        const status = url.searchParams.get('status') ?? ''
        const remark = url.searchParams.get('remark')?.trim().toLowerCase() ?? ''
        const page = Number(url.searchParams.get('page') || 1)
        const pageSize = Number(url.searchParams.get('pageSize') || 10)
        const filteredToolboxes = toolboxes.filter((toolbox) => {
            const matchesKeyword =
                !keyword ||
                [toolbox.name, toolbox.code].some((value) => value.toLowerCase().includes(keyword))
            const matchesStatus = !status || toolbox.status === status
            const matchesRemark = !remark || toolbox.remark.toLowerCase().includes(remark)

            return matchesKeyword && matchesStatus && matchesRemark
        })
        const startIndex = (page - 1) * pageSize
        const data: ToolboxListData = {
            items: filteredToolboxes.slice(startIndex, startIndex + pageSize).map((toolbox) => ({
                ...toolbox,
                ...getToolboxAvailability(toolbox, instruments),
            })),
            total: filteredToolboxes.length,
        }

        return HttpResponse.json(createSuccessResponse('获取工具箱成功', data))
    }),

    http.get('/api/base-data/toolboxes/options/available', async () => {
        await delay(150)

        const [toolboxes, instruments] = await Promise.all([
            getAllMockRecords(mockDatabaseStores.toolboxes),
            getAllMockRecords(mockDatabaseStores.instruments),
        ])
        const availableToolboxes = toolboxes.filter(
            (toolbox) => getToolboxAvailability(toolbox, instruments).available,
        )

        return HttpResponse.json(
            createSuccessResponse('获取可用工具箱选项成功', availableToolboxes),
        )
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
        await putMockRecord(mockDatabaseStores.toolboxes, toolbox)
        return HttpResponse.json(createSuccessResponse('新增工具箱成功', toolbox))
    }),

    http.get('/api/base-data/toolboxes/:id', async ({ params }) => {
        await delay(150)
        const toolbox = await getMockRecord(mockDatabaseStores.toolboxes, String(params.id))

        return toolbox
            ? HttpResponse.json(createSuccessResponse('获取工具箱详情成功', toolbox))
            : createNotFoundResponse('工具箱不存在')
    }),

    http.put('/api/base-data/toolboxes/:id', async ({ params, request }) => {
        await delay(200)
        const id = String(params.id)
        const toolbox = await getMockRecord(mockDatabaseStores.toolboxes, id)
        if (!toolbox) return createNotFoundResponse('工具箱不存在')

        const updatedToolbox: Toolbox = {
            ...toolbox,
            ...((await request.json()) as ToolboxFormParams),
            updatedAt: createTimestamp(),
        }
        await putMockRecord(mockDatabaseStores.toolboxes, updatedToolbox)
        return HttpResponse.json(createSuccessResponse('编辑工具箱成功', updatedToolbox))
    }),

    http.delete('/api/base-data/toolboxes/:id', async ({ params }) => {
        await delay(150)
        const id = String(params.id)
        const toolbox = await getMockRecord(mockDatabaseStores.toolboxes, id)
        if (!toolbox) return createNotFoundResponse('工具箱不存在')

        await deleteMockRecord(mockDatabaseStores.toolboxes, id)
        return HttpResponse.json(createSuccessResponse('删除工具箱成功', null))
    }),

    http.get('/api/base-data/report-components', async () => {
        await delay(200)
        const reportComponents = await getAllMockRecords(mockDatabaseStores.reportComponents)
        return HttpResponse.json(createSuccessResponse('获取报表组件成功', reportComponents))
    }),

    http.get('/api/base-data/templates', async ({ request }) => {
        await delay(200)

        const inspectionTemplates = await getAllMockRecords(mockDatabaseStores.inspectionTemplates)
        const url = new URL(request.url)
        const keyword = url.searchParams.get('keyword')?.trim().toLowerCase() ?? ''
        const version = url.searchParams.get('version')?.trim().toLowerCase() ?? ''
        const page = Math.max(1, Number(url.searchParams.get('page') || 1))
        const pageSize = Math.max(1, Number(url.searchParams.get('pageSize') || 10))
        const filteredTemplates = inspectionTemplates.filter((template) => {
            const matchesKeyword =
                !keyword ||
                [template.name, template.code].some((value) =>
                    value.toLowerCase().includes(keyword),
                )
            const matchesVersion = !version || template.version.toLowerCase().includes(version)

            return matchesKeyword && matchesVersion
        })
        const startIndex = (page - 1) * pageSize
        const data: InspectionTemplateListData = {
            items: filteredTemplates
                .map(getTemplateSummary)
                .slice(startIndex, startIndex + pageSize),
            total: filteredTemplates.length,
        }

        return HttpResponse.json(createSuccessResponse('获取检测模板列表成功', data))
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
        await putMockRecord(mockDatabaseStores.inspectionTemplates, template)
        return HttpResponse.json(createSuccessResponse('新增检测模板成功', template))
    }),

    http.get('/api/base-data/templates/:id', async ({ params }) => {
        await delay(200)
        const template = await getMockRecord(
            mockDatabaseStores.inspectionTemplates,
            String(params.id),
        )
        return template
            ? HttpResponse.json(createSuccessResponse('获取检测模板详情成功', template))
            : createNotFoundResponse('检测模板不存在')
    }),

    http.delete('/api/base-data/templates/:id', async ({ params }) => {
        await delay(150)
        const id = String(params.id)
        const template = await getMockRecord(mockDatabaseStores.inspectionTemplates, id)
        if (!template) return createNotFoundResponse('检测模板不存在')

        await deleteMockRecord(mockDatabaseStores.inspectionTemplates, id)
        return HttpResponse.json(createSuccessResponse('删除检测模板成功', null))
    }),

    http.put('/api/base-data/templates/:id/components', async ({ params, request }) => {
        await delay(200)
        const id = String(params.id)
        const template = await getMockRecord(mockDatabaseStores.inspectionTemplates, id)
        if (!template) return createNotFoundResponse('检测模板不存在')

        const data = (await request.json()) as { components: TemplateComponentConfig[] }
        const updatedTemplate: InspectionTemplate = {
            ...template,
            components: data.components,
            updatedAt: createTimestamp(),
        }
        await putMockRecord(mockDatabaseStores.inspectionTemplates, updatedTemplate)
        return HttpResponse.json(createSuccessResponse('保存模板组件成功', updatedTemplate))
    }),
]
