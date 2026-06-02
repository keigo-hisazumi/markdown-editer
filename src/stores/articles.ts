import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  orderBy,
} from 'firebase/firestore'
import { db } from '@/firebase'
import { useAuthStore } from '@/stores/auth'

export interface Article {
  id: string
  title: string
  content: string
  updatedAt: string
}

export const useArticlesStore = defineStore('articles', () => {
  const articles = ref<Article[]>([])

  function articlesCol() {
    const authStore = useAuthStore()
    if (!authStore.user) throw new Error('未ログイン')
    return collection(db, 'users', authStore.user.id, 'articles')
  }

  async function fetchAll(): Promise<void> {
    const q = query(articlesCol(), orderBy('updatedAt', 'desc'))
    const snap = await getDocs(q)
    articles.value = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Article, 'id'>) }))
  }

  function getById(id: string): Article | undefined {
    return articles.value.find((a) => a.id === id)
  }

  async function save(id: string, title: string, content: string): Promise<void> {
    const updatedAt = new Date().toISOString()
    await setDoc(doc(articlesCol(), id), { title, content, updatedAt })
    const article = articles.value.find((a) => a.id === id)
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
    }
    await setDoc(doc(articlesCol(), newArticle.id), {
      title: newArticle.title,
      content: newArticle.content,
      updatedAt: newArticle.updatedAt,
    })
    articles.value.unshift(newArticle)
    return newArticle
  }

  async function remove(id: string): Promise<void> {
    await deleteDoc(doc(articlesCol(), id))
    articles.value = articles.value.filter((a) => a.id !== id)
  }

  return { articles, fetchAll, getById, save, create, remove }
})
