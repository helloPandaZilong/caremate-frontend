import apiClient from './client'

/**
 * 승인 대기 중인 수리점 목록 조회
 * GET /api/admin/shops/pending
 * 응답: ApiResponse<List<PendingShop>>
 *   PendingShop: { memberId, email, managerName, businessNumber, repairShopName, address }
 */
export const getPendingShops = () =>
  apiClient.get('/admin/shops/pending')

/**
 * 수리점 가입 승인
 * PATCH /api/admin/shops/{shopId}/status
 * 요청: { action: "APPROVE" }
 * 처리: members.status → ACTIVE, repair_shops.status → ACTIVE, 알림 발송
 */
export const approveShop = (shopId) =>
  apiClient.patch(`/admin/shops/${shopId}/status`, { action: 'APPROVE' })

/**
 * 수리점 가입 반려
 * PATCH /api/admin/shops/{shopId}/status
 * 요청: { action: "REJECT", reason: string }
 * 처리: members.status → BLOCKED
 */
export const rejectShop = (shopId, reason) =>
  apiClient.patch(`/admin/shops/${shopId}/status`, { action: 'REJECT', reason })
