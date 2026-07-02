import apiClient, { unwrapApiResponse } from "./client";

export async function getOrderStatusHistories(orderId) {
  if (!orderId) {
    throw new Error("orderId가 필요합니다.");
  }

  const response = await apiClient.get(
      `/customer/repair-orders/${orderId}/status-histories`,
  );
  return unwrapApiResponse(response);
}
