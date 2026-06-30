import { useState, useEffect } from "react";
import {
  Phone,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Clock,
  Wrench,
  Package,
  Truck,
  Loader2,
} from "lucide-react";
import { Card, Badge } from "../../components/shared";
import { getRepairOrders, getStatusHistories } from "../../api/customerService";

const STAGES = [
  { id: 1, label: "접수", icon: CheckCircle2 },
  { id: 2, label: "수리중", icon: Wrench },
  { id: 3, label: "수리완료", icon: Package },
  { id: 4, label: "결제대기", icon: Clock },
  { id: 5, label: "인도완료", icon: Truck },
];

const STATUS_TO_STAGE = {
  RECEIVED: 1,
  ACCEPTED: 1,
  IN_REPAIR: 2,
  REPAIR_DONE: 3,
  PAYMENT_COMPLETED: 4,
  CLAIM_COMPLETED: 5,
};

const STATUS_LABEL = {
  RECEIVED: "접수완료",
  ACCEPTED: "접수수락",
  IN_REPAIR: "수리중",
  REPAIR_DONE: "수리완료",
  PAYMENT_COMPLETED: "결제완료",
  CLAIM_COMPLETED: "인도완료",
  REJECTED: "반려됨",
  CANCELLED: "취소됨",
  NO_SHOW: "노쇼",
};

const STATUS_VARIANT = {
  RECEIVED: "accent",
  ACCEPTED: "accent",
  IN_REPAIR: "yellow",
  REPAIR_DONE: "green",
  PAYMENT_COMPLETED: "green",
  CLAIM_COMPLETED: "green",
  REJECTED: "red",
  CANCELLED: "muted",
  NO_SHOW: "red",
};

function StatusStepper({ currentStage }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <div className="flex items-center justify-between relative">
        {/* Connecting line */}
        <div className="absolute top-5 left-6 right-6 h-0.5 bg-secondary z-0" />
        <div
          className="absolute top-5 left-6 h-0.5 bg-accent z-0 transition-all duration-500"
          style={{
            width: `${((currentStage - 1) / (STAGES.length - 1)) * 100}%`,
          }}
        />

        {STAGES.map((stage) => {
          const Icon = stage.icon;
          const done = stage.id < currentStage;
          const active = stage.id === currentStage;
          return (
            <div
              key={stage.id}
              className="flex flex-col items-center gap-2 relative z-10"
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                  done
                    ? "bg-accent border-accent"
                    : active
                      ? "bg-card border-accent shadow-lg shadow-accent/20"
                      : "bg-card border-secondary"
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${done ? "text-white" : active ? "text-accent" : "text-muted-foreground/40"}`}
                />
              </div>
              <span
                className={`text-xs font-medium ${active ? "text-accent" : done ? "text-foreground" : "text-muted-foreground/50"}`}
              >
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ASRequestCard({ order }) {
  const [expanded, setExpanded] = useState(false);

  if (!order) return null;

  const visitDate = order.reservedVisitAt
    ? new Date(order.reservedVisitAt).toLocaleString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "-";

  return (
    <Card className="p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">
          진행 중인 A/S 요청
        </h3>
        <Badge variant={STATUS_VARIANT[order.status] || "muted"}>
          {STATUS_LABEL[order.status] || order.status}
        </Badge>
      </div>

      <div className="flex items-center gap-3 bg-secondary rounded-xl p-3">
        <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
          <Phone className="w-5 h-5 text-accent" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">
            접수번호: {order.orderNo}
          </p>
          <p className="text-xs text-muted-foreground">{order.shopName}</p>
        </div>
      </div>

      <div className="flex flex-col gap-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">담당 수리점</span>
          <span className="font-medium text-foreground">{order.shopName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">예약 일시</span>
          <span className="font-medium text-foreground">{visitDate}</span>
        </div>
      </div>

      {/* Expandable breakdown */}
      {order.damageDescription && (
        <>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center justify-between py-2 px-3 bg-secondary rounded-xl text-xs font-medium text-foreground hover:bg-secondary/80 transition-colors"
          >
            <span>파손 상세 내역</span>
            {expanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
          {expanded && (
            <div className="text-xs text-muted-foreground px-1 animate-in fade-in slide-in-from-top-1 duration-150 whitespace-pre-line">
              {order.damageDescription}
            </div>
          )}
        </>
      )}
    </Card>
  );
}

function NotificationFeed({ histories }) {
  return (
    <Card className="p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">상태 이력</h3>
      </div>
      <div className="flex flex-col divide-y divide-border/40">
        {histories.length === 0 && (
          <p className="text-xs text-muted-foreground py-3">아직 이력이 없습니다.</p>
        )}
        {histories.map((h, i) => (
          <div key={i} className="flex gap-3 py-3">
            <div className="flex flex-col items-center gap-1 shrink-0 pt-1">
              <div className="w-2 h-2 rounded-full bg-accent" />
              {i < histories.length - 1 && (
                <div className="w-px flex-1 bg-border/40" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs leading-relaxed text-foreground font-medium">
                {STATUS_LABEL[h.previousStatus] || h.previousStatus} → {STATUS_LABEL[h.changedStatus] || h.changedStatus}
              </p>
              {h.note && (
                <p className="text-[11px] text-muted-foreground mt-0.5">{h.note}</p>
              )}
              <p className="text-[11px] text-muted-foreground/60 mt-0.5">
                {new Date(h.changedAt).toLocaleString("ko-KR")}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export default function CustomerDashboard() {
  const [latestOrder, setLatestOrder] = useState(null);
  const [histories, setHistories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const { data } = await getRepairOrders(0, 1);
        const orders = data.data?.content ?? [];
        if (orders.length > 0) {
          const order = orders[0];
          setLatestOrder(order);
          const histRes = await getStatusHistories(order.id);
          const histData = histRes.data.data?.histories;
          setHistories(Array.isArray(histData) ? histData : []);
        }
      } catch (e) {
        setError(e.response?.data?.error?.message || "데이터를 불러올 수 없습니다.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-accent" />
      </div>
    );
  }

  const currentStage = latestOrder ? STATUS_TO_STAGE[latestOrder.status] ?? 1 : 0;

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-semibold text-foreground">대시보드</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {latestOrder ? "현재 진행 중인 A/S가 있습니다." : "현재 진행 중인 A/S가 없습니다."}
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/50 rounded-xl text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {latestOrder && <StatusStepper currentStage={currentStage} />}

      {latestOrder && (
        <div className="grid md:grid-cols-2 gap-5">
          <ASRequestCard order={latestOrder} />
          <NotificationFeed histories={histories} />
        </div>
      )}

      {!latestOrder && !error && (
        <Card className="p-8 text-center">
          <p className="text-sm text-muted-foreground">
            A/S 접수 내역이 없습니다. 새로운 A/S를 접수해 보세요.
          </p>
        </Card>
      )}
    </div>
  );
}
