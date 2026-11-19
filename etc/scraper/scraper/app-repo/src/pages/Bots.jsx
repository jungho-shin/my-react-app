import { useState } from 'react'
import { api } from '../api.js'
import { Badge, Empty, ErrorBox, Loading, useLoad, usePoll } from '../ui.jsx'
import { fmtNumber, fmtTime, isActive, scheduleLabel } from '../util.js'

export default function Bots() {
  const bots = useLoad(() => api('/bots'))
  const templates = useLoad(() => api('/templates'))
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  usePoll(bots.reload, (bots.data || []).some((b) => isActive(b.last_run)))

  const run = async (e, bot) => {
    e.stopPropagation()
    setError('')
    try {
      await api(`/bots/${bot.id}/run`, { method: 'POST' })
      bots.reload()
    } catch (err) {
      setError(err.message)
    }
  }
  const shown = (bots.data || []).filter((b) => `${b.name} ${b.description} ${b.owner}`.toLowerCase().includes(query.toLowerCase()))

  return (
    <>
      <header className="head">
        <h1>수집 봇</h1>
        <a className="button primary" href="#/bots/new">
          새 수집 봇
        </a>
      </header>
      <ErrorBox>{error}</ErrorBox>

      <section className="card">
        <div className="card-head">
          <h2>전체 봇 {bots.data ? `(${bots.data.length})` : ''}</h2>
          <input className="search" placeholder="이름·설명·만든 사람 검색" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <Loading state={bots}>
          {shown.length ? (
            <div className="table-wrap">
              <table className="list">
                <thead>
                  <tr>
                    <th>이름</th>
                    <th>대상</th>
                    <th>예약</th>
                    <th>마지막 실행</th>
                    <th className="right">수집</th>
                    <th>만든 사람</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {shown.map((b) => (
                    <tr key={b.id} className="click" onClick={() => (window.location.hash = `/bots/${b.id}`)}>
                      <td>
                        <strong>{b.name}</strong>
                        {b.render === 'browser' && <span className="tag">브라우저</span>}
                      </td>
                      <td className="url">{b.start_url.replace(/^https?:\/\//, '')}</td>
                      <td>{scheduleLabel(b.schedule_type, b.schedule_value)}</td>
                      <td>
                        {b.last_run ? (
                          <>
                            <Badge status={b.last_run.status} /> {fmtTime(b.last_run.started_at || b.last_run.created_at)}
                          </>
                        ) : (
                          <span className="muted">없음</span>
                        )}
                      </td>
                      <td className="right">{b.last_run ? fmtNumber(b.last_run.item_count) : '-'}</td>
                      <td>{b.owner}</td>
                      <td className="right">
                        <button disabled={isActive(b.last_run)} onClick={(e) => run(e, b)}>
                          실행
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <Empty title={query ? '검색 결과가 없습니다' : '아직 봇이 없습니다'}>
              {!query && '아래 템플릿에서 시작하거나 ‘새 수집 봇’을 눌러 직접 만드세요.'}
            </Empty>
          )}
        </Loading>
      </section>

      <section>
        <h2 className="section-title">템플릿에서 시작</h2>
        <p className="muted">예제 사이트로 바로 실행해 볼 수 있습니다. 고른 뒤 주소와 선택자만 바꾸면 됩니다.</p>
        <div className="templates">
          {(templates.data || []).map((t) => (
            <a key={t.id} className="template" href={`#/bots/new?template=${t.id}`}>
              <strong>{t.name}</strong>
              <p>{t.description}</p>
              <div>
                {t.tags.map((tag) => (
                  <span key={tag} className="tag">
                    {tag}
                  </span>
                ))}
              </div>
            </a>
          ))}
        </div>
      </section>
    </>
  )
}
