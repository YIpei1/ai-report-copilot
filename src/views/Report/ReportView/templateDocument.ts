import type {
    Device,
    InspectionTemplate,
    Instrument,
    ReportComponentDefinition,
    TemplateComponentConfig,
} from '@/api/baseData'
import type { DocumentChild, DocumentSection } from './types'

const createBaseChild = (
    component: ReportComponentDefinition,
    config: TemplateComponentConfig,
) => ({
    label: config.title || component.name,
    fixed: component.category === 'cover',
    pid: 1,
    sort: config.sort,
})

const instrumentStatusTextMap: Record<Instrument['status'], string> = {
    available: '可用',
    disabled: '不可用',
    expired: '不可用',
}

// 使用浏览器本地日期作为本次检测报告的创建日期。
const createCurrentDate = (): string => {
    const currentDate = new Date()
    const year = currentDate.getFullYear()
    const month = String(currentDate.getMonth() + 1).padStart(2, '0')
    const day = String(currentDate.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
}

// 将后端报表组件定义转换为当前报表页面可以动态渲染的组件节点。
const createDocumentChild = (
    template: InspectionTemplate,
    component: ReportComponentDefinition,
    config: TemplateComponentConfig,
    instruments: Instrument[],
    inspectionDate: string,
    device?: Device,
): DocumentChild | null => {
    const baseChild = createBaseChild(component, config)

    switch (component.category) {
        case 'cover':
            return {
                ...baseChild,
                id: 'StartModel',
                templateId: 'StartModel',
                data: {
                    reportName: template.name,
                    userOrganization: device?.userOrganization || '',
                    deviceName: device?.name || '',
                    inspectionDate,
                },
            }
        case 'inspection-record':
            return {
                ...baseChild,
                id: 'SelfInspectionRecordModel',
                templateId: 'SelfInspectionRecordModel',
                data: {
                    recordNo: '',
                    userOrganization: device?.userOrganization || '',
                    location: device?.location || '',
                    deviceCode: device?.code || '',
                    registrationCode: device?.registrationCode || '',
                    deviceCategory: device?.category || '',
                    productModel: device?.model || '',
                    manufacturer: device?.manufacturer || '',
                    maintenanceOrganization: device?.maintenanceOrganization || '',
                    ratedLoad: device ? String(device.ratedLoad) : '',
                    ratedSpeed: device ? String(device.ratedSpeed) : '',
                    floorStationDoor: device
                        ? `${device.floors}/${device.stations}/${device.doors}`
                        : '',
                    inspectionDate,
                    inspectionBasis: '《电梯自行检测规则》(TSG T7008—2023)',
                    inspectorNames: '',
                    conclusion: '',
                    remark: '',
                },
            }
        case 'conditions-instruments':
            return {
                ...baseChild,
                id: 'InspectionConditionModel',
                templateId: 'InspectionConditionModel',
                data: {
                    temperature: '',
                    humidity: '',
                    supplyVoltage: '',
                    inspectionLocation: device?.location || '',
                    instruments: instruments.map((instrument, index) => ({
                        rowKey: index + 1,
                        sequence: String(index + 1),
                        name: instrument.name,
                        code: instrument.code,
                        status: instrumentStatusTextMap[instrument.status],
                    })),
                },
            }
        case 'inspection-items':
            return {
                ...baseChild,
                id: 'InspectionItemsModel',
                templateId: 'InspectionItemsModel',
                data: {
                    items: component.inspectionItems.map((item) => ({
                        ...item,
                        result: '',
                        conclusion: '',
                    })),
                },
            }
        default:
            return null
    }
}

// 按检测模板保存的组件顺序生成左侧目录和中间报表页面数据。
export const createTemplateDocument = (
    template: InspectionTemplate,
    reportComponents: ReportComponentDefinition[],
    instruments: Instrument[] = [],
    device?: Device,
): DocumentSection[] => {
    const inspectionDate = createCurrentDate()
    const componentMap = new Map(reportComponents.map((component) => [component.id, component]))
    const children = [...template.components]
        .sort((first, second) => first.sort - second.sort)
        .map((config) => {
            const component = componentMap.get(config.reportComponentId)

            return component
                ? createDocumentChild(
                      template,
                      component,
                      config,
                      instruments,
                      inspectionDate,
                      device,
                  )
                : null
        })
        .filter((child): child is DocumentChild => child !== null)

    return [
        {
            label: template.name,
            fixed: true,
            id: '1',
            sort: 1,
            children,
        },
    ]
}
