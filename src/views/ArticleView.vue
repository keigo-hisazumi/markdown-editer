<template>
  <div class="article-app">
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

        <!-- ビューモード切り替え -->
        <button
          :class="['drawer-item', { 'drawer-item--active': viewMode === 'all' }]"
          @click="setViewMode('all')"
        >
          <span class="drawer-item-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
              <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
            </svg>
          </span>
          <span>すべて</span>
        </button>
        <button
          :class="['drawer-item', { 'drawer-item--active': viewMode === 'draft' }]"
          @click="setViewMode('draft')"
        >
          <span class="drawer-item-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
          </span>
          <span>作成中</span>
        </button>
        <button
          :class="['drawer-item', { 'drawer-item--active': viewMode === 'published' }]"
          @click="setViewMode('published')"
        >
          <span class="drawer-item-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </span>
          <span>投稿済み</span>
        </button>
        <button
          :class="['drawer-item', { 'drawer-item--active': viewMode === 'trash' }]"
          @click="setViewMode('trash')"
        >
          <span class="drawer-item-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
            </svg>
          </span>
          <span>ゴミ箱</span>
          <span v-if="articlesStore.trashedArticles.length > 0" class="trash-badge">
            {{ articlesStore.trashedArticles.length }}
          </span>
        </button>

        <div class="drawer-divider" />
        <div class="drawer-bottom">
          <button class="drawer-item" @click="handleThemeToggle">
            <span class="drawer-item-icon">
              <svg v-if="themeStore.isDark" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
              <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
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
        </div>
      </aside>
    </Transition>

    <!-- サイドバー（記事一覧） -->
    <div class="article-sidebar" :class="{ 'mobile-hidden': isMobile && showEditor }">
      <div class="sidebar-header">
        <button class="btn-hamburger" :class="{ open: isDrawerOpen }" @click="isDrawerOpen = !isDrawerOpen" aria-label="メニューを開く">
          <span class="bar" /><span class="bar" /><span class="bar" />
        </button>
        <span class="sidebar-title">Markdown Editer</span>
        <button v-if="viewMode !== 'trash'" class="btn-compose" @click="handleCreate" aria-label="新規作成">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 20h9"/>
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
          </svg>
        </button>
        <div v-else style="width: 36px;" />
      </div>

      <!-- 記事一覧（ゴミ箱以外） -->
      <template v-if="viewMode !== 'trash'">
        <div class="search-bar-wrap">
          <div class="search-bar">
            <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input v-model="searchQuery" type="search" class="search-input" placeholder="記事を検索" />
          </div>
        </div>

        <!-- 記事リスト -->
        <div class="article-list">
          <div v-if="filteredArticles.length === 0" class="empty-state">
            <p>記事がありません</p>
            <p class="empty-hint">右上のボタンで記事を追加しましょう</p>
          </div>
          <div
            v-for="article in filteredArticles"
            :key="article.id"
            :class="['article-item', { active: selectedId === article.id }]"
            @click="handleSelect(article.id)"
          >
            <div class="article-item-inner">
              <div class="article-item-header">
                <h2 class="article-title">{{ article.title || '無題の記事' }}</h2>
                <span :class="['status-badge', `status-badge--${article.status}`]">
                  {{ article.status === 'published' ? '投稿済み' : '作成中' }}
                </span>
              </div>
              <p class="article-preview">{{ previewText(article.content) }}</p>
              <time class="article-date">{{ formatDate(article.updatedAt) }}</time>
            </div>
          </div>
        </div>
      </template>

      <!-- ゴミ箱 -->
      <template v-else>
        <div class="article-list">
          <div v-if="articlesStore.trashedArticles.length === 0" class="empty-state">
            <p>ゴミ箱は空です</p>
          </div>
          <div
            v-for="article in articlesStore.trashedArticles"
            :key="article.id"
            class="article-item article-item--trash"
          >
            <div class="article-item-inner">
              <h2 class="article-title">{{ article.title || '無題の記事' }}</h2>
              <p class="article-preview">{{ previewText(article.content) }}</p>
              <time class="article-date">削除日: {{ formatDate(article.deletedAt!) }}</time>
              <div class="trash-actions">
                <button class="trash-btn trash-btn--restore" @click="handleRestore(article.id)">
                  復元
                </button>
                <button class="trash-btn trash-btn--delete" @click="handlePermanentDelete(article.id)">
                  完全削除
                </button>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- メインエリア（エディタ） -->
    <div class="article-main" :class="{ 'mobile-hidden': isMobile && !showEditor }">
      <div class="editor-nav">
        <button v-if="isMobile" class="btn-back" @click="handleBack">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          <span>記事一覧</span>
        </button>
        <div v-else class="nav-spacer" />

        <div class="nav-actions">
          <span v-if="isDirty" class="editing-label">編集中</span>
          <span v-else-if="selectedId" class="saved-label">保存済み</span>

          <!-- プレビュー切り替えボタン -->
          <button v-if="selectedId" class="nav-icon-btn" @click="togglePreview" :title="isPreview ? '編集に戻る' : 'プレビュー'">
            <svg v-if="!isPreview" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
            </svg>
            <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
              <line x1="1" y1="1" x2="23" y2="23"/>
            </svg>
          </button>

          <!-- メニュー -->
          <div v-if="selectedId" class="nav-icon-wrap">
            <button class="nav-icon-btn" @click.stop="menuOpen = !menuOpen" title="その他">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <circle cx="12" cy="12" r="10"/>
                <circle cx="7.5" cy="12" r="1.1" fill="currentColor" stroke="none"/>
                <circle cx="12" cy="12" r="1.1" fill="currentColor" stroke="none"/>
                <circle cx="16.5" cy="12" r="1.1" fill="currentColor" stroke="none"/>
              </svg>
            </button>
            <div v-if="menuOpen" class="action-menu" @click.stop>
              <button class="action-menu-item" @click="onMenuSave">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                  <polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
                </svg>
                保存
              </button>
              <div class="action-menu-divider" />
              <button class="action-menu-item" @click="onMenuToggleStatus">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                {{ currentArticleStatus === 'published' ? '作成中に戻す' : '投稿済みにする' }}
              </button>
              <div class="action-menu-divider" />
              <button class="action-menu-item action-menu-delete" @click="onMenuTrash">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                  <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                </svg>
                ゴミ箱に移動
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- エディタ本体 -->
      <div v-if="!selectedId" class="no-selection">
        <div class="no-selection-content">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/>
          </svg>
          <p>記事を選択してください</p>
        </div>
      </div>

      <div v-else class="editor-scroll">
        <input
          v-model="title"
          class="title-input"
          placeholder="記事タイトル"
          @input="markDirty"
        />
        <div v-if="!isPreview" class="editor-pane">
          <textarea
            ref="textareaRef"
            v-model="content"
            class="markdown-input"
            placeholder="Markdown で書いてください..."
            @input="onContentInput"
            spellcheck="false"
          />
        </div>
        <div v-else class="preview-pane markdown-body" v-html="renderedContent" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { marked } from 'marked'
