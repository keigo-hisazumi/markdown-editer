/**
 * 表示用の整形ユーティリティ（共通実装）。
 */

/** 日時を「2026/10/27 12:34」の形式で表示する */
export function formatDateTime(value: Date | string): string {
  const date = typeof value === 'string' ? new Date(value) : value
  return date.toLocaleString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * 一覧に表示する本文のプレビューを作る。
 * 改行は空白にまとめ、Markdown の記号は取り除いて読みやすくする。
 */
export function previewText(content: string, maxLength = 100): string {
  const text = content
    .replace(/[#*`>_[\]]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength)}…`
}
