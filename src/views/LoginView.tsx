import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth'
import './LoginView.css'

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
      const code = (e as { code?: string }).code ?? ''
      if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setErrorMsg('メールアドレスまたはパスワードが正しくありません')
      } else if (code === 'auth/email-already-in-use') {
        setErrorMsg('このメールアドレスはすでに使用されています')
      } else if (code === 'auth/weak-password') {
        setErrorMsg('パスワードは6文字以上で入力してください')
      } else {
        setErrorMsg('エラーが発生しました。もう一度お試しください')
      }
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
