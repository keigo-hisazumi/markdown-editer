<template>
  <div class="list-page">
    <!-- ドロワーオーバーレイ -->
    <Transition name="fade">
      <div
        v-if="isDrawerOpen"
        class="drawer-overlay"
        @click="isDrawerOpen = false"
      />
    </Transition>

    <!-- 左スライドドロワー -->
    <Transition name="slide-left">
      <aside v-if="isDrawerOpen" class="drawer">
        <div class="drawer-top">
          <div class="drawer-avatar">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
            </svg>
          </div>
          <p class="drawer-email">{{ authStore.user?.email ?? '' }}</p>
        </div>
        <div class="drawer-body">
          <button class="drawer-btn-logout" @click="handleLogout">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
            ログアウト
          </button>
        </div>
        <div class="drawer-footer">
          <p class="drawer-app-date">アプリ更新日時<br>{{ APP_UPDATED_AT }}</p>
        </div>
      </aside>
    </Transition>

    <!-- ヘッダー -->
    <header class="page-header">
      <button class="btn-hamburger" @click="isDrawerOpen = true" aria-label="メニューを開く">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
        </svg>
      </button>
      <h1>記事一覧</h1>
      <button class="btn-new" @click="createArticle" aria-label="新規作成">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
        </svg>
      </button>
    </header>

    <!-- 記事一覧 -->
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
        記事がありません。右上の「＋」で始めましょう。
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useArticlesStore } from '@/stores/articles'

const APP_UPDATED_AT = '2026年06月02日'

const router = useRouter()
const authStore = useAuthStore()
const articlesStore = useArticlesStore()
const isDrawerOpen = ref(false)

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
  isDrawerOpen.value = false
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
/* ===== ページ全体 ===== */
.list-page {
  min-height: 100vh;
  background: #f3f4f6;
}

/* ===== ヘッダー ===== */
.page-header {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  padding: 0 1rem;
  height: 56px;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  position: sticky;
  top: 0;
  z-index: 10;
}

.page-header h1 {
  font-size: 1.125rem;
  font-weight: 700;
  margin: 0;
  color: #1a1a2e;
  text-align: center;
}

/* ===== ハンバーガーボタン ===== */
.btn-hamburger {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: #374151;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-hamburger:hover {
  background: #f3f4f6;
}

/* ===== 新規作成ボタン ===== */
.btn-new {
  justify-self: end;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: background 0.2s, transform 0.1s;
}

.btn-new:hover {
  background: #5a6fd6;
  transform: scale(1.05);
}

/* ===== オーバーレイ ===== */
.drawer-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 20;
}

/* ===== ドロワー ===== */
.drawer {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 280px;
  background: white;
  z-index: 30;
  display: flex;
  flex-direction: column;
  box-shadow: 4px 0 20px rgba(0, 0, 0, 0.15);
}

.drawer-top {
  padding: 2rem 1.5rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.drawer-avatar {
  width: 56px;
  height: 56px;
  background: #667eea;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.drawer-email {
  margin: 0;
  font-size: 0.875rem;
  color: #374151;
  word-break: break-all;
  text-align: center;
}

.drawer-body {
  flex: 1;
  padding: 1rem;
}

.drawer-btn-logout {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem 1rem;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: #ef4444;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.2s;
  text-align: left;
}

.drawer-btn-logout:hover {
  background: #fee2e2;
}

.drawer-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.drawer-app-date {
  margin: 0;
  font-size: 0.75rem;
  color: #9ca3af;
  line-height: 1.6;
}

/* ===== Transition: フェード ===== */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* ===== Transition: 左スライド ===== */
.slide-left-enter-active,
.slide-left-leave-active {
  transition: transform 0.25s ease;
}
.slide-left-enter-from,
.slide-left-leave-to {
  transform: translateX(-100%);
}

/* ===== 記事一覧 ===== */
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
