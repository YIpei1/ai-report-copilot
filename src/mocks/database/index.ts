import type {
    Device,
    InspectionTemplate,
    Instrument,
    ReportComponentDefinition,
    Toolbox,
} from '@/api/baseData'
import type { InspectionReport } from '@/api/report'
import {
    mockDevices,
    mockInspectionTemplates,
    mockInstruments,
    mockReportComponents,
    mockToolboxes,
} from '../data/baseData'
import { mockInspectionReports } from '../data/reports'

const DATABASE_NAME = 'ai-report-copilot-mock'
const DATABASE_VERSION = 6
const SEED_KEY = 'initial-data'
const BUILT_IN_DEVICE_IDS = ['device-001', 'device-002']
const BUILT_IN_REPORT_IDS = ['report-001', 'report-002']
const BUILT_IN_TEMPLATE_IDS = ['template-traction-elevator-demo']

type LegacyInspectionTemplate = InspectionTemplate & {
    applicableType?: string
    toolboxId?: string
    standard?: string
}

type LegacyDevice = Omit<Device, 'manufacturer'> & {
    manufacturer?: string
}

// IndexedDB 中保存的业务数据表名称。
export const mockDatabaseStores = {
    devices: 'devices',
    instruments: 'instruments',
    toolboxes: 'toolboxes',
    reportComponents: 'reportComponents',
    inspectionTemplates: 'inspectionTemplates',
    inspectionReports: 'inspectionReports',
} as const

type MockDataStoreName = (typeof mockDatabaseStores)[keyof typeof mockDatabaseStores]
type MockStoreName = MockDataStoreName | 'metadata'

interface MockDatabaseMetadata {
    key: string
    initializedAt: string
}

interface MockDatabaseSchema {
    devices: Device
    instruments: Instrument
    toolboxes: Toolbox
    reportComponents: ReportComponentDefinition
    inspectionTemplates: InspectionTemplate
    inspectionReports: InspectionReport
    metadata: MockDatabaseMetadata
}

const initialData: {
    [StoreName in MockDataStoreName]: MockDatabaseSchema[StoreName][]
} = {
    devices: mockDevices,
    instruments: mockInstruments,
    toolboxes: mockToolboxes,
    reportComponents: mockReportComponents,
    inspectionTemplates: mockInspectionTemplates,
    inspectionReports: mockInspectionReports,
}

let databasePromise: Promise<IDBDatabase> | undefined

// 将 IndexedDB 的事件式请求转换为 Promise，便于 MSW 处理器使用 async/await。
const requestToPromise = <T>(request: IDBRequest<T>): Promise<T> => {
    return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
    })
}

// 等待写事务完整提交，避免接口提前返回但数据尚未落盘。
const transactionToPromise = (transaction: IDBTransaction): Promise<void> => {
    return new Promise((resolve, reject) => {
        transaction.oncomplete = () => resolve()
        transaction.onerror = () => reject(transaction.error)
        transaction.onabort = () => reject(transaction.error)
    })
}

const openMockDatabase = (): Promise<IDBDatabase> => {
    if (databasePromise) {
        return databasePromise
    }

    databasePromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION)

        request.onupgradeneeded = (event) => {
            const database = request.result

            Object.values(mockDatabaseStores).forEach((storeName) => {
                if (!database.objectStoreNames.contains(storeName)) {
                    database.createObjectStore(storeName, { keyPath: 'id' })
                }
            })

            if (!database.objectStoreNames.contains('metadata')) {
                database.createObjectStore('metadata', { keyPath: 'key' })
            }

            // 版本 6 清理模板曾经保存的设备类型、参考依据和工具箱关联字段。
            if (event.oldVersion < 6 && request.transaction) {
                const templateStore = request.transaction.objectStore(
                    mockDatabaseStores.inspectionTemplates,
                )
                const cursorRequest = templateStore.openCursor()

                cursorRequest.onsuccess = () => {
                    const cursor = cursorRequest.result
                    if (!cursor) return

                    if (BUILT_IN_TEMPLATE_IDS.includes(String(cursor.primaryKey))) {
                        cursor.continue()
                        return
                    }

                    const migratedTemplate = { ...(cursor.value as LegacyInspectionTemplate) }
                    delete migratedTemplate.applicableType
                    delete migratedTemplate.standard
                    delete migratedTemplate.toolboxId
                    cursor.update(migratedTemplate)
                    cursor.continue()
                }
            }

            // 版本 4 只删除项目原先内置的演示记录，保留用户自行创建的数据。
            if (event.oldVersion < 4 && request.transaction) {
                const transaction = request.transaction
                const deviceStore = transaction.objectStore(mockDatabaseStores.devices)
                const reportStore = transaction.objectStore(mockDatabaseStores.inspectionReports)
                const templateStore = transaction.objectStore(
                    mockDatabaseStores.inspectionTemplates,
                )

                BUILT_IN_DEVICE_IDS.forEach((id) => deviceStore.delete(id))
                BUILT_IN_REPORT_IDS.forEach((id) => reportStore.delete(id))
                BUILT_IN_TEMPLATE_IDS.forEach((id) => templateStore.delete(id))
            }

            // 版本 5 为旧设备补充制造单位；没有设备时写入一条默认演示设备。
            if (event.oldVersion < 5 && request.transaction) {
                const deviceStore = request.transaction.objectStore(mockDatabaseStores.devices)
                const cursorRequest = deviceStore.openCursor()
                const countRequest = deviceStore.count()

                cursorRequest.onsuccess = () => {
                    const cursor = cursorRequest.result
                    if (!cursor) return

                    const legacyDevice = cursor.value as LegacyDevice
                    cursor.update({
                        ...legacyDevice,
                        manufacturer: legacyDevice.manufacturer || '未维护',
                    })
                    cursor.continue()
                }

                countRequest.onsuccess = () => {
                    if (countRequest.result === 0) {
                        mockDevices.forEach((device) => deviceStore.put(device))
                    }
                }
            }
        }

        request.onsuccess = () => resolve(request.result)
        request.onerror = () => {
            databasePromise = undefined
            reject(request.error)
        }
        request.onblocked = () => {
            databasePromise = undefined
            reject(new Error('IndexedDB 数据库升级被其他页面阻止'))
        }
    })

    return databasePromise
}

