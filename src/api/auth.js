import apiClient from './client'

/** 고객 회원가입 → POST /api/auth/signup/customer */
export const signupCustomer = (data) =>
  apiClient.post('/auth/signup/customer', data)

/** 수리점 회원가입 → POST /api/auth/signup/shop */
export const signupShop = (data) =>
  apiClient.post('/auth/signup/shop', data)

/** 이메일 중복 확인 → GET /api/auth/check-email?email= */
export const checkEmail = (email) =>
  apiClient.get('/auth/check-email', { params: { email } })

/** 통합 로그인(고객/수리점/관리자) → POST /api/auth/login */
export const login = (data) =>
  apiClient.post('/auth/login', data)

/** Access Token 재발급 → POST /api/auth/refresh (Refresh Token은 httpOnly 쿠키로 자동 전송) */
export const refreshToken = () =>
  apiClient.post('/auth/refresh')

/** 로그아웃 → POST /api/auth/logout (Access Token 블랙리스트 등록, Refresh Token 쿠키 삭제) */
export const logout = () =>
  apiClient.post('/auth/logout')