import { useArticlesStore } from '@/stores/articles'
import type { ArticleStatus } from '@/stores/articles'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'

const route = useRoute()
const router = useRouter()
const articlesStore = useArticlesStore()
const authStore = useAuthStore()
const themeStore = useThemeStore()

const isDrawerOpen = ref(false)
const searchQuery = ref('')
const menuOpen = ref(false)
const title = ref('')
const content = ref('')
const isDirty = ref(false)
const isPreview = ref(false)
const textareaRef = ref<HTMLTextAreaElement | null>(null)
const windowWidth = ref(window.innerWidth)
const viewMode = ref<'all' | 'draft' | 'published' | 'trash'>('all')

function setViewMode(mode: typeof viewMode.value) {
  viewMode.value = mode
  isDrawerOpen.value = false
}

const isMobile = computed(() => windowWidth.value < 768)
const selectedId = computed(() => route.query.id as string | undefined)
const showEditor = computed(() => !!selectedId.value)

const currentArticleStatus = computed(() => {
  if (!selectedId.value) return 'draft'
  return articlesStore.getById(selectedId.value)?.status ?? 'draft'
})

const filteredArticles = computed(() => {
  let list = articlesStore.articles
  if (viewMode.value === 'draft' || viewMode.value === 'published') {
    list = list.filter((a) => a.status === viewMode.value)
  }
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return list
  return list.filter((a) =>
    a.title.toLowerCase().includes(q) || a.content.toLowerCase().includes(q)
  )
})

const renderedContent = computed(() => marked(content.value))

watch(selectedId, (id) => {
  if (id) {
    const article = articlesStore.getById(id)
    if (article) {
      title.value = article.title
      content.value = article.content
      isDirty.value = false
      isPreview.value = false
      nextTick(autoResize)
    }
  }
}, { immediate: true })

function onResize() { windowWidth.value = window.innerWidth }

onMounted(() => {
  articlesStore.fetchAll()
  window.addEventListener('resize', onResize)
  document.addEventListener('click', closeMenu)
})

onUnmounted(() => {
  window.removeEventListener('resize', onResize)
  document.removeEventListener('click', closeMenu)
})

