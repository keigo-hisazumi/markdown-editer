import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Article {
  id: string
  title: string
  content: string
  updatedAt: string
}

const MOCK_ARTICLES: Article[] = [
  {
    id: '1',
    title: 'Vue.js 入門',
    content: `# Vue.js 入門\n\n## はじめに\n\nVue.js はプログレッシブフレームワークです。\n\n## 特徴\n\n- **リアクティブ** なデータバインディング\n- **コンポーネント** ベースのアーキテクチャ\n- **軽量** で学習コストが低い\n\n## コード例\n\n\`\`\`javascript\nconst app = Vue.createApp({})\n\`\`\`\n`,
    updatedAt: '2026-06-01T10:00:00Z',
  },
  {
    id: '2',
    title: 'Markdown チートシート',
    content: `# Markdown チートシート\n\n## 見出し\n\n# H1\n## H2\n### H3\n\n## テキスト装飾\n\n**太字** / *斜体* / ~~取り消し線~~\n\n## リスト\n\n- 項目1\n- 項目2\n  - サブ項目\n\n## テーブル\n\n| 列1 | 列2 |\n|-----|-----|\n| A   | B   |\n`,
    updatedAt: '2026-05-31T15:30:00Z',
  },
  {
    id: '3',
    title: '未完成の記事',
    content: `# 下書き\n\nここに内容を書く。\n`,
    updatedAt: '2026-05-30T09:00:00Z',
  },
]

export const useArticlesStore = defineStore('articles', () => {
  const articles = ref<Article[]>(JSON.parse(JSON.stringify(MOCK_ARTICLES)))

  function getById(id: string): Article | undefined {
    return articles.value.find((a) => a.id === id)
  }

  function save(id: string, title: string, content: string) {
    const article = articles.value.find((a) => a.id === id)
    if (article) {
      article.title = title
      article.content = content
      article.updatedAt = new Date().toISOString()
    }
  }

  function create(): Article {
    const newArticle: Article = {
      id: String(Date.now()),
      title: '新しい記事',
      content: '# 新しい記事\n\nここに内容を書いてください。\n',
      updatedAt: new Date().toISOString(),
    }
    articles.value.unshift(newArticle)
    return newArticle
  }

  function remove(id: string) {
    articles.value = articles.value.filter((a) => a.id !== id)
  }

  return { articles, getById, save, create, remove }
})
