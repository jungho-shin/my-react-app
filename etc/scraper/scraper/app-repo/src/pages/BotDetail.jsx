import { useState } from 'react'
import { api } from '../api.js'
import { Badge, DataTable, Empty, ErrorBox, ExportButtons, Loading, Pager, go, useLoad, usePoll } from '../ui.jsx'
import { fmtNumber, fmtTime, isActive, scheduleLabel } from '../util.js'
import { RunRows } from './Dashboard.jsx'

const PAGE = 50

export default function BotDetail({ botId }) {
  const [tab, setTab] = useState('data')
  const [offset, setOffset] = useState(0)
  const [newOnly, setNewOnly] = useState(false)
  const [error, setError] = useState('')
  const bot = useLoad(() => api(`/bots/${botId}`))
  const runs = useLoad(() => api(`/runs?bot_id=${botId}&limit=30`))
  const items = useLoad(
    () => api(`/bots/${botId}/latest/items?offset=${offset}&limit=${PAGE}&new_only=${newOnly}`).catch((e) => (e.status === 404 ? null : Promise.reject(e))),
    [offset, newOnly],
  )
  const b = bot.data
  const active = isActive(b?.last_run)
  usePoll(async () => {
    const before = b?.last_run?.status
    await bot.reload()
    runs.reload()
    if (before !== 'queued') items.reload()
  }, active)

  const act = async (fn) => {
    setError('')
    try {
      await fn()
      await Promise.all([bot.reload(), runs.reload(), items.reload()])
    } catch (e) {
      setError(e.message)
    }
  }
  const remove = async () => {
    if (!window.confirm(`‘${b.name}’ 봇과 수집한 데이터를 모두 삭제할까요?`)) return
    setError('')
    try {
      await api(`/bots/${botId}`, { method: 'DELETE' })
      go('/bots')
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <Loading state={bot}>
      {b && (
        <>
          <header className="head">
            <div>
              <a className="back" href="#/bots">
                ← 수집 봇
              </a>
              <h1>{b.name}</h1>
              {b.description && <p className="muted">{b.description}</p>}
            </div>
            <span className="actions">
              {b.can_edit && (
                <>
                  <button className="danger" onClick={remove}>
                    삭제
                  </button>
                  <a className="button" href={`#/bots/${b.id}/edit`}>
                    수정
                  </a>
                </>
              )}
              {active ? (
                <button onClick={() => act(() => api(`/runs/${b.last_run.id}/cancel`, { method: 'POST' }))}>실행 취소</button>
              ) : (
                <button className="primary" onClick={() => act(() => api(`/bots/${b.id}/run`, { method: 'POST' }))}>
                  지금 실행
                </button>
              )}
            </span>
          </header>
          <ErrorBox>{error}</ErrorBox>

          <dl className="facts card">
            <div>
              <dt>대상</dt>
              <dd className="url">{b.start_url}</dd>
            </div>
            <div>
              <dt>방식</dt>
              <dd>{b.render === 'browser' ? '브라우저 렌더링' : '일반'}</dd>
            </div>
            <div>
              <dt>예약</dt>
              <dd>
                {scheduleLabel(b.schedule_type, b.schedule_value)}
                {b.next_run_at && <small> · 다음 {fmtTime(b.next_run_at)}</small>}
              </dd>
            </div>
            <div>
              <dt>마지막 실행</dt>
              <dd>
                {b.last_run ? (
                  <a href={`#/runs/${b.last_run.id}`}>
                    <Badge status={b.last_run.status} /> {fmtTime(b.last_run.started_at || b.last_run.created_at)}
                    {active && ` · ${fmtNumber(b.last_run.item_count)}건 수집 중`}
                  </a>
                ) : (
                  '없음'
                )}
              </dd>
            </div>
            <div>
              <dt>만든 사람</dt>
              <dd>{b.owner}</dd>
            </div>
          </dl>
          {b.last_run?.status === 'failed' && <ErrorBox>마지막 실행 실패: {b.last_run.error}</ErrorBox>}

          <div className="tabs" role="tablist">
            <button role="tab" aria-selected={tab === 'data'} onClick={() => setTab('data')}>
              최신 데이터
            </button>
            <button role="tab" aria-selected={tab === 'runs'} onClick={() => setTab('runs')}>
              실행 이력 {runs.data ? `(${runs.data.total})` : ''}
            </button>
          </div>

          {tab === 'data' && (
            <section className="card">
              <Loading state={items}>
                {items.data ? (
                  <>
                    <div className="card-head">
                      <span>
                        <strong>{fmtNumber(items.data.total)}건</strong>
                        <span className="muted">
                          {' '}
                          · {fmtTime(items.data.run.finished_at)} 수집 · 신규 {fmtNumber(items.data.run.new_count)}건
                        </span>
                      </span>
                      <span className="actions">
                        <label className="toggle">
                          <input
                            type="checkbox"
                            checked={newOnly}
                            onChange={(e) => {
                              setOffset(0)
                              setNewOnly(e.target.checked)
                            }}
                          />
                          신규만
                        </label>
                        <ExportButtons path={`/bots/${b.id}/latest/export`} name={b.name} newOnly={newOnly} />
                      </span>
                    </div>
                    <DataTable columns={items.data.columns} rows={items.data.items} showNew />
                    <Pager offset={offset} limit={PAGE} total={items.data.total} onChange={setOffset} />
                  </>
                ) : (
                  <Empty title="아직 수집한 데이터가 없습니다">‘지금 실행’을 누르면 수집을 시작합니다.</Empty>
                )}
              </Loading>
            </section>
          )}
          {tab === 'runs' && (
            <section className="card">
              <Loading state={runs}>{runs.data?.runs.length ? <RunRows runs={runs.data.runs} showBot={false} /> : <Empty title="실행 이력이 없습니다" />}</Loading>
            </section>
          )}
        </>
      )}
    </Loading>
  )
}
