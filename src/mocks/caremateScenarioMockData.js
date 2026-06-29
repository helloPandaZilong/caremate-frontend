// CareMate Part3 시연용 목업 데이터
// 시나리오
// 1) test01@test.com 고객: 진행 중인 A/S가 수리완료(REPAIR_DONE) 상태이며 결제요청 알림(PAYMENT_REQUESTED)까지 표시
// 2) shop01@test.com 수리점: 예약 방문 1시간 전 노쇼 경고 알림(NO_SHOW_WARNING)까지 표시

const KST_OFFSET = '+09:00';

function pad(value) {
  return String(value).padStart(2, '0');
}

export function toKstIso(date = new Date()) {
  const kst = new Date(date.getTime() + 9 * 60 * 60 * 1000);
  return `${kst.getUTCFullYear()}-${pad(kst.getUTCMonth() + 1)}-${pad(kst.getUTCDate())}T${pad(kst.getUTCHours())}:${pad(kst.getUTCMinutes())}:${pad(kst.getUTCSeconds())}${KST_OFFSET}`;
}

export function minutesAgo(minutes) {
  return toKstIso(new Date(Date.now() - minutes * 60 * 1000));
}

export function minutesFromNow(minutes) {
  return toKstIso(new Date(Date.now() + minutes * 60 * 1000));
}

export const scenarioAccounts = [
  {
    memberId: 1001,
    role: 'CUSTOMER',
    name: '김민준',
    email: 'test99@test.com',
    password: 'test1234!',
    accessToken: 'mock-access-token-test01-customer',
    refreshToken: 'mock-refresh-token-test01-customer',
  },
  {
    memberId: 2001,
    role: 'REPAIR_SHOP',
    name: '박기술',
    email: 'shop99@test.com',
    password: 'test1234!',
    accessToken: 'mock-access-token-shop01-repair-shop',
    refreshToken: 'mock-refresh-token-shop01-repair-shop',
    repairShopId: 501,
    shopName: '강남 스마트케어',
  },
];

export const scenarioRepairShops = [
  {
    id: 501,
    memberId: 2001,
    shopName: '강남 스마트케어',
    businessNumber: '123-45-67890',
    address: '서울 강남구 테헤란로 123',
    latitude: 37.5012743,
    longitude: 127.039585,
    phone: '02-555-0101',
    status: 'ACTIVE',
    operatingSummary: '평일 10:00~19:00',
  },
];

export const scenarioOperatingHours = [
  { id: 1, repairShopId: 501, dayOfWeek: 1, openTime: '10:00', closeTime: '19:00', isClosed: false },
  { id: 2, repairShopId: 501, dayOfWeek: 2, openTime: '10:00', closeTime: '19:00', isClosed: false },
  { id: 3, repairShopId: 501, dayOfWeek: 3, openTime: '10:00', closeTime: '19:00', isClosed: false },
  { id: 4, repairShopId: 501, dayOfWeek: 4, openTime: '10:00', closeTime: '19:00', isClosed: false },
  { id: 5, repairShopId: 501, dayOfWeek: 5, openTime: '10:00', closeTime: '19:00', isClosed: false },
  { id: 6, repairShopId: 501, dayOfWeek: 6, openTime: '10:00', closeTime: '15:00', isClosed: false },
  { id: 7, repairShopId: 501, dayOfWeek: 0, openTime: null, closeTime: null, isClosed: true },
];

export const scenarioInsurancePolicies = [
  {
    id: 3001,
    memberId: 1001,
    insuranceProductId: 1,
    productName: 'KT 365 폰케어 파손형',
    providerType: 'TELECOM',
    providerName: 'KT',
    policyNumber: 'KT-TEST01-2026-0001',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    annualClaimCount: 0,
    annualClaimedAmount: 0,
    status: 'ACTIVE',
    coveragePerIncident: 800000,
    selfPayType: 'RATE',
    selfPayRate: 25,
    minSelfPayAmount: 30000,
  },
];

export function createScenarioRepairOrders() {
  const customerRepairDoneOrder = {
    id: 102,
    orderId: 102,
    orderNo: 'CM-TEST01-0102',
    memberId: 1001,
    repairShopId: 501,
    repairShopName: '강남 스마트케어',
    shopName: '강남 스마트케어',
    customerName: '김민준',
    customerPhone: '010-1001-1001',
    deviceModel: 'iPhone 15 Pro · 실버 256GB',
    damageDescription: '전면 액정 파손 및 터치 불량. 디스플레이 모듈 교체 필요.',
    reservedVisitAt: minutesAgo(160),
    status: 'REPAIR_DONE',
    createdAt: minutesAgo(240),
    updatedAt: minutesAgo(20),
    completedAt: minutesAgo(20),
    totalRepairCost: 700000,
    expectedRefundAmount: 595000,
  };

  const noShowWarningOrder = {
    id: 201,
    orderId: 201,
    orderNo: 'CM-SHOP01-0201',
    memberId: 1002,
    repairShopId: 501,
    repairShopName: '강남 스마트케어',
    shopName: '강남 스마트케어',
    customerName: '이수연',
    customerPhone: '010-2002-2002',
    deviceModel: 'Galaxy S24 Ultra · 티타늄 그레이',
    damageDescription: '후면 유리 파손 및 카메라 렌즈 스크래치. 방문 예약 1시간 전 노쇼 경고 대상.',
    reservedVisitAt: minutesFromNow(60),
    status: 'ACCEPTED',
    createdAt: minutesAgo(180),
    updatedAt: minutesAgo(170),
  };

  return [customerRepairDoneOrder, noShowWarningOrder];
}

