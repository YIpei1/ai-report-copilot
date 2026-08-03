export interface MockUser {
    userId: number
    account: string
    password: string
    username: string
    nickname: string
    avatar: string
    permissions: string[]
}

export const MOCK_ACCESS_TOKEN_EXPIRES_IN = 2 * 60 * 60
export const MOCK_REFRESH_TOKEN_EXPIRES_IN = 7 * 24 * 60 * 60

const ACCESS_TOKEN_PREFIX = 'access-'
const REFRESH_TOKEN_PREFIX = 'refresh-'

export const mockUsers: MockUser[] = [
    {
        userId: 1,
        account: 'admin',
        password: 'admin123',
        username: 'admin',
        nickname: '管理员',
        avatar: '',
        permissions: ['*'],
    },
    {
        userId: 2,
        account: 'user',
        password: 'user123',
        username: 'user',
        nickname: '普通用户',
        avatar: '',
        permissions: ['home:view'],
    },
]

export const findMockUser = (account: string, password: string) => {
    return mockUsers.find((user) => user.account === account && user.password === password)
}

export const createMockAccessToken = (user: MockUser) => {
    return `${ACCESS_TOKEN_PREFIX}${user.account}-${Date.now()}`
}

export const createMockRefreshToken = (user: MockUser) => {
    return `${REFRESH_TOKEN_PREFIX}${user.account}-${Date.now()}`
}

export const findMockUserByAccessToken = (accessToken: string) => {
    if (!accessToken.startsWith(ACCESS_TOKEN_PREFIX)) {
        return undefined
    }

    const tokenPayload = accessToken.slice(ACCESS_TOKEN_PREFIX.length)
    const issuedAtSeparatorIndex = tokenPayload.lastIndexOf('-')

    if (issuedAtSeparatorIndex <= 0) {
        return undefined
    }

    const account = tokenPayload.slice(0, issuedAtSeparatorIndex)
    const issuedAt = Number(tokenPayload.slice(issuedAtSeparatorIndex + 1))
    const expiresAt = issuedAt + MOCK_ACCESS_TOKEN_EXPIRES_IN * 1000

    if (!Number.isSafeInteger(issuedAt) || issuedAt > Date.now() || Date.now() >= expiresAt) {
        return undefined
    }

    return mockUsers.find((user) => user.account === account)
}
