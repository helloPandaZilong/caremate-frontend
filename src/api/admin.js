import apiClient from './client'

// ── 수리점 가입 승인 관련 API ───────────────────────────────────────────────────

// 승인 대기중인 목록 조회
export const getPendingShops = () =>
  apiClient.get('/admin/shops/pending')

// 수리점 가입 승인
export const approveShop = (shopId) =>
  apiClient.patch(`/admin/shops/${shopId}/status`, { action: 'APPROVE' })

// 수리점 가입 반려
export const rejectShop = (shopId, reason) =>
  apiClient.patch(`/admin/shops/${shopId}/status`, { action: 'REJECT', reason })

// ── 보험 약관(상품) 관련 API ────────────────────────────────────────────────────

// 보험 상품 전체 조회
export const getInsuranceProducts = () =>
  apiClient.get('/admin/insurance-products')

// 보험 상품 단건 조회
export const getInsuranceProduct = (productId) =>
  apiClient.get(`/admin/insurance-products/${productId}`)

// 보험 상품 등록
export const createInsuranceProduct = (data) =>
  apiClient.post('/admin/insurance-products', data)

// 보험 상품 수정
export const updateInsuranceProduct = (productId, data) =>
  apiClient.put(`/admin/insurance-products/${productId}`, data)

// 보험 상품 삭제
export const deleteInsuranceProduct = (productId) =>
  apiClient.delete(`/admin/insurance-products/${productId}`)
