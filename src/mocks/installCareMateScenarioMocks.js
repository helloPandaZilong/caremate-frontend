import apiClient from '../api/client';
import {
  createScenarioNotifications,
  createScenarioPaymentInfo,
  createScenarioRepairOrders,
  createScenarioStatusHistories,
  scenarioAccounts,
  scenarioInsurancePolicies,
  scenarioOperatingHours,
  scenarioRepairShops,
  minutesAgo,
  minutesFromNow,
} from './caremateScenarioMockData';

const USER_KEY = 'caremate_user';
const TOKEN_KEY = 'caremate_access_token';

function envelope(data) {
  return { success: true, data, error: null };
}

function page(content, params = {}) {
  const pageNo = Number(params.page ?? 0);
  const size = Number(params.size ?? 20);
  const start = pageNo * size;
  const sliced = content.slice(start, start + size);
  const totalElements = content.length;
  const totalPages = Math.max(1, Math.ceil(totalElements / size));
  return {
    content: sliced,
    page: pageNo,
    number: pageNo,
    size,
    totalElements,
    totalPages,
    first: pageNo === 0,
    last: pageNo >= totalPages - 1,
  };
}

function ok(data, config = {}) {
  return Promise.resolve({
    data: envelope(data),
    status: 200,
    statusText: 'OK',
    headers: {},
    config,
  });
}

function fail(status, code, message, config = {}) {
  const error = new Error(message);
  error.response = {
    data: { success: false, data: null, error: { code, message } },
    status,
    statusText: String(status),
    headers: {},
    config,
  };
  error.config = config;
  return Promise.reject(error);
}

function normalizeUrl(url = '') {
  try {
    const parsed = new URL(url, window.location.origin);
    return parsed.pathname.replace(/^\/api/, '') || '/';
  } catch {
    return String(url).replace(/^\/api/, '') || '/';
  }
}

function currentUserFromStorage() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }

  const token = localStorage.getItem(TOKEN_KEY);
  const account = scenarioAccounts.find((item) => item.accessToken === token);
  if (!account) return null;
  return {
    memberId: account.memberId,
    role: account.role,
    name: account.name,
    email: account.email,
  };
}

