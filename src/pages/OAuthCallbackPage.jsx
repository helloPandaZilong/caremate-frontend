import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { Shield, Loader2 } from 'lucide-react'
import { googleCallback } from '../api/auth'
import { useAuth } from '../contexts/AuthContext'

/**
 * Google OAuth2 콜백 페이지 (/auth/callback).
 *
 * Google 인증 완료 후 리다이렉트되는 페이지로, URL 파라미터에서
 * 인가 코드(code)와 CSRF 검증용 state를 읽어 백엔드에 토큰 교환을 요청한다.
 *
 * 처리 흐름:
 *   1. URL 파라미터에서 code, state, error 추출
 *   2. error 파라미터가 있으면 (사용자가 Google 동의 거부) /auth로 이동
 *   3. sessionStorage의 state와 URL state 비교 (CSRF 방지)
 *   4. 백엔드 POST /api/auth/oauth2/google/callback 호출
 *   5. 성공 시 인증 정보 저장 → 역할별 대시보드 이동
 *   6. 실패 시 에러 토스트 → /auth 이동
 */

// 역할별 기본 이동 경로 — AuthPage.jsx의 ROLE_REDIRECT와 동일하게 유지
const ROLE_REDIRECT = {
  CUSTOMER:    '/customer/dashboard',
  REPAIR_SHOP: '/shop/dashboard',
  ADMIN:       '/admin/dashboard',
}

// sessionStorage 키 — AuthPage.jsx의 handleGoogleLogin과 반드시 일치해야 함
const OAUTH2_STATE_KEY = 'oauth2State'

export default function OAuthCallbackPage() {
  const nav          = useNavigate()
  const { saveAuth } = useAuth()

  // React StrictMode에서 useEffect가 두 번 실행되어 인가 코드가 소진되는 것을 방지
  const processed = useRef(false)

  useEffect(() => {
    if (processed.current) return
    processed.current = true

    const params = new URLSearchParams(window.location.search)
    const code   = params.get('code')
    const state  = params.get('state')
    const error  = params.get('error')

    // Google 동의 화면에서 사용자가 취소한 경우
    if (error) {
      toast.error('Google 로그인이 취소되었습니다.')
      nav('/auth', { replace: true })
      return
    }

    // code가 없으면 잘못된 접근
    if (!code) {
      toast.error('유효하지 않은 Google 로그인 요청입니다.')
      nav('/auth', { replace: true })
      return
    }

    // ── CSRF 검증 ────────────────────────────────────────────────────────────
    // AuthPage에서 저장한 state와 Google이 반환한 state가 일치해야 정상 흐름이다.
    // 불일치 시 제3자가 만든 악의적인 리다이렉트일 수 있으므로 처리 중단.
    const savedState = sessionStorage.getItem(OAUTH2_STATE_KEY)
    sessionStorage.removeItem(OAUTH2_STATE_KEY) // 1회용 — 즉시 제거

    if (!savedState || savedState !== state) {
      toast.error('보안 검증에 실패했습니다. 다시 로그인해주세요.')
      nav('/auth', { replace: true })
      return
    }

    // ── 백엔드 토큰 교환 ──────────────────────────────────────────────────────
    // redirectUri는 Google에 등록된 값과 정확히 일치해야 한다
    // state도 함께 전달 — 백엔드가 Redis 저장값과 대조 후 1회 소비한다(서버 측 CSRF 검증)
    const redirectUri = `${window.location.origin}/auth/callback`

    googleCallback(code, redirectUri, state)
      .then((res) => {
        const { accessToken, memberId, role, name, email, phoneNumber } = res.data.data

        // 인증 정보를 localStorage + Context에 저장 (일반 로그인과 동일)
        // 소셜 가입자는 phoneNumber가 빈 값 → 대시보드 진입 시 AppShell이 온보딩 모달을 띄운다
        saveAuth(accessToken, { memberId, role, name, email, phoneNumber })
        toast.success(`${name}님, 환영합니다!`)

        // 역할별 대시보드로 이동 (ProtectedRoute 역할 검증과 일치)
        nav(ROLE_REDIRECT[role] ?? '/customer/dashboard', { replace: true })
      })
      .catch((err) => {
        const code = err.response?.data?.error?.code
        if (code === 'SOCIAL_LOGIN_FAILED') {
          toast.error('Google 로그인에 실패했습니다. 다시 시도해주세요.')
        } else if (code === 'SHOP_NOT_APPROVED') {
          toast.error('수리점 가입 승인 대기 중입니다. 관리자 승인 후 이용 가능합니다.')
        } else if (code === 'MEMBER_BLOCKED') {
          toast.error('차단된 계정입니다! 관리자측으로 문의하세요.')
        } else {
          toast.error('Google 로그인 처리 중 오류가 발생했습니다.')
        }
        nav('/auth', { replace: true })
      })
  }, []) // 마운트 시 1회만 실행

  // ── 로딩 UI (Google → 콜백 → 대시보드 전환 중) ──────────────────────────────
  return (
    <div
      className="min-h-screen bg-background flex flex-col items-center justify-center gap-6"
      style={{ fontFamily: "'Noto Sans KR', 'DM Sans', sans-serif" }}
    >
      {/* CareMate 로고 */}
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <span
          className="text-xl font-semibold text-foreground tracking-tight"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          Care<span className="text-accent">Mate</span>
        </span>
      </div>

      {/* 로딩 스피너 */}
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
        <p className="text-sm text-muted-foreground">Google 계정으로 로그인하는 중...</p>
      </div>
    </div>
  )
}
