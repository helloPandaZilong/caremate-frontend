import apiClient from './client'

// ── 회원 관리 (차단/해제) API ──────────────────────────────────────────────────

// 고객 목록 조회 (keyword: 이름 검색, page/size: 페이징)
export const getAdminCustomers = (params) =>
  apiClient.get('/admin/customers', { params })

// 수리점 회원 목록 조회
export const getAdminShops = (params) =>
  apiClient.get('/admin/shops/members', { params })

// 고객 계정 차단/해제 토글 → 응답: { status: "ACTIVE" | "BLOCKED" }
export const toggleCustomerBlock = (customerId) =>
  apiClient.patch(`/admin/customers/${customerId}/block`)

// 수리점 계정 차단/해제 토글 → 응답: { status: "ACTIVE" | "BLOCKED" }
export const toggleShopBlock = (shopId) =>
  apiClient.patch(`/admin/shops/${shopId}/block`)

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
