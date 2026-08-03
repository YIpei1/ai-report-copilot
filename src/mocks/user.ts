import { delay, http, HttpResponse } from 'msw'
import type { UserInfoData } from '@/api/auth/types'
import type { ApiResponse } from '@/http/requestType'
import { findMockUserByAccessToken } from './data/users'

export const userHandlers = [
    http.get('/api/user/info', async ({ request }) => {
        await delay(300)

        const authorization = request.headers.get('Authorization')
        const accessToken = authorization?.match(/^Bearer\s+(.+)$/i)?.[1] ?? ''
        const user = findMockUserByAccessToken(accessToken)

        if (!user) {
            const response = {
                code: 10002,
                message: '登录状态无效或已过期',
                data: null,
            } satisfies ApiResponse<null>

            return HttpResponse.json(response, {
                status: 401,
            })
        }

        const response = {
            code: 0,
            message: '获取用户信息成功',
            data: {
                userId: user.userId,
                username: user.username,
                nickname: user.nickname,
                avatar: user.avatar,
                permissions: user.permissions,
            },
        } satisfies ApiResponse<UserInfoData>

        return HttpResponse.json(response, {
            status: 200,
        })
    }),
]