onBeforeUnmount(() => {
  if (isDirty.value && selectedId.value) {
    articlesStore.save(selectedId.value, title.value, content.value)
  }
})

function autoResize() {
  const el = textareaRef.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = el.scrollHeight + 'px'
}

function markDirty() { isDirty.value = true }

function onContentInput() {
  markDirty()
  autoResize()
}

async function saveArticle() {
  if (!selectedId.value) return
  await articlesStore.save(selectedId.value, title.value, content.value)
  isDirty.value = false
}

function togglePreview() {
  if (!isPreview.value && isDirty.value) saveArticle()
  isPreview.value = !isPreview.value
}

function closeMenu() { menuOpen.value = false }

function onMenuSave() {
  saveArticle()
  menuOpen.value = false
}

async function onMenuToggleStatus() {
  if (!selectedId.value) return
  menuOpen.value = false
  const next: ArticleStatus = currentArticleStatus.value === 'published' ? 'draft' : 'published'
  await articlesStore.updateStatus(selectedId.value, next)
  isDirty.value = false
}

async function onMenuTrash() {
  if (!selectedId.value) return
  menuOpen.value = false
  if (isDirty.value) await saveArticle()
  await articlesStore.trash(selectedId.value)
  router.push('/')
}

async function handleRestore(id: string) {
  await articlesStore.restore(id)
}

async function handlePermanentDelete(id: string) {
  if (!confirm('この記事を完全に削除しますか？この操作は取り消せません。')) return
  await articlesStore.permanentDelete(id)
}

function handleSelect(id: string) {
  if (isDirty.value && selectedId.value) saveArticle()
  router.push({ query: { id } })
}

async function handleCreate() {
  if (isDirty.value && selectedId.value) await saveArticle()
  const article = await articlesStore.create()
  router.push({ query: { id: article.id } })
}

function handleBack() {
  if (isDirty.value && selectedId.value) saveArticle()
  router.push('/')
}

function handleThemeToggle() { themeStore.toggleTheme() }

async function handleLogout() {
  isDrawerOpen.value = false
  if (isDirty.value && selectedId.value) await saveArticle()
  await authStore.logout()
  router.push('/')
}

function previewText(c: string): string {
  return c.replace(/[#*`>_[\]]/g, '').slice(0, 80).trim()
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('ja-JP', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })
}
</script>

<style scoped>
.article-app {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background: var(--app-bg);
  transition: background 0.3s;
  position: relative;
}

/* ===== サイドバー ===== */
.article-sidebar {
  width: 300px;
  flex-shrink: 0;
  border-right: 1px solid var(--app-border);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: border-color 0.3s;
}

.sidebar-header {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 53px;
  padding: 0 0.75rem;
  background: var(--app-header-bg);
  border-bottom: 1px solid var(--app-header-border);
  flex-shrink: 0;
  transition: background 0.3s, border-color 0.3s;
}

.sidebar-title {
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

.btn-hamburger:hover { background: var(--app-menu-hover); }

.bar {
  display: block;
  width: 20px;
  height: 2px;
  background: var(--app-accent);
  border-radius: 2px;
  transition: transform 0.25s ease, opacity 0.25s ease;
  transform-origin: center;
}

.btn-hamburger.open .bar:nth-child(1) { transform: translateY(7px) rotate(45deg); }
.btn-hamburger.open .bar:nth-child(2) { opacity: 0; transform: scaleX(0); }
.btn-hamburger.open .bar:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

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

.btn-compose:hover { background: var(--app-menu-hover); }

.trash-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  background: #ef4444;
  color: #fff;
  border-radius: 8px;
  font-size: 0.65rem;
  font-weight: 700;
  line-height: 1;
  margin-left: auto;
}

/* 検索バー */
.search-bar-wrap {
  height: 53px;
  box-sizing: border-box;
  padding: 0 0.75rem;
  display: flex;
  align-items: center;
  background: var(--app-bg);
  border-bottom: 1px solid var(--app-border);
  flex-shrink: 0;
  transition: background 0.3s, border-color 0.3s;
}

.search-bar {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--app-bg-soft);
  border-radius: 10px;
  padding: 0.45rem 0.75rem;
  transition: background 0.3s;
}

.search-icon { color: var(--app-text-muted); flex-shrink: 0; }

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 0.9rem;
  color: var(--app-text);
  outline: none;
  font-family: inherit;
}

.search-input::placeholder { color: var(--app-text-muted); }
.search-input::-webkit-search-cancel-button { -webkit-appearance: none; }


/* 記事リスト */
.article-list {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  background: var(--app-bg);
  transition: background 0.3s;
}

