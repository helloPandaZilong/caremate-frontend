import axios from 'axios'

const TOKEN_KEY = 'caremate_access_token'

// ── 기본 API 클라이언트 ────────────────────────────────────────────────────────
const apiClient = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // httpOnly Refresh Token 쿠키 자동 전송
})

// 토큰 갱신 전용 클라이언트 — 기본 클라이언트의 인터셉터를 재진입하지 않도록 분리
const refreshClient = axios.create({
  baseURL: '/api',
  timeout: 10000,
  withCredentials: true,
})

// 동시 요청이 여러 개일 때 갱신을 한 번만 수행하기 위한 플래그와 대기 큐
let isRefreshing  = false
let pendingQueue  = [] // 갱신 완료를 기다리는 원본 요청 콜백 목록

/** 갱신 완료 시 대기 중인 요청들에 새 토큰을 전달하고 큐를 비움 */
function flushQueue(newToken) {
  pendingQueue.forEach((cb) => cb(newToken))
  pendingQueue = []
}

// ── 요청 인터셉터: Authorization 헤더 자동 주입 ───────────────────────────────
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ── 응답 인터셉터: 401 발생 시 Refresh Token으로 자동 갱신 후 재시도 ───────────
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config

    // 갱신 요청 자체가 401이면 세션 완전 만료 → 전역 로그아웃 이벤트 발생
    if (original.url?.includes('/auth/refresh')) {
      window.dispatchEvent(new Event('caremate-auth-error'))
      return Promise.reject(error)
    }

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true // 무한 재시도 방지

      // 이미 갱신 중이면 큐에 등록 후 갱신 완료까지 대기
      if (isRefreshing) {
        return new Promise((resolve) => {
          pendingQueue.push((token) => {
            original.headers.Authorization = `Bearer ${token}`
            resolve(apiClient(original))
          })
        })
      }

      isRefreshing = true
      try {
        const res = await refreshClient.post('/auth/refresh')
        const newToken = res.data.data.accessToken
        localStorage.setItem(TOKEN_KEY, newToken)
        flushQueue(newToken)
        original.headers.Authorization = `Bearer ${newToken}`
        return apiClient(original)
      } catch (refreshError) {
        pendingQueue = []
        window.dispatchEvent(new Event('caremate-auth-error'))
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default apiClient
