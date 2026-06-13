import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth'
import './LoginView.css'

function errorMessage(e: unknown): string {
  const code = (e as { code?: string }).code ?? ''
  switch (code) {
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'メールアドレスまたはパスワードが正しくありません'
    case 'auth/email-already-in-use':
      return 'このメールアドレスはすでに使用されています'
    case 'auth/weak-password':
      return 'パスワードは6文字以上で入力してください'
    case 'auth/invalid-email':
      return 'メールアドレスの形式が正しくありません'
    case 'auth/too-many-requests':
      return 'しばらくしてから再度お試しください'
    default:
      return 'エラーが発生しました。もう一度お試しください'
  }
}

export default function LoginView() {
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)
  const signup = useAuthStore((s) => s.signup)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSignup, setIsSignup] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setErrorMsg('')
    setLoading(true)
    try {
      if (isSignup) {
        await signup(email, password)
      } else {
        await login(email, password)
      }
      navigate('/')
    } catch (e: unknown) {
      setErrorMsg(errorMessage(e))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="app-title">📝 Markdown Editor</h1>
        <p className="app-subtitle">記事を書こう</p>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">メールアドレス</label>
            <input
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="example@example.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">パスワード</label>
            <input
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="6文字以上"
              required
              autoComplete="current-password"
            />
          </div>

          {errorMsg && <p className="error-msg">{errorMsg}</p>}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading && <span className="loading-spinner" />}
            {loading ? '処理中...' : isSignup ? 'アカウント作成' : 'ログイン'}
          </button>
        </form>

        <button className="btn-toggle" onClick={() => setIsSignup((v) => !v)}>
          {isSignup ? 'すでにアカウントをお持ちの方はこちら' : 'アカウントを新規作成する'}
        </button>
      </div>
    </div>
  )
}
