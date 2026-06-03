<template>
  <div class="editor-page">
    <header class="editor-header">
      <button class="btn-back" @click="router.push('/articles')" title="一覧に戻る">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
      </button>
      <span class="flex-spacer" />
      <span v-if="isDirty" class="editing-label">編集中</span>
      <span v-else class="saved-label">保存済み</span>
      <div class="menu-wrapper">
        <button class="btn-menu" @click.stop="menuOpen = !menuOpen" title="メニュー">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>
        </button>
        <div v-if="menuOpen" class="menu-dropdown" @click.stop>
          <button class="menu-item" @click="onMenuSave">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
            保存
          </button>
          <button class="menu-item" @click="onMenuTogglePreview">
            <svg v-if="!isPreview" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
            {{ isPreview ? '編集に戻る' : 'プレビュー' }}
          </button>
          <hr class="menu-divider" />
          <button class="menu-item menu-item--danger" @click="onMenuDelete">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
            削除
          </button>
        </div>
      </div>
    </header>

    <main class="editor-body">
      <div class="scroll-container">
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
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onBeforeUnmount, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { marked } from 'marked'
import { useArticlesStore } from '@/stores/articles'

const route = useRoute()
const router = useRouter()
const articlesStore = useArticlesStore()

const id = route.params.id as string
const article = articlesStore.getById(id)

if (!article) {
  router.push('/articles')
}

const title = ref(article?.title ?? '')
const content = ref(article?.content ?? '')
const isPreview = ref(false)
const isDirty = ref(false)
const menuOpen = ref(false)
const textareaRef = ref<HTMLTextAreaElement | null>(null)

const renderedContent = computed(() => marked(content.value))

function autoResize() {
  const el = textareaRef.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = el.scrollHeight + 'px'
}

function markDirty() {
  isDirty.value = true
}

function onContentInput() {
  markDirty()
  autoResize()
}

async function saveArticle() {
  await articlesStore.save(id, title.value, content.value)
  isDirty.value = false
}

function toggleMode() {
  if (!isPreview.value && isDirty.value) {
    saveArticle()
  }
  isPreview.value = !isPreview.value
}

function onMenuSave() {
  saveArticle()
  menuOpen.value = false
}

function onMenuTogglePreview() {
  toggleMode()
  menuOpen.value = false
}

async function onMenuDelete() {
  if (!confirm('この記事を削除しますか？')) return
  menuOpen.value = false
  await articlesStore.remove(id)
  router.push('/articles')
}

function closeMenu() {
  if (menuOpen.value) menuOpen.value = false
}

onMounted(() => {
  document.addEventListener('click', closeMenu)
  nextTick(autoResize)
})
onUnmounted(() => document.removeEventListener('click', closeMenu))

// ページ離脱前に自動保存
onBeforeUnmount(() => {
  if (isDirty.value) {
    articlesStore.save(id, title.value, content.value)
  }
})
</script>

<style scoped>
.editor-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  height: 100dvh;
  background: #fff;
}

.editor-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  padding-top: calc(0.75rem + env(safe-area-inset-top));
  padding-left: calc(1rem + env(safe-area-inset-left));
  padding-right: calc(1rem + env(safe-area-inset-right));
  border-bottom: 1px solid #e5e7eb;
  background: white;
  position: sticky;
  top: 0;
  z-index: 10;
  flex-shrink: 0;
}

.flex-spacer {
  flex: 1;
}

.btn-back {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  padding: 0;
  background: transparent;
  color: #6b7280;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: color 0.2s, background 0.2s;
}

.btn-back:hover {
  color: #374151;
  background: #f3f4f6;
}

.title-input {
  display: block;
  width: 100%;
  font-size: 1.4rem;
  font-weight: 700;
  border: none;
  outline: none;
  color: #1f2937;
  padding: 0.75rem 1.5rem;
  padding-left: calc(1.5rem + env(safe-area-inset-left));
  padding-right: calc(1.5rem + env(safe-area-inset-right));
  background: #fafafa;
  flex-shrink: 0;
  box-sizing: border-box;
}

.title-input::placeholder {
  color: #d1d5db;
}

.saved-label {
  font-size: 0.8rem;
  color: #10b981;
  flex-shrink: 0;
}

