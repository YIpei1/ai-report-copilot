import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { useUserStore } from './user'
interface AuthTokens {
    accessToken: string
    refreshToken: string
}

export const useAuthStore = defineStore(
    'auth',
    () => {
        const accessToken = ref('')
        const refreshToken = ref('')

        const isLoggedIn = computed(() => Boolean(accessToken.value))
        // 手动登录后更新token  获取用户信息
        async function setTokens(tokens: AuthTokens) {
            accessToken.value = tokens.accessToken
            refreshToken.value = tokens.refreshToken
            useUserStore().setUserInfo()
        }

        function setAccessToken(token: string) {
            accessToken.value = token
        }

        async function clearTokens() {
            accessToken.value = ''
            refreshToken.value = ''
        }

        return {
            accessToken,
            refreshToken,
            isLoggedIn,
            setTokens,
            setAccessToken,
            clearTokens,
        }
    },
    {
        persist: {
            pick: ['accessToken', 'refreshToken'],
        },
    },
)
