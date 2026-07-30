import type { ApiResponse } from '@/http/requestType'
import axios, { AxiosError, type AxiosRequestConfig } from 'axios'

const service = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    timeout: 5000,
    withToken: true,
    skipAuthRefresh: false,
})
// 添加请求拦截器
service.interceptors.request.use(
    function (config) {
        // 在发送请求之前做些什么
        return config
    },
    function (error) {
        // 对请求错误做些什么
        return Promise.reject(error)
    },
)

// 添加响应拦截器
service.interceptors.response.use(
    function (response) {
        // 2xx 范围内的状态码都会触发该函数。
        // 对响应数据做点什么
        return response.data
    },
    function (error) {
        // 判断是否为 AxiosError 类型
        if (!axios.isAxiosError(error)) {
            ElMessage.error('请求失败，请稍后再试')
            return Promise.reject(error)
        }
        // 如果是 进入错误处理逻辑

        return AxiosErrorHandler(error)
    },
)
// 维护错误码和错误信息
const errorMessages: Record<number, string> = {
    400: '请求错误',
    401: '未授权，请登录',
    403: '拒绝访问',
    404: '请求地址出错',
    408: '请求超时',
    500: '服务器内部错误',
}

// axios 错误处理函数
function AxiosErrorHandler(error: AxiosError<ApiResponse<null>>) {
    const response = error.response

    if (response?.status === 401) {
        // 判断是否需要传递token  ， 是否需要刷新token
        if (response.config.withToken && !response.config.skipAuthRefresh) {
            // 需要传递token ， 需要刷新token
            // 刷新token逻辑
            ElMessage.error(errorMessages[401])
        } else {
            // 不需要传递token ， 不需要刷新token
            ElMessage.error(response?.data?.message)
        }
    }
    return Promise.reject(error)
}
const request = <TResponse, TRequest = unknown>(
    config: AxiosRequestConfig<TRequest>,
): Promise<TResponse> => {
    return service.request<TResponse, TResponse, TRequest>(config)
}

export default request
