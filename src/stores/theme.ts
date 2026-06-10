import { create } from 'zustand'

interface ThemeState {
  isDark: boolean
  initTheme: () => void
  toggleTheme: () => void
}

function applyTheme(isDark: boolean) {
  if (isDark) {
    document.documentElement.classList.add('dark')
    document.documentElement.classList.remove('light')
  } else {
    document.documentElement.classList.add('light')
    document.documentElement.classList.remove('dark')
  }
}

function applyThemeWithTransition(isDark: boolean) {
  document.documentElement.classList.add('theme-transitioning')
  applyTheme(isDark)
  setTimeout(() => {
    document.documentElement.classList.remove('theme-transitioning')
  }, 400)
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  isDark: false,

  initTheme() {
    const saved = localStorage.getItem('theme')
    let isDark: boolean
    if (saved === 'dark' || saved === 'light') {
      isDark = saved === 'dark'
    } else {
      isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    set({ isDark })
    applyTheme(isDark)

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem('theme')) {
        set({ isDark: e.matches })
        applyThemeWithTransition(e.matches)
      }
    })
  },

  toggleTheme() {
    const isDark = !get().isDark
    set({ isDark })
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
    applyThemeWithTransition(isDark)
  },
}))
