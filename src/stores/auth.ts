import { create } from 'zustand'
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

interface AuthState {
  user: User | null
  /** Firebase Auth 初期化完了（localStorage 読み込み含む）かどうか */
  isAuthReady: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthReady: false,

  async login(email: string, password: string): Promise<void> {
    const credential = await signInWithEmailAndPassword(auth, email, password)
    set({ user: { id: credential.user.uid, email: credential.user.email ?? '' } })
  },

  async signup(email: string, password: string): Promise<void> {
    const credential = await createUserWithEmailAndPassword(auth, email, password)
    set({ user: { id: credential.user.uid, email: credential.user.email ?? '' } })
  },

  async logout(): Promise<void> {
    await signOut(auth)
  },
}))

// Firebase Auth 初期化完了（localStorage 読み込み含む）を待ってから描画を開始する
auth.authStateReady().then(() => {
  useAuthStore.setState({
    user: auth.currentUser
      ? { id: auth.currentUser.uid, email: auth.currentUser.email ?? '' }
      : null,
    isAuthReady: true,
  })
})

// ログイン・ログアウト後もリアルタイムで状態を同期
onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
  useAuthStore.setState({
    user: firebaseUser
      ? { id: firebaseUser.uid, email: firebaseUser.email ?? '' }
      : null,
  })
})
