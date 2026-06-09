import { Route, Routes } from 'react-router-dom'
import AppView from './views/AppView'
import { useAuthStore } from './stores/auth'

export default function App() {
  // Firebase Auth の初期化（localStorage 読み込み含む）が完了するまで描画を待つ
  const isAuthReady = useAuthStore((s) => s.isAuthReady)
  if (!isAuthReady) return null

  return (
    <Routes>
      <Route path="/" element={<AppView />} />
    </Routes>
  )
}
