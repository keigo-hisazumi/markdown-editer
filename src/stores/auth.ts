import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth'
import { auth } from '@/firebase'

export interface User {
  id: string
  email: string
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const isLoggedIn = computed(() => user.value !== null)

  // Firebase Auth 初期化完了（localStorage 読み込み含む）を待つ Promise
  const authReady = auth.authStateReady().then(() => {
    user.value = auth.currentUser
      ? { id: auth.currentUser.uid, email: auth.currentUser.email ?? '' }
      : null
  })

  // ログイン・ログアウト後もリアルタイムで状態を同期
  onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
    user.value = firebaseUser
      ? { id: firebaseUser.uid, email: firebaseUser.email ?? '' }
      : null
  })

  async function login(email: string, password: string): Promise<void> {
    const credential = await signInWithEmailAndPassword(auth, email, password)
    user.value = { id: credential.user.uid, email: credential.user.email ?? '' }
  }

  async function signup(email: string, password: string): Promise<void> {
    const credential = await createUserWithEmailAndPassword(auth, email, password)
    user.value = { id: credential.user.uid, email: credential.user.email ?? '' }
  }

  async function logout(): Promise<void> {
    await signOut(auth)
  }

  return { user, isLoggedIn, authReady, login, signup, logout }
})
