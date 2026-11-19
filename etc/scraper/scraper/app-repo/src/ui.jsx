// 여러 화면이 같이 쓰는 작은 부품
import { useCallback, useEffect, useRef, useState } from 'react'
import { download } from './api.js'
import { STATUS, cellText, isUrl } from './util.js'

export const go = (path) => {
  window.location.hash = path
}

// 화면이 열릴 때(그리고 deps 가 바뀔 때) 불러오기. reload() 로 다시 불러온다
export function useLoad(loader, deps = []) {
  const [state, setState] = useState({ data: null, error: '', loading: true })
  const ref = useRef(loader)
  ref.current = loader
  const reload = useCallback(async () => {
    try {
      const data = await ref.current()
      setState({ data, error: '', loading: false })
    } catch (e) {
      setState((s) => ({ ...s, error: e.message, loading: false }))
    }
  }, [])
  useEffect(() => {
    reload()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
  return { ...state, reload }
}

// active 인 동안 ms 마다 fn 호출 (수집 중인 실행의 진행 상황)
export function usePoll(fn, active, ms = 2500) {
  const ref = useRef(fn)
  ref.current = fn
  useEffect(() => {
    if (!active) return undefined
    const id = setInterval(() => ref.current(), ms)
    return () => clearInterval(id)
  }, [active, ms])
}

export function Badge({ status }) {
  return <span className={`badge ${status}`}>{STATUS[status] || status}</span>
}

export function ErrorBox({ children }) {
  return children ? (
    <div className="error" role="alert">
      {children}
    </div>
  ) : null
}

export function Loading({ state, children }) {
  if (state.loading && !state.data) return <p className="muted">불러오는 중…</p>
  if (state.error && !state.data) return <ErrorBox>{state.error}</ErrorBox>
  return children
}

export function Empty({ title, children }) {
  return (
    <div className="empty">
      <strong>{title}</strong>
      {children && <p>{children}</p>}
    </div>
  )
}

function Cell({ value }) {
  if (isUrl(value)) {
    return (
      <a href={value} target="_blank" rel="noreferrer noopener">
        {cellText(value, 60)}
      </a>
    )
  }
  return cellText(value)
}

// 수집 결과 표. rows: [{seq, is_new, data}] 또는 미리보기의 [{...data}]
export function DataTable({ columns, rows, showNew = false }) {
  if (!rows.length) return <Empty title="데이터가 없습니다" />
  return (
    <div className="table-wrap">
      <table className="data">
        <thead>
          <tr>
            <th className="num">#</th>
            {columns.map((c) => (
              <th key={c}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const data = row.data || row
            return (
              <tr key={row.seq ?? i}>
                <td className="num">
                  {row.seq ?? i + 1}
                  {showNew && row.is_new && <span className="new">신규</span>}
                </td>
                {columns.map((c) => (
                  <td key={c} title={typeof data[c] === 'string' ? data[c] : undefined}>
                    <Cell value={data[c]} />
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export function Pager({ offset, limit, total, onChange }) {
  if (total <= limit) return null
  return (
    <div className="pager">
      <button disabled={offset === 0} onClick={() => onChange(Math.max(0, offset - limit))}>
        이전
      </button>
      <span>
        {offset + 1}–{Math.min(offset + limit, total)} / {total.toLocaleString('ko-KR')}
      </span>
      <button disabled={offset + limit >= total} onClick={() => onChange(offset + limit)}>
        다음
      </button>
    </div>
  )
}

export function ExportButtons({ path, name, newOnly = false }) {
  const [error, setError] = useState('')
  const save = async (fmt) => {
    setError('')
    try {
      await download(`${path}?format=${fmt}${newOnly ? '&new_only=true' : ''}`, `${name}.${fmt}`)
    } catch (e) {
      setError(e.message)
    }
  }
  return (
    <span className="exports">
      <button onClick={() => save('xlsx')}>Excel</button>
      <button onClick={() => save('csv')}>CSV</button>
      <button onClick={() => save('json')}>JSON</button>
      {error && <span className="inline-error">{error}</span>}
    </span>
  )
}
