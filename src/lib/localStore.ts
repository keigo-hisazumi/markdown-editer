import type { Article } from '@/stores/articles'

// localStorage に保存する際のキーのプレフィックス。
// ユーザーごとにデータを分けるため、末尾に userId を付与する。
const KEY_PREFIX = 'articles:'

function storageKey(userId: string): string {
  return `${KEY_PREFIX}${userId}`
}

/**
 * 指定ユーザーの記事一覧をローカル（localStorage）から読み込む。
 * ネットワークに接続されていなくても利用できる。
 * 破損データや未保存の場合は空配列を返す。
 */
export function loadLocalArticles(userId: string): Article[] {
  try {
    const raw = localStorage.getItem(storageKey(userId))
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed as Article[]
  } catch {
    // JSON 破損などの場合は空として扱う
    return []
  }
}

/**
 * 記事一覧をローカル（localStorage）へ保存する。
 * オフライン時の編集内容を保持し、次回起動時や再接続時の同期に利用する。
 */
export function saveLocalArticles(userId: string, articles: Article[]): void {
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify(articles))
  } catch {
    // 容量超過などで保存に失敗しても致命的ではないため握りつぶす
  }
}
