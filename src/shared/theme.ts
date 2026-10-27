/**
 * テーマ（ライト/ダーク）の解決・適用・保存を担う共通ユーティリティ。
 *
 * React の描画前に同期的にテーマを適用できるよう、状態管理（Context / Zustand）から
 * 切り離している。これにより初期描画時のちらつき（FOUC）を防ぐ。
 *
 * src/shared/ 配下は memo-list と markdown-editer で同一内容を保つ共通実装です。
 */

const STORAGE_KEY = 'theme'
const DARK_QUERY = '(prefers-color-scheme: dark)'

/** ユーザーがテーマを手動で選んでいるかどうか */
function hasSavedTheme(): boolean {
  const saved = localStorage.getItem(STORAGE_KEY)
  return saved === 'dark' || saved === 'light'
}

/** localStorage と OS 設定から初期テーマ（ダークかどうか）を解決する */
export function resolveInitialTheme(): boolean {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved === 'dark' || saved === 'light') {
    return saved === 'dark'
  }
  return window.matchMedia(DARK_QUERY).matches
}

/** html 要素に light/dark クラスを適用する */
export function applyTheme(isDark: boolean): void {
  document.documentElement.classList.toggle('dark', isDark)
  document.documentElement.classList.toggle('light', !isDark)
  syncThemeColor()
}

/**
 * meta[name="theme-color"] をヘッダーの背景色に合わせる。
 * ブラウザやホーム画面アプリのステータスバー（ヘッダーの上）がヘッダーと同じ色になる。
 */
function syncThemeColor(): void {
  const meta = document.querySelector('meta[name="theme-color"]')
  if (!meta) return
  const color = getComputedStyle(document.documentElement).getPropertyValue('--app-header-bg').trim()
  if (color) meta.setAttribute('content', color)
}

/** トランジション付きでテーマを適用する（ユーザー操作時に使用） */
export function applyThemeWithTransition(isDark: boolean): void {
  document.documentElement.classList.add('theme-transitioning')
  applyTheme(isDark)
  setTimeout(() => {
    document.documentElement.classList.remove('theme-transitioning')
  }, 400)
}

/** 手動で選んだテーマを保存し、トランジション付きで適用する */
export function saveTheme(isDark: boolean): void {
  localStorage.setItem(STORAGE_KEY, isDark ? 'dark' : 'light')
  applyThemeWithTransition(isDark)
}

/**
 * OS のテーマ設定の変更を監視する。手動でテーマを選んでいない場合のみ追従する。
 * 戻り値は監視を解除する関数。
 */
export function watchSystemTheme(onChange: (isDark: boolean) => void): () => void {
  const mq = window.matchMedia(DARK_QUERY)
  function handleChange(e: MediaQueryListEvent) {
    if (hasSavedTheme()) return
    applyThemeWithTransition(e.matches)
    onChange(e.matches)
  }
  mq.addEventListener('change', handleChange)
  return () => mq.removeEventListener('change', handleChange)
}
