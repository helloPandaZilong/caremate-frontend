export const mockRepairShops = [
  {
    id: 5,
    memberId: 50,
    shopName: 'CareMate 강남센터',
    businessNumber: '123-45-67890',
    address: '서울 강남구 테헤란로 123',
    latitude: 37.5012743,
    longitude: 127.039585,
    phone: '02-123-4567',
    status: 'ACTIVE',
    operatingSummary: '평일 10:00~19:00',
  },
  {
    id: 6,
    memberId: 51,
    shopName: 'CareMate 홍대센터',
    businessNumber: '234-56-78901',
    address: '서울 마포구 양화로 45',
    latitude: 37.5563,
    longitude: 126.9236,
    phone: '02-987-6543',
    status: 'ACTIVE',
    operatingSummary: '평일 09:30~18:30',
  },
];

export const mockOperatingHours = [
  { id: 1, repairShopId: 5, dayOfWeek: 1, openTime: '10:00', closeTime: '19:00', isClosed: false },
  { id: 2, repairShopId: 5, dayOfWeek: 2, openTime: '10:00', closeTime: '19:00', isClosed: false },
  { id: 3, repairShopId: 5, dayOfWeek: 3, openTime: '10:00', closeTime: '19:00', isClosed: false },
  { id: 4, repairShopId: 5, dayOfWeek: 4, openTime: '10:00', closeTime: '19:00', isClosed: false },
  { id: 5, repairShopId: 5, dayOfWeek: 5, openTime: '10:00', closeTime: '19:00', isClosed: false },
  { id: 6, repairShopId: 5, dayOfWeek: 6, openTime: null, closeTime: null, isClosed: true },
  { id: 7, repairShopId: 5, dayOfWeek: 0, openTime: null, closeTime: null, isClosed: true },
];

export const mockInsuranceProducts = [
  {
    id: 1,
    productName: 'KT 365 폰케어 2025(파손형)',
    providerType: 'TELECOM',
    providerName: 'KT',
    billingAmount: 5900,
    monthlyFeeEquivalent: 5900,
    coveragePerIncident: 800000,
    annualLimit: 800000,
    annualClaimLimit: 5,
    selfPayType: 'RATE',
    selfPayRate: 25,
    selfPayAmount: 0,
    minSelfPayAmount: 30000,
    claimChannelType: 'WEBSITE',
    claimChannelValue: 'https://kt.example.com/claim',
    summaryNote: '파손 수리비 25% 자기부담',
  },
  {
    id: 4,
    productName: '하나카드 휴대폰케어',
    providerType: 'CARD',
    providerName: '하나카드',
    billingAmount: 1800,
    monthlyFeeEquivalent: 1800,
    coveragePerIncident: 100000,
    annualLimit: 100000,
    annualClaimLimit: 1,
    selfPayType: 'FIXED',
    selfPayRate: 0,
    selfPayAmount: 30000,
    minSelfPayAmount: 0,
    claimChannelType: 'KAKAO',
    claimChannelValue: '하나카드 휴대폰케어 채널',
    summaryNote: '잔여 수리비 보충 보상',
  },
];

