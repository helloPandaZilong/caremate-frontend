import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, X, Check, Phone, Image, Wrench, UserX } from "lucide-react";
import { Badge, Button } from "../../components/shared";
import { getOrders, getOrderDetail, acceptOrder, rejectOrder, startRepair, manualNoShow } from "../../api/repairshopApi";

const DAYS = ["일", "월", "화", "수", "목", "금", "토"];

const STATUS_MAP = {
  RECEIVED: "pending",
  ACCEPTED: "scheduled",
  IN_REPAIR: "in_repair",
  REPAIR_DONE: "done",
  REJECTED: "rejected",
  NO_SHOW: "no_show",
};

const STATUS_BADGE = {
  pending:   { label: "대기",    cls: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" },
  scheduled: { label: "확정",    cls: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" },
  in_repair: { label: "수리중",  cls: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400" },
  done:      { label: "완료",    cls: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" },
  rejected:  { label: "거절",    cls: "bg-red-100 text-red-500 dark:bg-red-900/30 dark:text-red-400" },
  no_show:   { label: "노쇼",    cls: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400" },
};

function formatHour(dateStr) { return dateStr ? new Date(dateStr).getHours() : 0; }
function formatDay(dateStr) { return dateStr ? new Date(dateStr).getDate() : 0; }
function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,"0")}.${String(d.getDate()).padStart(2,"0")} ${String(d.getHours()).padStart(2,"0")}:00`;
}

const MOCK_BOOKINGS = [
  { id:1, day:13, hour:10, customer:"김민준", device:"iPhone 15 Pro 실버 256GB", issue:"전면 유리 균열, 터치 미인식", status:"pending", phone:"010-1234-5678" },
  { id:2, day:13, hour:14, customer:"이수연", device:"Galaxy S24 Ultra", issue:"배터리 교체", status:"scheduled", phone:"010-2345-6789" },
  { id:3, day:15, hour:11, customer:"박도현", device:"iPhone 14 블랙", issue:"카메라 렌즈 파손", status:"pending", phone:"010-3456-7890" },
  { id:4, day:17, hour:15, customer:"최지아", device:"Pixel 8 Pro", issue:"침수 수리", status:"scheduled", phone:"010-4567-8901" },
  { id:5, day:20, hour:10, customer:"정우성", device:"Galaxy Z Flip 5", issue:"힌지 파손", status:"pending", phone:"010-5678-9012" },
];

function CalendarCell({ day, bookings, onSelect, isToday }) {
  if (!day) return <div className="min-h-20 bg-secondary/30 rounded-lg" />;
  return (
    <div className={`min-h-20 p-2 rounded-lg border transition-colors ${isToday ? "border-accent/30 bg-accent/5" : "border-transparent hover:border-border hover:bg-card"}`}>
      <span className={`text-xs font-medium ${isToday ? "text-accent font-bold" : "text-muted-foreground"}`}>{day}</span>
      <div className="flex flex-col gap-1 mt-1">
        {bookings.map((b) => {
          const badge = STATUS_BADGE[b.status] ?? STATUS_BADGE.pending;
          return (
            <button key={b.id} onClick={() => onSelect(b)}
              className="w-full text-left px-1.5 py-1 rounded text-[10px] font-medium transition-colors bg-secondary hover:bg-secondary/70 flex items-center justify-between gap-1">
              <span className="truncate text-foreground">{b.hour}:00 {b.customer}</span>
              <span className={`shrink-0 px-1 py-0.5 rounded text-[9px] font-semibold ${badge.cls}`}>{badge.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function BookingDrawer({ booking, onClose, onAction }) {
  const [decision, setDecision] = useState(null);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    getOrderDetail(booking.id)
      .then((d) => setDetail(d))
      .catch(() => {});
  }, [booking.id]);

  const issue = detail?.damageDescription ?? booking.issue ?? "-";
  const phone = detail?.customerPhone ?? booking.phone ?? "";

  const isScheduled = booking.status === "scheduled";
  const isPending = booking.status === "pending";

  const canConfirm = isPending
    ? decision === "accept" || (decision === "reject" && reason.trim())
    : isScheduled ? (decision === "start" || decision === "noshow") : false;

  async function handleConfirm() {
    setLoading(true);
    try {
      if (isPending) {
        if (decision === "accept") await acceptOrder(booking.id);
        else await rejectOrder(booking.id, reason);
      } else if (isScheduled) {
        if (decision === "start") await startRepair(booking.id);
        else await manualNoShow(booking.id);
      }
      onAction();
      onClose();
    } catch {
      alert("처리 중 오류가 발생했습니다.");
    } finally { setLoading(false); }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />
      <aside className="fixed right-0 top-0 h-full w-[380px] bg-card border-l border-border shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-250">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <p className="text-sm font-semibold text-foreground">예약 상세</p>
            <p className="text-xs text-muted-foreground">#{booking.orderNo || `REQ-${String(booking.id).padStart(4,"0")}`}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">
          <div className="flex flex-col gap-3">
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent font-semibold text-sm">
              {booking.customer?.[0] ?? "?"}
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{booking.customer}</p>
              {phone && (
                <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                  <Phone className="w-3 h-3" />{phone}
                </p>
              )}
            </div>
          </div>

          <div className="bg-secondary rounded-xl p-4 flex flex-col gap-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">기기 정보</p>
            <p className="text-sm text-muted-foreground">{issue}</p>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">방문 예정</span>
            <span className="font-medium text-foreground">{booking.visitAt ?? `2024.06.${booking.day} ${booking.hour}:00`}</span>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium text-muted-foreground">첨부 이미지</p>
            <div className="flex gap-2">
              {[1, 2].map((i) => (
                <div key={i} className="w-16 h-16 rounded-xl bg-secondary flex items-center justify-center border border-border">
                  <Image className="w-6 h-6 text-muted-foreground/50" />
                </div>
              ))}
            </div>
          </div>

          {isPending && (
            <div className="flex flex-col gap-3">
              <p className="text-xs font-semibold text-foreground">예약 승인/거절</p>
              <div className="flex gap-2">
                <button onClick={() => setDecision("accept")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border transition-all ${decision === "accept" ? "bg-green-500 text-white border-green-500" : "border-border text-foreground hover:bg-green-50 dark:hover:bg-green-900/20"}`}>
                  <Check className="w-4 h-4" /> 승인
                </button>
                <button onClick={() => setDecision("reject")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border transition-all ${decision === "reject" ? "bg-red-500 text-white border-red-500" : "border-border text-foreground hover:bg-red-50 dark:hover:bg-red-900/20"}`}>
                  <X className="w-4 h-4" /> 거절
                </button>
              </div>
              {decision === "reject" && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">거절 사유 입력</label>
                  <textarea value={reason} onChange={(e) => setReason(e.target.value)}
                    placeholder="예: 해당 일시에 예약이 마감되었습니다. 다른 날짜를 선택해주세요."
                    rows={3}
                    className="w-full px-3.5 py-2.5 text-sm bg-secondary border border-border rounded-xl text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-accent/30 resize-none transition-all" />
                </div>
              )}
            </div>
          )}

          {isScheduled && (
            <div className="flex flex-col gap-3">
              <p className="text-xs font-semibold text-foreground">방문 처리</p>
              <div className="flex gap-2">
                <button onClick={() => setDecision("start")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border transition-all ${decision === "start" ? "bg-accent text-white border-accent" : "border-border text-foreground hover:bg-accent/5"}`}>
                  <Wrench className="w-4 h-4" /> 수리 시작
                </button>
                <button onClick={() => setDecision("noshow")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border transition-all ${decision === "noshow" ? "bg-red-500 text-white border-red-500" : "border-border text-foreground hover:bg-red-50 dark:hover:bg-red-900/20"}`}>
                  <UserX className="w-4 h-4" /> 노쇼
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="p-5 border-t border-border flex gap-2">
          <Button variant="secondary" size="md" className="flex-1" onClick={onClose}>취소</Button>
          <Button
            variant={decision === "reject" || decision === "noshow" ? "danger" : "accent"}
            size="md" className="flex-1"
            disabled={!canConfirm || loading}
            onClick={handleConfirm}>
            {loading ? "처리 중..." : decision === "accept" ? "승인 확정" : decision === "reject" ? "거절 전송" : decision === "start" ? "수리 시작" : decision === "noshow" ? "노쇼 처리" : "선택 필요"}
          </Button>
        </div>
      </aside>
    </>
  );
}

export default function ShopDashboard() {
  const [view, setView] = useState("month");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [bookings, setBookings] = useState(MOCK_BOOKINGS);
  const [curYear, setCurYear] = useState(new Date().getFullYear());
  const [curMonth, setCurMonth] = useState(new Date().getMonth());

  const loadOrders = useCallback(() => {
    getOrders({ size: 100 })
      .then((data) => {
        const items = data?.content ?? data ?? [];
        if (!items.length) return;
        const mapped = items
          .filter((o) => o.reservedVisitAt)
          .map((o) => ({
            id: o.id,
            orderNo: o.orderNo,
            day: formatDay(o.reservedVisitAt),
            hour: formatHour(o.reservedVisitAt),
            customer: o.customerName,
            device: o.deviceModel ?? "-",
            issue: o.damageDescription ?? "-",
            status: STATUS_MAP[o.status] ?? "pending",
            phone: o.customerPhone ?? "",
            visitAt: formatDate(o.reservedVisitAt),
          }));
        setBookings(mapped);
        const first = new Date(items[0].reservedVisitAt);
        setCurYear(first.getFullYear());
        setCurMonth(first.getMonth());
      })
      .catch(() => {});
  }, []);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  const firstDay = new Date(curYear, curMonth, 1).getDay();
  const daysInMonth = new Date(curYear, curMonth + 1, 0).getDate();
  const MONTH_GRID = Array.from({ length: Math.ceil((firstDay + daysInMonth) / 7) * 7 }, (_, i) => {
    const day = i - firstDay + 1;
    return day >= 1 && day <= daysInMonth ? day : null;
  });

  const bookingsByDay = (day) => bookings.filter((b) => b.day === day);
  const todayBookings = bookings.filter((b) => b.day === new Date().getDate());

  const prevMonth = () => { if (curMonth === 0) { setCurYear(y => y-1); setCurMonth(11); } else setCurMonth(m => m-1); };
  const nextMonth = () => { if (curMonth === 11) { setCurYear(y => y+1); setCurMonth(0); } else setCurMonth(m => m+1); };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">예약 스케줄 관리</h1>
          <p className="text-sm text-muted-foreground mt-1">강남 스마트케어 · 오늘 예약 {todayBookings.length}건</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-accent/20" />검토 대기</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-amber-100 dark:bg-amber-900/30" />확정 예약</span>
          </div>
          <div className="flex items-center gap-1 bg-secondary rounded-lg p-0.5">
            {["month", "week"].map((v) => (
              <button key={v} onClick={() => setView(v)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${view === v ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                {v === "month" ? "월간" : "주간"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <p className="text-sm font-semibold text-foreground">{curYear}년 {curMonth + 1}월</p>
          <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className="grid grid-cols-7 border-b border-border/40">
          {DAYS.map((d, i) => (
            <div key={d} className={`py-2 text-center text-xs font-medium ${i === 0 ? "text-red-400" : i === 6 ? "text-accent" : "text-muted-foreground"}`}>{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1 p-3">
          {MONTH_GRID.map((day, i) => (
            <CalendarCell key={i} day={day} bookings={day ? bookingsByDay(day) : []} onSelect={setSelectedBooking} isToday={day === new Date().getDate() && curMonth === new Date().getMonth() && curYear === new Date().getFullYear()} />
          ))}
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">오늘 예약 목록</h3>
        {todayBookings.length === 0
          ? <p className="text-sm text-muted-foreground text-center py-6">오늘 예약이 없습니다.</p>
          : (
            <div className="flex flex-col gap-2">
              {todayBookings.map((b) => (
                <div key={b.id} onClick={() => setSelectedBooking(b)}
                  className="flex items-center justify-between p-3 bg-secondary rounded-xl cursor-pointer hover:bg-secondary/80 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-muted-foreground w-12">{b.hour}:00</span>
                    <div>
                      <p className="text-sm font-medium text-foreground">{b.customer}</p>
                      <p className="text-xs text-muted-foreground">{b.device}</p>
                    </div>
                  </div>
                  <Badge variant={b.status === "pending" ? "accent" : "yellow"}>
                    {b.status === "pending" ? "검토 대기" : "확정"}
                  </Badge>
                </div>
              ))}
            </div>
          )
        }
      </div>

      {selectedBooking && (
        <BookingDrawer booking={selectedBooking} onClose={() => setSelectedBooking(null)} onAction={loadOrders} />
      )}
    </div>
  );
}
