import '../styles/ui.css'

/**
 * 起動時（認証状態の確認中）に表示するスプラッシュ画面（共通実装）。
 * リングが回転するローディングインジケーターを中央に表示する。
 */
export default function SplashScreen({ appName }: { appName: string }) {
  return (
    <div className="splash-screen" role="status" aria-live="polite">
      <div className="splash-ring" aria-hidden="true" />
      <span className="splash-label">{appName} を読み込み中…</span>
    </div>
  )
}
