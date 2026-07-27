import request from '@/utils/request'
import type { LoginData, LoginParams } from './types'
import type { ApiResponse } from '@/types/request'
export const login = (data: LoginParams) => {
    return request<ApiResponse<LoginData>>({
        url: '/login',
        method: 'post',
        data,
    })
}
export * from './types'
