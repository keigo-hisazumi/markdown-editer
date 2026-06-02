<template>
  <div class="list-page">
    <header class="page-header">
      <h1>記事一覧</h1>
      <div class="header-actions">
        <button class="btn-new" @click="createArticle">+ 新規作成</button>
        <button class="btn-logout" @click="handleLogout">ログアウト</button>
      </div>
    </header>

    <main class="article-list">
      <div
        v-for="article in articlesStore.articles"
        :key="article.id"
        class="article-card"
        @click="openArticle(article.id)"
      >
        <div class="card-body">
          <h2 class="article-title">{{ article.title }}</h2>
          <p class="article-preview">{{ previewText(article.content) }}</p>
          <time class="article-date">{{ formatDate(article.updatedAt) }}</time>
        </div>
        <button
          class="btn-delete"
          @click.stop="deleteArticle(article.id)"
          title="削除"
        >
          ✕
        </button>
      </div>

      <div v-if="articlesStore.articles.length === 0" class="empty-state">
        記事がありません。「新規作成」で始めましょう。
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useArticlesStore } from '@/stores/articles'

const router = useRouter()
const authStore = useAuthStore()
const articlesStore = useArticlesStore()

onMounted(() => {
  articlesStore.fetchAll()
})

function openArticle(id: string) {
  router.push(`/articles/${id}`)
}

async function createArticle() {
  const article = await articlesStore.create()
  router.push(`/articles/${article.id}`)
}

async function deleteArticle(id: string) {
  if (confirm('この記事を削除しますか？')) {
    await articlesStore.remove(id)
  }
}

async function handleLogout() {
  await authStore.logout()
  router.push('/')
}

function previewText(content: string): string {
  return content.replace(/[#*`>_[\]]/g, '').slice(0, 80).trim()
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<style scoped>
.list-page {
  min-height: 100vh;
  background: #f3f4f6;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  position: sticky;
  top: 0;
  z-index: 10;
}

.page-header h1 {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
  color: #1a1a2e;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
}

.btn-new {
  padding: 0.5rem 1rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-new:hover {
  background: #5a6fd6;
}

.btn-logout {
  padding: 0.5rem 1rem;
  background: transparent;
  color: #6b7280;
  border: 1.5px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-logout:hover {
  border-color: #9ca3af;
  color: #374151;
}

.article-list {
  padding: 1.5rem;
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.article-card {
  background: white;
  border-radius: 10px;
  padding: 1.25rem;
  cursor: pointer;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  transition: box-shadow 0.2s, transform 0.1s;
}

.article-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  transform: translateY(-1px);
}

.card-body {
  flex: 1;
  min-width: 0;
}

.article-title {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.4rem;
  color: #1f2937;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.article-preview {
  font-size: 0.85rem;
  color: #6b7280;
  margin: 0 0 0.5rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.article-date {
  font-size: 0.75rem;
  color: #9ca3af;
}

.btn-delete {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  background: transparent;
  color: #d1d5db;
  border: none;
  border-radius: 50%;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-delete:hover {
  background: #fee2e2;
  color: #ef4444;
}

.empty-state {
  text-align: center;
  color: #9ca3af;
  padding: 3rem;
}
</style>
