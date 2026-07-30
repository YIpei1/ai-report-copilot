import { delay, http, HttpResponse } from 'msw'
import type { LoginData, LoginParams } from '@/api/login/types'
import type { ApiResponse } from '@/http/requestType'
import { findMockUser, setCurrentMockUser } from './data/users'

export const authHandlers = [
    http.post('/api/login', async ({ request }) => {
        await delay(600)

        const params = (await request.json()) as LoginParams
        const user = findMockUser(params.account, params.password)

        if (!user) {
            return HttpResponse.json(
                {
                    code: 10001,
                    message: '账号或密码错误',
                    data: null,
                },
                {
                    status: 401,
                },
            )
        }

        setCurrentMockUser(user.userId)

        const response = {
            code: 0,
            message: '登录成功',
            data: {
                accessToken: `access-${user.account}-${Date.now()}`,
                refreshToken: `refresh-${user.account}-${Date.now()}`,
                accessTokenExpiresIn: 2 * 60 * 60,
                refreshTokenExpiresIn: 7 * 24 * 60 * 60,
                username: user.nickname,
            },
        } satisfies ApiResponse<LoginData>

        return HttpResponse.json(response, {
            status: 200,
        })
    }),
]