function createRepository() {
  let repairOrders = createScenarioRepairOrders();
  let statusHistories = createScenarioStatusHistories();
  let notifications = createScenarioNotifications();
  let paymentInfo = createScenarioPaymentInfo();

  function getCurrentMemberId() {
    return currentUserFromStorage()?.memberId ?? scenarioAccounts[0].memberId;
  }

  function getCurrentAccount() {
    const user = currentUserFromStorage();
    return scenarioAccounts.find((item) => item.memberId === user?.memberId) ?? scenarioAccounts[0];
  }

  function getOrder(orderId) {
    return repairOrders.find((item) => item.id === Number(orderId) || item.orderId === Number(orderId));
  }

  function sortLatest(list) {
    return [...list].sort((a, b) => new Date(b.createdAt ?? b.updatedAt).getTime() - new Date(a.createdAt ?? a.updatedAt).getTime());
  }

  function addNotification(notification) {
    const next = {
      id: Math.max(9000, ...notifications.map((item) => Number(item.id) || 0)) + 1,
      isRead: false,
      read: false,
      createdAt: minutesAgo(0),
      ...notification,
    };
    notifications = [next, ...notifications];
    return next;
  }

  function updateOrderStatus(orderId, changedStatus, note) {
    const order = getOrder(orderId);
    if (!order) return null;

    const previousStatus = order.status;
    order.status = changedStatus;
    order.updatedAt = minutesAgo(0);

    if (!statusHistories[order.id]) {
      statusHistories[order.id] = {
        orderId: order.id,
        currentStatus: changedStatus,
        milestones: [],
        histories: [],
      };
    }

    statusHistories[order.id].currentStatus = changedStatus;
    statusHistories[order.id].histories.push({
      id: Date.now(),
      repairOrderId: order.id,
      previousStatus,
      changedStatus,
      changedBy: getCurrentMemberId(),
      note,
      changedAt: minutesAgo(0),
    });

    statusHistories[order.id].milestones = statusHistories[order.id].milestones.map((m) => {
      if (m.status === changedStatus) {
        return { ...m, reached: true, current: true, changedAt: minutesAgo(0), reachedAt: minutesAgo(0) };
      }
      return { ...m, current: false };
    });

    return order;
  }

  return {
    handleGet(path, config = {}) {
      const params = config.params ?? {};
      const memberId = getCurrentMemberId();
      const account = getCurrentAccount();

      if (path === '/auth/check-email') {
        const email = params.email;
        return { isDuplicated: scenarioAccounts.some((item) => item.email === email) };
      }

      if (path === '/repair-shops') {
        return page(scenarioRepairShops, params);
      }

      const repairShopHoursMatch = path.match(/^\/repair-shops\/(\d+)\/operating-hours$/);
      if (repairShopHoursMatch) {
        return scenarioOperatingHours.filter((item) => item.repairShopId === Number(repairShopHoursMatch[1]));
      }

      if (path === '/customer/insurance-policies') {
        return page(scenarioInsurancePolicies.filter((item) => item.memberId === memberId), params);
      }

      if (path === '/customer/repair-orders') {
        const filtered = repairOrders.filter((item) => item.memberId === memberId);
        return page(sortLatest(filtered), params);
      }

      const customerOrderMatch = path.match(/^\/customer\/repair-orders\/(\d+)$/);
      if (customerOrderMatch) {
        const order = getOrder(customerOrderMatch[1]);
        return order?.memberId === memberId ? order : null;
      }

      const customerHistoryMatch = path.match(/^\/customer\/repair-orders\/(\d+)\/status-histories$/);
      if (customerHistoryMatch) {
        const orderId = Number(customerHistoryMatch[1]);
        return { ...statusHistories[orderId], orderId };
      }

      if (path === '/notifications') {
        const filtered = notifications.filter((item) => item.memberId === memberId);
        return page(sortLatest(filtered), params);
      }

      const paymentInfoMatch = path.match(/^\/customer\/payments\/info\/(\d+)$/);
      if (paymentInfoMatch) {
        return paymentInfo[Number(paymentInfoMatch[1])] ?? null;
      }

      if (path === '/shop/dashboard') {
        const shopOrders = repairOrders.filter((item) => item.repairShopId === account.repairShopId);
        return {
          shopId: account.repairShopId,
          shopName: account.shopName,
          receivedCount: shopOrders.filter((item) => item.status === 'RECEIVED').length,
          acceptedCount: shopOrders.filter((item) => item.status === 'ACCEPTED').length,
          inRepairCount: shopOrders.filter((item) => item.status === 'IN_REPAIR').length,
          repairDoneCount: shopOrders.filter((item) => item.status === 'REPAIR_DONE').length,
          noShowWarningCount: notifications.filter((item) => item.memberId === memberId && item.type === 'NO_SHOW_WARNING' && !item.isRead).length,
        };
      }

      if (path === '/shop/orders') {
        const filtered = repairOrders
          .filter((item) => item.repairShopId === account.repairShopId)
          .filter((item) => !params.status || item.status === params.status)
          .filter((item) => !params.date || item.reservedVisitAt?.startsWith(params.date));
        return page(sortLatest(filtered), params);
      }

      const shopOrderMatch = path.match(/^\/shop\/orders\/(\d+)$/);
      if (shopOrderMatch) {
        return getOrder(shopOrderMatch[1]) ?? null;
      }

      const shopHistoryMatch = path.match(/^\/shop\/orders\/(\d+)\/status-histories$/);
      if (shopHistoryMatch) {
        const orderId = Number(shopHistoryMatch[1]);
        return { ...statusHistories[orderId], orderId };
      }

      if (path === '/shop/profile') {
        return {
          memberId: account.memberId,
          repairShopId: account.repairShopId,
          shopName: account.shopName,
          address: '서울 강남구 테헤란로 123',
          phone: '02-555-0101',
          status: 'ACTIVE',
        };
      }

      if (path === '/shop/operating-hours') {
        return scenarioOperatingHours.filter((item) => item.repairShopId === account.repairShopId);
      }

      const receiptMatch = path.match(/^\/customer\/payments\/(\d+)\/receipt$/);
      if (receiptMatch) {
        return {
          paymentId: Number(receiptMatch[1]),
          orderId: 102,
          amount: 700000,
          approvedAt: minutesAgo(0),
          receiptUrl: 'https://example.com/mock-receipt/102',
        };
      }

      throw new Error('NOT_MOCKED');
    },

    handlePost(path, body = {}) {
      if (path === '/auth/login') {
        const account = scenarioAccounts.find((item) => item.email === body.email);
        if (!account) {
          return fail(401, 'INVALID_CREDENTIALS', '목업 계정은 test99@test.com 또는 shop99@test.com 입니다.', { url: path });
        }

        return {
          accessToken: account.accessToken,
          tokenType: 'Bearer',
          expiredAt: minutesFromNow(120),
          memberId: account.memberId,
          role: account.role,
          name: account.name,
          email: account.email,
        };
      }

      if (path === '/auth/refresh') {
        const account = getCurrentAccount();
        return {
          accessToken: account.accessToken,
          tokenType: 'Bearer',
          expiredAt: minutesFromNow(120),
          memberId: account.memberId,
          role: account.role,
          name: account.name,
          email: account.email,
        };
      }

      if (path === '/auth/logout') {
        return { loggedOut: true };
      }

      if (path === '/customer/repair-orders') {
        const nextId = Math.max(...repairOrders.map((item) => item.id), 200) + 1;
        const created = {
          id: nextId,
          orderId: nextId,
          orderNo: `CM-MOCK-${nextId}`,
          memberId: getCurrentMemberId(),
          repairShopId: Number(body.repairShopId ?? 501),
          repairShopName: '강남 스마트케어',
          customerName: currentUserFromStorage()?.name ?? '김민준',
          customerPhone: '010-1001-1001',
          deviceModel: 'iPhone 15 Pro',
          damageDescription: body.damageDescription ?? '목업 접수 건',
          reservedVisitAt: body.reservedVisitAt ?? minutesFromNow(180),
          status: 'RECEIVED',
          createdAt: minutesAgo(0),
          updatedAt: minutesAgo(0),
        };
        repairOrders = [created, ...repairOrders];
        statusHistories[created.id] = {
          orderId: created.id,
          currentStatus: 'RECEIVED',
          milestones: [
            { status: 'RECEIVED', displayName: '접수', label: '접수', reached: true, current: true, changedAt: created.createdAt, reachedAt: created.createdAt },
            { status: 'ACCEPTED', displayName: '예약확정', label: '예약확정', reached: false, current: false, changedAt: null, reachedAt: null },
            { status: 'IN_REPAIR', displayName: '수리중', label: '수리중', reached: false, current: false, changedAt: null, reachedAt: null },
            { status: 'REPAIR_DONE', displayName: '수리완료', label: '수리완료', reached: false, current: false, changedAt: null, reachedAt: null },
            { status: 'PAYMENT_COMPLETED', displayName: '결제완료', label: '결제완료', reached: false, current: false, changedAt: null, reachedAt: null },
            { status: 'CLAIM_REQUESTED', displayName: '청구요청', label: '청구요청', reached: false, current: false, changedAt: null, reachedAt: null },
            { status: 'CLAIM_COMPLETED', displayName: '청구패키지완료', label: '청구패키지완료', reached: false, current: false, changedAt: null, reachedAt: null },
          ],
          histories: [
            { id: Date.now(), repairOrderId: created.id, previousStatus: 'RECEIVED', changedStatus: 'RECEIVED', changedBy: getCurrentMemberId(), note: '목업 A/S 접수 완료', changedAt: created.createdAt },
          ],
        };
        return { orderId: nextId, orderNo: created.orderNo, status: 'RECEIVED' };
      }

      if (path === '/customer/payments/ready') {
        return {
          orderId: Number(body.orderId),
          paymentId: 7001,
          amount: 700000,
          orderName: 'CareMate 수리비 결제',
          paymentUrl: 'https://example.com/mock-payment-ready',
        };
      }

      if (path === '/customer/payments/confirm') {
        const orderId = Number(body.orderId);
        updateOrderStatus(orderId, 'PAYMENT_COMPLETED', '목업 결제 완료');
        paymentInfo[orderId] = { ...paymentInfo[orderId], paymentStatus: 'COMPLETED' };
        addNotification({
          memberId: getCurrentMemberId(),
          repairOrderId: orderId,
          type: 'PAYMENT_COMPLETED',
          message: '결제가 완료되었습니다. 보험 청구를 진행할 수 있습니다.',
        });
        return { orderId, paymentId: 7001, status: 'PAYMENT_COMPLETED' };
      }

      if (path === '/customer/payments/fail') {
        return { orderId: Number(body.orderId), status: 'FAILED', errorCode: body.errorCode };
      }

      const cancelPaymentMatch = path.match(/^\/customer\/payments\/(\d+)\/cancel$/);
      if (cancelPaymentMatch) {
        return { paymentId: Number(cancelPaymentMatch[1]), status: 'CANCELLED' };
      }

      const cancelOrderMatch = path.match(/^\/customer\/repair-orders\/(\d+)\/cancel$/);
      if (cancelOrderMatch) {
        const order = updateOrderStatus(cancelOrderMatch[1], 'CANCELLED', '고객 취소');
        return { orderId: Number(cancelOrderMatch[1]), status: order?.status ?? 'CANCELLED' };
      }

      throw new Error('NOT_MOCKED');
    },

    handlePatch(path, body = {}) {
      const notificationReadMatch = path.match(/^\/notifications\/(\d+)\/read$/);
      if (notificationReadMatch) {
        const id = Number(notificationReadMatch[1]);
        notifications = notifications.map((item) =>
          item.id === id ? { ...item, isRead: true, read: true } : item,
        );
        return notifications.find((item) => item.id === id) ?? { id, isRead: true, read: true };
      }

      const acceptMatch = path.match(/^\/shop\/orders\/(\d+)\/accept$/);
      if (acceptMatch) {
        return updateOrderStatus(acceptMatch[1], 'ACCEPTED', '목업 수리점 예약 확정');
      }

      const rejectMatch = path.match(/^\/shop\/orders\/(\d+)\/reject$/);
      if (rejectMatch) {
        return updateOrderStatus(rejectMatch[1], 'REJECTED', body.reason ?? '목업 거절 처리');
      }

      const startMatch = path.match(/^\/shop\/orders\/(\d+)\/start-repair$/);
      if (startMatch) {
        return updateOrderStatus(startMatch[1], 'IN_REPAIR', '목업 수리 시작');
      }

      const noShowMatch = path.match(/^\/shop\/orders\/(\d+)\/no-show$/);
      if (noShowMatch) {
        const order = updateOrderStatus(noShowMatch[1], 'NO_SHOW', '목업 노쇼 처리');
        addNotification({
          memberId: order?.memberId ?? 1002,
          repairOrderId: Number(noShowMatch[1]),
          type: 'NO_SHOW',
          message: '방문 예약 시간이 지났으나 방문이 확인되지 않아 노쇼 처리되었습니다.',
        });
        return order;
      }

      const completeMatch = path.match(/^\/shop\/orders\/(\d+)\/complete-repair$/);
      if (completeMatch) {
        const order = updateOrderStatus(completeMatch[1], 'REPAIR_DONE', '목업 수리 완료 및 결제 요청');
        addNotification({
          memberId: order?.memberId ?? 1001,
          repairOrderId: Number(completeMatch[1]),
          type: 'PAYMENT_REQUESTED',
          message: '수리가 완료되었습니다. 결제를 진행해 주세요.',
        });
        return order;
      }

      throw new Error('NOT_MOCKED');
    },

    getNotificationsForToken(token) {
      const account = scenarioAccounts.find((item) => item.accessToken === token) ?? getCurrentAccount();
      return notifications.filter((item) => item.memberId === account.memberId);
    },
  };
}

