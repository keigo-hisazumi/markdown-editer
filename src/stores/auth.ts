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

  // Firebase Auth の初期化完了を待つ Promise
  const authReady = new Promise<void>((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      user.value = firebaseUser
        ? { id: firebaseUser.uid, email: firebaseUser.email ?? '' }
        : null
      unsubscribe()
      resolve()
    })
  })

  // ログイン後もリアルタイムで状態を同期
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
