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
