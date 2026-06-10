import { useEffect } from 'react'
import { Route, Routes } from 'react-router-dom'
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth'
import { auth } from './firebase'
import { useAuthStore } from './stores/auth'
import AppView from './views/AppView'

function toUser(firebaseUser: FirebaseUser | null) {
  return firebaseUser ? { id: firebaseUser.uid, email: firebaseUser.email ?? '' } : null
}

export default function App() {
  const isAuthReady = useAuthStore((s) => s.isAuthReady)

  useEffect(() => {
    // onAuthStateChanged を useEffect 内で登録することで、Firebase のコールバックが
    // React のレンダーサイクル外でのみ発火することを保証する（error #185 の防止）
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      useAuthStore.setState({
        user: toUser(firebaseUser),
        isAuthReady: true,
      })
    })
    return unsub
  }, [])

  if (!isAuthReady) return null

  return (
    <Routes>
      <Route path="/" element={<AppView />} />
    </Routes>
  )
}
