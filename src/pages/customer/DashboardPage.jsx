import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router";
import {
  Bell,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CreditCard,
  ListFilter,
  Loader2,
  Phone,
  RefreshCw,
  Wrench,
  X as XIcon,
} from "lucide-react";
import { Badge, Button, Card } from "../../components/shared";
import ShopReviewCard from "../../components/ShopReviewCard";
import RepairStatusStepper, {
  OrderStatusHistoryList,
} from "../../components/monitoring/RepairStatusStepper";
import { NotificationList } from "../../components/notification/NotificationBell";
import { useNotificationSse } from "../../hooks/useNotificationSse";
import { getOrderStatusHistories } from "../../api/monitoringApi";
import { getCustomerRepairOrders } from "../../api/customerRepairOrderApi";
import { getNotifications, markNotificationRead } from "../../api/notificationApi";
import { useAuth } from "../../contexts/AuthContext";

const REVIEWABLE_STATUSES = [
  "PAYMENT_COMPLETED",
  "CLAIM_REQUESTED",
  "CLAIM_COMPLETED",
  "RECEIPT_UPLOADED",
];

const STATUS_LABEL = {
  RECEIVED: "접수",
  ACCEPTED: "예약확정",
  REJECTED: "접수반려",
  NO_SHOW: "노쇼",
  REPAIR_IMPOSSIBLE: "수리불가",
  IN_REPAIR: "수리중",
  REPAIR_DONE: "수리완료·결제대기",
  PAYMENT_COMPLETED: "결제완료",
  CLAIM_REQUESTED: "청구요청",
  CLAIM_COMPLETED: "청구완료",
};

const STATUS_BADGE = {
  RECEIVED: "yellow",
  ACCEPTED: "accent",
  IN_REPAIR: "teal",
  REPAIR_DONE: "green",
  PAYMENT_COMPLETED: "green",
  CLAIM_REQUESTED: "accent",
  CLAIM_COMPLETED: "green",
  REJECTED: "red",
  NO_SHOW: "red",
  REPAIR_IMPOSSIBLE: "red",
};

const ACTIVE_STATUSES = new Set([
  "RECEIVED",
  "ACCEPTED",
  "IN_REPAIR",
  "REPAIR_DONE",
  "PAYMENT_COMPLETED",
  "CLAIM_REQUESTED",
]);

function getContent(pageData) {
  if (Array.isArray(pageData)) return pageData;
  return pageData?.content ?? [];
}

function formatDateTime(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value).replace("T", " ").slice(0, 16);
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function pickDashboardOrder(orders, savedOrderId) {
  if (!orders.length) return null;
  const saved = savedOrderId
      ? orders.find((order) => String(order.id) === String(savedOrderId))
      : null;
  return saved ?? orders.find((order) => ACTIVE_STATUSES.has(order.status)) ?? orders[0];
}

function buildOrderForTimeline(order, timeline) {
  if (!order && !timeline) return null;
  return {
    ...(order ?? {}),
    id: order?.id ?? timeline?.orderId,
    orderNo: order?.orderNo ?? timeline?.orderNo,
    status: timeline?.currentStatus ?? order?.status,
    shopName: order?.shopName ?? order?.repairShopName ?? timeline?.shopName,
    reservedVisitAt: order?.reservedVisitAt ?? timeline?.reservedVisitAt,
    createdAt: order?.createdAt ?? timeline?.createdAt,
    damageDescription: order?.damageDescription ?? timeline?.damageDescription,
  };
}

