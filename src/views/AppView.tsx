import { useAuthStore } from '@/stores/auth'
import LoginView from './LoginView'
import ArticleView from './ArticleView'

export default function AppView() {
  const isLoggedIn = useAuthStore((s) => s.user !== null)

  return isLoggedIn ? <ArticleView /> : <LoginView />
}
