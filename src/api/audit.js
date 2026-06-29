import apiClient from './client'

// ── 관리자 감사 / DLQ API ──────────────────────────────────────────────────────

export const getDlqList = (params) =>
  apiClient.get('/admin/audit/dlq', { params })

export const getPendingDlqCount = () =>
  apiClient.get('/admin/audit/dlq/count')

export const retryDlqItem = (dlqId) =>
  apiClient.post(`/admin/audit/dlq/${dlqId}/retry`)

export const retryAllDlqItems = () =>
  apiClient.post('/admin/audit/dlq/retry-all')

export const getAuditLogs = (params) =>
  apiClient.get('/admin/audit/logs', { params })

// ── 결제 무결성 감사 API ────────────────────────────────────────────────────────

export const scanPaymentIntegrity = () =>
  apiClient.post('/admin/audit/integrity/scan')

export const verifyPaymentIntegrity = () =>
  apiClient.post('/admin/audit/integrity/verify')

export const getIntegrityLogs = (params) =>
  apiClient.get('/admin/audit/integrity/logs', { params })

export const getTamperedCount = () =>
  apiClient.get('/admin/audit/integrity/count')
