import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router";
import { Bell, CheckCircle2, CreditCard, FileText, Loader2, RefreshCw, Wrench } from "lucide-react";
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

  return (
      <Link to={`/customer/repair-orders/${order.id}/status`} className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:underline">
        <FileText className="w-4 h-4" /> 상세 타임라인 보기
      </Link>
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

      const savedOrderId = localStorage.getItem("caremate-current-order-id");

      if (!savedOrderId) {
        setLatestOrder(null);
        setTimeline(null);
        return;
      }

      const statusData = await getOrderStatusHistories(savedOrderId);
      setTimeline(statusData);

      setLatestOrder({
        id: savedOrderId,
        orderNo: statusData.orderNo,
        status: statusData.currentStatus,
        reservedVisitAt: statusData.reservedVisitAt,
        createdAt: statusData.createdAt,
        damageDescription: statusData.damageDescription,
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

  const handleSseNotification = useCallback((notification) => {
    setNotifications((prev) => [notification, ...prev.filter((item) => item.id !== notification.id)].slice(0, 5));
    if (notification.repairOrderId && latestOrder?.id && String(notification.repairOrderId) === String(latestOrder.id)) {
      getOrderStatusHistories(latestOrder.id).then(setTimeline).catch(() => {});
    }
  }, [latestOrder?.id]);

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
              <Card className="p-5 flex flex-col gap-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Wrench className="w-4 h-4 text-accent" />
                      <h2 className="text-sm font-semibold text-foreground">진행 중인 A/S</h2>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{latestOrder.orderNo ?? `주문 #${latestOrder.id}`}</p>
                  </div>
                  <Badge variant={STATUS_BADGE[latestOrder.status] ?? "muted"}>
                    {STATUS_LABEL[latestOrder.status] ?? latestOrder.status}
                  </Badge>
                </div>

                <div className="grid sm:grid-cols-2 gap-3 text-sm">
                  <div className="rounded-xl bg-secondary border border-border p-3">
                    <p className="text-xs text-muted-foreground">방문 예약</p>
                    <p className="font-medium text-foreground mt-1">{formatDateTime(latestOrder.reservedVisitAt)}</p>
                  </div>
                  <div className="rounded-xl bg-secondary border border-border p-3">
                    <p className="text-xs text-muted-foreground">접수 일시</p>
                    <p className="font-medium text-foreground mt-1">{formatDateTime(latestOrder.createdAt)}</p>
                  </div>
                </div>

                {latestOrder.damageDescription && (
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                      {latestOrder.damageDescription}
                    </p>
                )}

                <SummaryAction order={latestOrder} />
              </Card>

              {timeline && (
                  <>
                    <RepairStatusStepper milestones={timeline.milestones} currentStatus={timeline.currentStatus} />
                    <OrderStatusHistoryList histories={timeline.histories} />
                  </>
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
