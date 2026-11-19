import { useEffect, useState } from 'react'
import { api, auth, loadConfig } from './api.js'
import { parseRoute } from './util.js'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Bots from './pages/Bots.jsx'
import BotEditor from './pages/BotEditor.jsx'
import BotDetail from './pages/BotDetail.jsx'
import { RunDetail, Runs } from './pages/Runs.jsx'
import { Admin, Keys } from './pages/Settings.jsx'

const NAV = [
  ['', '대시보드'],
  ['bots', '수집 봇'],
  ['runs', '실행 이력'],
  ['api', 'API · 연동'],
]

function useRoute() {
  const [route, setRoute] = useState(() => parseRoute(window.location.hash))
  useEffect(() => {
    const onChange = () => setRoute(parseRoute(window.location.hash))
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return route
}

function Page({ route, ctx }) {
  const [a, b, c] = route.parts
  if (!a) return <Dashboard />
  if (a === 'bots' && !b) return <Bots />
  if (a === 'bots' && b === 'new') return <BotEditor key={`new-${route.query.template || ''}`} template={route.query.template} ctx={ctx} />
  if (a === 'bots' && c === 'edit') return <BotEditor key={b} botId={b} ctx={ctx} />
  if (a === 'bots') return <BotDetail key={b} botId={b} />
  if (a === 'runs' && b) return <RunDetail key={b} runId={b} />
  if (a === 'runs') return <Runs />
  if (a === 'api') return <Keys />
  if (a === 'admin' && ctx.user.is_admin) return <Admin me={ctx.user} />
  return <p className="muted">없는 화면입니다.</p>
}

export default function App() {
  const route = useRoute()
  const [config, setConfig] = useState(null)
  const [info, setInfo] = useState(null)
  const [user, setUser] = useState(null)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadConfig().then(setConfig).catch(() => setConfig({ env: '?', version: '?' }))
    api('/info').then(setInfo).catch((e) => setError(e.message))
    const check = auth.token ? api('/auth/me').then(setUser).catch(() => {}) : Promise.resolve()
    check.finally(() => setReady(true))
    const onLogout = () => setUser(null)
    window.addEventListener('scraper:logout', onLogout)
    return () => window.removeEventListener('scraper:logout', onLogout)
  }, [])

  if (!ready || !config) return <p className="boot">불러오는 중…</p>
  if (!user) return <Login info={info} error={error} onLogin={setUser} />

  const logout = () => {
    auth.token = null
    setUser(null)
  }
  const current = route.parts[0] || ''
  const nav = user.is_admin ? [...NAV, ['admin', '사용자 관리']] : NAV

  return (
    <div className="shell">
      <aside className="side">
        <a className="brand" href="#/">
          <span className="logo" aria-hidden="true" />
          scraper
        </a>
        <nav>
          {nav.map(([key, label]) => (
            <a key={key} href={`#/${key}`} className={current === key ? 'on' : ''}>
              {label}
            </a>
          ))}
        </nav>
        <div className="side-foot">
          <div className="who">
            <strong>{user.username}</strong>
            {user.is_admin && <span className="tag">관리자</span>}
          </div>
          <button className="link" onClick={logout}>
            로그아웃
          </button>
          <div className="ver" data-testid="env">
            {config.env} · {config.version}
          </div>
        </div>
      </aside>
      <main className="main">
        <Page route={route} ctx={{ user, info: info || {} }} />
      </main>
    </div>
  )
}
