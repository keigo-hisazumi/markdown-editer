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
import { loadLocalArticles, saveLocalArticles } from '@/lib/localStore'
import { mergeArticles } from '@/lib/mergeArticles'

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
  /** ローカルデータの読み込みと Firestore のリアルタイム購読を開始する */
  subscribe: () => void
  /** リアルタイム購読を解除し、状態を初期化する */
  unsubscribe: () => void
  getById: (id: string) => Article | undefined
  /** ローカル（localStorage）のみへ即時保存する。サーバーへは送信しない */
  saveLocal: (id: string, title: string, content: string) => void
  /** 指定記事の現在の内容をサーバー（Firestore）へ送信する */
  syncToServer: (id: string) => Promise<void>
  /** ローカルとサーバーの両方へ保存する（保存ボタン用の強制保存） */
  save: (id: string, title: string, content: string) => Promise<void>
  createArticle: () => Promise<Article>
  updateStatus: (id: string, status: ArticleStatus) => Promise<void>
  trash: (id: string) => Promise<void>
  restore: (id: string) => Promise<void>
  permanentDelete: (id: string) => Promise<void>
}

function currentUserId(): string | null {
  return useAuthStore.getState().user?.id ?? null
}

function articlesCol() {
  const userId = currentUserId()
  if (!userId) throw new Error('未ログイン')
  return collection(db, 'users', userId, 'articles')
}

/** Firestore ドキュメントを Article 型へ正規化する */
function toArticle(id: string, data: Omit<Article, 'id'>): Article {
  return {
    id,
    title: data.title,
    content: data.content,
    updatedAt: data.updatedAt,
    status: data.status ?? 'draft',
    deletedAt: data.deletedAt ?? null,
  }
}

/** Article を Firestore へ保存する形（id を除いた全フィールド）に変換する */
function toDocData(article: Article): Omit<Article, 'id'> {
  return {
    title: article.title,
    content: article.content,
    updatedAt: article.updatedAt,
    status: article.status,
    deletedAt: article.deletedAt,
  }
}

// Firestore の購読解除関数をモジュールスコープで保持する
let unsub: Unsubscribe | null = null

/**
 * Firestore への書き込みエラーを処理する。
 * オフライン時は書き込みが保留されるだけで失敗しないため、
 * ここに到達するのは権限エラーなど。UI は止めず警告のみ出す。
 */
function reportWriteError(error: unknown): void {
  console.warn('Firestore への書き込みに失敗しました', error)
}

export const useArticlesStore = create<ArticlesState>((set, get) => ({
  all: [],

  subscribe(): void {
    const userId = currentUserId()
    if (!userId) return
    if (unsub) unsub()

    // まずローカルデータを読み込み、オフラインでもすぐに利用できるようにする
    set({ all: loadLocalArticles(userId) })

    // Firestore のリアルタイム購読を開始する。スナップショット受信時に
    // ローカルと更新日時で比較してマージし、デバイス間で記事を同期する。
    const q = query(articlesCol(), orderBy('updatedAt', 'desc'))
    unsub = onSnapshot(q, (snap) => {
      const remote = snap.docs.map((d) => toArticle(d.id, d.data() as Omit<Article, 'id'>))
      const { merged, toPush } = mergeArticles(get().all, remote)

      set({ all: merged })
      saveLocalArticles(userId, merged)

      // ローカルの方が新しい記事をリモートへ反映（新しい方で上書き）する
      for (const article of toPush) {
        setDoc(doc(articlesCol(), article.id), toDocData(article)).catch(reportWriteError)
      }
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

  saveLocal(id: string, title: string, content: string): void {
    const updatedAt = new Date().toISOString()
    const status = get().all.find((a) => a.id === id)?.status ?? 'draft'
    const updated: Partial<Article> = { title, content, updatedAt, status, deletedAt: null }

    // ローカル（localStorage）のみを即時更新する。編集のたびに呼ばれ、
    // オフラインでも入力内容が失われないようにする。サーバーへは送信しない。
    const next = get().all.map((a) => (a.id === id ? { ...a, ...updated } : a))
    set({ all: next })
    persist(next)
  },

  async syncToServer(id: string): Promise<void> {
    // ストア上の最新内容をリモートへ送る（オフライン時は再接続時に送信される）
    const article = get().all.find((a) => a.id === id)
    if (!article) return
    await setDoc(doc(articlesCol(), id), toDocData(article)).catch(reportWriteError)
  },

  async save(id: string, title: string, content: string): Promise<void> {
    // 保存ボタン用の強制保存。ローカルへ即時保存したうえでサーバーへも送信する。
    get().saveLocal(id, title, content)
    await get().syncToServer(id)
  },

  async createArticle(): Promise<Article> {
    const newArticle: Article = {
      id: String(Date.now()),
      title: '',
      content: '',
      updatedAt: new Date().toISOString(),
      status: 'draft',
      deletedAt: null,
    }

    const next = [newArticle, ...get().all]
    set({ all: next })
    persist(next)

    setDoc(doc(articlesCol(), newArticle.id), toDocData(newArticle)).catch(reportWriteError)
    return newArticle
  },

  async updateStatus(id: string, status: ArticleStatus): Promise<void> {
    // 更新日時を更新し、競合時に updatedAt で正しく解決できるようにする
    const updatedAt = new Date().toISOString()
    const next = get().all.map((a) => (a.id === id ? { ...a, status, updatedAt } : a))
    set({ all: next })
    persist(next)

    updateDoc(doc(articlesCol(), id), { status, updatedAt }).catch(reportWriteError)
  },

  async trash(id: string): Promise<void> {
    const deletedAt = new Date().toISOString()
    const updatedAt = deletedAt
    const next = get().all.map((a) => (a.id === id ? { ...a, deletedAt, updatedAt } : a))
    set({ all: next })
    persist(next)

    updateDoc(doc(articlesCol(), id), { deletedAt, updatedAt }).catch(reportWriteError)
  },

  async restore(id: string): Promise<void> {
    const updatedAt = new Date().toISOString()
    const next = get().all.map((a) => (a.id === id ? { ...a, deletedAt: null, updatedAt } : a))
    set({ all: next })
    persist(next)

    updateDoc(doc(articlesCol(), id), { deletedAt: null, updatedAt }).catch(reportWriteError)
  },

  async permanentDelete(id: string): Promise<void> {
    const next = get().all.filter((a) => a.id !== id)
    set({ all: next })
    persist(next)

    deleteDoc(doc(articlesCol(), id)).catch(reportWriteError)
  },
}))

/** 現在の記事一覧をローカル（localStorage）へ保存する */
function persist(articles: Article[]): void {
  const userId = currentUserId()
  if (userId) saveLocalArticles(userId, articles)
}
