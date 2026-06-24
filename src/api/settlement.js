import apiClient from './client'

const authHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
})

/**
 * 월별 정산 목록 조회
 * GET /api/shop/settlements
 */
export const fetchSettlements = () =>
  apiClient.get('/shop/settlements', authHeader())

/**
 * 특정 월 정산 상세 조회
 * GET /api/shop/settlements/{settlementMonth}
 */
export const fetchSettlementDetail = (settlementMonth) =>
  apiClient.get(`/shop/settlements/${settlementMonth}`, authHeader())

/**
 * 정산 리포트 다운로드 (Excel)
 * GET /api/shop/settlements/{settlementMonth}/download
 */
export const downloadSettlementExcel = async (settlementMonth) => {
  const response = await apiClient.get(
    `/shop/settlements/${settlementMonth}/download`,
    {
      ...authHeader(),
      responseType: 'blob',
    }
  )
  // 브라우저 다운로드 트리거
  const url = URL.createObjectURL(new Blob([response.data]))
  const a = document.createElement('a')
  a.href = url
  a.download = `정산리포트_${settlementMonth}.xlsx`
  a.click()
  URL.revokeObjectURL(url)
}
