import { delay, http, HttpResponse } from 'msw'
import type { UserInfoData } from '@/api/user/types'
import type { ApiResponse } from '@/http/requestType'
import { getCurrentMockUser } from './data/users'

export const userHandlers = [
    http.get('/api/user/info', async () => {
        await delay(300)
        const user = getCurrentMockUser()

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
