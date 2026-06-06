import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  updateDoc,
  query,
  orderBy,
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

export const useArticlesStore = defineStore('articles', () => {
  const _all = ref<Article[]>([])

  const articles = computed(() => _all.value.filter((a) => !a.deletedAt))
  const trashedArticles = computed(() => _all.value.filter((a) => !!a.deletedAt))

  function articlesCol() {
    const authStore = useAuthStore()
    if (!authStore.user) throw new Error('未ログイン')
    return collection(db, 'users', authStore.user.id, 'articles')
  }

  async function fetchAll(): Promise<void> {
    const q = query(articlesCol(), orderBy('updatedAt', 'desc'))
    const snap = await getDocs(q)
    _all.value = snap.docs.map((d) => {
      const data = d.data() as Omit<Article, 'id'>
      return {
        id: d.id,
        status: data.status ?? 'draft',
        deletedAt: data.deletedAt ?? null,
        title: data.title,
        content: data.content,
        updatedAt: data.updatedAt,
      }
    })
  }

  function getById(id: string): Article | undefined {
    return _all.value.find((a) => a.id === id)
  }

  async function save(id: string, title: string, content: string): Promise<void> {
    const updatedAt = new Date().toISOString()
    const article = _all.value.find((a) => a.id === id)
    const status = article?.status ?? 'draft'
    await setDoc(doc(articlesCol(), id), { title, content, updatedAt, status, deletedAt: null })
    if (article) {
      article.title = title
      article.content = content
      article.updatedAt = updatedAt
    }
  }

  async function create(): Promise<Article> {
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
    _all.value.unshift(newArticle)
    return newArticle
  }

  async function updateStatus(id: string, status: ArticleStatus): Promise<void> {
    await updateDoc(doc(articlesCol(), id), { status })
    const article = _all.value.find((a) => a.id === id)
    if (article) article.status = status
  }

  async function trash(id: string): Promise<void> {
    const deletedAt = new Date().toISOString()
    await updateDoc(doc(articlesCol(), id), { deletedAt })
    const article = _all.value.find((a) => a.id === id)
    if (article) article.deletedAt = deletedAt
  }

  async function restore(id: string): Promise<void> {
    await updateDoc(doc(articlesCol(), id), { deletedAt: null })
    const article = _all.value.find((a) => a.id === id)
    if (article) article.deletedAt = null
  }

  async function permanentDelete(id: string): Promise<void> {
    await deleteDoc(doc(articlesCol(), id))
    _all.value = _all.value.filter((a) => a.id !== id)
  }

  return {
    articles,
    trashedArticles,
    fetchAll,
    getById,
    save,
    create,
    updateStatus,
    trash,
    restore,
    permanentDelete,
  }
})