export const mockInsurancePolicies = [
  {
    id: 10,
    memberId: 42,
    insuranceProductId: 1,
    productName: 'KT 365 폰케어 2025(파손형)',
    providerType: 'TELECOM',
    providerName: 'KT',
    policyNumber: 'KT-POLICY-2026-0010',
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
  {
    id: 21,
    memberId: 42,
    insuranceProductId: 4,
    productName: '하나카드 휴대폰케어',
    providerType: 'CARD',
    providerName: '하나카드',
    policyNumber: 'HANA-POLICY-2026-0021',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    annualClaimCount: 0,
    annualClaimedAmount: 0,
    status: 'ACTIVE',
    coveragePerIncident: 100000,
    selfPayType: 'FIXED',
    selfPayAmount: 30000,
  },
];

export const mockRepairOrders = [
  {
    id: 101,
    orderId: 101,
    orderNo: 'CM-20260629-0001',
    memberId: 42,
    repairShopId: 5,
    repairShopName: 'CareMate 강남센터',
    customerName: '홍길동',
    damageDescription: '액정 파손으로 터치가 되지 않습니다.',
    reservedVisitAt: '2026-06-30T10:00:00+09:00',
    status: 'REPAIR_DONE',
    createdAt: '2026-06-29T09:00:00+09:00',
    updatedAt: '2026-06-29T11:30:00+09:00',
    totalRepairCost: 700000,
  },
  {
    id: 102,
    orderId: 102,
    orderNo: 'CM-20260629-0002',
    memberId: 42,
    repairShopId: 6,
    repairShopName: 'CareMate 홍대센터',
    customerName: '홍길동',
    damageDescription: '후면 유리 파손 및 카메라 렌즈 스크래치가 있습니다.',
    reservedVisitAt: '2026-07-01T14:00:00+09:00',
    status: 'ACCEPTED',
    createdAt: '2026-06-29T12:00:00+09:00',
    updatedAt: '2026-06-29T12:15:00+09:00',
  },
];

export const mockStatusHistories = {
  currentStatus: 'REPAIR_DONE',
  milestones: [
    { status: 'RECEIVED', displayName: '접수', reached: true, current: false, changedAt: '2026-06-29T09:00:00+09:00' },
    { status: 'ACCEPTED', displayName: '예약확정', reached: true, current: false, changedAt: '2026-06-29T09:30:00+09:00' },
    { status: 'IN_REPAIR', displayName: '수리중', reached: true, current: false, changedAt: '2026-06-29T10:20:00+09:00' },
    { status: 'REPAIR_DONE', displayName: '수리완료', reached: true, current: true, changedAt: '2026-06-29T11:30:00+09:00' },
    { status: 'PAYMENT_COMPLETED', displayName: '결제완료', reached: false, current: false, changedAt: null },
    { status: 'CLAIM_REQUESTED', displayName: '청구요청', reached: false, current: false, changedAt: null },
    { status: 'CLAIM_COMPLETED', displayName: '청구완료', reached: false, current: false, changedAt: null },
  ],
  histories: [
    { id: 1, repairOrderId: 101, previousStatus: 'RECEIVED', changedStatus: 'ACCEPTED', changedBy: 50, note: '수리점 접수 수락', changedAt: '2026-06-29T09:30:00+09:00' },
    { id: 2, repairOrderId: 101, previousStatus: 'ACCEPTED', changedStatus: 'IN_REPAIR', changedBy: 50, note: '기기 입고 및 수리 시작', changedAt: '2026-06-29T10:20:00+09:00' },
    { id: 3, repairOrderId: 101, previousStatus: 'IN_REPAIR', changedStatus: 'REPAIR_DONE', changedBy: 50, note: '정형 리포트 등록 완료', changedAt: '2026-06-29T11:30:00+09:00' },
  ],
};

export const mockNotifications = [
  {
    id: 10482,
    memberId: 42,
    repairOrderId: 101,
    type: 'PAYMENT_REQUESTED',
    message: '수리 완료 - 결제를 진행해 주세요.',
    isRead: false,
    createdAt: '2026-06-29T11:30:10+09:00',
  },
  {
    id: 10481,
    memberId: 42,
    repairOrderId: 101,
    type: 'ACCEPTED',
    message: 'CareMate 강남센터에서 접수를 수락했습니다.',
    isRead: true,
    createdAt: '2026-06-29T09:30:05+09:00',
  },
];

export const mockPaymentInfo = {
  orderId: 101,
  orderNo: 'CM-20260629-0001',
  status: 'REPAIR_DONE',
  partsCost: 350000,
  laborCost: 350000,
  totalRepairCost: 700000,
  expectedRefundAmount: 595000,
  report: {
    troubleDescription: '액정 파손으로 디스플레이 모듈을 교체했습니다.',
  },
};

export const mockExpectedClaims = [
  { claimId: 1, providerType: 'TELECOM', providerName: 'KT', claimOrder: 1, expectedAmount: 525000, status: 'CALCULATED' },
  { claimId: 2, providerType: 'CARD', providerName: '하나카드', claimOrder: 2, expectedAmount: 70000, status: 'CALCULATED' },
];

export const mockProfile = {
  memberId: 42,
  role: 'CUSTOMER',
  name: '홍길동',
  email: 'customer@caremate.test',
  phone: '010-1234-5678',
};
