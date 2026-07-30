import 'axios'

declare module 'axios' {
    interface AxiosRequestConfig<D = any> {
        /** 是否自动携带 Token */
        withToken?: boolean

        /** 是否跳过 401 Token 刷新 */
        skipAuthRefresh?: boolean
    }
}
