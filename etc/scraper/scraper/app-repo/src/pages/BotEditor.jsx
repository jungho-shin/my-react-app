import { useEffect, useState } from 'react'
import { api } from '../api.js'
import { DataTable, ErrorBox, go } from '../ui.jsx'
import { cleanConfig, emptyBot, emptyField } from '../util.js'

const TYPES = [
  ['text', '글자'],
  ['number', '숫자'],
  ['link', '링크 주소'],
  ['image', '이미지 주소'],
  ['attr', '속성 값'],
  ['html', 'HTML'],
  ['page_url', '현재 페이지 주소'],
]

function FieldRows({ fields, onChange, hint }) {
  const set = (i, patch) => onChange(fields.map((f, n) => (n === i ? { ...f, ...patch } : f)))
  return (
    <div className="fields">
      <div className="field-row head">
        <span>이름 (열 제목)</span>
        <span>선택자</span>
        <span>가져올 값</span>
        <span>정규식 (선택)</span>
        <span>옵션</span>
        <span />
      </div>
      {fields.map((f, i) => (
        <div className="field-row" key={i}>
          <input value={f.name} placeholder="예: 상품명" onChange={(e) => set(i, { name: e.target.value })} />
          <input
            className="mono"
            value={f.selector}
            placeholder={f.type === 'page_url' ? '(필요 없음)' : '예: h3 a'}
            disabled={f.type === 'page_url'}
            onChange={(e) => set(i, { selector: e.target.value })}
          />
          <span className="pair">
            <select value={f.type} onChange={(e) => set(i, { type: e.target.value })}>
              {TYPES.map(([v, label]) => (
                <option key={v} value={v}>
                  {label}
                </option>
              ))}
            </select>
            {f.type === 'attr' && (
              <input className="mono" value={f.attr} placeholder="속성 (예: title)" onChange={(e) => set(i, { attr: e.target.value })} />
            )}
          </span>
          <input className="mono" value={f.regex} placeholder="예: (\d+)개" onChange={(e) => set(i, { regex: e.target.value })} />
          <span className="checks">
            <label title="이 값이 없는 항목은 버립니다">
              <input type="checkbox" checked={f.required} onChange={(e) => set(i, { required: e.target.checked })} />
              필수
            </label>
            <label title="일치하는 모든 값을 목록으로 가져옵니다">
              <input type="checkbox" checked={f.multiple} onChange={(e) => set(i, { multiple: e.target.checked })} />
              여러 값
            </label>
          </span>
          <button className="icon" title="필드 삭제" onClick={() => onChange(fields.filter((_, n) => n !== i))}>
            ×
          </button>
        </div>
      ))}
      <button onClick={() => onChange([...fields, emptyField()])}>+ 필드 추가</button>
      {hint && <p className="hint">{hint}</p>}
    </div>
  )
}