.editing-label {
  font-size: 0.8rem;
  color: #f59e0b;
  flex-shrink: 0;
}

.menu-wrapper {
  position: relative;
  flex-shrink: 0;
}

.btn-menu {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  padding: 0;
  background: transparent;
  color: #6b7280;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: color 0.2s, background 0.2s;
}

.btn-menu:hover {
  color: #374151;
  background: #f3f4f6;
}

.menu-dropdown {
  position: absolute;
  top: calc(100% + 0.25rem);
  right: 0;
  min-width: 140px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  z-index: 100;
  overflow: hidden;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.6rem 1rem;
  background: transparent;
  border: none;
  font-size: 0.875rem;
  color: #374151;
  cursor: pointer;
  text-align: left;
  transition: background 0.15s;
}

.menu-item:hover {
  background: #f3f4f6;
}

.menu-item--danger {
  color: #ef4444;
}

.menu-item--danger:hover {
  background: #fef2f2;
}

.menu-divider {
  border: none;
  border-top: 1px solid #e5e7eb;
  margin: 0.25rem 0;
}

.editor-body {
  flex: 1;
  overflow: hidden;
  display: flex;
  min-height: 0;
}

.scroll-container {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  display: flex;
  flex-direction: column;
  padding-bottom: env(safe-area-inset-bottom);
}

.editor-pane {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.markdown-input {
  width: 100%;
  min-height: 60vh;
  padding: 1.5rem;
  padding-left: calc(1.5rem + env(safe-area-inset-left));
  padding-right: calc(1.5rem + env(safe-area-inset-right));
  border: none;
  outline: none;
  resize: none;
  font-family: 'Courier New', Courier, monospace;
  font-size: 1rem;
  line-height: 1.7;
  color: #374151;
  background: #fafafa;
  box-sizing: border-box;
  overflow: hidden;
}

.preview-pane {
  padding: 1.5rem;
  padding-left: calc(1.5rem + env(safe-area-inset-left));
  padding-right: calc(1.5rem + env(safe-area-inset-right));
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
}
</style>

<style>
/* Markdown プレビュースタイル（グローバル） */
.markdown-body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 1rem;
  line-height: 1.75;
  color: #374151;
}

.markdown-body h1,
.markdown-body h2,
.markdown-body h3 {
  font-weight: 700;
  margin-top: 1.5em;
  margin-bottom: 0.5em;
  color: #1f2937;
}

.markdown-body h1 { font-size: 1.75rem; border-bottom: 2px solid #e5e7eb; padding-bottom: 0.5rem; }
.markdown-body h2 { font-size: 1.35rem; border-bottom: 1px solid #e5e7eb; padding-bottom: 0.3rem; }
.markdown-body h3 { font-size: 1.1rem; }

.markdown-body p { margin: 0.75em 0; }

.markdown-body ul,
.markdown-body ol {
  padding-left: 1.5rem;
  margin: 0.75em 0;
}

.markdown-body li { margin: 0.25em 0; }

.markdown-body code {
  background: #f3f4f6;
  padding: 0.15em 0.4em;
  border-radius: 4px;
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.875em;
  color: #ef4444;
}

.markdown-body pre {
  background: #1f2937;
  padding: 1rem;
  border-radius: 8px;
  overflow-x: auto;
  margin: 1em 0;
}

.markdown-body pre code {
  background: none;
  color: #f9fafb;
  padding: 0;
}

.markdown-body blockquote {
  border-left: 4px solid #667eea;
  margin: 1em 0;
  padding: 0.5rem 1rem;
  background: #eff6ff;
  color: #374151;
}

.markdown-body table {
  border-collapse: collapse;
  width: 100%;
  margin: 1em 0;
}

.markdown-body th,
.markdown-body td {
  border: 1px solid #d1d5db;
  padding: 0.5rem 0.75rem;
}

.markdown-body th {
  background: #f9fafb;
  font-weight: 600;
}

.markdown-body a {
  color: #667eea;
  text-decoration: none;
}

.markdown-body a:hover {
  text-decoration: underline;
}

.markdown-body strong { font-weight: 700; }
.markdown-body em { font-style: italic; }
.markdown-body del { text-decoration: line-through; color: #6b7280; }
</style>
