import { useState, useEffect, useRef } from "react";
import { Link, useLocation, Outlet, useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { logout as logoutApi } from "../api/auth";
import {
  Shield,
  LayoutDashboard,
  FileText,
  CreditCard,
  Wrench,
  Calendar,
  BarChart2,
  BookOpen,
  Package,
  AlertTriangle,
  MapPin,
  Menu,
  X,
  ChevronRight,
  LogOut,
  Bell,
  Receipt,
  GraduationCap,
  Sun,
  Moon,
  User,
  CheckCircle2,
  Clock,
  AlertCircle,
  CreditCard as Pay,
  Award,
  Store, // 수리점 가입 승인 메뉴 아이콘
  Users, // 회원 관리 메뉴 아이콘
  Sparkles, // AI 정확도 현황 메뉴 아이콘
} from "lucide-react";
import { useDarkMode } from "../hooks/useDarkMode";
import { getGuides } from "../api/lmsService";
import { getRepairOrders } from "../api/customerService";
import { getNotifications, getUnreadCount, markNotificationRead } from "../api/notificationApi";

// ── LMS gate helpers ──────────────────────────────────────────────────────────

function isShopLMSDone() {
  return localStorage.getItem("caremate-shop-lms") === "done";
}

// ── Nav config ────────────────────────────────────────────────────────────────

// 결제 대기 주문 ID가 아직 동적으로 채워지기 전 사용하는 플레이스홀더 href.
// 실제 클릭 가능한 href는 렌더링 시 resolveNavHref()로 치환된다.
const PAYMENT_NAV_HREF = "/customer/payment";

const CUSTOMER_NAV = [
  { label: "대시보드", href: "/customer/dashboard", icon: LayoutDashboard },
  { label: "A/S 접수", href: "/customer/request", icon: FileText },
  { label: "보험 관리", href: "/customer/insurance", icon: Shield },
  { label: "결제·청구", href: PAYMENT_NAV_HREF, icon: CreditCard },
  { label: "서비스 센터 찾기", href: "/customer/find-shop", icon: MapPin },
];

// 사이드바 nav 항목의 실제 이동 경로를 계산한다.
// "결제·청구"는 사용자마다 다른 주문(REPAIR_DONE 상태)으로 가야 하므로 고정 href가 없다.
function resolveNavHref(item, paymentOrderId) {
  if (item.href !== PAYMENT_NAV_HREF) return item.href;
  return paymentOrderId ? `/customer/payment/${paymentOrderId}` : null; // null = 이동 불가(비활성화)
}


const SHOP_NAV = [
  { label: "대시보드", href: "/shop/dashboard", icon: Calendar },
  { label: "주문 접수", href: "/shop/orders", icon: FileText },
  { label: "수리 리포트", href: "/shop/report", icon: Wrench },
  { label: "LMS 교육", href: "/shop/lms", icon: GraduationCap },
  { label: "월말 정산", href: "/shop/settlement", icon: Receipt },
];

const ADMIN_NAV = [
  { label: "통합 대시보드", href: "/admin/dashboard", icon: BarChart2 },
  { label: "수리점 가입 승인", href: "/admin/shop-approvals", icon: Store },
  { label: "회원 관리", href: "/admin/members", icon: Users }, // 고객·수리점 차단/해제
  { label: "보험 약관 관리", href: "/admin/policies", icon: BookOpen },
  { label: "수수료 청구 관리", href: "/admin/settlements", icon: Package },
  { label: "LMS 관리", href: "/admin/lms", icon: GraduationCap },
  { label: "AI 정확도 현황", href: "/admin/ai-accuracy", icon: Sparkles },
  { label: "운영 감사", href: "/admin/audit", icon: AlertTriangle },
];

function getNavConfig(path) {
  if (path.startsWith("/shop"))
    return {
      items: SHOP_NAV,
      role: "수리점 파트너",
      roleColorLight: "text-amber-700 bg-amber-100 border border-amber-200",
      roleColorDark:
        "text-amber-300 bg-amber-900/40 border border-amber-700/40",
      profileHref: "/shop/profile",
      profileLabel: "매장 프로필",
    };
  if (path.startsWith("/admin"))
    return {
      items: ADMIN_NAV,
      role: "관리자",
      roleColorLight: "text-red-700 bg-red-100 border border-red-200",
      roleColorDark: "text-red-300 bg-red-900/40 border border-red-700/40",
      profileHref: "/admin/profile",
      profileLabel: "마이페이지",
    };
  return {
    items: CUSTOMER_NAV,
    role: "일반 고객",
    roleColorLight: "text-blue-700 bg-blue-100 border border-blue-200",
    roleColorDark: "text-blue-300 bg-blue-900/40 border border-blue-700/40",
    profileHref: "/customer/profile",
    profileLabel: "마이페이지",
  };
}

// ── Notification helpers ──────────────────────────────────────────────────────

function formatRelativeTime(createdAt) {
  const diff = Date.now() - new Date(createdAt).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "방금 전";
  if (mins < 60) return `${mins}분 전`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "어제";
  return `${days}일 전`;
}

function getNotifMeta(type) {
  switch (type) {
    case "ORDER_RECEIVED":
    case "ORDER_ACCEPTED":
    case "PAYMENT_COMPLETED":
    case "CLAIM_DISPATCH_SUCCESS":
    case "BATCH_COMPLETED":
    case "REPAIR_SHOP_APPROVED":
      return { icon: CheckCircle2, color: "text-green-500" };
    case "ORDER_REJECTED":
    case "NO_SHOW_WARNING":
    case "NO_SHOW":
    case "REPAIR_IMPOSSIBLE":
    case "CLAIM_DISPATCH_FAILED":
      return { icon: AlertCircle, color: "text-red-500" };
    case "PAYMENT_REQUESTED":
      return { icon: Pay, color: "text-blue-500" };
    case "ESTIMATED_CLAIM_NOTICE":
      return { icon: Award, color: "text-amber-500" };
    case "REPORT_MODIFIED":
      return { icon: FileText, color: "text-violet-500" };
    default:
      return { icon: Bell, color: "text-muted-foreground" };
  }
}

// ── Dark mode toggle ──────────────────────────────────────────────────────────

function DarkModeToggle({ dark, toggle }) {
  return (
    <button
      onClick={toggle}
      title={dark ? "라이트 모드" : "다크 모드"}
      className="relative w-12 h-6 rounded-full border transition-all duration-300 focus:outline-none shrink-0"
      style={{
        background: dark ? "#D97706" : "#E8EDF3",
        borderColor: dark ? "#D97706" : "rgba(30,41,59,0.15)",
      }}
    >
      <span
        className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-sm transition-all duration-300"
        style={{ transform: dark ? "translateX(24px)" : "translateX(0px)" }}
      >
        {dark ? (
          <Moon className="w-2.5 h-2.5 text-amber-600" />
        ) : (
          <Sun className="w-2.5 h-2.5 text-amber-500" />
        )}
      </span>
    </button>
  );
}

// ── Notification dropdown ─────────────────────────────────────────────────────

function NotificationDropdown({ onClose }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const ref = useRef(null);

  useEffect(() => {
    getNotifications()
      .then(({ data }) => {
        console.log('[Notification] API 응답:', data);
        setItems(data.data?.content ?? []);
      })
      .catch((err) => {
        console.error('[Notification] API 오류:', err?.response?.status, err?.response?.data ?? err?.message);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  const unreadCount = items.filter((n) => !n.isRead).length;

  const handleMarkRead = (id) => {
    setItems((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));
    markNotificationRead(id).catch(() => {});
  };

  const markAll = () => {
    const unread = items.filter((n) => !n.isRead);
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
    Promise.all(unread.map((n) => markNotificationRead(n.id))).catch(() => {});
  };

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-2xl shadow-xl z-50 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-foreground">알림</p>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.5 text-[10px] font-bold bg-accent text-accent-foreground rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAll}
            className="text-xs text-accent hover:underline font-medium"
          >
            모두 읽음
          </button>
        )}
      </div>

      {/* Notification list */}
      <div className="max-h-72 overflow-y-auto">
        {loading ? (
          <div className="py-10 text-center text-sm text-muted-foreground">불러오는 중...</div>
        ) : items.length === 0 ? (
          <div className="py-10 text-center text-sm text-muted-foreground">
            알림이 없습니다.
          </div>
        ) : (
          items.map((n) => {
            const { icon: Icon, color } = getNotifMeta(n.type);
            return (
              <div
                key={n.id}
                onClick={() => handleMarkRead(n.id)}
                className={`flex gap-3 px-4 py-3 border-b border-border last:border-0 cursor-pointer transition-colors ${n.isRead ? "opacity-60 hover:opacity-80" : "hover:bg-secondary"}`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${n.isRead ? "bg-muted" : "bg-secondary"}`}
                >
                  <Icon
                    className={`w-3.5 h-3.5 ${n.isRead ? "text-muted-foreground" : color}`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-xs leading-relaxed ${n.isRead ? "text-muted-foreground" : "text-foreground font-medium"}`}
                  >
                    {n.message}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Clock className="w-2.5 h-2.5 text-muted-foreground" />
                    <p className="text-[10px] text-muted-foreground">
                      {formatRelativeTime(n.createdAt)}
                    </p>
                    {!n.isRead && (
                      <span className="w-1.5 h-1.5 rounded-full bg-accent ml-auto" />
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 border-t border-border">
        <button className="w-full text-center text-xs text-accent hover:underline font-medium py-0.5">
          전체 알림 보기
        </button>
      </div>
    </div>
  );
}

// ── Bell button (wraps dropdown) ──────────────────────────────────────────────

function BellButton({ path }) {
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  const fetchUnread = () => {
    getUnreadCount()
      .then(({ data }) => setUnread(data.data?.unreadCount ?? 0))
      .catch(() => {});
  };

  useEffect(() => { fetchUnread(); }, []);

  const handleClose = () => {
    setOpen(false);
    fetchUnread();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 rounded-xl hover:bg-secondary transition-colors"
      >
        <Bell className="w-4 h-4 text-muted-foreground" />
        {unread > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 flex items-center justify-center text-[9px] font-bold bg-accent text-white rounded-full leading-none">
            {unread}
          </span>
        )}
      </button>
      {open && (
        <NotificationDropdown onClose={handleClose} />
      )}
    </div>
  );
}

// ── LMS Gate overlay ──────────────────────────────────────────────────────────

const LMS_GATE_GUIDE_META = [
  {
    guideType: "REPAIR_REPORT_GUIDE",
    desc: "필수 입력 항목, 사진 요건, 금지 사항",
    icon: FileText,
  },
  {
    guideType: "PLATFORM_PROCESS_GUIDE",
    desc: "전체 절차, 부정 처리 금지",
    icon: Shield,
  },
];

function LMSGate({ guides, onNavigate }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-8 max-w-md mx-auto text-center">
      <div className="w-20 h-20 rounded-3xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
        <GraduationCap className="w-10 h-10 text-amber-600 dark:text-amber-400" />
      </div>
      <div className="flex flex-col gap-3">
        <h2 className="text-xl font-bold text-foreground">
          LMS 필수 교육 이수 필요
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          CareMate 수리점 파트너 활동을 시작하기 전에
          <br />
          <strong className="text-foreground">필수 교육 2종</strong>을 이수해야
          합니다.
        </p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          각 가이드별 퀴즈에서 정답률 80% 이상 달성 시 수료 처리됩니다.
          <br />
          2종 모두 수료한 이후 모든 기능을 이용하실 수 있습니다.
        </p>
      </div>
      <div className="flex flex-col gap-3 w-full">
        {LMS_GATE_GUIDE_META.map((meta) => {
          const Icon = meta.icon;
          const guide = guides?.find((g) => g.guideType === meta.guideType);
          const completed = guide?.completed ?? false;
          return (
            <div
              key={meta.guideType}
              className="flex items-center gap-3 p-4 bg-card border border-border rounded-xl text-left"
            >
              <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {guide?.title ?? meta.guideType}
                </p>
                <p className="text-xs text-muted-foreground">{meta.desc}</p>
              </div>
              <div className="ml-auto">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
                    completed
                      ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-700/50"
                      : "bg-secondary text-muted-foreground border-border"
                  }`}
                >
                  {completed ? "수료 완료" : "미수료"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <button
        onClick={onNavigate}
        className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm transition-all shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2"
      >
        <GraduationCap className="w-4 h-4" />
        지금 LMS 교육 시작하기
      </button>
    </div>
  );
}

// ── Desktop Sidebar ───────────────────────────────────────────────────────────

function DesktopSidebar({ collapsed, onToggle, dark, onLogout, paymentOrderId }) {
  const loc = useLocation();
  const nav = useNavigate();
  const { items, role, roleColorLight, roleColorDark, profileHref, profileLabel } =
    getNavConfig(loc.pathname);
  const roleColor = dark ? roleColorDark : roleColorLight;

  return (
    <aside
      className={`hidden lg:flex fixed top-0 left-0 h-screen flex-col transition-all duration-300 z-40 ${collapsed ? "w-16" : "w-60"}`}
      style={{ background: "#1E293B" }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-white/10 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-amber-600 flex items-center justify-center shrink-0">
          <Shield className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <span
            className="text-base font-semibold text-white tracking-tight whitespace-nowrap"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Care<span className="text-amber-400">Mate</span>
          </span>
        )}
      </div>

      {/* Role badge */}
      {!collapsed && (
        <div className="px-4 py-3 border-b border-white/10">
          <span
            className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${roleColor}`}
          >
            {role}
          </span>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 flex flex-col gap-1 overflow-y-auto">
        {items.map((item) => {
          const Icon = item.icon;
          const href = resolveNavHref(item, paymentOrderId);
          const isActive = href != null && loc.pathname === href;

          if (href == null) {
            // 결제 대기 중인 주문이 없음 — 비활성화 상태로 표시
            return (
              <span
                key={item.href}
                title="결제 대기 중인 주문이 없습니다."
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/25 cursor-not-allowed select-none"
              >
                <Icon className="w-4 h-4 shrink-0" />
                {!collapsed && (
                  <span className="whitespace-nowrap">{item.label}</span>
                )}
              </span>
            );
          }

          return (
            <Link
              key={item.href}
              to={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${isActive ? "bg-white/15 text-white" : "text-white/55 hover:text-white hover:bg-white/10"}`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {!collapsed && (
                <span className="whitespace-nowrap">{item.label}</span>
              )}
              {!collapsed && isActive && (
                <ChevronRight className="w-3.5 h-3.5 ml-auto text-white/50" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-2 pb-4 flex flex-col gap-1 border-t border-white/10 pt-3">
        <button
          onClick={() => nav(profileHref)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/55 hover:text-white hover:bg-white/10 transition-all"
        >
          <User className="w-4 h-4 shrink-0" />
          {!collapsed && <span>{profileLabel}</span>}
        </button>
        {/* 로그아웃 버튼 — API 호출 후 인증 정보 초기화 */}
        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/40 hover:text-white/70 hover:bg-white/8 transition-all w-full text-left"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span>로그아웃</span>}
        </button>
        <button
          onClick={onToggle}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/40 hover:text-white/70 hover:bg-white/8 transition-all"
        >
          <Menu className="w-4 h-4 shrink-0" />
          {!collapsed && <span>사이드바 접기</span>}
        </button>
      </div>
    </aside>
  );
}

// ── Mobile Top Nav ────────────────────────────────────────────────────────────

function MobileTopNav({ dark, toggleDark, onLogout, paymentOrderId }) {
  const loc = useLocation();
  const { items, role, roleColorLight, roleColorDark, profileHref, profileLabel } =
    getNavConfig(loc.pathname);
  const roleColor = dark ? roleColorDark : roleColorLight;
  const [open, setOpen] = useState(false);

  return (
    <>
      <header
        className="lg:hidden fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-4 border-b border-white/10"
        style={{ background: "#1E293B" }}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-amber-600 flex items-center justify-center shrink-0">
            <Shield className="w-3.5 h-3.5 text-white" />
          </div>
          <span
            className="text-sm font-semibold text-white tracking-tight"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Care<span className="text-amber-400">Mate</span>
          </span>
          <span
            className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ml-1 ${roleColor}`}
          >
            {role}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <DarkModeToggle dark={dark} toggle={toggleDark} />
          <button
            onClick={() => setOpen(true)}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
          >
            <Menu className="w-4 h-4 text-white" />
          </button>
        </div>
      </header>

      {open && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={() => setOpen(false)}
          />
          <div
            className="lg:hidden fixed top-0 right-0 bottom-0 w-72 z-50 flex flex-col shadow-2xl animate-in slide-in-from-right duration-200"
            style={{ background: "#1E293B" }}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-600 flex items-center justify-center">
                  <Shield className="w-3.5 h-3.5 text-white" />
                </div>
                <span
                  className="text-sm font-semibold text-white"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  Care<span className="text-amber-400">Mate</span>
                </span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            <div className="px-5 py-3 border-b border-white/10">
              <span
                className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${roleColor}`}
              >
                {role}
              </span>
            </div>

            <div className="px-5 py-3 border-b border-white/10 flex items-center justify-between">
              <span className="text-xs text-white/50">다크 모드</span>
              <DarkModeToggle dark={dark} toggle={toggleDark} />
            </div>

            <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
              {items.map((item) => {
                const Icon = item.icon;
                const href = resolveNavHref(item, paymentOrderId);
                const isActive = href != null && loc.pathname === href;

                if (href == null) {
                  return (
                    <span
                      key={item.href}
                      title="결제 대기 중인 주문이 없습니다."
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-white/25 cursor-not-allowed select-none"
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </span>
                  );
                }

                return (
                  <Link
                    key={item.href}
                    to={href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${isActive ? "bg-white/15 text-white" : "text-white/60 hover:text-white hover:bg-white/10"}`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                    {isActive && (
                      <ChevronRight className="w-3.5 h-3.5 ml-auto text-white/50" />
                    )}
                  </Link>
                );
              })}
            </nav>

            <div className="px-3 pb-6 border-t border-white/10 pt-3 flex flex-col gap-1">
              <Link
                to={profileHref}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/10 transition-all"
              >
                <User className="w-4 h-4" />
                <span>{profileLabel}</span>
              </Link>
              {/* 로그아웃 버튼 — API 호출 후 인증 정보 초기화 */}
              <button
                onClick={() => { setOpen(false); onLogout(); }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-white/40 hover:text-white/70 hover:bg-white/8 transition-all w-full text-left"
              >
                <LogOut className="w-4 h-4" />
                <span>로그아웃</span>
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}

// ── Desktop Top Bar ───────────────────────────────────────────────────────────

function DesktopTopBar({ collapsed, dark, toggleDark, user }) {
  const loc = useLocation();
  const { profileHref } = getNavConfig(loc.pathname);

  // 사용자 이름의 첫 글자를 아바타 이니셜로 사용
  const initial = user?.name ? user.name.charAt(0) : "?";

  return (
    <header
      className="hidden lg:flex fixed top-0 right-0 h-16 bg-background/90 backdrop-blur-md border-b border-border z-30 items-center justify-end px-6 gap-3 transition-all duration-300"
      style={{ left: collapsed ? "4rem" : "15rem" }}
    >
      <DarkModeToggle dark={dark} toggle={toggleDark} />
      <BellButton path={loc.pathname} />
      <Link
        to={profileHref}
        title={user?.name}
        className="w-8 h-8 rounded-full bg-accent/15 flex items-center justify-center text-accent text-sm font-bold border border-accent/25 hover:bg-accent/25 transition-colors"
      >
        {initial}
      </Link>
    </header>
  );
}

// ── Content Area ─────────────────────────────────────────────────────────────

function ContentArea({ collapsed, children }) {
  const [isLg, setIsLg] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth >= 1024 : true,
  );
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const handler = (e) => setIsLg(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return (
    <main
      className="min-h-screen transition-all duration-300"
      style={{
        paddingTop: isLg ? "4rem" : "3.5rem",
        paddingLeft: isLg ? (collapsed ? "4rem" : "15rem") : "0",
      }}
    >
      <div className="p-4 md:p-6 lg:p-8">{children}</div>
    </main>
  );
}

// ── AppShell ──────────────────────────────────────────────────────────────────

export default function AppShell() {
  const [collapsed, setCollapsed] = useState(false);
  const { dark, toggle } = useDarkMode();
  const loc = useLocation();
  const nav = useNavigate();
  const { user, clearAuth } = useAuth();

  // 사이드바 "결제·청구" 메뉴용 — 고객의 결제 대기(REPAIR_DONE) 주문을 동적으로 조회.
  // 역할이 CUSTOMER일 때만 조회하고, 경로가 바뀔 때마다(예: 결제 완료 후 복귀) 다시 확인한다.
  const [paymentOrderId, setPaymentOrderId] = useState(null);
  useEffect(() => {
    if (user?.role !== "CUSTOMER") return;
    let cancelled = false;
    getRepairOrders(0, 1, "REPAIR_DONE")
      .then((res) => {
        if (cancelled) return;
        const orders = res.data?.data?.content ?? [];
        setPaymentOrderId(orders[0]?.id ?? null);
      })
      .catch(() => {
        if (!cancelled) setPaymentOrderId(null);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.role, loc.pathname]);

  // 로그아웃: 서버에 토큰 무효화 요청 후 클라이언트 인증 정보 초기화
  const handleLogout = async () => {
    try {
      await logoutApi()
    } catch {
      // 네트워크 오류 등 API 실패 시에도 클라이언트 상태는 반드시 초기화
    } finally {
      clearAuth()
      nav("/", { replace: true })
    }
  };

  // LMS gate state for shop — 서버의 실제 수료 상태를 직접 확인 (localStorage는 신뢰하지 않음)
  const isShopRoute = loc.pathname.startsWith("/shop");
  const isLMSPage = loc.pathname === "/shop/lms";

  const [shopLMSDone, setShopLMSDone] = useState(null); // null = 아직 확인 전
  const [gateGuides, setGateGuides] = useState([]);

  const checkLMSStatus = () => {
    getGuides()
      .then(({ data }) => {
        setShopLMSDone(data.allCompleted ?? false);
        setGateGuides(data.guides ?? []);
        if (data.allCompleted) localStorage.setItem("caremate-shop-lms", "done");
      })
      .catch(() => setShopLMSDone(isShopLMSDone()));
  };

  useEffect(() => {
    if (!isShopRoute) return;
    checkLMSStatus();
  }, [loc.pathname]);
  useEffect(() => {
    window.addEventListener("lms-completed", checkLMSStatus);
    return () => window.removeEventListener("lms-completed", checkLMSStatus);
  }, []);

  const showLMSGate = isShopRoute && !isLMSPage && shopLMSDone === false;

  return (
    <div
      className="min-h-screen bg-background"
      style={{ fontFamily: "'Noto Sans KR', 'DM Sans', sans-serif" }}
    >
      <DesktopSidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((v) => !v)}
        dark={dark}
        onLogout={handleLogout}
        paymentOrderId={paymentOrderId}
      />
      <DesktopTopBar collapsed={collapsed} dark={dark} toggleDark={toggle} user={user} />
      <MobileTopNav dark={dark} toggleDark={toggle} onLogout={handleLogout} paymentOrderId={paymentOrderId} />
      <ContentArea collapsed={collapsed}>
        {showLMSGate ? (
          <LMSGate guides={gateGuides} onNavigate={() => nav("/shop/lms")} />
        ) : (
          <Outlet />
        )}
      </ContentArea>
    </div>
  );
}
