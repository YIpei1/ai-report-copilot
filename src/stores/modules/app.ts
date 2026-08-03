import { defineStore } from 'pinia'
import { useDark } from '@vueuse/core'
import { computed, ref } from 'vue'
import { getBrowserFingerprint } from '@/utils/fingerprint'
export const useAppStore = defineStore(
    'app',
    () => {
        const isDark = useDark({
            storageKey: 'theme',
        })
        const fingerprint = ref('')

        const getFingerprint = computed(() => fingerprint.value)

        const getIsDark = computed(() => isDark.value)
        const toggleDark = () => {
            isDark.value = !isDark.value
        }
        const setFingerprint = async () => {
            fingerprint.value = await getBrowserFingerprint()
        }
        return {
            isDark,
            toggleDark,
            getIsDark,
            getFingerprint,
            setFingerprint,
        }
    },
    {
        persist: true,
    },
)
