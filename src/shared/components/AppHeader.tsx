import type { ReactNode } from 'react'
import '../styles/ui.css'

interface Props {
  /** 左端に置く要素（ハンバーガーメニューなど） */
  left?: ReactNode
  /** 中央に表示するタイトル */
  title?: ReactNode
  /** 右端に置く要素（新規作成ボタンなど）。省略時は左右の幅を揃える空白を置く */
  right?: ReactNode
}

/** 一覧側の上部ヘッダー（共通実装）。タイトルは常に中央に配置する */
export default function AppHeader({ left, title, right }: Props) {
  return (
    <header className="app-header">
      {left ?? <span className="app-header-spacer" />}
      {title && <span className="app-header-title">{title}</span>}
      {right ?? <span className="app-header-spacer" />}
    </header>
  )
}
