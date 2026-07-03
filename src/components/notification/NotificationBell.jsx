import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { useAuth } from "../../contexts/AuthContext";
import {
  AlertCircle,
  Award,
  Bell,
  CheckCircle2,
  Clock,
  CreditCard,
  FileText,
  PackageCheck,
  RefreshCw,
  Wrench,
  Store,
  Receipt,
} from "lucide-react";
import {
  getNotifications,
  getUnreadCount,
  markNotificationRead,
} from "../../api/notificationApi";
import { useNotificationSse } from "../../hooks/useNotificationSse";

const TYPE_META = {
  ORDER_RECEIVED: { label: "접수 완료", icon: FileText, color: "text-blue-500" },
  ORDER_ACCEPTED: { label: "예약 확정", icon: CheckCircle2, color: "text-green-500" },
  ORDER_REJECTED: { label: "접수 반려", icon: AlertCircle, color: "text-red-500" },
  NO_SHOW_WARNING: { label: "노쇼 예정", icon: AlertCircle, color: "text-amber-500" },
  NO_SHOW: { label: "노쇼", icon: AlertCircle, color: "text-amber-500" },
  PAYMENT_REQUESTED: { label: "결제 요청", icon: CreditCard, color: "text-blue-500" },
  PAYMENT_COMPLETED: { label: "결제 완료", icon: CheckCircle2, color: "text-teal-500" },
  ESTIMATED_CLAIM_NOTICE: { label: "예상 환급", icon: Award, color: "text-amber-500" },
  CLAIM_DISPATCH_SUCCESS: { label: "청구 패키지 완료", icon: PackageCheck, color: "text-green-500" },
  CLAIM_DISPATCH_FAILED: { label: "청구 패키지 실패", icon: AlertCircle, color: "text-red-500" },
  BATCH_COMPLETED: { label: "배치 완료", icon: Wrench, color: "text-purple-500" },
  BATCH_FAILED: {label: "월말 정산 실패", icon: AlertCircle, color: "text-red-500",},
  FEE_CHARGE_REQUESTED: {label: "수수료 납부 요청", icon: CreditCard, color: "text-red-500",},
  FEE_PAYMENT_DUE_SOON: {label: "납부 마감 임박", icon: AlertCircle, color: "text-amber-500",},
  SHOP_SIGNUP_REQUESTED: {label: "가입 요청",icon: Store,color: "text-amber-500",},
};

function getPageContent(pageData) {
  if (Array.isArray(pageData)) return pageData;
  return pageData?.content ?? [];
}

function formatDateTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value).replace("T", " ").slice(0, 16);
  return new Intl.DateTimeFormat("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getDetailHref(notification, role) {
  const type = notification?.type;
  const orderId = notification?.repairOrderId;

  if (role === "CUSTOMER") {
    switch (type) {
      case "PAYMENT_REQUESTED":
      case "PAYMENT_COMPLETED":
      case "ESTIMATED_CLAIM_NOTICE":
      case "CLAIM_DISPATCH_SUCCESS":
      case "CLAIM_DISPATCH_FAILED":
        return orderId ? `/customer/payment/${orderId}` : "/customer/dashboard";

      case "ORDER_ACCEPTED":
      case "ORDER_RECEIVED":
      case "ORDER_REJECTED":
      case "NO_SHOW":
        return "/customer/dashboard";

      default:
        return orderId ? "/customer/dashboard" : "/notifications";
    }
  }

  if (role === "REPAIR_SHOP") {
    switch (type) {
      case "NO_SHOW_WARNING":
      case "NO_SHOW":
      case "ORDER_RECEIVED":
        return "/shop/orders";

      case "BATCH_COMPLETED":
      case "FEE_CHARGE_REQUESTED":
      case "FEE_PAYMENT_DUE_SOON":
        return "/shop/settlement";

      case "REPAIR_SHOP_APPROVED":
        return "/shop/profile";

      case "ORDER_ACCEPTED":
      case "ORDER_REJECTED":
      case "PAYMENT_REQUESTED":
      case "PAYMENT_COMPLETED":
        return orderId ? `/shop/orders/${orderId}` : "/shop/orders";

      default:
        return orderId ? `/shop/orders/${orderId}` : "/shop/dashboard";
    }
  }

  if (role === "ADMIN") {
    switch (type) {
      case "BATCH_COMPLETED":
      case "BATCH_FAILED":
        return "/admin/settlements";

      case "CLAIM_DISPATCH_FAILED":
        return "/admin/audit";

      case "SHOP_SIGNUP_REQUESTED":
      case "REPAIR_SHOP_APPROVED":
        return "/admin/shop-approvals";

      default:
        return "/admin/dashboard";
    }
  }

  return "/notifications";
}

