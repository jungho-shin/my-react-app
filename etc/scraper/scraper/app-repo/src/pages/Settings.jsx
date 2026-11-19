import { useState } from 'react'
import { API, api } from '../api.js'
import { Empty, ErrorBox, Loading, useLoad } from '../ui.jsx'
import { fmtTime } from '../util.js'

export function Keys() {
  const keys = useLoad(() => api('/keys'))
  const [name, setName] = useState('')
  const [made, setMade] = useState(null)
  const [error, setError] = useState('')
  const base = `${window.location.origin}${API}`

  const create = async (e) => {
    e.preventDefault()
    setError('')
    try {
      setMade(await api('/keys', { method: 'POST', body: { name } }))
      setName('')
      keys.reload()
    } catch (err) {
      setError(err.message)
    }
  }
  const remove = async (k) => {
    if (!window.confirm(`‘${k.name}’ 키를 삭제할까요? 이 키를 쓰는 연동은 바로 멈춥니다.`)) return
    try {
      await api(`/keys/${k.id}`, { method: 'DELETE' })
      keys.reload()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <>
      <header className="head">
        <h1>API · 연동</h1>
        <a className="button" href={`${API}/docs`} target="_blank" rel="noreferrer">
          API 문서 열기
        </a>
      </header>
      <ErrorBox>{error}</ErrorBox>

      <section className="card">
        <h2>API 키</h2>
        <p className="muted">다른 시스템(BI, 배치, 스크립트)에서 수집을 실행하거나 데이터를 가져갈 때 사용합니다. 사용 제한이나 과금은 없습니다.</p>
        <form className="inline" onSubmit={create}>
          <input value={name} placeholder="키 이름 (예: BI 대시보드)" maxLength={60} required onChange={(e) => setName(e.target.value)} />
          <button className="primary">키 만들기</button>
        </form>
        {made && (
          <div className="notice">
            <strong>새 키 – 지금만 볼 수 있으니 복사해 두세요</strong>
            <code className="key">{made.key}</code>
          </div>
        )}
        <Loading state={keys}>
          {keys.data?.length ? (
            <table className="list">
              <thead>
                <tr>
                  <th>이름</th>
                  <th>키</th>
                  <th>만든 날</th>
                  <th>마지막 사용</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {keys.data.map((k) => (
                  <tr key={k.id}>
                    <td>{k.name}</td>
                    <td>
                      <code>{k.prefix}…</code>
                    </td>
                    <td>{fmtTime(k.created_at)}</td>
                    <td>{k.last_used_at ? fmtTime(k.last_used_at) : '사용 안 함'}</td>
                    <td className="right">
                      <button className="danger" onClick={() => remove(k)}>
                        삭제
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <Empty title="만든 키가 없습니다" />
          )}
        </Loading>
      </section>

      <section className="card">
        <h2>사용 예</h2>
        <p className="muted">
          <code>{'{봇ID}'}</code> 는 봇 화면 주소의 숫자입니다. 모든 요청에 <code>X-API-Key</code> 헤더를 넣습니다.
        </p>
        <h3>가장 최근에 성공한 수집 결과 가져오기 (JSON)</h3>
        <pre className="log">{`curl -H "X-API-Key: usk_..." "${base}/bots/{봇ID}/latest/items?limit=1000"`}</pre>
        <h3>Excel / CSV 파일로 받기</h3>
        <pre className="log">{`curl -H "X-API-Key: usk_..." -o data.xlsx "${base}/bots/{봇ID}/latest/export?format=xlsx"\n# 이전 실행에 없던 데이터만: &new_only=true`}</pre>
        <h3>수집 실행 → 끝났는지 확인</h3>
        <pre className="log">{`curl -X POST -H "X-API-Key: usk_..." "${base}/bots/{봇ID}/run"      # → {"id": 실행ID, "status": "queued"}\ncurl -H "X-API-Key: usk_..." "${base}/runs/{실행ID}"               # status: success 가 될 때까지`}</pre>
        <h3>MCP – Claude 같은 AI 도구에서 바로 쓰기</h3>
        <p className="muted">
          MCP 서버로 등록하면 AI 가 봇 목록 조회, 수집 실행, 데이터 가져오기, 새 봇 만들기(자동 감지 → 미리보기 → 저장)를 도구로 호출합니다. 아래는 Claude Code 에 등록하는 명령입니다.
        </p>
        <pre className="log">{`claude mcp add --transport http scraper ${base}/mcp --header "X-API-Key: usk_..."`}</pre>
        <h3>Webhook</h3>
        <p className="muted">
          봇 설정에 Webhook 주소를 넣으면 실행이 끝날 때마다 <code>{'{event, bot, run, columns, items}'}</code> 를 POST 합니다 (items 는 최대 500건, 전체는 <code>items_url</code>).
        </p>
      </section>
    </>
  )
}

export function Admin({ me }) {
  const users = useLoad(() => api('/admin/users'))
  const [error, setError] = useState('')
  const [done, setDone] = useState('')

  const act = async (fn, message) => {
    setError('')
    setDone('')
    try {
      await fn()
      setDone(message)
      users.reload()
    } catch (e) {
      setError(e.message)
    }
  }
  const reset = (u) => {
    const password = window.prompt(`${u.username} 의 새 비밀번호 (8자 이상)`)
    if (password) act(() => api(`/admin/users/${u.id}/password`, { method: 'POST', body: { password } }), `${u.username} 의 비밀번호를 바꿨습니다`)
  }

  return (
    <>
      <header className="head">
        <h1>사용자 관리</h1>
      </header>
      <ErrorBox>{error}</ErrorBox>
      {done && <div className="notice">{done}</div>}
      <section className="card">
        <Loading state={users}>
          <table className="list">
            <thead>
              <tr>
                <th>사용자</th>
                <th>권한</th>
                <th className="right">봇</th>
                <th>가입</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {(users.data || []).map((u) => (
                <tr key={u.id}>
                  <td>{u.username}</td>
                  <td>{u.is_admin ? '관리자' : '사용자'}</td>
                  <td className="right">{u.bots}</td>
                  <td>{fmtTime(u.created_at)}</td>
                  <td className="right actions">
                    <button onClick={() => reset(u)}>비밀번호 재설정</button>
                    {u.id !== me.id && (
                      <button onClick={() => act(() => api(`/admin/users/${u.id}/admin`, { method: 'POST', body: { is_admin: !u.is_admin } }), '권한을 바꿨습니다')}>
                        {u.is_admin ? '관리자 해제' : '관리자로 지정'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Loading>
      </section>
    </>
  )
}
