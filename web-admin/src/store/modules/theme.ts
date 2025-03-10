import { defineStore } from 'pinia'

export const useThemeStore = defineStore('theme', {
  state: () => ({
    theme: localStorage.getItem('admin-theme') || 'blue'
  }),
  actions: {
    setTheme(theme: string) {
      this.theme = theme
      localStorage.setItem('admin-theme', theme)
      document.documentElement.setAttribute('data-theme', theme)
    },
    initTheme() {
      const theme = this.theme
      document.documentElement.setAttribute('data-theme', theme)
    }
  },
  persist: true
})