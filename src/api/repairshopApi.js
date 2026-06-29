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
  }).then((r) => JSON.parse(r.data.data))
}

// aiDraft(x)와 최종 제출값(y)을 서버에 저장 — 프롬프트 개선용 피드백
export const submitReportFeedback = ({ orderId, aiDraft, finalData }) =>
  apiClient.post('/shop/reports/feedback', { orderId, aiDraft, finalData })

// ─── Shop Profile ─────────────────────────────────────────
export const getShopProfile = () =>
  apiClient.get('/shop/profile').then((r) => r.data.data)

export const updateShopProfile = (data) =>
  apiClient.put('/shop/profile', data).then((r) => r.data.data)

export const getOperatingHours = () =>
  apiClient.get('/shop/operating-hours').then((r) => r.data.data)

export const updateOperatingHours = (data) =>
  apiClient.put('/shop/operating-hours', data).then((r) => r.data.data)
