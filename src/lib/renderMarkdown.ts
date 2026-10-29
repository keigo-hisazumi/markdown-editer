import DOMPurify from 'dompurify'
import { marked } from 'marked'

/**
 * Markdown を HTML に変換し、DOMPurify でサニタイズして返す。
 * marked は生の HTML（<script> や onerror 属性など）をそのまま出力するため、
 * サニタイズせずに表示すると貼り付けた Markdown 経由でスクリプトが実行される（XSS）。
 */
export function renderMarkdown(content: string): string {
  return DOMPurify.sanitize(marked.parse(content, { async: false }))
}
