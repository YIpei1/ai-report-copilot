export interface LoginParams {
    account: string
    password: string
}

export interface LoginData {
    accessToken: string
    refreshToken: string
    accessTokenExpiresIn: number
    refreshTokenExpiresIn: number
    username: string
}
export interface UserInfoData {
    userId: number
    username: string
    nickname: string
    avatar: string
    permissions: string[]
}
