import apiClient from './client'

// Authorization 헤더 생성 (localStorage에서 토큰 읽기)
const authHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
})

/**
 * 결제 정보 조회
 * GET /api/customer/payments/info/{orderId}
 * - 총수리비 + 현재 주문 상태 반환
 */
export const fetchPaymentInfo = (orderId) =>
  apiClient.get(`/customer/payments/info/${orderId}`, authHeader())

/**
 * 결제 준비
 * POST /api/customer/payments/ready
 * - paymentKey, amount 반환 -> PG SDK에 전달
 */
export const readyPayment = (orderId) =>
  apiClient.post('/customer/payments/ready', { orderId }, authHeader())

/**
 * 결제 승인 콜백
 * POST /api/customer/payments/confirm
 * - PG 성공 후 서버에 통지 → 정산 엔진 트리거
 */
export const confirmPayment = (orderId, paymentKey, amount) =>
  apiClient.post('/customer/payments/confirm', { orderId, paymentKey, amount }, authHeader())

/**
 * 결제 실패 처리
 * POST /api/customer/payments/fail
 * - PG 실패 시 서버에 통지 → REPAIR_DONE 유지
 */
export const failPayment = (orderId, errorCode, errorMessage) =>
  apiClient.post('/customer/payments/fail', { orderId, errorCode, errorMessage }, authHeader())

/**
 * 결제 영수증 조회
 * GET /api/customer/payments/{paymentId}/receipt
 */
export const fetchReceipt = (paymentId) =>
  apiClient.get(`/customer/payments/${paymentId}/receipt`, authHeader())

/**
 * 결제 취소·환불
 * POST /api/customer/payments/{paymentId}/cancel
 * - PAYMENT_COMPLETED 까지만 허용
 */
export const cancelPayment = (paymentId) =>
  apiClient.post(`/customer/payments/${paymentId}/cancel`, {}, authHeader())
