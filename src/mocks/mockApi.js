import {
  mockInsurancePolicies,
  mockNotifications,
  mockOperatingHours,
  mockRepairOrders,
  mockRepairShops,
  mockStatusHistories,
} from './mockData';

export function makeApiResponse(data) {
  return {
    success: true,
    data,
    error: null,
  };
}

export function makeApiError(code = 'VALIDATION_ERROR', message = '요청값이 올바르지 않습니다.') {
  return {
    success: false,
    data: null,
    error: { code, message },
  };
}

export function makePage(content, { page = 0, size = 20 } = {}) {
  const start = page * size;
  const sliced = content.slice(start, start + size);
  const totalElements = content.length;
  const totalPages = Math.max(1, Math.ceil(totalElements / size));

  return {
    content: sliced,
    page,
    size,
    totalElements,
    totalPages,
    first: page === 0,
    last: page >= totalPages - 1,
  };
}

export function createMockApiRepository() {
  let repairOrders = [...mockRepairOrders];
  let notifications = [...mockNotifications];

  return {
    getRepairShops(params = {}) {
      return makePage(mockRepairShops, params);
    },

    getRepairShopOperatingHours(shopId) {
      return mockOperatingHours.filter((item) => item.repairShopId === Number(shopId));
    },

    getCustomerInsurancePolicies(params = {}) {
      const filtered = params.status
        ? mockInsurancePolicies.filter((item) => item.status === params.status)
        : mockInsurancePolicies;
      return makePage(filtered, params);
    },

    getCustomerRepairOrders(params = {}) {
      const filtered = params.status
        ? repairOrders.filter((item) => item.status === params.status)
        : repairOrders;
      return makePage(filtered, params);
    },

    getCustomerRepairOrder(orderId) {
      return repairOrders.find((item) => item.id === Number(orderId) || item.orderId === Number(orderId)) ?? null;
    },

    createCustomerRepairOrder(payload) {
      const nextId = Math.max(...repairOrders.map((item) => item.id), 100) + 1;
      const created = {
        id: nextId,
        orderId: nextId,
        orderNo: `CM-20260629-${String(nextId).padStart(4, '0')}`,
        memberId: 42,
        repairShopId: Number(payload.repairShopId),
        repairShopName: mockRepairShops.find((shop) => shop.id === Number(payload.repairShopId))?.shopName ?? '선택 센터',
        customerName: '홍길동',
        damageDescription: payload.damageDescription,
        reservedVisitAt: payload.reservedVisitAt,
        status: 'RECEIVED',
        createdAt: '2026-06-29T13:00:00+09:00',
        updatedAt: '2026-06-29T13:00:00+09:00',
      };
      repairOrders = [created, ...repairOrders];
      return { orderId: nextId, orderNo: created.orderNo, status: 'RECEIVED' };
    },

    cancelCustomerRepairOrder(orderId) {
      repairOrders = repairOrders.map((item) =>
        item.id === Number(orderId) ? { ...item, status: 'CANCELLED' } : item,
      );
      return { orderId: Number(orderId), status: 'CANCELLED' };
    },

    getOrderStatusHistories(orderId) {
      return {
        ...mockStatusHistories,
        orderId: Number(orderId),
      };
    },

    getNotifications(params = {}) {
      return makePage(notifications, params);
    },

    getUnreadCount() {
      return notifications.filter((item) => !item.isRead).length;
    },

    markNotificationRead(id) {
      notifications = notifications.map((item) =>
        item.id === Number(id) ? { ...item, isRead: true } : item,
      );
      return notifications.find((item) => item.id === Number(id)) ?? { id: Number(id), isRead: true };
    },

    pushNotification(notification) {
      const next = {
        id: notification.id ?? Date.now(),
        memberId: 42,
        isRead: false,
        createdAt: '2026-06-29T13:00:00+09:00',
        ...notification,
      };
      notifications = [next, ...notifications];
      return next;
    },
  };
}

export const mockApiRepository = createMockApiRepository();
