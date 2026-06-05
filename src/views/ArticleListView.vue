<template>
  <div class="list-view">
    <!-- ドロワーオーバーレイ -->
    <Transition name="fade">
      <div v-if="isDrawerOpen" class="drawer-overlay" @click="isDrawerOpen = false" />
    </Transition>

    <!-- 左スライドドロワー -->
    <Transition name="slide-left">
      <aside v-if="isDrawerOpen" class="drawer" role="dialog" aria-modal="true">
        <div class="drawer-account">
          <div class="drawer-avatar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <span class="drawer-email">{{ authStore.user?.email ?? '' }}</span>
        </div>

        <div class="drawer-divider" />

        <button class="drawer-item" @click="handleThemeToggle">
          <span class="drawer-item-icon">
            <svg v-if="themeStore.isDark" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
            <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="5"/>
              <line x1="12" y1="1" x2="12" y2="3"/>
              <line x1="12" y1="21" x2="12" y2="23"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="1" y1="12" x2="3" y2="12"/>
              <line x1="21" y1="12" x2="23" y2="12"/>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
          </span>
          <span>{{ themeStore.isDark ? 'ダークモード' : 'ライトモード' }}</span>
        </button>

        <div class="drawer-divider" />

        <button class="drawer-item drawer-item--logout" @click="handleLogout">
          <span class="drawer-item-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </span>
          <span>ログアウト</span>
        </button>
      </aside>
    </Transition>

    <!-- ヘッダー -->
    <header class="list-header">
      <button class="btn-hamburger" :class="{ open: isDrawerOpen }" @click="isDrawerOpen = !isDrawerOpen" aria-label="メニューを開く">
        <span class="bar" />
        <span class="bar" />
        <span class="bar" />
      </button>
      <span class="header-title">Markdown Editer</span>
      <button class="btn-compose" @click="createArticle" aria-label="新規作成">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 20h9"/>
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
        </svg>
      </button>
    </header>

    <!-- 検索バー -->
    <div class="search-bar-wrap">
      <div class="search-bar">
        <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          v-model="searchQuery"
          type="search"
          class="search-input"
          placeholder="記事を検索"
        />
      </div>
    </div>

    <!-- 記事一覧 -->
    <main class="list-body">
      <div v-if="filteredArticles.length === 0" class="empty-state">
        <p>記事がありません</p>
        <p class="empty-hint">右上のボタンで記事を追加しましょう</p>
      </div>

      <div v-else class="article-items">
        <div
          v-for="article in filteredArticles"
          :key="article.id"
          class="article-item"
          @click="openArticle(article.id)"
        >
          <div class="article-item-inner">
            <div class="article-content">
              <h2 class="article-title">{{ article.title || '無題の記事' }}</h2>
              <p class="article-preview">{{ previewText(article.content) }}</p>
              <time class="article-date">{{ formatDate(article.updatedAt) }}</time>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useArticlesStore } from '@/stores/articles'
import { useThemeStore } from '@/stores/theme'

const router = useRouter()
const authStore = useAuthStore()
const articlesStore = useArticlesStore()
const themeStore = useThemeStore()

const isDrawerOpen = ref(false)
const searchQuery = ref('')

const filteredArticles = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return articlesStore.articles
  return articlesStore.articles.filter(a =>
    a.title.toLowerCase().includes(q) || a.content.toLowerCase().includes(q)
  )
})

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

function handleThemeToggle() {
  themeStore.toggleTheme()
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
.list-view {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  max-width: 600px;
  margin: 0 auto;
  padding-top: 53px;
  background: var(--app-bg);
  transition: background 0.3s;
}

/* ヘッダー */
.list-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  max-width: 600px;
  margin: 0 auto;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0.75rem;
  background: var(--app-header-bg);
  border-bottom: 1px solid var(--app-header-border);
  transition: background 0.3s, border-color 0.3s;
  box-shadow: 0 1px 4px var(--app-shadow);
}

.header-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--app-text);
  letter-spacing: 0.01em;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  transition: color 0.3s;
}

/* ハンバーガーボタン */
.btn-hamburger {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 5px;
  width: 36px;
  height: 36px;
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  padding: 6px;
  transition: background 0.2s;
  -webkit-tap-highlight-color: transparent;
}

.btn-hamburger:hover {
  background: var(--app-menu-hover);
}

.bar {
  display: block;
  width: 20px;
  height: 2px;
  background: var(--app-accent);
  border-radius: 2px;
  transition: transform 0.25s ease, opacity 0.25s ease;
  transform-origin: center;
}

