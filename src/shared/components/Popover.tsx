import type { ReactNode } from 'react'
import IconButton from './IconButton'
import '../styles/ui.css'

interface PopoverProps {
  label: string
  icon: ReactNode
  open: boolean
  onOpenChange: (open: boolean) => void
  children: ReactNode
  /** メニュー形式（項目を縦に並べる）にするかどうか。false の場合は情報表示用の余白を付ける */
  menu?: boolean
}

/**
 * アイコンボタンと、その下に開くポップアップ（共通実装）。
 * 外側のクリックで閉じるには、親で useDocumentClick を使って open を false にする。
 */
export function Popover({ label, icon, open, onOpenChange, children, menu = true }: PopoverProps) {
  return (
    <div className="popover-wrap">
      <IconButton
        label={label}
        aria-haspopup={menu ? 'menu' : 'dialog'}
        aria-expanded={open}
        onClick={(e) => {
          e.stopPropagation()
          onOpenChange(!open)
        }}
      >
        {icon}
      </IconButton>
      {open && (
        <div
          className={menu ? 'popover popover--menu' : 'popover popover--info'}
          role={menu ? 'menu' : 'dialog'}
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      )}
    </div>
  )
}

interface MenuItemProps {
  icon: ReactNode
  children: ReactNode
  onClick: () => void
  danger?: boolean
}

export function MenuItem({ icon, children, onClick, danger }: MenuItemProps) {
  return (
    <button
      type="button"
      role="menuitem"
      className={`menu-item${danger ? ' menu-item--danger' : ''}`}
      onClick={onClick}
    >
      <span className="menu-item-icon">{icon}</span>
      {children}
    </button>
  )
}

export function MenuDivider() {
  return <div className="menu-divider" role="separator" />
}