function NotificationRow({ notification, onRead, onNavigate, compact = false, role }) {
  const meta = TYPE_META[notification.type] ?? {
    label: notification.type ?? "알림",
    icon: Bell,
    color: "text-muted-foreground",
  };
  const Icon = meta.icon;
  const read = Boolean(notification.isRead ?? notification.read);

  return (
      <Link
          to={getDetailHref(notification, role)}
          onClick={() => {
            onRead?.(notification);
            onNavigate?.();
          }}
          className={`flex gap-3 px-4 py-3 border-b border-border last:border-0 transition-colors ${read ? "opacity-60 hover:opacity-90" : "hover:bg-secondary"}`}
      >
        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${read ? "bg-muted" : "bg-secondary"}`}>
          <Icon className={`w-4 h-4 ${read ? "text-muted-foreground" : meta.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`text-[11px] font-semibold ${read ? "text-muted-foreground" : "text-accent"}`}>{meta.label}</span>
            {!read && <span className="w-1.5 h-1.5 rounded-full bg-accent" />}
          </div>
          <p className={`mt-1 text-xs leading-relaxed ${read ? "text-muted-foreground" : "text-foreground font-medium"}`}>
            {notification.message}
          </p>
          {!compact && notification.repairOrderId && (
              <p className="mt-1 text-[10px] text-muted-foreground">주문 ID: {notification.repairOrderId}</p>
          )}
          <div className="flex items-center gap-1.5 mt-1.5 text-[10px] text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>{formatDateTime(notification.createdAt)}</span>
          </div>
        </div>
      </Link>
  );
}

export function NotificationList({ items, onRead, onNavigate, compact = false, role }) {
  if (!items?.length) {
    return (
        <div className="py-10 text-center text-sm text-muted-foreground">
          수신된 알림이 없습니다.
        </div>
    );
  }

  return items.map((notification) => (
      <NotificationRow
          key={notification.id}
          notification={notification}
          onRead={onRead}
          onNavigate={onNavigate}
          compact={compact}
          role={role}
      />
  ));
}

export default function NotificationBell() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const dropdownRef = useRef(null);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [page, count] = await Promise.all([
        getNotifications({ page: 0, size: 5 }),
        getUnreadCount(),
      ]);
      setItems(getPageContent(page));
      setUnreadCount(count);
    } catch (e) {
      setError(e.message || "알림을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    function handleClick(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSseNotification = useCallback((notification) => {
    setItems((prev) => [notification, ...prev.filter((item) => item.id !== notification.id)].slice(0, 5));
    setUnreadCount((prev) => prev + 1);
  }, []);

  const { connectionState } = useNotificationSse({
    enabled: true,
    onNotification: handleSseNotification,
  });

  const handleRead = async (notification) => {
    if (!notification?.id || notification.isRead || notification.read) return;
    setItems((prev) => prev.map((item) => (item.id === notification.id ? { ...item, isRead: true, read: true } : item)));
    setUnreadCount((prev) => Math.max(prev - 1, 0));
    try {
      await markNotificationRead(notification.id);
    } catch {
      await loadNotifications();
    }
  };

  return (
      <div className="relative" ref={dropdownRef}>
        <button
            onClick={() => setOpen((value) => !value)}
            className="relative p-2 rounded-xl hover:bg-secondary transition-colors"
            title={`알림 연결 상태: ${connectionState}`}
        >
          <Bell className="w-4 h-4 text-muted-foreground" />
          {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-4 h-4 px-1 flex items-center justify-center text-[9px] font-bold bg-accent text-white rounded-full leading-none">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
          )}
        </button>

        {open && (
            <div className="absolute right-0 top-full mt-2 w-96 max-w-[calc(100vw-2rem)] bg-card border border-border rounded-2xl shadow-xl z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-foreground">실시간 알림</p>
                    <span className={`w-2 h-2 rounded-full ${connectionState === "connected" ? "bg-green-500" : "bg-amber-500"}`} />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{connectionState === "connected" ? "SSE 연결됨" : "SSE 대기/재연결 중"}</p>
                </div>
                <button
                    onClick={loadNotifications}
                    className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground"
                    title="새로고침"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                </button>
              </div>

              {error && (
                  <div className="px-4 py-2 text-xs text-red-600 bg-red-50 border-b border-red-100">
                    {error}
                  </div>
              )}

              <div className="max-h-80 overflow-y-auto">
                <NotificationList
                    items={items}
                    onRead={handleRead}
                    onNavigate={() => setOpen(false)}
                    compact
                    role={user?.role}
                />
              </div>

              <div className="px-4 py-2.5 border-t border-border">
                <Link
                    to="/notifications"
                    onClick={() => setOpen(false)}
                    className="block w-full text-center text-xs text-accent hover:underline font-medium py-0.5"
                >
                  전체 알림 보기
                </Link>
              </div>
            </div>
        )}
      </div>
  );
}
