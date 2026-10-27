import type { ReactNode } from 'react'
import { BackIcon } from './Icons'
import '../styles/ui.css'

interface Props {
  /** モバイル表示のときだけ「戻る」ボタンを表示する */
  showBack: boolean
  backLabel: string
  onBack: () => void
  /** 右側に並べる操作（保存状態・メニューなど） */
  children?: ReactNode
}

/** エディタ側の上部ナビゲーション（共通実装） */
export default function EditorNav({ showBack, backLabel, onBack, children }: Props) {
  return (
    <div className="editor-nav">
      {showBack ? (
        <button type="button" className="btn-back" onClick={onBack}>
          <BackIcon />
          <span>{backLabel}</span>
        </button>
      ) : (
        <div className="nav-spacer" />
      )}
      <div className="nav-actions">{children}</div>
    </div>
  )
}
