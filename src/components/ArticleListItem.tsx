import { useRef, useState, type MutableRefObject, type PointerEvent } from 'react'
import type { Article } from '@/stores/articles'

interface Props {
  article: Article
  active: boolean
  isOpen: boolean
  suppressClickRef: MutableRefObject<number>
  onSelect: (id: string) => void
  onTrash: (id: string) => void
  onOpen: (id: string | null) => void
}

const DELETE_WIDTH = 88
const OPEN_THRESHOLD = 40
const SWIPE_TRIGGER = 8

function previewText(c: string): string {
  return c.replace(/[#*`>_[\]]/g, '').slice(0, 80).trim()
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('ja-JP', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })
}

/**
 * 記事一覧の項目。タッチ操作で左にスワイプすると「ゴミ箱」ボタンを表示する
 * （memo-list のスワイプ削除 UI を記事一覧へ取り込んだもの）。
 */
export default function ArticleListItem({
  article, active, isOpen, suppressClickRef, onSelect, onTrash, onOpen,
}: Props) {
  const [offset, setOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const startX = useRef(0)
  const startY = useRef(0)
  const startOffset = useRef(0)
  const dragging = useRef(false)
  const swiped = useRef(false)
  const decided = useRef(false)

  // 静止位置は isOpen のみで決まる。offset はドラッグ中だけ使用する。
  const translate = isDragging ? -offset : (isOpen ? -DELETE_WIDTH : 0)

  function handlePointerDown(e: PointerEvent<HTMLDivElement>) {
    if (e.pointerType === 'mouse') return
    startX.current = e.clientX
    startY.current = e.clientY
    startOffset.current = isOpen ? DELETE_WIDTH : 0
    dragging.current = true
    swiped.current = false
    decided.current = false
  }

  function handlePointerMove(e: PointerEvent<HTMLDivElement>) {
    if (!dragging.current) return
    const dx = e.clientX - startX.current
    const dy = e.clientY - startY.current

    if (!decided.current) {
      if (Math.abs(dx) < SWIPE_TRIGGER && Math.abs(dy) < SWIPE_TRIGGER) return
      // ジェスチャーの方向を判定（縦スクロール or 横スワイプ）
      if (Math.abs(dy) > Math.abs(dx)) {
        dragging.current = false
        return
      }
      decided.current = true
      swiped.current = true
      setIsDragging(true)
      e.currentTarget.setPointerCapture(e.pointerId)
    }

    let next = startOffset.current - dx
    if (next < 0) next = 0
    if (next > DELETE_WIDTH + 40) next = DELETE_WIDTH + 40
    setOffset(next)
  }

  function endDrag() {
    if (!dragging.current) return
    dragging.current = false
    setIsDragging(false)
    if (decided.current) {
      if (offset > OPEN_THRESHOLD) {
        onOpen(article.id)
      } else if (isOpen) {
        onOpen(null)
      }
    }
    setOffset(0)
  }

  function handleClick() {
    if (swiped.current) {
      swiped.current = false
      return
    }
    // 開いた削除ボタンを閉じるタップで遷移しないようにする
    if (Date.now() - suppressClickRef.current < 350) {
      suppressClickRef.current = 0
      return
    }
    if (isOpen) {
      onOpen(null)
      return
    }
    onSelect(article.id)
  }

  return (
    <div className="article-item-wrapper">
      <button
        type="button"
        className="article-item-delete"
        style={{ width: DELETE_WIDTH }}
        onClick={(e) => { e.stopPropagation(); onTrash(article.id) }}
        aria-label="ゴミ箱に移動"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
          <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
        </svg>
        <span>ゴミ箱</span>
      </button>
      <div
        className={`article-item${active ? ' active' : ''}`}
        style={{
          transform: `translateX(${translate}px)`,
          transition: isDragging ? 'none' : 'transform 0.2s ease',
        }}
        onClick={handleClick}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <div className="article-item-inner">
          <div className="article-item-header">
            <h2 className="article-title">{article.title || '無題の記事'}</h2>
            <span className={`status-badge status-badge--${article.status}`}>
              {article.status === 'published' ? '投稿済み' : '作成中'}
            </span>
          </div>
          <p className="article-preview">{previewText(article.content)}</p>
          <time className="article-date">{formatDate(article.updatedAt)}</time>
        </div>
      </div>
    </div>
  )
}
