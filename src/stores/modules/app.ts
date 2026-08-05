import { defineStore } from 'pinia'
import { useDark } from '@vueuse/core'
import { ref } from 'vue'
import { getBrowserFingerprint } from '@/utils/fingerprint'
export const useAppStore = defineStore(
    'app',
    () => {
        const isDark = useDark({
            storageKey: 'theme',
        })
        const fingerprint = ref('')

        const toggleDark = () => {
            isDark.value = !isDark.value
        }
        const setFingerprint = async () => {
            fingerprint.value = await getBrowserFingerprint()
        }
        return {
            isDark,
            fingerprint,
            toggleDark,
            setFingerprint,
        }
    },
    {
        persist: true,
    },
)
