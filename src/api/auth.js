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
