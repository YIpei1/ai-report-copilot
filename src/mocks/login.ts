import { delay, http, HttpResponse } from 'msw'
import type { LoginData, LoginParams } from '@/api/auth/types'
import type { ApiResponse } from '@/http/requestType'
import {
    createMockAccessToken,
    createMockRefreshToken,
    findMockUser,
    MOCK_ACCESS_TOKEN_EXPIRES_IN,
    MOCK_REFRESH_TOKEN_EXPIRES_IN,
} from './data/users'

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

        const response = {
            code: 0,
            message: '登录成功',
            data: {
                accessToken: createMockAccessToken(user),
                refreshToken: createMockRefreshToken(user),
                accessTokenExpiresIn: MOCK_ACCESS_TOKEN_EXPIRES_IN,
                refreshTokenExpiresIn: MOCK_REFRESH_TOKEN_EXPIRES_IN,
                username: user.nickname,
            },
        } satisfies ApiResponse<LoginData>

        return HttpResponse.json(response, {
            status: 200,
        })
    }),
]
