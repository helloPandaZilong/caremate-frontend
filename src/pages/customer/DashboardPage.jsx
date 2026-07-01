import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router";
import {
  Bell,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CreditCard,
  FileText,
  Loader2,
  Phone,
  RefreshCw,
  Wrench,
} from "lucide-react";
import { Badge, Button, Card } from "../../components/shared";
import RepairStatusStepper, { OrderStatusHistoryList } from "../../components/monitoring/RepairStatusStepper";
import { NotificationList } from "../../components/notification/NotificationBell";
import { useNotificationSse } from "../../hooks/useNotificationSse";
import { getOrderStatusHistories } from "../../api/monitoringApi";
import { getCustomerRepairOrders } from "../../api/customerRepairOrderApi";
import { getNotifications, markNotificationRead } from "../../api/notificationApi";

const STATUS_LABEL = {
  RECEIVED: "접수",
  ACCEPTED: "예약확정",
  REJECTED: "접수반려",
  NO_SHOW: "노쇼",
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
};

const ACTIVE_STATUSES = new Set([
  "RECEIVED",
  "ACCEPTED",
  "IN_REPAIR",
  "REPAIR_DONE",
  "PAYMENT_COMPLETED",
  "CLAIM_REQUESTED",
]);

function toContent(data) {
  if (Array.isArray(data)) return data;
  return data?.content ?? [];
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

function SummaryAction({ order }) {
  if (!order) return null;

  if (order.status === "REPAIR_DONE") {
    return (
        <Link to={`/customer/payment/${order.id}`} className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:underline">
          <CreditCard className="w-4 h-4" /> 결제하러 가기
        </Link>
    );
  }
}

// Origin 쪽 카드 UI(접수번호·매장 연락 정보·파손 상세 아코디언)를 유지하되,
// 데이터는 timeline/latestOrder(=실 API·SSE 연동 state)에서만 공급받는다.
function ASRequestCard({ order }) {
  const [expanded, setExpanded] = useState(false);
  if (!order) return null;

  const shopName = order.shopName ?? order.repairShopName ?? null;

  return (
      <Card className="p-5 flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2">
            <Wrench className="w-4 h-4 text-accent" />
            <h2 className="text-sm font-semibold text-foreground">진행 중인 A/S</h2>
          </div>
          <Badge variant={STATUS_BADGE[order.status] ?? "muted"}>
            {STATUS_LABEL[order.status] ?? order.status}
          </Badge>
        </div>

        <div className="flex items-center gap-3 bg-secondary rounded-xl p-3">
          <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
            <Phone className="w-5 h-5 text-accent" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">
              접수번호: {order.orderNo ?? `주문 #${order.id}`}
            </p>
            {shopName && <p className="text-xs text-muted-foreground">{shopName}</p>}
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
                  onClick={() => setExpanded(!expanded)}
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

        <SummaryAction order={order} />
      </Card>
  );
}

export default function CustomerDashboard() {
  const [latestOrder, setLatestOrder] = useState(null);
  const [timeline, setTimeline] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const notificationPage = await getNotifications({ page: 0, size: 5 });
      setNotifications(toContent(notificationPage));

      let selectedOrder = null;
      let selectedOrderId = localStorage.getItem("caremate-current-order-id");

      try {
        const orderPage = await getCustomerRepairOrders({ page: 0, size: 10 });
        const orders = toContent(orderPage);
        selectedOrder = orders.find((order) => ACTIVE_STATUSES.has(order.status)) ?? orders[0] ?? null;
        if (selectedOrder?.id) {
          selectedOrderId = String(selectedOrder.id);
          localStorage.setItem("caremate-current-order-id", selectedOrderId);
        }
      } catch {
        // 접수 목록 API가 아직 미구현이어도, 저장된 orderId로 조회를 계속 시도한다.
      }

      if (!selectedOrderId) {
        setLatestOrder(null);
        setTimeline(null);
        return;
      }

      const statusData = await getOrderStatusHistories(selectedOrderId);
      setTimeline(statusData);

      setLatestOrder({
        id: selectedOrderId,
        orderNo: selectedOrder?.orderNo ?? statusData.orderNo,
        status: statusData.currentStatus ?? selectedOrder?.status,
        shopName: selectedOrder?.shopName ?? selectedOrder?.repairShopName ?? statusData.shopName,
        reservedVisitAt: selectedOrder?.reservedVisitAt ?? statusData.reservedVisitAt,
        createdAt: selectedOrder?.createdAt ?? statusData.createdAt,
        damageDescription: selectedOrder?.damageDescription ?? statusData.damageDescription,
      });
    } catch (e) {
      setError(
          `${e.response?.status ?? ""} ${e.config?.url ?? ""} ${
              e.message || "대시보드 데이터를 불러오지 못했습니다."
          }`
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // 상태 이력이 정적으로 한 번만 조회되던 Origin 방식과 달리,
  // SSE로 상태 전이 알림이 들어오면 그 즉시 타임라인(milestones/histories)을 재조회해
  // 스테퍼·이력 리스트가 실시간으로 갱신되도록 연동한다.
  const handleSseNotification = useCallback((notification) => {
    setNotifications((prev) => [notification, ...prev.filter((item) => item.id !== notification.id)].slice(0, 5));
    setTimeout(() => {
      getNotifications({ page: 0, size: 5 })
          .then((page) => setNotifications(toContent(page)))
          .catch(() => {});
    }, 300);

    if (notification.repairOrderId) {
      localStorage.setItem("caremate-current-order-id", String(notification.repairOrderId));
      getOrderStatusHistories(notification.repairOrderId)
          .then((statusData) => {
            setTimeline(statusData);
            setLatestOrder((prev) => ({
              ...(prev ?? {}),
              id: String(notification.repairOrderId),
              orderNo: prev?.orderNo ?? statusData.orderNo,
              status: statusData.currentStatus,
              shopName: prev?.shopName ?? statusData.shopName,
              reservedVisitAt: prev?.reservedVisitAt ?? statusData.reservedVisitAt,
              createdAt: prev?.createdAt ?? statusData.createdAt,
              damageDescription: prev?.damageDescription ?? statusData.damageDescription,
            }));
          })
          .catch(() => {});
    }
  }, []);

  const { connectionState } = useNotificationSse({
    enabled: true,
    onNotification: handleSseNotification,
  });

  const handleRead = async (notification) => {
    if (!notification?.id || notification.isRead || notification.read) return;
    setNotifications((prev) => prev.map((item) => (item.id === notification.id ? { ...item, isRead: true, read: true } : item)));
    try {
      await markNotificationRead(notification.id);
    } catch {
      await load();
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
          <Button variant="secondary" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            새로고침
          </Button>
        </div>

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

              {timeline && (
                  <section id="repair-status-section" className="scroll-mt-24 flex flex-col gap-6">
                    <RepairStatusStepper milestones={timeline.milestones} currentStatus={timeline.currentStatus} />
                    <OrderStatusHistoryList histories={timeline.histories} />
                  </section>
              )}
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
          <NotificationList items={notifications} onRead={handleRead} compact />
        </Card>
      </div>
  );
}