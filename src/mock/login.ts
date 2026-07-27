const MOCK_ACCOUNT = 'admin'
const MOCK_PASSWORD = 'admin123'
const ACCESS_TOKEN_EXPIRES_IN = 120 * 60
const REFRESH_TOKEN_EXPIRES_IN = 7 * 24 * 60 * 60

const createMockToken = (type: 'access' | 'refresh') => {
    return `mock-${type}-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export const loginApi = async (params: LoginParams): Promise<LoginResponse> => {
    await new Promise((resolve) => window.setTimeout(resolve, 600))

    if (params.account !== MOCK_ACCOUNT || params.password !== MOCK_PASSWORD) {
        throw new Error('账号或密码错误')
    }

    return {
        code: 0,
        message: '登录成功',
        data: {
            accessToken: createMockToken('access'),
            refreshToken: createMockToken('refresh'),
            accessTokenExpiresIn: ACCESS_TOKEN_EXPIRES_IN,
            refreshTokenExpiresIn: REFRESH_TOKEN_EXPIRES_IN,
            username: '管理员',
        },
    }
}
