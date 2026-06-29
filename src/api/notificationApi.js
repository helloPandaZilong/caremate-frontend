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
  const page = await getNotifications({ page: 0, size: 100 });

  return getPageContent(page).filter((notification) => {
    return !Boolean(notification.isRead ?? notification.read);
  }).length;
}

export async function markNotificationRead(id) {
  const response = await apiClient.patch(`/notifications/${id}/read`);
  return unwrapApiResponse(response);
}