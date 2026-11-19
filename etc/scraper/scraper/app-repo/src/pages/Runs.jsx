import { useState } from 'react'
import { api } from '../api.js'
import { Badge, DataTable, Empty, ErrorBox, ExportButtons, Loading, Pager, useLoad, usePoll } from '../ui.jsx'
import { STATUS, TRIGGER, fmtDuration, fmtNumber, fmtTime, isActive } from '../util.js'
import { RunRows } from './Dashboard.jsx'

const PAGE = 50

export function Runs() {
  const [status, setStatus] = useState('')
  const [offset, setOffset] = useState(0)
  const state = useLoad(() => api(`/runs?limit=${PAGE}&offset=${offset}${status ? `&status=${status}` : ''}`), [status, offset])
  usePoll(state.reload, (state.data?.runs || []).some(isActive))

  return (
    <>
      <header className="head">
        <h1>실행 이력</h1>
        <select
          value={status}
          aria-label="상태로 걸러 보기"
          onChange={(e) => {
            setOffset(0)
            setStatus(e.target.value)
          }}
        >
          <option value="">모든 상태</option>
          {Object.entries(STATUS).map(([v, label]) => (
            <option key={v} value={v}>
              {label}
            </option>
          ))}
        </select>
      </header>
      <section className="card">
        <Loading state={state}>
          {state.data?.runs.length ? (
            <>
              <RunRows runs={state.data.runs} />
              <Pager offset={offset} limit={PAGE} total={state.data.total} onChange={setOffset} />
            </>
          ) : (
            <Empty title="실행 이력이 없습니다" />
          )}
        </Loading>
      </section>
    </>
  )
}

export function RunDetail({ runId }) {
  const [offset, setOffset] = useState(0)
  const [newOnly, setNewOnly] = useState(false)
  const [error, setError] = useState('')
  const run = useLoad(() => api(`/runs/${runId}`))
  const items = useLoad(() => api(`/runs/${runId}/items?offset=${offset}&limit=${PAGE}&new_only=${newOnly}`), [offset, newOnly])
  const r = run.data
  usePoll(() => {
    run.reload()
    items.reload()
  }, isActive(r))

  const cancel = async () => {
    setError('')
    try {
      await api(`/runs/${runId}/cancel`, { method: 'POST' })
      run.reload()
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <Loading state={run}>
      {r && (
        <>
          <header className="head">
            <div>
              <a className="back" href={`#/bots/${r.bot_id}`}>
                ← {r.bot_name}
              </a>
              <h1>
                실행 #{r.id} <Badge status={r.status} />
              </h1>
            </div>
            {isActive(r) && (
              <button disabled={r.cancel_requested} onClick={cancel}>
                {r.cancel_requested ? '취소하는 중…' : '실행 취소'}
              </button>
            )}
          </header>
          <ErrorBox>{error || (r.status === 'failed' ? r.error : '')}</ErrorBox>

          <dl className="facts card">
            <div>
              <dt>시작</dt>
              <dd>{fmtTime(r.started_at || r.created_at)}</dd>
            </div>
            <div>
              <dt>걸린 시간</dt>
              <dd>{fmtDuration(r.seconds)}</dd>
            </div>
            <div>
              <dt>페이지</dt>
              <dd>{r.pages}</dd>
            </div>
            <div>
              <dt>수집</dt>
              <dd>
                {fmtNumber(r.item_count)}건 <small>· 신규 {fmtNumber(r.new_count)}건</small>
              </dd>
            </div>
            <div>
              <dt>실행 방법</dt>
              <dd>
                {TRIGGER[r.trigger] || r.trigger}
                {r.requested_by && r.trigger !== 'schedule' ? ` · ${r.requested_by}` : ''}
              </dd>
            </div>
          </dl>

          <section className="card">
            <div className="card-head">
              <h2>데이터</h2>
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
                {r.item_count > 0 && <ExportButtons path={`/runs/${r.id}/export`} name={`${r.bot_name}_${r.id}`} newOnly={newOnly} />}
              </span>
            </div>
            <Loading state={items}>
              {items.data && (
                <>
                  <DataTable columns={items.data.columns} rows={items.data.items} showNew />
                  <Pager offset={offset} limit={PAGE} total={items.data.total} onChange={setOffset} />
                </>
              )}
            </Loading>
          </section>

          <section className="card">
            <h2>로그</h2>
            <pre className="log">{r.log || '(아직 없음)'}</pre>
          </section>
        </>
      )}
    </Loading>
  )
}
