import { create } from 'zustand'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { auth } from '@/firebase'

export interface User {
  id: string
  email: string
}

interface AuthState {
  user: User | null
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
