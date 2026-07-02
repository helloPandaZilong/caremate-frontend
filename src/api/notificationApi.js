import apiClient from './client'

export function getNotifications(page = 0, size = 20) {
  return apiClient.get('/notifications', { params: { page, size } })
}

export function getUnreadCount() {
  return apiClient.get('/notifications/unread-count')
}

export function markNotificationRead(id) {
  return apiClient.patch(`/notifications/${id}/read`)
}