export function createScenarioStatusHistories() {
  return {
    102: {
      orderId: 102,
      currentStatus: 'REPAIR_DONE',
      milestones: [
        { status: 'RECEIVED', displayName: '접수', label: '접수', reached: true, current: false, changedAt: minutesAgo(240), reachedAt: minutesAgo(240) },
        { status: 'ACCEPTED', displayName: '예약확정', label: '예약확정', reached: true, current: false, changedAt: minutesAgo(220), reachedAt: minutesAgo(220) },
        { status: 'IN_REPAIR', displayName: '수리중', label: '수리중', reached: true, current: false, changedAt: minutesAgo(80), reachedAt: minutesAgo(80) },
        { status: 'REPAIR_DONE', displayName: '수리완료', label: '수리완료', reached: true, current: true, changedAt: minutesAgo(20), reachedAt: minutesAgo(20) },
        { status: 'PAYMENT_COMPLETED', displayName: '결제완료', label: '결제완료', reached: false, current: false, changedAt: null, reachedAt: null },
        { status: 'CLAIM_REQUESTED', displayName: '청구요청', label: '청구요청', reached: false, current: false, changedAt: null, reachedAt: null },
        { status: 'CLAIM_COMPLETED', displayName: '청구패키지완료', label: '청구패키지완료', reached: false, current: false, changedAt: null, reachedAt: null },
      ],
      histories: [
        { id: 1, repairOrderId: 102, previousStatus: 'RECEIVED', changedStatus: 'RECEIVED', changedBy: 1001, note: '비대면 A/S 접수 완료', changedAt: minutesAgo(240) },
        { id: 2, repairOrderId: 102, previousStatus: 'RECEIVED', changedStatus: 'ACCEPTED', changedBy: 2001, note: '수리점 예약 확정', changedAt: minutesAgo(220) },
        { id: 3, repairOrderId: 102, previousStatus: 'ACCEPTED', changedStatus: 'IN_REPAIR', changedBy: 2001, note: '고객 방문 확인 및 수리 시작', changedAt: minutesAgo(80) },
        { id: 4, repairOrderId: 102, previousStatus: 'IN_REPAIR', changedStatus: 'REPAIR_DONE', changedBy: 2001, note: '수리 완료. 결제 요청 알림 발송', changedAt: minutesAgo(20) },
      ],
    },
    201: {
      orderId: 201,
      currentStatus: 'ACCEPTED',
      milestones: [
        { status: 'RECEIVED', displayName: '접수', label: '접수', reached: true, current: false, changedAt: minutesAgo(180), reachedAt: minutesAgo(180) },
        { status: 'ACCEPTED', displayName: '예약확정', label: '예약확정', reached: true, current: true, changedAt: minutesAgo(170), reachedAt: minutesAgo(170) },
        { status: 'IN_REPAIR', displayName: '수리중', label: '수리중', reached: false, current: false, changedAt: null, reachedAt: null },
        { status: 'REPAIR_DONE', displayName: '수리완료', label: '수리완료', reached: false, current: false, changedAt: null, reachedAt: null },
        { status: 'PAYMENT_COMPLETED', displayName: '결제완료', label: '결제완료', reached: false, current: false, changedAt: null, reachedAt: null },
        { status: 'CLAIM_REQUESTED', displayName: '청구요청', label: '청구요청', reached: false, current: false, changedAt: null, reachedAt: null },
        { status: 'CLAIM_COMPLETED', displayName: '청구패키지완료', label: '청구패키지완료', reached: false, current: false, changedAt: null, reachedAt: null },
      ],
      histories: [
        { id: 11, repairOrderId: 201, previousStatus: 'RECEIVED', changedStatus: 'RECEIVED', changedBy: 1002, note: '고객 비대면 A/S 접수', changedAt: minutesAgo(180) },
        { id: 12, repairOrderId: 201, previousStatus: 'RECEIVED', changedStatus: 'ACCEPTED', changedBy: 2001, note: '수리점 예약 확정. 방문 1시간 전 노쇼 경고 대상', changedAt: minutesAgo(170) },
      ],
    },
  };
}

export function createScenarioNotifications() {
  return [
    {
      id: 9002,
      memberId: 2001,
      repairOrderId: 201,
      type: 'NO_SHOW_WARNING',
      message: '예약 방문 1시간 전입니다. 고객이 방문하면 [수리 시작], 미방문이면 [노쇼 처리]를 눌러주세요.',
      isRead: false,
      read: false,
      createdAt: minutesAgo(1),
    },
    {
      id: 9001,
      memberId: 1001,
      repairOrderId: 102,
      type: 'PAYMENT_REQUESTED',
      message: '수리가 완료되었습니다. 총 수리비 700,000원을 결제해 주세요.',
      isRead: false,
      read: false,
      createdAt: minutesAgo(1),
    },
    {
      id: 9000,
      memberId: 1001,
      repairOrderId: 102,
      type: 'ORDER_ACCEPTED',
      message: '강남 스마트케어에서 예약을 확정했습니다.',
      isRead: true,
      read: true,
      createdAt: minutesAgo(220),
    },
  ];
}

export function createScenarioPaymentInfo() {
  return {
    102: {
      orderId: 102,
      orderNo: 'CM-TEST01-0102',
      status: 'REPAIR_DONE',
      partsCost: 420000,
      laborCost: 280000,
      totalRepairCost: 700000,
      expectedRefundAmount: 595000,
      paymentStatus: 'READY',
      report: {
        troubleDescription: '액정 파손으로 디스플레이 모듈을 교체했습니다.',
        repairSummary: '정품 OLED 디스플레이 모듈 교체 및 터치 동작 검수 완료',
      },
    },
  };
}
