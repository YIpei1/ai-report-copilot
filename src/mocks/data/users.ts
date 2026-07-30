export interface MockUser {
    userId: number
    account: string
    password: string
    username: string
    nickname: string
    avatar: string
    permissions: string[]
}

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

let currentUserId = mockUsers[0].userId

export const findMockUser = (account: string, password: string) => {
    return mockUsers.find((user) => user.account === account && user.password === password)
}

export const setCurrentMockUser = (userId: number) => {
    currentUserId = userId
}

export const getCurrentMockUser = () => {
    return mockUsers.find((user) => user.userId === currentUserId) ?? mockUsers[0]
}
