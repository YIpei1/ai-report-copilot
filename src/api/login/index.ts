import request from '@/http/request'
import type { LoginData, LoginParams } from './types'
import type { ApiResponse } from '@/http/requestType'
export const login = (data: LoginParams) => {
    return request<ApiResponse<LoginData>>({
        url: '/login',
        method: 'post',
        data,
        withToken: false,
        skipAuthRefresh: true,
    })
}
export * from './types'