function ASRequestCard({ order }) {
  const [expanded, setExpanded] = useState(false);
  if (!order) return null;

  const shopName = order.shopName ?? order.repairShopName ?? "-";

  return (
      <div className="flex flex-col gap-6">
      <Card className="p-5 flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2">
            <Wrench className="w-4 h-4 text-accent" />
            <h2 className="text-sm font-semibold text-foreground">진행 중인 A/S</h2>
          </div>
          <Badge variant={STATUS_BADGE[order.status] ?? "muted"}>
            {STATUS_LABEL[order.status] ?? order.status ?? "상태 없음"}
          </Badge>
        </div>

        <div className="flex items-center gap-3 bg-secondary rounded-xl p-3">
          <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
            <Phone className="w-5 h-5 text-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">
              접수번호: {order.orderNo ?? `주문 #${order.id}`}
            </p>
            <p className="text-xs text-muted-foreground truncate">{shopName}</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl bg-secondary border border-border p-3">
            <p className="text-xs text-muted-foreground">방문 예약</p>
            <p className="font-medium text-foreground mt-1">{formatDateTime(order.reservedVisitAt)}</p>
          </div>
          <div className="rounded-xl bg-secondary border border-border p-3">
            <p className="text-xs text-muted-foreground">접수 일시</p>
            <p className="font-medium text-foreground mt-1">{formatDateTime(order.createdAt)}</p>
          </div>
        </div>

        {order.damageDescription && (
            <>
              <button
                  type="button"
                  onClick={() => setExpanded((value) => !value)}
                  className="flex items-center justify-between py-2 px-3 bg-secondary rounded-xl text-xs font-medium text-foreground hover:bg-secondary/80 transition-colors"
              >
                <span>파손 상세 내역</span>
                {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {expanded && (
                  <p className="text-xs text-muted-foreground px-1 whitespace-pre-line">
                    {order.damageDescription}
                  </p>
              )}
            </>
        )}

        {order.status === "REPAIR_DONE" && (
            <Link
                to={`/customer/payment/${order.id}`}
                className="inline-flex items-center gap-2 self-end text-sm font-semibold text-accent hover:underline"
            >
              <CreditCard className="w-4 h-4" />
              결제하러 가기
            </Link>
        )}
      </Card>

      {REVIEWABLE_STATUSES.includes(order.status) && (
          <ShopReviewCard orderId={order.id} shopName={order.shopName ?? order.repairShopName} />
      )}
      </div>
  );
}

function OrderPickerModal({ orders, loading, selectedId, onSelect, onClose }) {
  return (
      <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
      >
        <div
            className="bg-card rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col"
            onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-center justify-between p-5 border-b border-border shrink-0">
            <h3 className="text-base font-semibold text-foreground">내 접수건</h3>
            <button
                type="button"
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <XIcon className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
            {loading && (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="w-5 h-5 animate-spin text-accent" />
                </div>
            )}
            {!loading && orders.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-10">
                  접수 내역이 없습니다.
                </p>
            )}
            {!loading &&
                orders.map((order) => (
                    <button
                        type="button"
                        key={order.id}
                        onClick={() => onSelect(order)}
                        className={`flex flex-col gap-1.5 p-4 rounded-xl border text-left transition-all ${
                            String(order.id) === String(selectedId)
                                ? "border-accent bg-accent/10"
                                : "border-border hover:border-accent/30 hover:bg-secondary"
                        }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-foreground">
                    {order.orderNo ?? `주문 #${order.id}`}
                  </span>
                        <Badge variant={STATUS_BADGE[order.status] || "muted"}>
                          {STATUS_LABEL[order.status] || order.status}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                        <span>{order.shopName ?? order.repairShopName ?? "-"}</span>
                        <span>{formatDateTime(order.createdAt).slice(0, 12)}</span>
                      </div>
                    </button>
                ))}
          </div>
        </div>
      </div>
  );
}

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [latestOrder, setLatestOrder] = useState(null);
  const [timeline, setTimeline] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [allOrders, setAllOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const loadTimelineForOrder = useCallback(async (orderOrId) => {
    const orderId = typeof orderOrId === "object" ? orderOrId?.id : orderOrId;
    if (!orderId) {
      setLatestOrder(null);
      setTimeline(null);
      return;
    }

    const nextTimeline = await getOrderStatusHistories(orderId);
    setTimeline(nextTimeline);
    setLatestOrder(buildOrderForTimeline(typeof orderOrId === "object" ? orderOrId : null, nextTimeline));
    localStorage.setItem("caremate-current-order-id", String(orderId));
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [notificationPage, orderPage] = await Promise.all([
        getNotifications({ page: 0, size: 5 }),
        getCustomerRepairOrders({ page: 0, size: 20 }),
      ]);

      setNotifications(getContent(notificationPage));

      const orders = getContent(orderPage);
      const selectedOrder = pickDashboardOrder(
          orders,
          localStorage.getItem("caremate-current-order-id"),
      );

      if (selectedOrder?.id) {
        await loadTimelineForOrder(selectedOrder);
      } else {
        setLatestOrder(null);
        setTimeline(null);
      }
    } catch (e) {
      setError(e.message || "대시보드 데이터를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [loadTimelineForOrder]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSseNotification = useCallback((notification) => {
    if (!notification?.id) return;
    setNotifications((prev) => [
      { ...notification, isRead: false },
      ...prev.filter((item) => item.id !== notification.id),
    ].slice(0, 5));

    if (notification.repairOrderId) {
      loadTimelineForOrder(notification.repairOrderId).catch(() => {});
    }
  }, [loadTimelineForOrder]);

  const { connectionState } = useNotificationSse({
    enabled: true,
    onNotification: handleSseNotification,
  });

  const handleRead = async (notification) => {
    if (!notification?.id || notification.isRead || notification.read) return;
    setNotifications((prev) => prev.map((item) => (
        item.id === notification.id ? { ...item, isRead: true, read: true } : item
    )));
    try {
      await markNotificationRead(notification.id);
    } catch {
      await load();
    }
  };

  const openPicker = async () => {
    setPickerOpen(true);
    setOrdersLoading(true);
    try {
      const pageData = await getCustomerRepairOrders({ page: 0, size: 50 });
      setAllOrders(getContent(pageData));
    } catch {
      setAllOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleSelectOrder = async (order) => {
    setPickerOpen(false);
    setLoading(true);
    setError("");
    try {
      await loadTimelineForOrder(order);
    } catch (e) {
      setError(e.message || "선택한 접수건의 상태 이력을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="flex flex-col gap-6 max-w-5xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-foreground">대시보드</h1>
            <p className="text-sm text-muted-foreground mt-1">
              접수부터 수리중, 수리완료, 결제대기, 청구 완료까지 실시간으로 확인합니다.
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button variant="secondary" size="sm" onClick={openPicker} disabled={loading}>
              <ListFilter className="w-4 h-4" />
              내 접수건
            </Button>
            <Button variant="secondary" size="sm" onClick={load} disabled={loading}>
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              새로고침
            </Button>
          </div>
        </div>

        {pickerOpen && (
            <OrderPickerModal
                orders={allOrders}
                loading={ordersLoading}
                selectedId={latestOrder?.id}
                onSelect={handleSelectOrder}
                onClose={() => setPickerOpen(false)}
            />
        )}

        {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
        )}

        {loading ? (
            <Card className="p-8 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              데이터를 불러오는 중입니다.
            </Card>
        ) : latestOrder ? (
            <>
              <ASRequestCard order={latestOrder} />
              <section id="repair-status-section" className="scroll-mt-24 flex flex-col gap-6">
                <RepairStatusStepper
                    milestones={timeline?.milestones}
                    currentStatus={timeline?.currentStatus ?? latestOrder?.status}
                />
                <OrderStatusHistoryList histories={timeline?.histories ?? []} />
              </section>
            </>
        ) : (
            <Card className="p-8 text-center flex flex-col items-center gap-4">
              <CheckCircle2 className="w-10 h-10 text-muted-foreground" />
              <div>
                <h2 className="text-base font-semibold text-foreground">진행 중인 A/S가 없습니다.</h2>
                <p className="text-sm text-muted-foreground mt-1">새 비대면 A/S 접수를 시작해보세요.</p>
              </div>
              <Link to="/customer/request">
                <Button variant="accent">새 A/S 접수</Button>
              </Link>
            </Card>
        )}

        <Card className="overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-accent" />
              <h2 className="text-sm font-semibold text-foreground">최근 실시간 알림</h2>
            </div>
            <span className="text-[11px] text-muted-foreground">
            {connectionState === "connected" ? "SSE 연결됨" : "SSE 대기/재연결 중"}
          </span>
          </div>
          <NotificationList
              items={notifications}
              onRead={handleRead}
              compact
              role={user?.role}
          />
          <div className="px-5 py-3 border-t border-border text-center">
            <Link to="/notifications" className="text-xs font-semibold text-accent hover:underline">
              전체 알림 보기
            </Link>
          </div>
        </Card>
      </div>
  );
}