function parseTokenFromSseUrl(url) {
  try {
    return new URL(url, window.location.origin).searchParams.get('token');
  } catch {
    return '';
  }
}

function installMockEventSource(repository) {
  const NativeEventSource = window.EventSource;

  class CareMateScenarioEventSource {
    static CONNECTING = 0;
    static OPEN = 1;
    static CLOSED = 2;

    constructor(url, options = {}) {
      this.url = url;
      this.options = options;
      this.readyState = CareMateScenarioEventSource.CONNECTING;
      this.listeners = new Map();
      this.onopen = null;
      this.onerror = null;
      this.onmessage = null;
      this._timers = [];

      this._timers.push(window.setTimeout(() => {
        this.readyState = CareMateScenarioEventSource.OPEN;
        this.onopen?.({ type: 'open' });
        this.emit('connected', {});
      }, 150));

      this._timers.push(window.setTimeout(() => {
        const token = parseTokenFromSseUrl(url);
        const firstUnread = repository
          .getNotificationsForToken(token)
          .find((item) => !item.isRead);
        if (firstUnread) this.emit('notification', firstUnread);
      }, 700));

      this._timers.push(window.setInterval(() => {
        if (this.readyState === CareMateScenarioEventSource.OPEN) {
          this.emit('heartbeat', {});
        }
      }, 15000));
    }

    addEventListener(type, listener) {
      const listeners = this.listeners.get(type) ?? [];
      listeners.push(listener);
      this.listeners.set(type, listeners);
    }

    removeEventListener(type, listener) {
      const listeners = this.listeners.get(type) ?? [];
      this.listeners.set(type, listeners.filter((item) => item !== listener));
    }

    emit(type, data = {}) {
      const event = {
        type,
        data: typeof data === 'string' ? data : JSON.stringify(data),
        lastEventId: String(data?.id ?? ''),
      };
      if (type === 'message') this.onmessage?.(event);
      for (const listener of this.listeners.get(type) ?? []) listener(event);
    }

    close() {
      this.readyState = CareMateScenarioEventSource.CLOSED;
      this._timers.forEach((timer) => window.clearTimeout(timer));
      this._timers = [];
    }
  }

  window.EventSource = CareMateScenarioEventSource;
  return () => {
    window.EventSource = NativeEventSource;
  };
}