.btn-hamburger.open .bar:nth-child(1) {
  transform: translateY(7px) rotate(45deg);
}

.btn-hamburger.open .bar:nth-child(2) {
  opacity: 0;
  transform: scaleX(0);
}

.btn-hamburger.open .bar:nth-child(3) {
  transform: translateY(-7px) rotate(-45deg);
}

/* 新規作成ボタン */
.btn-compose {
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--app-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 6px;
  padding: 0;
  transition: background 0.2s;
  -webkit-tap-highlight-color: transparent;
}

.btn-compose:hover {
  background: var(--app-menu-hover);
}

/* 検索バー */
.search-bar-wrap {
  padding: 0.6rem 0.75rem;
  background: var(--app-bg);
  border-bottom: 1px solid var(--app-border);
  transition: background 0.3s, border-color 0.3s;
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--app-bg-soft);
  border-radius: 10px;
  padding: 0.45rem 0.75rem;
  transition: background 0.3s;
}

.search-icon {
  color: var(--app-text-muted);
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 0.9rem;
  color: var(--app-text);
  outline: none;
  font-family: inherit;
}

.search-input::placeholder {
  color: var(--app-text-muted);
}

.search-input::-webkit-search-cancel-button {
  -webkit-appearance: none;
}

/* ドロワーオーバーレイ */
.drawer-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 200;
}

/* ドロワー */
.drawer {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 280px;
  max-width: 80vw;
  background: var(--app-menu-bg);
  border-right: 1px solid var(--app-border);
  box-shadow: 4px 0 20px var(--app-menu-shadow);
  z-index: 300;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  transition: background 0.3s;
}

.drawer-account {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.25rem;
  user-select: none;
  -webkit-user-select: none;
}

.drawer-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: var(--app-accent);
  border-radius: 50%;
  color: #ffffff;
  flex-shrink: 0;
}

.drawer-email {
  font-size: 0.85rem;
  color: var(--app-text);
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 180px;
  transition: color 0.3s;
}

.drawer-divider {
  height: 1px;
  background: var(--app-border);
  transition: background 0.3s;
}

.drawer-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.9rem 1.25rem;
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
  color: var(--app-text-secondary);
  text-align: left;
  transition: background 0.15s, color 0.15s;
  font-family: inherit;
  -webkit-tap-highlight-color: transparent;
}

.drawer-item:hover {
  background: var(--app-menu-hover);
  color: var(--app-text);
}

.drawer-item-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  flex-shrink: 0;
  color: var(--app-text-muted);
  transition: color 0.15s;
}

.drawer-item:hover .drawer-item-icon {
  color: var(--app-text-secondary);
}

.drawer-item--logout:hover {
  color: var(--app-logout-hover-text);
}

.drawer-item--logout:hover .drawer-item-icon {
  color: var(--app-logout-hover-text);
}

/* 記事一覧 */
.list-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--app-bg);
  transition: background 0.3s;
}

.empty-state {
  padding: 3rem 1.5rem;
  text-align: center;
  color: var(--app-text-muted);
  transition: color 0.3s;
}

.empty-state p {
  margin: 0.5rem 0;
}

.empty-hint {
  font-size: 0.9rem;
}

.article-items {
  display: flex;
  flex-direction: column;
}

.article-item {
  background: var(--app-bg);
  cursor: pointer;
  border-bottom: 1px solid var(--app-border);
  transition: background 0.15s, border-color 0.3s;
  -webkit-tap-highlight-color: transparent;
}

.article-item:last-child {
  border-bottom: none;
}

.article-item:active {
  background: var(--app-active-bg);
}

.article-item-inner {
  padding: 0.85rem 1rem;
}

.article-content {
  min-width: 0;
}

.article-title {
  margin: 0 0 0.2rem;
  font-size: 1rem;
  font-weight: 600;
  color: var(--app-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.3s;
}

.article-preview {
  margin: 0 0 0.3rem;
  font-size: 0.82rem;
  color: var(--app-text-secondary);
  line-height: 1.45;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: color 0.3s;
}

.article-date {
  font-size: 0.75rem;
  color: var(--app-text-muted);
  transition: color 0.3s;
}

/* トランジション: オーバーレイ */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* トランジション: ドロワー（左からスライド） */
.slide-left-enter-active {
  transition: transform 0.28s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.slide-left-leave-active {
  transition: transform 0.22s cubic-bezier(0.55, 0, 0.55, 0.2);
}

.slide-left-enter-from,
.slide-left-leave-to {
  transform: translateX(-100%);
}
</style>
