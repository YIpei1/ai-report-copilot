import request from '@/http/request'
import type { ApiResponse } from '@/http/requestType'
import type { UserInfoData } from './types'

export const getUserInfo = () => {
    return request<ApiResponse<UserInfoData>>({
        url: '/user/info',
        method: 'get',
    })
}

export * from './types'
