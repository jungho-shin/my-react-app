import { useState } from 'react'
import { api, auth } from '../api.js'
import { ErrorBox } from '../ui.jsx'

export default function Login({ info, error: bootError, onLogin }) {
  const [mode, setMode] = useState('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const signup = mode === 'signup'

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const res = await api(signup ? '/auth/signup' : '/auth/login', { method: 'POST', body: { username, password } })
      auth.token = res.token
      onLogin(res.user)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="login">
      <form className="login-card" onSubmit={submit}>
        <div className="brand dark">
          <span className="logo" aria-hidden="true" />
          scraper
        </div>
        <p className="lead">웹 페이지의 목록·가격·게시글을 코드 없이 모아 Excel 과 API 로 내보내는 사내 수집 서비스</p>
        <label>
          사용자 이름
          <input value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" autoFocus required />
        </label>
        <label>
          비밀번호 {signup && <small>8자 이상</small>}
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={signup ? 'new-password' : 'current-password'}
            required
          />
        </label>
        <ErrorBox>{error || bootError}</ErrorBox>
        <button className="primary" disabled={busy}>
          {signup ? '계정 만들기' : '로그인'}
        </button>
        {info?.allow_signup !== false && (
          <button type="button" className="link" onClick={() => setMode(signup ? 'login' : 'signup')}>
            {signup ? '이미 계정이 있습니다' : '처음이면 계정 만들기'}
          </button>
        )}
      </form>
    </div>
  )
}
