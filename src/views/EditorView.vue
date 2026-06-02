<template>
  <div class="editor-page">
    <header class="editor-header">
      <button class="btn-back" @click="router.push('/articles')">← 一覧</button>
      <input
        v-model="title"
        class="title-input"
        placeholder="記事タイトル"
        @input="markDirty"
      />
      <div class="header-actions">
        <button
          v-if="isDirty"
          class="btn-save"
          @click="saveArticle"
        >
          保存
        </button>
        <span v-else class="saved-label">保存済み</span>
        <button
          class="btn-toggle"
          @click="toggleMode"
          :title="isPreview ? '編集に戻る' : 'プレビュー'"
        >
          {{ isPreview ? '✏️ 編集' : '👁 プレビュー' }}
        </button>
      </div>
    </header>

    <main class="editor-body">
      <div v-if="!isPreview" class="editor-pane">
        <textarea
          v-model="content"
          class="markdown-input"
          placeholder="Markdown で書いてください..."
          @input="markDirty"
          spellcheck="false"
        />
      </div>

      <div v-else class="preview-pane markdown-body" v-html="renderedContent" />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onBeforeUnmount } from 'vue'
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

const renderedContent = computed(() => marked(content.value))

function markDirty() {
  isDirty.value = true
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
  background: #fff;
}

.editor-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e5e7eb;
  background: white;
  position: sticky;
  top: 0;
  z-index: 10;
}

.btn-back {
  flex-shrink: 0;
  padding: 0.4rem 0.75rem;
  background: transparent;
  color: #6b7280;
  border: 1.5px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}

.btn-back:hover {
  border-color: #9ca3af;
  color: #374151;
}

.title-input {
  flex: 1;
  font-size: 1.1rem;
  font-weight: 600;
  border: none;
  outline: none;
  color: #1f2937;
  min-width: 0;
}

.title-input::placeholder {
  color: #d1d5db;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.btn-save {
  padding: 0.4rem 1rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-save:hover {
  background: #5a6fd6;
}

.saved-label {
  font-size: 0.8rem;
  color: #10b981;
  padding: 0.4rem 0.5rem;
}

.btn-toggle {
  padding: 0.4rem 0.75rem;
  background: transparent;
  color: #374151;
  border: 1.5px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-toggle:hover {
  border-color: #9ca3af;
}

.editor-body {
  flex: 1;
  overflow: hidden;
  display: flex;
}

.editor-pane {
  flex: 1;
  display: flex;
}

.markdown-input {
  flex: 1;
  padding: 1.5rem;
  border: none;
  outline: none;
  resize: none;
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.95rem;
  line-height: 1.7;
  color: #374151;
  background: #fafafa;
}

.preview-pane {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
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
