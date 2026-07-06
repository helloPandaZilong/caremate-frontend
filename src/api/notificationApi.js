import apiClient, { unwrapApiResponse } from "./client";

function getPageContent(pageData) {
  if (Array.isArray(pageData)) return pageData;
  return pageData?.content ?? [];
}

export async function getNotifications({ page = 0, size = 20 } = {}) {
  const response = await apiClient.get("/notifications", {
    params: { page, size },
  });
  return unwrapApiResponse(response);
}

export async function getUnreadCount() {
  try {
    const response = await apiClient.get("/notifications/unread-count");
    const data = unwrapApiResponse(response);
    return Number(data?.unreadCount ?? data?.count ?? data ?? 0);
  } catch (error) {
    if (error.response?.status !== 404) throw error;

    const page = await getNotifications({ page: 0, size: 100 });
    return getPageContent(page).filter((notification) => {
      return !Boolean(notification.isRead ?? notification.read);
    }).length;
  }
}

export async function markNotificationRead(id) {
  const response = await apiClient.patch(`/notifications/${id}/read`);
  return unwrapApiResponse(response);
}

export async function markAllNotificationsRead() {
  const response = await apiClient.patch("/notifications/read-all");
  return unwrapApiResponse(response);
}