.empty-state {
  padding: 3rem 1.5rem;
  text-align: center;
  color: var(--app-text-muted);
  transition: color 0.3s;
}

.empty-state p { margin: 0.5rem 0; }
.empty-hint { font-size: 0.9rem; }

.article-item {
  background: var(--app-bg);
  cursor: pointer;
  border-bottom: 1px solid var(--app-border);
  transition: background 0.15s, border-color 0.3s;
  -webkit-tap-highlight-color: transparent;
}

.article-item--trash { cursor: default; }

.article-item:last-child { border-bottom: none; }

.article-item:hover:not(.article-item--trash),
.article-item.active { background: var(--app-active-bg); }

.article-item-inner { padding: 0.85rem 1rem; }

.article-item-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.2rem;
}

.article-title {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--app-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.3s;
  flex: 1;
  min-width: 0;
}

/* ステータスバッジ */
.status-badge {
  flex-shrink: 0;
  display: inline-block;
  padding: 0.1rem 0.45rem;
  border-radius: 10px;
  font-size: 0.65rem;
  font-weight: 600;
  line-height: 1.4;
}

.status-badge--draft {
  background: rgba(245, 158, 11, 0.15);
  color: #d97706;
}

.status-badge--published {
  background: rgba(16, 185, 129, 0.15);
  color: #059669;
}

.article-preview {
  margin: 0 0 0.3rem;
  font-size: 0.8rem;
  color: var(--app-text-secondary);
  line-height: 1.45;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: color 0.3s;
}

.article-date {
  font-size: 0.72rem;
  color: var(--app-text-muted);
  transition: color 0.3s;
}

/* ゴミ箱アクションボタン */
.trash-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.6rem;
}

.trash-btn {
  padding: 0.3rem 0.7rem;
  border-radius: 6px;
  font-size: 0.78rem;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid;
  font-family: inherit;
  transition: background 0.15s, color 0.15s;
}

.trash-btn--restore {
  background: transparent;
  border-color: var(--app-accent);
  color: var(--app-accent);
}

.trash-btn--restore:hover {
  background: var(--app-accent);
  color: #fff;
}

.trash-btn--delete {
  background: transparent;
  border-color: #ef4444;
  color: #ef4444;
}

.trash-btn--delete:hover {
  background: #ef4444;
  color: #fff;
}

/* ===== メインエリア ===== */
.article-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
}

.editor-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 53px;
  padding: 0 0.75rem;
  background: var(--app-header-bg);
  border-bottom: 1px solid var(--app-header-border);
  flex-shrink: 0;
  transition: background 0.3s, border-color 0.3s;
}

.nav-spacer { flex: 1; }

.btn-back {
  display: flex;
  align-items: center;
  gap: 0.1rem;
  padding: 0.4rem 0.5rem;
  background: transparent;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 400;
  cursor: pointer;
  color: var(--app-accent);
  transition: opacity 0.15s;
  font-family: inherit;
}

.btn-back:hover { opacity: 0.7; }

