import { useState, type FormEvent, type ReactNode } from 'react'
import { authErrorMessage } from '../lib/authError'
import '../styles/ui.css'

interface Props {
  /** アプリ名 */
  appName: ReactNode
  /** アプリ名の下に表示する一言 */
  tagline?: string
  onLogin: (email: string, password: string) => Promise<void>
  onSignup: (email: string, password: string) => Promise<void>
  /** ログイン・新規登録に成功したときの処理（画面遷移など） */
  onSuccess?: () => void
}

/** メールアドレスとパスワードによるログイン・新規登録画面（共通実装） */
export default function LoginPage({ appName, tagline, onLogin, onSignup, onSuccess }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignup, setIsSignup] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setErrorMessage('')
    setIsLoading(true)
    try {
      await (isSignup ? onSignup : onLogin)(email, password)
      onSuccess?.()
    } catch (err) {
      setErrorMessage(authErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }

  function toggleMode() {
    setIsSignup((v) => !v)
    setErrorMessage('')
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-app-name">{appName}</h1>
        {tagline && <p className="login-tagline">{tagline}</p>}
        <h2 className="login-form-title">{isSignup ? '新規登録' : 'ログイン'}</h2>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="login-email">メールアドレス</label>
            <input
              id="login-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="example@example.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-password">パスワード</label>
            <input
              id="login-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="6文字以上"
              required
              minLength={6}
              autoComplete={isSignup ? 'new-password' : 'current-password'}
            />
          </div>

          {errorMessage && <p className="login-error" role="alert">{errorMessage}</p>}

          <button type="submit" className="btn-primary" disabled={isLoading}>
            {isLoading && <span className="loading-spinner" />}
            {isSignup ? '登録する' : 'ログイン'}
          </button>
        </form>

        <button type="button" className="btn-link" onClick={toggleMode}>
          {isSignup ? 'すでにアカウントをお持ちの方はこちら' : 'アカウントをお持ちでない方はこちら'}
        </button>
      </div>
    </div>
  )
}
