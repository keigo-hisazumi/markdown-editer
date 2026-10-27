import { useEffect, useState, type ReactNode } from 'react'
import { LogoutIcon, MoonIcon, SunIcon, UserIcon } from './Icons'
import '../styles/ui.css'

export interface DrawerItem {
  key: string
  label: string
  icon: ReactNode
  onSelect: () => void
  /** 現在表示中の画面に対応する項目かどうか */
  active?: boolean
  /** 件数バッジ（0 のときは表示しない） */
  badge?: number
}

interface Props {
  email: string
  items: DrawerItem[]
  isDark: boolean
  onToggleTheme: () => void
  onLogout: () => void
}

/**
 * ハンバーガーボタンと、左からスライドするドロワーメニュー（共通実装）。
 * アカウント表示・画面切り替え・テーマ切り替え・ログアウトをまとめる。
 */
export default function DrawerMenu({ email, items, isDark, onToggleTheme, onLogout }: Props) {
  const [isOpen, setIsOpen] = useState(false)

  // Esc キーでドロワーを閉じる
  useEffect(() => {
    if (!isOpen) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isOpen])

  function select(action: () => void) {
    setIsOpen(false)
    action()
  }

  return (
    <>
      <button
        type="button"
        className={`hamburger-btn${isOpen ? ' open' : ''}`}
        onClick={() => setIsOpen((v) => !v)}
        aria-label={isOpen ? 'メニューを閉じる' : 'メニューを開く'}
        aria-expanded={isOpen}
      >
        <span className="bar" />
        <span className="bar" />
        <span className="bar" />
      </button>

      {/* 閉じるときもフェードアウトさせるため、オーバーレイとドロワーは常に描画しておく */}
      <div className={`drawer-overlay${isOpen ? ' open' : ''}`} onClick={() => setIsOpen(false)} />

      <aside
        className={`drawer${isOpen ? ' open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="メニュー"
        inert={!isOpen}
      >
        <div className="drawer-account">
          <div className="drawer-avatar">
            <UserIcon />
          </div>
          <span className="drawer-email">{email}</span>
        </div>
        <div className="drawer-divider" />

        {items.map((item) => (
          <button
            key={item.key}
            type="button"
            className={`drawer-item${item.active ? ' drawer-item--active' : ''}`}
            onClick={() => select(item.onSelect)}
            aria-current={item.active ? 'page' : undefined}
          >
            <span className="drawer-item-icon">{item.icon}</span>
            <span>{item.label}</span>
            {!!item.badge && <span className="count-badge">{item.badge}</span>}
          </button>
        ))}

        <div className="drawer-bottom">
          <div className="drawer-divider" />
          <button type="button" className="drawer-item" onClick={onToggleTheme}>
            <span className="drawer-item-icon">{isDark ? <MoonIcon /> : <SunIcon />}</span>
            <span>{isDark ? 'ダークモード' : 'ライトモード'}</span>
          </button>
          <div className="drawer-divider" />
          <button type="button" className="drawer-item drawer-item--logout" onClick={() => select(onLogout)}>
            <span className="drawer-item-icon"><LogoutIcon /></span>
            <span>ログアウト</span>
          </button>
        </div>
      </aside>
    </>
  )
}
