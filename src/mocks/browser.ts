import { setupWorker } from 'msw/browser'
import { initializeMockDatabase } from './database'
import { handlers } from './handlers'

const worker = setupWorker(...handlers)

// 先初始化浏览器数据库，再启动 MSW，避免首个接口读取到空数据。
export const startMockWorker = async (): Promise<void> => {
    await initializeMockDatabase()
    await worker.start({
        onUnhandledRequest: 'bypass',
    })
}