export default function BotEditor({ botId, template, ctx }) {
  const [bot, setBot] = useState(null)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [preview, setPreview] = useState(null)
  const [previewing, setPreviewing] = useState(false)
  const [detect, setDetect] = useState(null)
  const [detecting, setDetecting] = useState(false)
  const info = ctx.info

  useEffect(() => {
    const load = async () => {
      if (botId) {
        const b = await api(`/bots/${botId}`)
        return { ...emptyBot(), ...b, config: { ...emptyBot().config, ...b.config } }
      }
      const fresh = emptyBot()
      if (template) {
        const t = (await api('/templates')).find((x) => x.id === template)
        if (t) return { ...fresh, name: t.name, description: t.description, config: { ...fresh.config, ...t.config } }
      }
      return fresh
    }
    load()
      .then((b) => setBot({ ...b, config: { ...b.config, start_urls: b.config.start_urls.length ? b.config.start_urls : [''] } }))
      .catch((e) => setError(e.message))
  }, [botId, template])

  if (!bot) return error ? <ErrorBox>{error}</ErrorBox> : <p className="muted">불러오는 중…</p>

  const cfg = bot.config
  const set = (patch) => setBot((b) => ({ ...b, ...patch }))
  const setCfg = (patch) => setBot((b) => ({ ...b, config: { ...b.config, ...patch } }))
  const setIn = (key, patch) => setCfg({ [key]: { ...cfg[key], ...patch } })
  const num = (v) => (v === '' ? '' : Number(v))
  const allNames = [...cfg.fields, ...(cfg.detail.enabled ? cfg.detail.fields : [])].map((f) => f.name.trim()).filter(Boolean)
  const firstUrl = cfg.pagination.type === 'template' ? cfg.pagination.template.replace('{page}', cfg.pagination.start) : cfg.start_urls[0]

  const runPreview = async () => {
    setPreviewing(true)
    setError('')
    try {
      setPreview(await api('/preview', { method: 'POST', body: cleanConfig(cfg) }))
    } catch (e) {
      setPreview(null)
      setError(e.message)
    } finally {
      setPreviewing(false)
    }
  }

  const runDetect = async () => {
    setDetecting(true)
    setError('')
    try {
      setDetect(await api('/detect', { method: 'POST', body: { url: (firstUrl || '').trim(), render: cfg.render, wait_for: cfg.wait_for } }))
    } catch (e) {
      setDetect(null)
      setError(e.message)
    } finally {
      setDetecting(false)
    }
  }

  const applyCandidate = (c) => {
    setCfg({ item_selector: c.item_selector, fields: c.fields.map((f) => ({ ...emptyField(), ...f })) })
    setDetect(null)
    setPreview(null)
  }

  const save = async () => {
    setSaving(true)
    setError('')
    try {
      const body = {
        name: bot.name,
        description: bot.description,
        config: cleanConfig(cfg),
        schedule_type: bot.schedule_type,
        schedule_value: String(bot.schedule_value ?? ''),
        webhook_url: bot.webhook_url,
      }
      const saved = botId ? await api(`/bots/${botId}`, { method: 'PUT', body }) : await api('/bots', { method: 'POST', body })
      go(`/bots/${saved.id}`)
    } catch (e) {
      setError(e.message)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <header className="head">
        <h1>{botId ? '봇 수정' : '새 수집 봇'}</h1>
        <span className="actions">
          <a className="button" href={botId ? `#/bots/${botId}` : '#/bots'}>
            취소
          </a>
          <button className="primary" disabled={saving} onClick={save}>
            {saving ? '저장 중…' : '저장'}
          </button>
        </span>
      </header>
      <ErrorBox>{error}</ErrorBox>

      <section className="card form">
        <h2>1. 기본 정보</h2>
        <label>
          봇 이름
          <input value={bot.name} maxLength={80} placeholder="예: 경쟁사 A 상품 가격" onChange={(e) => set({ name: e.target.value })} />
        </label>
        <label>
          설명 <small>선택</small>
          <input value={bot.description} maxLength={500} onChange={(e) => set({ description: e.target.value })} />
        </label>
      </section>

      <section className="card form">
        <h2>2. 수집할 페이지</h2>
        {cfg.pagination.type !== 'template' && (
          <label>
            시작 주소 <small>한 줄에 하나씩, 여러 개 가능</small>
            <textarea
              className="mono"
              rows={Math.min(Math.max(cfg.start_urls.length, 2), 8)}
              value={cfg.start_urls.join('\n')}
              placeholder="https://example.com/products"
              onChange={(e) => setCfg({ start_urls: e.target.value.split('\n') })}
            />
          </label>
        )}
        <div className="row">
          <label>
            가져오는 방식
            <select value={cfg.render} onChange={(e) => setCfg({ render: e.target.value })}>
              <option value="http">일반 (빠름) – HTML 을 그대로 읽기</option>
              <option value="browser" disabled={info.browser === false}>
                브라우저 렌더링 – JavaScript 로 그려지는 페이지
              </option>
            </select>
          </label>
          {cfg.render === 'browser' && (
            <>
              <label>
                이 요소가 보일 때까지 대기 <small>선택자, 선택</small>
                <input className="mono" value={cfg.wait_for} placeholder="예: .product-list" onChange={(e) => setCfg({ wait_for: e.target.value })} />
              </label>
              <label>
                아래로 스크롤 횟수 <small>더 불러오기 목록</small>
                <input type="number" min={0} max={20} value={cfg.scroll} onChange={(e) => setCfg({ scroll: num(e.target.value) })} />
              </label>
            </>
          )}
        </div>

        <h3>페이지 넘김</h3>
        <div className="row">
          <label>
            방식
            <select value={cfg.pagination.type} onChange={(e) => setIn('pagination', { type: e.target.value })}>
              <option value="none">없음 – 시작 주소만</option>
              <option value="next">‘다음’ 링크 따라가기</option>
              <option value="template">주소의 페이지 번호 바꾸기</option>
            </select>
          </label>
          {cfg.pagination.type === 'next' && (
            <label className="grow">
              ‘다음’ 링크 선택자
              <input className="mono" value={cfg.pagination.next_selector} placeholder="예: li.next a" onChange={(e) => setIn('pagination', { next_selector: e.target.value })} />
            </label>
          )}
          {cfg.pagination.type === 'template' && (
            <>
              <label className="grow">
                주소 형식 <small>번호 자리에 {'{page}'}</small>
                <input className="mono" value={cfg.pagination.template} placeholder="https://example.com/list?page={page}" onChange={(e) => setIn('pagination', { template: e.target.value })} />
              </label>
              <label className="narrow">
                시작
                <input type="number" min={0} value={cfg.pagination.start} onChange={(e) => setIn('pagination', { start: num(e.target.value) })} />
              </label>
              <label className="narrow">
                끝
                <input type="number" min={0} value={cfg.pagination.end} onChange={(e) => setIn('pagination', { end: num(e.target.value) })} />
              </label>
            </>
          )}
        </div>
      </section>

      <section className="card form">
        <div className="card-head">
          <h2>3. 가져올 데이터</h2>
          <button disabled={detecting || !firstUrl?.trim()} onClick={runDetect} title="페이지에서 반복되는 묶음을 찾아 선택자를 제안합니다">
            {detecting ? '찾는 중…' : '자동 감지'}
          </button>
        </div>
        {detect && (
          <div className="detect">
            {detect.candidates.length ? (
              <>
                <p className="hint">반복되는 묶음 {detect.candidates.length}개를 찾았습니다. 원하는 데이터가 보이는 것을 고르세요.</p>
                {detect.candidates.map((c) => (
                  <div className="candidate" key={c.item_selector}>
                    <div className="candidate-head">
                      <code>{c.item_selector}</code>
                      <span className="muted">{c.count}건</span>
                      <button className="primary" onClick={() => applyCandidate(c)}>
                        이 묶음 사용
                      </button>
                    </div>
                    <DataTable columns={c.fields.map((f) => f.name)} rows={c.sample.slice(0, 3)} />
                  </div>
                ))}
              </>
            ) : (
              <p className="hint">
                반복되는 묶음을 찾지 못했습니다. 화면에는 보이는데 못 찾는다면 ‘브라우저 렌더링’으로 바꿔 다시 시도하세요.
              </p>
            )}
            <button className="link" onClick={() => setDetect(null)}>
              닫기
            </button>
          </div>
        )}
        <label>
          목록 항목 선택자 <small>반복되는 한 건(상품 카드, 게시글 행)을 가리키는 CSS 선택자. 비우면 페이지 전체가 1건</small>
          <input className="mono" value={cfg.item_selector} placeholder="예: article.product_pod" onChange={(e) => setCfg({ item_selector: e.target.value })} />
        </label>
        <FieldRows
          fields={cfg.fields}
          onChange={(fields) => setCfg({ fields })}
          hint="선택자는 항목 안에서 찾습니다. CSS 가 기본이고 // 로 시작하면 XPath 로 해석합니다. 정규식은 괄호 안의 부분만 남깁니다."
        />

        <h3>
          <label className="toggle">
            <input type="checkbox" checked={cfg.detail.enabled} onChange={(e) => setIn('detail', { enabled: e.target.checked, fields: cfg.detail.fields.length ? cfg.detail.fields : [emptyField()] })} />
            상세 페이지에 들어가서 더 가져오기
          </label>
        </h3>
        {cfg.detail.enabled && (
          <>
            <label>
              상세 페이지 주소가 담긴 필드 <small>‘링크 주소’ 종류의 필드</small>
              <select value={cfg.detail.link_field} onChange={(e) => setIn('detail', { link_field: e.target.value })}>
                <option value="">선택…</option>
                {cfg.fields
                  .filter((f) => f.name.trim())
                  .map((f) => (
                    <option key={f.name} value={f.name.trim()}>
                      {f.name}
                    </option>
                  ))}
              </select>
            </label>
            <FieldRows fields={cfg.detail.fields} onChange={(fields) => setIn('detail', { fields })} hint="상세 페이지 전체에서 찾습니다. 항목 수만큼 요청이 늘어나므로 최대 건수를 작게 잡으세요." />
          </>
        )}

        <div className="preview">
          <div className="card-head">
            <h3>미리보기</h3>
            <button className="primary" disabled={previewing} onClick={runPreview}>
              {previewing ? '수집 중…' : '첫 페이지 수집해 보기'}
            </button>
          </div>
          {preview ? (
            <>
              <ErrorBox>{preview.error}</ErrorBox>
              {!preview.error && <DataTable columns={preview.columns} rows={preview.items} />}
              <pre className="log">{preview.log.join('\n')}</pre>
            </>
          ) : (
            <p className="hint">저장하기 전에 첫 페이지에서 최대 20건을 바로 수집해 확인합니다.</p>
          )}
        </div>
      </section>

      <section className="card form">
        <h2>4. 한도 · 예약 · 알림</h2>
        <div className="row">
          <label className="narrow">
            최대 페이지 <small>~{info.max_pages}</small>
            <input type="number" min={1} max={info.max_pages} value={cfg.limits.max_pages} onChange={(e) => setIn('limits', { max_pages: num(e.target.value) })} />
          </label>
          <label className="narrow">
            최대 건수 <small>~{info.max_items}</small>
            <input type="number" min={1} max={info.max_items} value={cfg.limits.max_items} onChange={(e) => setIn('limits', { max_items: num(e.target.value) })} />
          </label>
          <label className="narrow">
            요청 간격(ms) <small>{info.min_delay_ms}~</small>
            <input type="number" min={0} step={100} value={cfg.limits.delay_ms} onChange={(e) => setIn('limits', { delay_ms: num(e.target.value) })} />
          </label>
          <label className="toggle">
            <input type="checkbox" checked={cfg.respect_robots} onChange={(e) => setCfg({ respect_robots: e.target.checked })} />
            robots.txt 준수
          </label>
        </div>

        {allNames.length > 0 && (
          <div className="group">
            <span className="label">
              같은 데이터로 볼 기준 <small>고른 필드가 같으면 이전에 수집한 데이터로 보고, 처음 보는 것만 ‘신규’로 표시합니다. 고르지 않으면 모든 값이 같아야 같은 데이터</small>
            </span>
            <div className="chips">
              {allNames.map((name) => (
                <label key={name} className={cfg.key_fields.includes(name) ? 'chip on' : 'chip'}>
                  <input
                    type="checkbox"
                    checked={cfg.key_fields.includes(name)}
                    onChange={(e) => setCfg({ key_fields: e.target.checked ? [...cfg.key_fields, name] : cfg.key_fields.filter((k) => k !== name) })}
                  />
                  {name}
                </label>
              ))}
            </div>
            <label className="toggle">
              <input type="checkbox" checked={!!cfg.skip_known} onChange={(e) => setCfg({ skip_known: e.target.checked })} />
              이미 수집한 데이터는 다시 수집하지 않기 <small>위 기준으로 이전 실행에 있던 데이터는 저장하지 않습니다 (상세 페이지도 열지 않음). 최대 건수는 ‘살펴볼 건수’가 됩니다</small>
            </label>
          </div>
        )}

        <div className="row">
          <label>
            예약 실행
            <select value={bot.schedule_type} onChange={(e) => set({ schedule_type: e.target.value, schedule_value: { interval: '60', daily: '09:00', cron: '0 9 * * 1-5' }[e.target.value] || '' })}>
              <option value="none">예약 없음 – 직접 실행</option>
              <option value="interval">일정 간격으로</option>
              <option value="daily">매일 정해진 시각에</option>
              <option value="cron">cron 식으로</option>
            </select>
          </label>
          {bot.schedule_type === 'interval' && (
            <label className="narrow">
              간격(분) <small>5~</small>
              <input type="number" min={5} value={bot.schedule_value} onChange={(e) => set({ schedule_value: e.target.value })} />
            </label>
          )}
          {bot.schedule_type === 'daily' && (
            <label className="narrow">
              시각 <small>{info.tz}</small>
              <input type="time" value={bot.schedule_value} onChange={(e) => set({ schedule_value: e.target.value })} />
            </label>
          )}
          {bot.schedule_type === 'cron' && (
            <label>
              cron 식 <small>분 시 일 월 요일 · {info.tz}</small>
              <input className="mono" value={bot.schedule_value} placeholder="0 9 * * 1-5" onChange={(e) => set({ schedule_value: e.target.value })} />
            </label>
          )}
        </div>
        <label>
          Webhook 주소 <small>선택 – 실행이 끝날 때마다 결과를 JSON 으로 POST</small>
          <input className="mono" value={bot.webhook_url} placeholder="https://hooks.example.com/..." onChange={(e) => set({ webhook_url: e.target.value })} />
        </label>
      </section>

      <div className="foot-actions">
        <button className="primary" disabled={saving} onClick={save}>
          {saving ? '저장 중…' : '저장'}
        </button>
      </div>
    </>
  )
}
