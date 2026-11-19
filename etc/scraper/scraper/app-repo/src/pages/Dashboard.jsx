import { api } from '../api.js'
import { Badge, Empty, Loading, useLoad, usePoll } from '../ui.jsx'
import { TRIGGER, fmtDuration, fmtNumber, fmtTime, scheduleLabel } from '../util.js'

function Stat({ label, value, note, warn }) {
  return (
    <div className={`stat${warn ? ' warn' : ''}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      {note && <small>{note}</small>}
    </div>
  )
}

export function RunRows({ runs, showBot = true }) {
  return (
    <div className="table-wrap">
      <table className="list">
        <thead>
          <tr>
            <th>상태</th>
            {showBot && <th>봇</th>}
            <th>시작</th>
            <th>걸린 시간</th>
            <th className="right">페이지</th>
            <th className="right">수집</th>
            <th className="right">신규</th>
            <th>실행 방법</th>
          </tr>
        </thead>
        <tbody>
          {runs.map((r) => (
            <tr key={r.id} className="click" onClick={() => (window.location.hash = `/runs/${r.id}`)}>
              <td>
                <Badge status={r.status} />
              </td>
              {showBot && <td>{r.bot_name}</td>}
              <td>{fmtTime(r.started_at || r.created_at)}</td>
              <td>{fmtDuration(r.seconds)}</td>
              <td className="right">{r.pages}</td>
              <td className="right">{fmtNumber(r.item_count)}</td>
              <td className="right">{fmtNumber(r.new_count)}</td>
              <td>
                {TRIGGER[r.trigger] || r.trigger}
                {r.trigger !== 'schedule' && r.requested_by ? ` · ${r.requested_by}` : ''}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function Dashboard() {
  const state = useLoad(() => api('/dashboard'))
  usePoll(state.reload, true, 10000)
  const d = state.data

  return (
    <>
      <header className="head">
        <h1>대시보드</h1>
        <a className="button primary" href="#/bots/new">
          새 수집 봇
        </a>
      </header>
      <Loading state={state}>
        {d && (
          <>
            <div className="stats">
              <Stat label="수집 봇" value={fmtNumber(d.bots)} note={`예약 ${d.scheduled}개`} />
              <Stat label="지금 진행 중" value={fmtNumber(d.active)} note="대기 + 수집 중" />
              <Stat label="최근 24시간 실행" value={fmtNumber(d.runs_24h)} note={`실패 ${d.failed_24h}건`} warn={d.failed_24h > 0} />
              <Stat label="최근 24시간 수집" value={fmtNumber(d.items_24h)} note={`신규 ${fmtNumber(d.new_24h)}건`} />
            </div>

            <div className="cols">
              <section className="card grow">
                <h2>최근 실행</h2>
                {d.recent.length ? (
                  <RunRows runs={d.recent} />
                ) : (
                  <Empty title="아직 실행한 적이 없습니다">봇을 만들고 ‘지금 실행’을 눌러 보세요.</Empty>
                )}
              </section>
              <div className="stack">
                <section className="card">
                  <h2>다가오는 예약</h2>
                  {d.upcoming.length ? (
                    <ul className="plain">
                      {d.upcoming.map((b) => (
                        <li key={b.id}>
                          <a href={`#/bots/${b.id}`}>{b.name}</a>
                          <small>
                            {fmtTime(b.next_run_at)} · {scheduleLabel(b.schedule_type, b.schedule_value)}
                          </small>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="muted">예약된 봇이 없습니다.</p>
                  )}
                </section>
                <section className="card">
                  <h2>최근 7일</h2>
                  <table className="list compact">
                    <thead>
                      <tr>
                        <th>날짜</th>
                        <th className="right">실행</th>
                        <th className="right">실패</th>
                        <th className="right">수집</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...d.days].reverse().map((day) => (
                        <tr key={day.date}>
                          <td>{day.date.slice(5)}</td>
                          <td className="right">{day.runs}</td>
                          <td className={`right${day.failed ? ' bad' : ''}`}>{day.failed}</td>
                          <td className="right">{fmtNumber(day.items)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </section>
              </div>
            </div>
          </>
        )}
      </Loading>
    </>
  )
}
