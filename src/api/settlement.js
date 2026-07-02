import apiClient from './client'

/**
 * 월별 정산 목록 조회
 * GET /api/shop/settlements
 */
export const fetchSettlements = () =>
  apiClient.get('/shop/settlements')

/**
 * 특정 월 정산 상세 조회
 * GET /api/shop/settlements/{settlementMonth}
 */
export const fetchSettlementDetail = (settlementMonth) =>
  apiClient.get(`/shop/settlements/${settlementMonth}`)

/**
 * 정산 리포트 다운로드 (Excel)
 * GET /api/shop/settlements/{settlementMonth}/download
 */
export const downloadSettlementExcel = async (settlementMonth) => {
  const response = await apiClient.get(
    `/shop/settlements/${settlementMonth}/download`,
    { responseType: 'blob' }
  )
  const url = URL.createObjectURL(new Blob([response.data]))
  const a = document.createElement('a')
  a.href = url
  a.download = `정산리포트_${settlementMonth}.xlsx`
  a.click()
  URL.revokeObjectURL(url)
}

/**
 * 특정 월 건별(주문별) 결제 내역 조회
 * GET /api/shop/settlements/{settlementMonth}/orders
 *
 * 응답 data: [{ orderId, orderNo, customerName, totalPaidAmount,
 *               expectedRefundAmount, paidAt }]
 * payments.paidAt 기준으로 뽑은 목록이라 위 정산 요약(총매출·건수)과 항상 합계가 일치함.
 */
export const fetchSettlementOrders = (settlementMonth) =>
  apiClient.get(`/shop/settlements/${settlementMonth}/orders`)

/**
 * 정산 리포트 PDF 다운로드 — 화면에 보이는 리포트를 서버(Thymeleaf+openhtmltopdf)에서
 * 그대로 렌더링해 PDF로 내려준다. window.print()와 달리 클릭 한 번으로 바로 파일 다운로드된다.
 * GET /api/shop/settlements/{settlementMonth}/pdf
 */
export const downloadSettlementPdf = async (settlementMonth) => {
  const response = await apiClient.get(
    `/shop/settlements/${settlementMonth}/pdf`,
    { responseType: 'blob' }
  )
  const url = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }))
  const a = document.createElement('a')
  a.href = url
  a.download = `정산리포트_${settlementMonth}.pdf`
  a.click()
  URL.revokeObjectURL(url)
}

// ── 관리자 정산·배치 관리 API ───────────────────────────────────────────────────
// 백엔드: AdminSettlementController (/api/admin/settlements/**)

/**
 * 관리자 — 월간 정산 통계 (수리점별)
 * GET /api/admin/settlements/monthly?yearMonth=2026-06
 * yearMonth 생략 시 전체 정산 이력 전체 조회 (AdminSettlementService 확인 완료)
 */
export const getAdminMonthlySettlements = (yearMonth) =>
  apiClient.get('/admin/settlements/monthly', {
    params: yearMonth ? { yearMonth } : {},
  })

/**
 * 관리자 — 특정 수리점의 월별 정산 상세 이력 조회
 * GET /api/admin/settlements/monthly/{shopId}
 */
export const getAdminShopSettlementDetail = (shopId) =>
  apiClient.get(`/admin/settlements/monthly/${shopId}`)

/**
 * 관리자 — 월말 정산 배치 수동 실행/재실행
 * POST /api/admin/settlements/batch/run
 * body: { settlementMonth: "2026-06" }
 * 응답 data: { settlementMonth, status: "SUCCESS"|"PARTIAL_FAIL"|"FAILED"|"SKIPPED", message }
 */
export const runSettlementBatch = (settlementMonth) =>
  apiClient.post('/admin/settlements/batch/run', { settlementMonth })

/**
 * 관리자 — 배치 실행 로그 목록 조회 (최신순)
 * GET /api/admin/settlements/batch/logs
 */
export const getBatchExecutionLogs = () =>
  apiClient.get('/admin/settlements/batch/logs')
