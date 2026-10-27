import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type PointerEvent,
  type ReactNode,
} from 'react'
import { TrashIcon } from './Icons'
import '../styles/ui.css'

const ACTION_WIDTH = 88
const OPEN_THRESHOLD = 40
const SWIPE_TRIGGER = 8
// 開いたボタンを閉じるためのタップを、項目の選択として扱わない時間（ミリ秒）
const SUPPRESS_CLICK_MS = 350

interface SwipeListState {
  openId: string | null
  setOpenId: (id: string | null) => void
  /** 開いていたボタンを外側のタップで閉じた時刻 */
  suppressClickRef: { current: number }
}

const SwipeListContext = createContext<SwipeListState | null>(null)

/**
 * スワイプでボタンを表示する一覧（共通実装）。
 * 同時に開くのは 1 項目だけで、ボタン以外の場所をタップすると閉じる。
 */
export function SwipeableList({ children }: { children: ReactNode }) {
  const [openId, setOpenId] = useState<string | null>(null)
  const suppressClickRef = useRef(0)

  useEffect(() => {
    if (openId === null) return
    function onDocPointerDown(e: globalThis.PointerEvent) {
      const target = e.target as HTMLElement | null
      if (target?.closest('.swipe-item-action')) return
      suppressClickRef.current = Date.now()
      setOpenId(null)
    }
    document.addEventListener('pointerdown', onDocPointerDown)
    return () => document.removeEventListener('pointerdown', onDocPointerDown)
  }, [openId])

  return (
    <SwipeListContext.Provider value={{ openId, setOpenId, suppressClickRef }}>
      <div className="swipe-list">{children}</div>
    </SwipeListContext.Provider>
  )
}

interface ItemProps {
  id: string
  active: boolean
  onSelect: (id: string) => void
  /** スワイプで表示したボタンを押したときの処理（ゴミ箱へ移動） */
  onAction: (id: string) => void
  actionLabel?: string
  children: ReactNode
}

/**
 * タッチ操作で左にスワイプすると「ゴミ箱」ボタンを表示する一覧の項目（共通実装）。
 * スワイプはタッチ専用の操作のため、マウス操作では反応しない。
 */
export function SwipeableListItem({
  id, active, onSelect, onAction, actionLabel = 'ゴミ箱', children,
}: ItemProps) {
  const list = useContext(SwipeListContext)
  if (!list) throw new Error('SwipeableListItem は SwipeableList の中で使ってください')
  const { openId, setOpenId, suppressClickRef } = list
  const isOpen = openId === id

  const [offset, setOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const startX = useRef(0)
  const startY = useRef(0)
  const startOffset = useRef(0)
  const dragging = useRef(false)
  const swiped = useRef(false)
  const decided = useRef(false)

  // 静止位置は isOpen のみで決まる。offset はドラッグ中だけ使用する。
  const translate = isDragging ? -offset : (isOpen ? -ACTION_WIDTH : 0)

  function handlePointerDown(e: PointerEvent<HTMLDivElement>) {
    if (e.pointerType === 'mouse') return
    startX.current = e.clientX
    startY.current = e.clientY
    startOffset.current = isOpen ? ACTION_WIDTH : 0
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

    const next = Math.min(Math.max(startOffset.current - dx, 0), ACTION_WIDTH + 40)
    setOffset(next)
  }

  function endDrag() {
    if (!dragging.current) return
    dragging.current = false
    setIsDragging(false)
    if (decided.current) {
      if (offset > OPEN_THRESHOLD) {
        setOpenId(id)
      } else if (isOpen) {
        setOpenId(null)
      }
    }
    setOffset(0)
  }

  function handleClick() {
    if (swiped.current) {
      swiped.current = false
      return
    }
    // 開いたボタンを閉じるタップで遷移しないようにする
    if (Date.now() - suppressClickRef.current < SUPPRESS_CLICK_MS) {
      suppressClickRef.current = 0
      return
    }
    if (isOpen) {
      setOpenId(null)
      return
    }
    onSelect(id)
  }

  return (
    <div className={`swipe-item${isDragging || isOpen ? ' swipe-item--revealed' : ''}`}>
      <button
        type="button"
        className="swipe-item-action"
        style={{ width: ACTION_WIDTH }}
        onClick={(e) => {
          e.stopPropagation()
          setOpenId(null)
          onAction(id)
        }}
        aria-label={actionLabel}
        tabIndex={isOpen ? 0 : -1}
      >
        <TrashIcon size={20} />
        <span>{actionLabel}</span>
      </button>
      <div
        className={`swipe-item-body${active ? ' active' : ''}`}
        style={{
          transform: `translateX(${translate}px)`,
          transition: isDragging ? 'none' : 'transform 0.2s ease',
        }}
        role="button"
        tabIndex={0}
        aria-current={active ? 'true' : undefined}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onSelect(id)
          }
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        {children}
      </div>
    </div>
  )
}
