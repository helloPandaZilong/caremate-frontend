import { createContext, useContext, useState, useCallback, useEffect } from 'react'

const TOKEN_KEY = 'caremate_access_token'
const LEGACY_TOKEN_KEYS = ['accessToken', 'caremate-access-token', 'caremate.accessToken', 'token']
const USER_KEY  = 'caremate_user'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  // 페이지 새로고침 후에도 로그인 상태 유지: localStorage에서 초기값 로드
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem(TOKEN_KEY) || localStorage.getItem('accessToken'))
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem(USER_KEY)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })

  // 로그인 성공 시 호출 — 토큰과 사용자 정보를 메모리 + localStorage에 저장
  const saveAuth = useCallback((token, userInfo) => {
    localStorage.setItem(TOKEN_KEY, token)
    LEGACY_TOKEN_KEYS.forEach((key) => localStorage.removeItem(key))
    localStorage.setItem(USER_KEY, JSON.stringify(userInfo))
    setAccessToken(token)
    setUser(userInfo)
  }, [])

  // 사용자 정보 부분 갱신 — 예: 소셜 가입자가 온보딩에서 전화번호를 입력한 뒤 user.phoneNumber 반영
  const updateUser = useCallback((partial) => {
    setUser((prev) => {
      if (!prev) return prev
      const next = { ...prev, ...partial }
      localStorage.setItem(USER_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  // 로그아웃 또는 세션 만료 시 호출 — 인증 정보 전체 초기화
  const clearAuth = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    LEGACY_TOKEN_KEYS.forEach((key) => localStorage.removeItem(key))
    localStorage.removeItem(USER_KEY)
    setAccessToken(null)
    setUser(null)
  }, [])

  // axios 인터셉터에서 Refresh Token 갱신 실패 시 발생하는 전역 이벤트를 수신해 자동 로그아웃
  useEffect(() => {
    const handler = () => clearAuth()
    window.addEventListener('caremate-auth-error', handler)
    return () => window.removeEventListener('caremate-auth-error', handler)
  }, [clearAuth])

  return (
    <AuthContext.Provider value={{
      accessToken,
      user,                       // { memberId, role, name, email, phoneNumber }
      isAuthenticated: !!accessToken,
      saveAuth,
      updateUser,
      clearAuth,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

// 인증 상태를 읽는 커스텀 훅 — AuthProvider 외부에서 사용하면 에러
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth는 AuthProvider 내부에서만 사용 가능합니다.')
  return ctx
}
