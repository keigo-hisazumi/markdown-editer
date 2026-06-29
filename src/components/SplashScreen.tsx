import './SplashScreen.css'

/**
 * 起動時に表示するスプラッシュ画面。
 * リングが回転するローディングインジケーターを中央に表示する。
 */
export default function SplashScreen() {
  return (
    <div className="splash-screen" role="status" aria-live="polite">
      <div className="splash-ring" aria-hidden="true" />
      <span className="splash-label">Markdown Editor を読み込み中…</span>
    </div>
  )
}
