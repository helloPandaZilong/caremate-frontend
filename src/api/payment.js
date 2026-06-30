import apiClient from './client'

/**
 * 결제 정보 조회
 * GET /api/customer/payments/info/{orderId}
 */
export const fetchPaymentInfo = (orderId) =>
  apiClient.get(`/customer/payments/info/${orderId}`)

/**
 * 결제 준비
 * POST /api/customer/payments/ready
 */
export const readyPayment = (orderId) =>
  apiClient.post('/customer/payments/ready', { orderId })

/**
 * 결제 승인 콜백
 * POST /api/customer/payments/confirm
 * tossOrderId: ready 단계에서 발급받아 토스 SDK에 전달했던 결제 시도 전용 주문ID
 *              (= 토스 successUrl 리다이렉트 쿼리파라미터의 orderId)
 */
export const confirmPayment = (orderId, paymentKey, tossOrderId, amount) =>
  apiClient.post('/customer/payments/confirm', { orderId, paymentKey, tossOrderId, amount })

/**
 * 결제 실패 처리
 * POST /api/customer/payments/fail
 */
export const failPayment = (orderId, errorCode, errorMessage) =>
  apiClient.post('/customer/payments/fail', { orderId, errorCode, errorMessage })

/**
 * 결제 영수증 조회
 * GET /api/customer/payments/{paymentId}/receipt
 */
export const fetchReceipt = (paymentId) =>
  apiClient.get(`/customer/payments/${paymentId}/receipt`)

/**
 * 결제 취소·환불
 * POST /api/customer/payments/{paymentId}/cancel
 */
export const cancelPayment = (paymentId) =>
  apiClient.post(`/customer/payments/${paymentId}/cancel`, {})
