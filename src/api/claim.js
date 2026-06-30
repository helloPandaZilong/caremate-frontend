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
