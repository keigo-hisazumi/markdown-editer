import { create } from 'zustand'
import { applyTheme, resolveInitialTheme, saveTheme, watchSystemTheme } from '@/shared/theme'

interface ThemeState {
  isDark: boolean
  initTheme: () => void
  toggleTheme: () => void
}

let stopWatchingSystemTheme: (() => void) | null = null

export const useThemeStore = create<ThemeState>((set, get) => ({
  isDark: false,

  initTheme() {
    const isDark = resolveInitialTheme()
    set({ isDark })
    applyTheme(isDark)

    stopWatchingSystemTheme?.()
    stopWatchingSystemTheme = watchSystemTheme((next) => set({ isDark: next }))
  },

  toggleTheme() {
    const isDark = !get().isDark
    set({ isDark })
    saveTheme(isDark)
  },
}))
