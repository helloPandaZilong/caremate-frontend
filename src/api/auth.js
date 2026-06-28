import apiClient from './client'

// 수리 고객 회원가입
export const signupCustomer = (data) =>
  apiClient.post('/auth/signup/customer', data)

// 수리점 회원가입
export const signupShop = (data) =>
  apiClient.post('/auth/signup/shop', data)

// 이메일 중복 확인
export const checkEmail = (email) =>
  apiClient.get('/auth/check-email', { params: { email } })

// 통합 로그인
export const login = (data) =>
  apiClient.post('/auth/login', data)

// accessToken 재발급
export const refreshToken = () =>
  apiClient.post('/auth/refresh')

// 로그아웃
export const logout = () =>
  apiClient.post('/auth/logout')

// ── Google OAuth2 Authorization Code Flow ──────────────────────────────────

/**
 * Google 인증 페이지 URL과 CSRF state를 백엔드에서 조회한다.
 *
 * 반환값: { authorizationUrl: string, state: string }
 * - authorizationUrl: 브라우저가 리다이렉트할 Google 동의 화면 URL
 * - state: sessionStorage에 저장 후 콜백 시 CSRF 검증에 사용
 *
 * @param {string} redirectUri Google 인증 완료 후 리다이렉트될 프론트엔드 콜백 URL
 */
export const getGoogleAuthUrl = (redirectUri) =>
  apiClient.get('/auth/oauth2/google/authorize', { params: { redirectUri } })

/**
 * Google 인가 코드를 백엔드에 전달해 JWT를 발급받는다.
 *
 * 반환값: 일반 로그인과 동일한 LoginResponse
 * { accessToken, tokenType, expiredAt, memberId, role, name, email }
 *
 * @param {string} code        Google 콜백 URL에서 추출한 인가 코드
 * @param {string} redirectUri 인가 요청 시 사용한 것과 동일한 콜백 URL
 */
export const googleCallback = (code, redirectUri) =>
  apiClient.post('/auth/oauth2/google/callback', { code, redirectUri })
