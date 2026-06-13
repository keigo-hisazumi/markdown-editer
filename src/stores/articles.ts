import { create } from 'zustand'
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  query,
  orderBy,
  onSnapshot,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from '@/firebase'
import { useAuthStore } from '@/stores/auth'

export type ArticleStatus = 'draft' | 'published'

export interface Article {
  id: string
  title: string
  content: string
  updatedAt: string
  status: ArticleStatus
  deletedAt: string | null
}

interface ArticlesState {
  /** ゴミ箱の記事も含めた全記事 */
  all: Article[]
  /** Firestore のリアルタイム購読を開始し、デバイス間で記事を同期する */
  subscribe: () => void
  /** リアルタイム購読を解除し、状態を初期化する */
  unsubscribe: () => void
  getById: (id: string) => Article | undefined
  save: (id: string, title: string, content: string) => Promise<void>
  createArticle: () => Promise<Article>
  updateStatus: (id: string, status: ArticleStatus) => Promise<void>
  trash: (id: string) => Promise<void>
  restore: (id: string) => Promise<void>
  permanentDelete: (id: string) => Promise<void>
}

function articlesCol() {
  const { user } = useAuthStore.getState()
  if (!user) throw new Error('未ログイン')
  return collection(db, 'users', user.id, 'articles')
}

// Firestore の購読解除関数をモジュールスコープで保持する
let unsub: Unsubscribe | null = null

export const useArticlesStore = create<ArticlesState>((set, get) => ({
  all: [],

  subscribe(): void {
    const { user } = useAuthStore.getState()
    if (!user) return
    if (unsub) unsub()
    const q = query(articlesCol(), orderBy('updatedAt', 'desc'))
    unsub = onSnapshot(q, (snap) => {
      set({
        all: snap.docs.map((d) => {
          const data = d.data() as Omit<Article, 'id'>
          return {
            id: d.id,
            status: data.status ?? 'draft',
            deletedAt: data.deletedAt ?? null,
            title: data.title,
            content: data.content,
            updatedAt: data.updatedAt,
          }
        }),
      })
    })
  },

  unsubscribe(): void {
    if (unsub) {
      unsub()
      unsub = null
    }
    set({ all: [] })
  },

  getById(id: string): Article | undefined {
    return get().all.find((a) => a.id === id)
  },

  async save(id: string, title: string, content: string): Promise<void> {
    const updatedAt = new Date().toISOString()
    const article = get().all.find((a) => a.id === id)
    const status = article?.status ?? 'draft'
    await setDoc(doc(articlesCol(), id), { title, content, updatedAt, status, deletedAt: null })
    set((state) => ({
      all: state.all.map((a) => (a.id === id ? { ...a, title, content, updatedAt } : a)),
    }))
  },

  async createArticle(): Promise<Article> {
    const newArticle: Article = {
      id: String(Date.now()),
      title: '新しい記事',
      content: '# 新しい記事\n\nここに内容を書いてください。\n',
      updatedAt: new Date().toISOString(),
      status: 'draft',
      deletedAt: null,
    }
    await setDoc(doc(articlesCol(), newArticle.id), {
      title: newArticle.title,
      content: newArticle.content,
      updatedAt: newArticle.updatedAt,
      status: newArticle.status,
      deletedAt: null,
    })
    set((state) => ({ all: [newArticle, ...state.all] }))
    return newArticle
  },

  async updateStatus(id: string, status: ArticleStatus): Promise<void> {
    await updateDoc(doc(articlesCol(), id), { status })
    set((state) => ({
      all: state.all.map((a) => (a.id === id ? { ...a, status } : a)),
    }))
  },

  async trash(id: string): Promise<void> {
    const deletedAt = new Date().toISOString()
    await updateDoc(doc(articlesCol(), id), { deletedAt })
    set((state) => ({
      all: state.all.map((a) => (a.id === id ? { ...a, deletedAt } : a)),
    }))
  },

  async restore(id: string): Promise<void> {
    await updateDoc(doc(articlesCol(), id), { deletedAt: null })
    set((state) => ({
      all: state.all.map((a) => (a.id === id ? { ...a, deletedAt: null } : a)),
    }))
  },

  async permanentDelete(id: string): Promise<void> {
    await deleteDoc(doc(articlesCol(), id))
    set((state) => ({ all: state.all.filter((a) => a.id !== id) }))
  },
}))