export function installCareMateScenarioMocks() {
  if (window.__CARE_MATE_SCENARIO_MOCKS_INSTALLED__) return;
  window.__CARE_MATE_SCENARIO_MOCKS_INSTALLED__ = true;

  const repository = createRepository();

  const original = {
    get: apiClient.get.bind(apiClient),
    post: apiClient.post.bind(apiClient),
    patch: apiClient.patch.bind(apiClient),
    put: apiClient.put?.bind(apiClient),
  };

  apiClient.get = (url, config = {}) => {
    const path = normalizeUrl(url);
    try {
      return ok(repository.handleGet(path, config), { ...config, url });
    } catch (error) {
      if (error?.message === 'NOT_MOCKED') return original.get(url, config);
      throw error;
    }
  };

  apiClient.post = (url, body = {}, config = {}) => {
    const path = normalizeUrl(url);
    try {
      const result = repository.handlePost(path, body, config);
      if (result?.then) return result;
      return ok(result, { ...config, url, data: body });
    } catch (error) {
      if (error?.message === 'NOT_MOCKED') return original.post(url, body, config);
      throw error;
    }
  };

  apiClient.patch = (url, body = {}, config = {}) => {
    const path = normalizeUrl(url);
    try {
      return ok(repository.handlePatch(path, body, config), { ...config, url, data: body });
    } catch (error) {
      if (error?.message === 'NOT_MOCKED') return original.patch(url, body, config);
      throw error;
    }
  };

  apiClient.put = (url, body = {}, config = {}) => {
    const path = normalizeUrl(url);
    if (path === '/shop/profile') return ok({ ...body, updated: true }, { ...config, url, data: body });
    if (path === '/shop/operating-hours') return ok(body, { ...config, url, data: body });
    return original.put ? original.put(url, body, config) : ok({ updated: true }, { ...config, url, data: body });
  };

  installMockEventSource(repository);

  // 개발 중 바로 확인하기 쉽게 콘솔에 목업 계정 정보를 남깁니다.
  console.info('[CareMate Scenario Mock] enabled');
  console.info('[CareMate Scenario Mock] CUSTOMER test99@test.com / password any value');
  console.info('[CareMate Scenario Mock] SHOP     shop99@test.com / password any value');
}
