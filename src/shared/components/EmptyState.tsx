import type { ReactNode } from 'react'
import '../styles/ui.css'

interface Props {
  message: string
  hint?: string
  icon?: ReactNode
}

/** 一覧が空のときの表示（共通実装） */
export default function EmptyState({ message, hint, icon }: Props) {
  return (
    <div className="empty-state">
      {icon && <span className="empty-state-icon">{icon}</span>}
      <p>{message}</p>
      {hint && <p className="empty-state-hint">{hint}</p>}
    </div>
  )
}
