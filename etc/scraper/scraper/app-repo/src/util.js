// 화면 공통 계산 (표시 형식, 주소 해석). 순수 함수만 둔다 → util.test.js

export function parseRoute(hash) {
  const [path, query = ''] = (hash || '').replace(/^#/, '').split('?')
  const parts = path.split('/').filter(Boolean)
  return { parts, query: Object.fromEntries(new URLSearchParams(query)) }
}

const pad = (n) => String(n).padStart(2, '0')

export function fmtTime(iso) {
  if (!iso) return '-'
  const d = new Date(iso)
  return `${d.getMonth() + 1}/${d.getDate()} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function fmtDuration(seconds) {
  if (seconds == null) return '-'
  if (seconds < 60) return `${seconds}초`
  const m = Math.floor(seconds / 60)
  return m < 60 ? `${m}분 ${seconds % 60}초` : `${Math.floor(m / 60)}시간 ${m % 60}분`
}

export const fmtNumber = (n) => (n ?? 0).toLocaleString('ko-KR')

export function scheduleLabel(type, value) {
  if (type === 'interval') {
    const m = Number(value)
    return m % 1440 === 0 ? `${m / 1440}일마다` : m % 60 === 0 ? `${m / 60}시간마다` : `${m}분마다`
  }
  if (type === 'daily') return `매일 ${value}`
  if (type === 'cron') return `cron ${value}`
  return '예약 없음'
}

export const STATUS = {
  queued: '대기',
  running: '수집 중',
  success: '성공',
  failed: '실패',
  canceled: '취소',
}
export const isActive = (run) => run && (run.status === 'queued' || run.status === 'running')

export const TRIGGER = { manual: '직접 실행', schedule: '예약', api: 'API' }

// 표에 보여 줄 값: 목록은 ' | ' 로 잇고, 너무 길면 줄인다
export function cellText(value, max = 160) {
  if (value == null) return ''
  const text = Array.isArray(value) ? value.join(' | ') : typeof value === 'object' ? JSON.stringify(value) : String(value)
  return text.length > max ? `${text.slice(0, max)}…` : text
}

export const isUrl = (value) => typeof value === 'string' && /^https?:\/\//.test(value)

export function emptyField() {
  return { name: '', selector: '', type: 'text', attr: '', regex: '', required: false, multiple: false }
}

export function emptyBot() {
  return {
    name: '',
    description: '',
    schedule_type: 'none',
    schedule_value: '',
    webhook_url: '',
    config: {
      start_urls: [''],
      render: 'http',
      wait_for: '',
      wait_ms: 0,
      scroll: 0,
      item_selector: '',
      fields: [emptyField()],
      pagination: { type: 'none', next_selector: '', template: '', start: 1, end: 5, step: 1 },
      detail: { enabled: false, link_field: '', fields: [] },
      limits: { max_pages: 10, max_items: 1000, delay_ms: 1000 },
      key_fields: [],
      skip_known: false,
      respect_robots: true,
      headers: {},
      user_agent: '',
    },
  }
}

// 저장·미리보기 전에 빈 줄을 정리한 설정
export function cleanConfig(config) {
  const fields = (list) => list.filter((f) => f.name.trim()).map((f) => ({ ...f, name: f.name.trim() }))
  const main = fields(config.fields)
  const detailFields = fields(config.detail.fields)
  const names = new Set([...main, ...detailFields].map((f) => f.name))
  return {
    ...config,
    start_urls: config.start_urls.map((u) => u.trim()).filter(Boolean),
    fields: main,
    detail: { ...config.detail, fields: detailFields },
    key_fields: config.key_fields.filter((k) => names.has(k)),
  }
}
