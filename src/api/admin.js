import apiClient from './client'

// ── 관리자 마이페이지 API ─────────────────────────────────────────────────────

// 관리자 프로필 조회 → { id, name, email, phoneNumber, role, status, createdAt, updatedAt }
export const getAdminProfile = () =>
  apiClient.get('/admin/profile')

// 관리자 기본 정보 수정 (이름·전화번호만 변경 가능)
export const updateAdminProfile = (data) =>
  apiClient.patch('/admin/profile', data)

// 비밀번호 변경 — 성공 시 204 반환, 기존 토큰 즉시 무효화 → 프론트에서 로그아웃 필요
export const changeAdminPassword = (data) =>
  apiClient.patch('/admin/profile/password', data)

// 최근 접속 이력 조회 (최대 20건, 최신순)
export const getAdminLoginHistory = () =>
  apiClient.get('/admin/profile/login-history')

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

// ── LMS 수료 관리 API ────────────────────────────────────────────────────────────

// 수리점 LMS 수료 현황 조회 (keyword: 수리점명 검색, page/size: 페이징)
export const getShopsLmsStatus = (params) =>
  apiClient.get('/admin/lms', { params })

// 특정 가이드 수료 기록 삭제 (guideType: "REPAIR_REPORT_GUIDE" | "PLATFORM_PROCESS_GUIDE")
export const deleteLmsGuide = (memberId, guideType) =>
  apiClient.delete(`/admin/lms/${memberId}/guides/${guideType}`)

// 전체 가이드 수료 기록 삭제
export const deleteAllLmsGuides = (memberId) =>
  apiClient.delete(`/admin/lms/${memberId}/guides`)

// ── AI 정확도 현황 API ──────────────────────────────────────────────────────────

// AI 파싱 정확도 통계 조회
// → { totalCount, noCorrectionCount, accuracyRate, fieldCorrectionCounts, fieldCorrectionRates, recentLogs }
export const getAiAccuracyStats = () =>
  apiClient.get('/admin/ai-accuracy').then((r) => r.data.data)