// 第一次启用 Mock 时写入演示数据；后续刷新不会覆盖用户已经修改的数据。
export const initializeMockDatabase = async (): Promise<void> => {
    const database = await openMockDatabase()
    const metadataTransaction = database.transaction('metadata', 'readonly')
    const metadata = (await requestToPromise(
        metadataTransaction.objectStore('metadata').get(SEED_KEY),
    )) as MockDatabaseMetadata | undefined

    if (metadata) {
        return
    }

    const storeNames: MockStoreName[] = [...Object.values(mockDatabaseStores), 'metadata']
    const seedTransaction = database.transaction(storeNames, 'readwrite')

    Object.entries(initialData).forEach(([storeName, records]) => {
        const store = seedTransaction.objectStore(storeName)
        records.forEach((record) => store.put(record))
    })

    seedTransaction.objectStore('metadata').put({
        key: SEED_KEY,
        initializedAt: new Date().toISOString(),
    } satisfies MockDatabaseMetadata)

    await transactionToPromise(seedTransaction)
}

// 清空当前浏览器数据库，并重新写入项目定义的初始演示数据。
export const resetMockDatabase = async (): Promise<void> => {
    const database = await openMockDatabase()
    const storeNames: MockStoreName[] = [...Object.values(mockDatabaseStores), 'metadata']
    const transaction = database.transaction(storeNames, 'readwrite')

    Object.values(mockDatabaseStores).forEach((storeName) => {
        transaction.objectStore(storeName).clear()
    })

    Object.entries(initialData).forEach(([storeName, records]) => {
        const store = transaction.objectStore(storeName)
        records.forEach((record) => store.put(record))
    })

    transaction.objectStore('metadata').put({
        key: SEED_KEY,
        initializedAt: new Date().toISOString(),
    } satisfies MockDatabaseMetadata)

    await transactionToPromise(transaction)
}

// 查询指定数据表的全部记录。
export const getAllMockRecords = async <StoreName extends MockDataStoreName>(
    storeName: StoreName,
): Promise<MockDatabaseSchema[StoreName][]> => {
    const database = await openMockDatabase()
    const transaction = database.transaction(storeName, 'readonly')

    return requestToPromise(transaction.objectStore(storeName).getAll())
}

// 按业务 id 查询单条记录。
export const getMockRecord = async <StoreName extends MockDataStoreName>(
    storeName: StoreName,
    id: string,
): Promise<MockDatabaseSchema[StoreName] | undefined> => {
    const database = await openMockDatabase()
    const transaction = database.transaction(storeName, 'readonly')
    const record = await requestToPromise(transaction.objectStore(storeName).get(id))

    return record as MockDatabaseSchema[StoreName] | undefined
}

// 新增或覆盖一条记录。
export const putMockRecord = async <StoreName extends MockDataStoreName>(
    storeName: StoreName,
    record: MockDatabaseSchema[StoreName],
): Promise<void> => {
    const database = await openMockDatabase()
    const transaction = database.transaction(storeName, 'readwrite')
    transaction.objectStore(storeName).put(record)
    await transactionToPromise(transaction)
}

// 按业务 id 删除一条记录。
export const deleteMockRecord = async <StoreName extends MockDataStoreName>(
    storeName: StoreName,
    id: string,
): Promise<void> => {
    const database = await openMockDatabase()
    const transaction = database.transaction(storeName, 'readwrite')
    transaction.objectStore(storeName).delete(id)
    await transactionToPromise(transaction)
}