.nav-actions {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.saved-label { font-size: 0.8rem; color: #10b981; }
.editing-label { font-size: 0.8rem; color: #f59e0b; }

.nav-icon-wrap { position: relative; }

.nav-icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: transparent;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  color: var(--app-accent);
  transition: opacity 0.15s;
}

.nav-icon-btn:hover { opacity: 0.7; }

.action-menu {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  background: var(--app-menu-bg);
  border: 1px solid var(--app-border);
  border-radius: 10px;
  box-shadow: 0 4px 16px var(--app-shadow);
  z-index: 100;
  min-width: 180px;
  overflow: hidden;
  transition: background 0.3s;
}

.action-menu-item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  width: 100%;
  padding: 0.75rem 1rem;
  background: transparent;
  border: none;
  font-size: 0.95rem;
  cursor: pointer;
  text-align: left;
  font-family: inherit;
  color: var(--app-text);
  transition: background 0.15s;
}

.action-menu-item:hover { background: var(--app-menu-hover); }

.action-menu-divider {
  height: 1px;
  background: var(--app-border);
  margin: 0;
}

.action-menu-delete { color: var(--app-delete-hover-text); }

/* 未選択時 */
.no-selection {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  color: var(--app-text-muted);
  transition: color 0.3s;
}

.no-selection-content {
  text-align: center;
}

.no-selection-content svg {
  margin-bottom: 1rem;
  opacity: 0.4;
}

.no-selection-content p {
  margin: 0;
  font-size: 1rem;
}

/* エディタ */
.editor-scroll {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  display: flex;
  flex-direction: column;
  background: var(--app-bg);
  transition: background 0.3s;
}

.title-input {
  display: block;
  width: 100%;
  height: 53px;
  font-size: 1.4rem;
  font-weight: 700;
  border: none;
  border-bottom: 1px solid var(--app-border);
  outline: none;
  color: var(--app-text);
  padding: 0 1.25rem;
  background: var(--app-bg);
  flex-shrink: 0;
  box-sizing: border-box;
  transition: background 0.3s, color 0.3s, border-color 0.3s;
  font-family: inherit;
}

.title-input::placeholder { color: var(--app-text-placeholder); }

.editor-pane {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.markdown-input {
  width: 100%;
  min-height: 60vh;
  padding: 1.5rem;
  border: none;
  outline: none;
  resize: none;
  font-family: 'Courier New', Courier, monospace;
  font-size: 1rem;
  line-height: 1.7;
  color: var(--app-text);
  background: var(--app-bg);
  box-sizing: border-box;
  overflow: hidden;
  transition: background 0.3s, color 0.3s;
}

.preview-pane {
  padding: 1.5rem;
  box-sizing: border-box;
}

/* ===== ドロワー ===== */
.drawer-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 200;
}

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

.drawer-item:hover .drawer-item-icon { color: var(--app-text-secondary); }

.drawer-item--active {
  color: var(--app-accent);
  background: var(--app-active-bg);
}

.drawer-item--active .drawer-item-icon { color: var(--app-accent); }

.drawer-item--logout:hover { color: var(--app-logout-hover-text); }
.drawer-item--logout:hover .drawer-item-icon { color: var(--app-logout-hover-text); }

.drawer-bottom {
  margin-top: auto;
  padding-bottom: env(safe-area-inset-bottom, 0px);
}

/* ===== モバイル対応 ===== */
@media (max-width: 767px) {
  .article-sidebar,
  .article-main {
    position: absolute;
    inset: 0;
    width: 100%;
  }

  .article-sidebar { border-right: none; }

  .mobile-hidden { display: none; }
}

/* ===== ドロワートランジション ===== */
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.slide-left-enter-active { transition: transform 0.28s cubic-bezier(0.25, 0.46, 0.45, 0.94); }
.slide-left-leave-active { transition: transform 0.22s cubic-bezier(0.55, 0, 0.55, 0.2); }
.slide-left-enter-from, .slide-left-leave-to { transform: translateX(-100%); }
</style>

<style>
/* Markdown プレビュースタイル（グローバル） */
.markdown-body {
  font-family: inherit;
  font-size: 1rem;
  line-height: 1.75;
  color: var(--app-text);
}

.markdown-body h1,
.markdown-body h2,
.markdown-body h3 {
  font-weight: 700;
  margin-top: 1.5em;
  margin-bottom: 0.5em;
  color: var(--app-text);
}

.markdown-body h1 { font-size: 1.75rem; border-bottom: 2px solid var(--app-border); padding-bottom: 0.5rem; }
.markdown-body h2 { font-size: 1.35rem; border-bottom: 1px solid var(--app-border); padding-bottom: 0.3rem; }
.markdown-body h3 { font-size: 1.1rem; }

.markdown-body p { margin: 0.75em 0; }

.markdown-body ul,
.markdown-body ol { padding-left: 1.5rem; margin: 0.75em 0; }

.markdown-body li { margin: 0.25em 0; }

.markdown-body code {
  background: var(--app-bg-soft);
  padding: 0.15em 0.4em;
  border-radius: 4px;
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.875em;
  color: #ef4444;
}

.markdown-body pre {
  background: var(--app-header-bg);
  border: 1px solid var(--app-border);
  padding: 1rem;
  border-radius: 8px;
  overflow-x: auto;
  margin: 1em 0;
}

.markdown-body pre code { background: none; color: var(--app-text); padding: 0; }

.markdown-body blockquote {
  border-left: 4px solid var(--app-accent);
  margin: 1em 0;
  padding: 0.5rem 1rem;
  background: var(--app-active-bg);
  color: var(--app-text-secondary);
}

.markdown-body table { border-collapse: collapse; width: 100%; margin: 1em 0; }

.markdown-body th,
.markdown-body td { border: 1px solid var(--app-border); padding: 0.5rem 0.75rem; }

.markdown-body th { background: var(--app-bg-soft); font-weight: 600; }

.markdown-body a { color: var(--app-accent); text-decoration: none; }
.markdown-body a:hover { text-decoration: underline; }

.markdown-body strong { font-weight: 700; }
.markdown-body em { font-style: italic; }
.markdown-body del { text-decoration: line-through; color: var(--app-text-muted); }
</style>
