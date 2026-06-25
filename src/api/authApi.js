import apiClient from './client'

export const login = (email, password) =>
  apiClient.post('/auth/login', { email, password }).then(r => r.data.data)

export const signupCustomer = (data) =>
  apiClient.post('/auth/signup/customer', data).then(r => r.data.data)

export const signupShop = (data) =>
  apiClient.post('/auth/signup/shop', data).then(r => r.data.data)

export const logout = () =>
  apiClient.post('/auth/logout').then(r => r.data)

export const refreshToken = () =>
  apiClient.post('/auth/refresh').then(r => r.data.data)

export const checkEmail = (email) =>
  apiClient.get('/auth/check-email', { params: { email } }).then(r => r.data.data)
