import { Navigate, useLocation } from 'react-router'
import { useAuth } from '../contexts/AuthContext'

/**
 * 인증이 필요한 페이지를 보호하는 라우트 가드.
 * 미로그인 상태에서 접근하면 /auth 로 리다이렉트하고,
 * 로그인 성공 후 원래 페이지로 돌아올 수 있도록 현재 경로를 state에 저장한다.
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace state={{ from: location }} />
  }

  return children
}
