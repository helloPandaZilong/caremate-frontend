import apiClient, { unwrapApiResponse } from './client'

export async function getRepairShops(params = {}) {
  const response = await apiClient.get('/repair-shops', { params })
  return unwrapApiResponse(response)
}

export async function getRepairShopOperatingHours(shopId) {
  const response = await apiClient.get(`/repair-shops/${shopId}/operating-hours`)
  return unwrapApiResponse(response)
}

export async function getCustomerInsurancePolicies(params = {}) {
  const response = await apiClient.get('/customer/insurance-policies', { params })
  return unwrapApiResponse(response)
}

export async function getCustomerRepairOrders(params = {}) {
  const response = await apiClient.get('/customer/repair-orders', { params })
  return unwrapApiResponse(response)
}

export async function getCustomerRepairOrder(orderId) {
  const response = await apiClient.get(`/customer/repair-orders/${orderId}`)
  return unwrapApiResponse(response)
}

export async function createCustomerRepairOrder({
  repairShopId,
  damageDescription,
  reservedVisitAt,
  memberInsurancePolicyIds,
  agreeTerms = true,
  agreePrivacy = true,
  images = [],
}) {
  const formData = new FormData()
  const request = {
    repairShopId: Number(repairShopId),
    damageDescription,
    reservedVisitAt,
    memberInsurancePolicyIds: memberInsurancePolicyIds.map(Number),
    agreeTerms,
    agreePrivacy,
  }

  formData.append(
    'request',
    new Blob([JSON.stringify(request)], { type: 'application/json' }),
  )

  images.forEach((file) => {
    formData.append('images', file)
  })

  const response = await apiClient.post('/customer/repair-orders', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return unwrapApiResponse(response)
}

export async function cancelCustomerRepairOrder(orderId) {
  const response = await apiClient.post(`/customer/repair-orders/${orderId}/cancel`)
  return unwrapApiResponse(response)
}
