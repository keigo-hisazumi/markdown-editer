import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface User {
  id: string
  email: string
  name: string
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)

  const isLoggedIn = computed(() => user.value !== null)

  function login(email: string, password: string): boolean {
    // モック: 固定の認証情報でログイン
    if (email === 'demo@example.com' && password === 'password') {
      user.value = {
        id: '1',
        email: 'demo@example.com',
        name: 'デモユーザー',
      }
      return true
    }
    return false
  }

  function logout() {
    user.value = null
  }

  return { user, isLoggedIn, login, logout }
})
