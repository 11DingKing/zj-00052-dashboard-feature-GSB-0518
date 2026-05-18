import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { saveTheme, loadTheme } from '@/utils/storage'

export const useThemeStore = defineStore('theme', () => {
  const isDark = ref(loadTheme())

  watch(isDark, (newValue) => {
    saveTheme(newValue)
    if (newValue) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, { immediate: true })

  function toggleTheme() {
    isDark.value = !isDark.value
  }

  return {
    isDark,
    toggleTheme
  }
})
