import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth'
import LoginPage from '@/shared/components/LoginPage'

export default function LoginView() {
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)
  const signup = useAuthStore((s) => s.signup)

  return (
    <LoginPage
      appName="📝 Markdown Editor"
      tagline="記事を書こう"
      onLogin={login}
      onSignup={signup}
      onSuccess={() => navigate('/')}
    />
  )
}
