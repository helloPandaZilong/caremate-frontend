import { Navigate, useLocation } from 'react-router'
import { useAuth } from '../contexts/AuthContext'

/**
 * 역할별 기본 대시보드 경로.
 * 로그인 후 또는 잘못된 역할 경로 접근 시 이 경로로 리다이렉트합니다.
 */
const ROLE_HOME = {
  CUSTOMER:    '/customer/dashboard',
  REPAIR_SHOP: '/shop/dashboard',
  ADMIN:       '/admin/dashboard',
}

/**
 * 역할별 URL 접두어.
 * 각 역할은 자신의 접두어로 시작하는 경로에만 접근할 수 있습니다.
 * 예) ADMIN은 /admin/** 경로만 접근 가능, /customer/**는 접근 불가.
 */
const ROLE_PREFIX = {
  CUSTOMER:    '/customer',
  REPAIR_SHOP: '/shop',
  ADMIN:       '/admin',
}

/**
 * 인증 및 역할 기반 라우트 가드.
 *
 * 검사 순서:
 * 1. 미인증 → /auth 로 리다이렉트 (현재 경로를 state.from에 저장해 로그인 후 복귀 가능)
 * 2. 역할 미확인 (토큰 있지만 user 정보 없음) → /auth 로 리다이렉트
 * 3. 역할 불일치 (예: ADMIN이 /customer 경로 접근) → 해당 역할 대시보드로 리다이렉트
 * 4. 정상 → children 렌더링
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, user } = useAuth()
  const location = useLocation()

  // 1. 미인증 → /auth 이동, 이전 경로 state에 저장
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace state={{ from: location }} />
  }

  // 2. 인증 토큰은 있지만 사용자 정보가 아직 없는 엣지 케이스
  if (!user?.role) {
    return <Navigate to="/auth" replace />
  }

  // 3. 현재 경로가 해당 역할의 접두어로 시작하지 않으면 역할 대시보드로 강제 이동
  const prefix = ROLE_PREFIX[user.role]
  const home   = ROLE_HOME[user.role] ?? '/auth'

  if (prefix && !location.pathname.startsWith(prefix)) {
    return <Navigate to={home} replace />
  }

  return children
}
