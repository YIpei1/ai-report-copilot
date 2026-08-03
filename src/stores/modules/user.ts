import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { getUserInfo, type UserInfoData } from '@/api/auth'

export const useUserStore = defineStore(
    'user',
    () => {
        const userInfo = ref<UserInfoData>()
        // 当前用户拥有的权限码集合。
        const permissionCodes = ref<string[]>([])
        // 当前用户权限码的快速查找集合。
        const permissionCodeSet = computed(() => new Set(permissionCodes.value))
        // 获取用户信息
        async function setUserInfo() {
            const res = await getUserInfo()
            userInfo.value = res.data
            permissionCodes.value = res.data.permissions || []
        }
        function clearUserInfo() {
            userInfo.value = undefined
            permissionCodes.value = []
        }
        const hasPermission = (code: string | undefined): boolean => {
            if (!code?.trim()) {
                return false
            }
            return permissionCodeSet.value.has('*') || permissionCodeSet.value.has(code)
        }

        // 判断是否拥有任一权限码。
        const hasAnyPermission = (codes: string[]): boolean => {
            return codes.some((code) => hasPermission(code))
        }

        // 判断是否拥有全部权限码。
        const hasAllPermissions = (codes: string[]): boolean => {
            return codes.every((code) => hasPermission(code))
        }

        return {
            userInfo,
            permissionCodes,
            setUserInfo,
            hasPermission,
            hasAnyPermission,
            hasAllPermissions,
            clearUserInfo,
        }
    },
    {
        persist: {
            pick: ['userInfo', 'permissionCodes'],
        },
    },
)
