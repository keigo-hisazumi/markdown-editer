import type { ButtonHTMLAttributes, ReactNode } from 'react'
import '../styles/ui.css'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** ボタンの用途（aria-label と title に使う） */
  label: string
  children: ReactNode
  /** 危険な操作（削除など）の色で表示する */
  danger?: boolean
}

/** ヘッダー・ナビゲーションに置くアイコンだけのボタン（共通実装） */
export default function IconButton({ label, children, danger, className, ...rest }: Props) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`icon-btn${danger ? ' icon-btn--danger' : ''}${className ? ` ${className}` : ''}`}
      {...rest}
    >
      {children}
    </button>
  )
}
