import apiClient from './client.js'

// ─── Dashboard ────────────────────────────────────────────
export const getDashboard = () =>
  apiClient.get('/shop/dashboard').then((r) => r.data.data)

// ─── Orders ───────────────────────────────────────────────
export const getOrders = (params = {}) =>
  apiClient.get('/shop/orders', { params }).then((r) => r.data.data)

export const getOrderDetail = (orderId) =>
  apiClient.get(`/shop/orders/${orderId}`).then((r) => r.data.data)

export const getStatusHistories = (orderId) =>
  apiClient.get(`/shop/orders/${orderId}/status-histories`).then((r) => r.data.data)

export const acceptOrder = (orderId) =>
  apiClient.patch(`/shop/orders/${orderId}/accept`).then((r) => r.data.data)

export const rejectOrder = (orderId, reason) =>
  apiClient
    .patch(`/shop/orders/${orderId}/reject`, { reason })
    .then((r) => r.data.data)

export const startRepair = (orderId) =>
  apiClient.patch(`/shop/orders/${orderId}/start-repair`).then((r) => r.data.data)

export const manualNoShow = (orderId) =>
  apiClient.patch(`/shop/orders/${orderId}/no-show`).then((r) => r.data.data)

export const completeRepair = (orderId) =>
  apiClient.patch(`/shop/orders/${orderId}/complete-repair`).then((r) => r.data.data)

// ─── AI Report Parse & Feedback ───────────────────────────
export const parseRepairFile = (file, orderContext = {}) => {
  const form = new FormData()
  form.append('file', file)
  if (orderContext.customer) form.append('customerName', orderContext.customer)
  if (orderContext.device)   form.append('deviceModel',  orderContext.device)
  if (orderContext.issue)    form.append('damageDesc',   orderContext.issue)
  return apiClient.post('/shop/reports/parse-file', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000, // Gemini 처리 시간 고려해 60초로 확장
  }).then((r) => {
    const raw = r.data.data
    try {
      return typeof raw === 'string' ? JSON.parse(raw) : raw
    } catch (e) {
      console.error('[parseRepairFile] JSON 파싱 실패:', raw)
      throw new Error('AI 응답을 파싱할 수 없습니다. 다시 시도해주세요.')
    }
  })
}

// aiDraft(x)와 최종 제출값(y)을 서버에 저장 — 프롬프트 개선용 피드백
export const submitReportFeedback = ({ orderId, aiDraft, finalData }) =>
  apiClient.post('/shop/reports/feedback', { orderId, aiDraft, finalData })

// ─── Order Images ─────────────────────────────────────────
// type: 'BEFORE_REPAIR' | 'AFTER_REPAIR'
export const uploadOrderImage = (orderId, type, file) => {
  const form = new FormData()
  form.append('file', file)
  return apiClient.post(`/shop/orders/${orderId}/images?type=${type}`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((r) => r.data.data)
}

export const getOrderImages = (orderId) =>
  apiClient.get(`/shop/orders/${orderId}/images`).then((r) => r.data.data)

export const deleteOrderImage = (orderId, imageId) =>
  apiClient.delete(`/shop/orders/${orderId}/images/${imageId}`)

// ─── Report Save & PDF ────────────────────────────────────
export const saveReport = (orderId, data) =>
  apiClient.post(`/shop/orders/${orderId}/report`, data)

export const downloadReportPdf = async (orderId, customerName) => {
  const res = await apiClient.get(`/shop/orders/${orderId}/report/pdf`, {
    responseType: 'blob',
  })
  const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
  const a = document.createElement('a')
  a.href = url
  a.download = `수리리포트_${customerName}_${orderId}.pdf`
  a.click()
  URL.revokeObjectURL(url)
}

// ─── Shop Profile ─────────────────────────────────────────
export const getShopProfile = () =>
  apiClient.get('/shop/profile').then((r) => r.data.data)

export const updateShopProfile = (data) =>
  apiClient.put('/shop/profile', data).then((r) => r.data.data)

export const getOperatingHours = () =>
  apiClient.get('/shop/operating-hours').then((r) => r.data.data)

export const updateOperatingHours = (data) =>
  apiClient.put('/shop/operating-hours', data).then((r) => r.data.data)
