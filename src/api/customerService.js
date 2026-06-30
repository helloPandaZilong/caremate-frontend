import apiClient from './client'

// ── Profile ──────────────────────────────────────────────────────────────────

export function getProfile() {
    return apiClient.get('/customer/profile')
}

export function updateProfile({ name, phoneNumber }) {
    return apiClient.put('/customer/profile', { name, phoneNumber })
}

// ── Repair Orders ────────────────────────────────────────────────────────────

export function createRepairOrder({ repairShopId, damageDescription, reservedVisitAt, policyIds, images }) {
    const formData = new FormData()
    formData.append('request', new Blob(
        [JSON.stringify({ repairShopId, damageDescription, reservedVisitAt, policyIds })],
        { type: 'application/json' },
    ))
    if (images?.length) {
        images.forEach((file) => formData.append('images', file))
    }
    return apiClient.post('/customer/repair-orders', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    })
}

export function getRepairOrders(page = 0, size = 10, status) {
    const params = { page, size }
    if (status) params.status = status
    return apiClient.get('/customer/repair-orders', { params })
}

export function getRepairOrder(orderId) {
    return apiClient.get(`/customer/repair-orders/${orderId}`)
}

export function cancelRepairOrder(orderId) {
    return apiClient.post(`/customer/repair-orders/${orderId}/cancel`)
}

export function getStatusHistories(orderId) {
    return apiClient.get(`/customer/repair-orders/${orderId}/status-histories`)
}

// ── Insurance Policies ───────────────────────────────────────────────────────

export function getInsurancePolicies() {
    return apiClient.get('/customer/insurance-policies')
}

export function getInsurancePolicy(policyId) {
    return apiClient.get(`/customer/insurance-policies/${policyId}`)
}

export function createInsurancePolicy({ insuranceProductId, policyNumber, startDate, endDate }) {
    return apiClient.post('/customer/insurance-policies', {
        insuranceProductId, policyNumber, startDate, endDate,
    })
}

export function updateInsurancePolicy(policyId, { policyNumber, startDate, endDate }) {
    return apiClient.put(`/customer/insurance-policies/${policyId}`, {
        policyNumber, startDate, endDate,
    })
}

export function deleteInsurancePolicy(policyId) {
    return apiClient.delete(`/customer/insurance-policies/${policyId}`)
}

// ── Insurance Products (public) ──────────────────────────────────────────────

export function getInsuranceProducts(providerType) {
    const params = providerType ? { providerType } : {}
    return apiClient.get('/insurance-products', { params })
}

export function getInsuranceProduct(productId) {
    return apiClient.get(`/insurance-products/${productId}`)
}

// ── Repair Shops (public) ────────────────────────────────────────────────────

export function getRepairShops() {
    return apiClient.get('/repair-shops')
}

export function getRepairShop(shopId) {
    return apiClient.get(`/repair-shops/${shopId}`)
}

export function getShopOperatingHours(shopId) {
    return apiClient.get(`/repair-shops/${shopId}/operating-hours`)
}
