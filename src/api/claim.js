import apiClient from "./client";

/**
 * 결제 후 예상 보험금 내역 조회 (상품정보·제출링크·status 포함)
 * GET /api/customer/repair-orders/{orderId}/insurance-claims
 *
 * 응답 data: ClaimEstimateResponse[]
 *   { claimId, claimOrder, baseAmount, expectedAmount, status, claimMonth,
 *     productName, providerType, providerName, coveragePerIncident,
 *     selfPayType, selfPayAmount, selfPayRate, minSelfPayAmount,
 *     claimChannelType, claimChannelValue }
 */
export async function getClaimEstimates(orderId) {
  const res = await apiClient.get(
    `/customer/repair-orders/${orderId}/insurance-claims`,
  );
  return res.data.data; // ApiResponse 래퍼의 data
}

/**
 * 청구하기 + 패키지(zip) 다운로드
 * POST /api/customer/repair-orders/{orderId}/claim-request
 * 응답이 zip(blob)이므로 responseType: 'blob' 필수.
 * 성공(200) = 서버에서 청구 처리 완료(status → PACKAGE_READY).
 */
export async function requestClaimPackage(orderId) {
  const res = await apiClient.post(
    `/customer/repair-orders/${orderId}/claim-request`,
    null,
    { responseType: "blob" },
  );
  return res.data; // Blob
}

// ── 관리자 — 청구 패키지 실패 관제/재시도 API ──────────────────────────────────
// 백엔드: AdminClaimController (/api/admin/claims/**)

/**
 * 관리자 — 청구 패키지 생성 현황·실패율 모니터링 조회
 * GET /api/admin/claims/monitoring
 *
 * 응답 data (ClaimMonitoringResponse):
 *   { totalClaimTargetCount, completedCount, failedCount, pendingCount,
 *     successRate, failureRate,
 *     failedItems: [{ orderId, orderNo, memberId, currentStatus, createdAt }] }
 */
export async function getClaimMonitoring() {
  const res = await apiClient.get("/admin/claims/monitoring");
  return res.data.data;
}

/**
 * 관리자 — 청구 패키지 생성 실패 건 재시도
 * POST /api/admin/claims/packages/retry
 * body(ClaimRetryRequest): { orderIds: number[] }
 *   - orderIds 를 지정하면 해당 건들만 재시도
 *   - orderIds 를 비우거나 생략하면(null/[]) 실패 건 전체를 재시도
 *
 * 응답 data (ClaimRetryResponse):
 *   { totalRetryCount, successCount, failedCount,
 *     results: [{ orderId, orderNo, success, failReason }] }
 *
 * @param {number[]} [orderIds] 재시도할 주문 ID 목록. 생략 시 실패 건 전체 재시도.
 */
export async function retryClaimPackage(orderIds) {
  const res = await apiClient.post("/admin/claims/packages/retry", {
    orderIds: orderIds ?? [],
  });
  return res.data.data;
}

/**
 * 관리자 — 실패 건 전체 재시도 (편의 함수)
 */
export const retryAllClaimPackages = () => retryClaimPackage([]);
