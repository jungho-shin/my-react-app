// 런타임 설정: 컨테이너 시작 시 환경변수로 만들어지는 config.json (이미지 하나로 dev/prod 공용)
// BASE_URL = vite.config.js 의 base ('/scraper/')
export async function loadConfig() {
  const res = await fetch(`${import.meta.env.BASE_URL}config.json`, { cache: 'no-store' })
  if (!res.ok) throw new Error(`config.json HTTP ${res.status}`)
  return res.json()
}

// 같은 환경(같은 입구)의 scraper-api. dev 화면이면 dev API, prod 화면이면 prod API 를 부름
export const API = '/scraper-api/api'
const TOKEN_KEY = 'scraper.token'

export const auth = {
  get token() {
    try {
      return localStorage.getItem(TOKEN_KEY)
    } catch {
      return null
    }
  },
  set token(value) {
    try {
      if (value) localStorage.setItem(TOKEN_KEY, value)
      else localStorage.removeItem(TOKEN_KEY)
    } catch {
      /* 저장소를 쓸 수 없는 브라우저 - 새로고침 시 다시 로그인 */
    }
  },
}

export class ApiError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

function errorMessage(data, status) {
  const detail = data?.detail
  if (Array.isArray(detail)) return detail.map((d) => String(d.msg).replace(/^Value error, /, '')).join(' / ')
  return detail || `요청 실패 (HTTP ${status})`
}

export async function api(path, { method = 'GET', body } = {}) {
  const headers = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (auth.token) headers.Authorization = `Bearer ${auth.token}`
  let res
  try {
    res = await fetch(`${API}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: 'no-store',
    })
  } catch {
    throw new ApiError(0, '서버에 연결할 수 없습니다')
  }
  const data = await res.json().catch(() => null)
  if (!res.ok) {
    if (res.status === 401 && auth.token) {
      auth.token = null
      window.dispatchEvent(new Event('scraper:logout'))
    }
    throw new ApiError(res.status, errorMessage(data, res.status))
  }
  return data
}

// 인증이 필요한 파일 내려받기 (Excel / CSV / JSON)
export async function download(path, filename) {
  const res = await fetch(`${API}${path}`, { headers: { Authorization: `Bearer ${auth.token}` }, cache: 'no-store' })
  if (!res.ok) throw new ApiError(res.status, errorMessage(await res.json().catch(() => null), res.status))
  const url = URL.createObjectURL(await res.blob())
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
