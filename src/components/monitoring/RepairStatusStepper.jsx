import {
  AlertCircle,
  CheckCircle2,
  Clock,
  CreditCard,
  FileText,
  PackageCheck,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import { Badge } from "../../components/shared";

const DEFAULT_MILESTONES = [
  { status: "RECEIVED", displayName: "접수", reached: false, current: false },
  { status: "ACCEPTED", displayName: "예약확정", reached: false, current: false },
  { status: "IN_REPAIR", displayName: "수리중", reached: false, current: false },
  { status: "REPAIR_DONE", displayName: "수리완료", reached: false, current: false },
  { status: "PAYMENT_COMPLETED", displayName: "결제완료", reached: false, current: false },
  { status: "CLAIM_REQUESTED", displayName: "청구요청", reached: false, current: false },
  { status: "CLAIM_COMPLETED", displayName: "청구완료", reached: false, current: false },
];

const STATUS_ICON = {
  RECEIVED: FileText,
  ACCEPTED: ShieldCheck,
  REJECTED: AlertCircle,
  NO_SHOW: AlertCircle,
  IN_REPAIR: Wrench,
  REPAIR_DONE: CheckCircle2,
  PAYMENT_COMPLETED: CreditCard,
  CLAIM_REQUESTED: Clock,
  CLAIM_COMPLETED: PackageCheck,
};

const STATUS_LABEL = {
  RECEIVED: "접수",
  ACCEPTED: "예약확정",
  REJECTED: "접수반려",
  NO_SHOW: "노쇼",
  IN_REPAIR: "수리중",
  REPAIR_DONE: "수리완료",
  PAYMENT_COMPLETED: "결제완료",
  CLAIM_REQUESTED: "청구요청",
  CLAIM_COMPLETED: "청구완료",
};

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

function normalizeMilestones(milestones, currentStatus) {
  if (milestones?.length) return milestones;
  const currentIndex = DEFAULT_MILESTONES.findIndex((item) => item.status === currentStatus);
  return DEFAULT_MILESTONES.map((item, index) => ({
    ...item,
    reached: currentIndex >= 0 && index <= currentIndex,
    current: item.status === currentStatus,
  }));
}

export default function RepairStatusStepper({ milestones, currentStatus }) {
  const isTerminalIssue = currentStatus === "REJECTED" || currentStatus === "NO_SHOW";
  const normalized = normalizeMilestones(milestones, currentStatus);
  const currentLabel = STATUS_LABEL[currentStatus] ?? currentStatus ?? "상태 없음";
  const reachedCount = normalized.filter((item) => item.reached).length;
  const progress = normalized.length <= 1 ? 0 : Math.max(((reachedCount - 1) / (normalized.length - 1)) * 100, 0);

  return (
    <div className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">A/S 진행 상태</h3>
          <p className="text-xs text-muted-foreground mt-1">접수부터 청구 패키지 완료까지 단계별로 확인합니다.</p>
        </div>
        <Badge variant={isTerminalIssue ? "red" : "teal"}>{currentLabel}</Badge>
      </div>

      {isTerminalIssue ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <div className="font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {currentStatus === "REJECTED" ? "접수가 반려되었습니다." : "예약 시간에 방문하지 않아 노쇼 처리되었습니다."}
          </div>
          <p className="mt-1 text-xs text-red-600">상세 사유는 아래 상태 이력의 note를 확인하고 필요하면 새 A/S 접수를 진행해 주세요.</p>
        </div>
      ) : (
        <div className="relative overflow-x-auto pb-1">
          <div className="min-w-[720px] relative flex items-start justify-between px-2">
            <div className="absolute top-5 left-8 right-8 h-0.5 bg-secondary" />
            <div
              className="absolute top-5 left-8 h-0.5 bg-teal-500 transition-all duration-500"
              style={{ width: `calc((100% - 4rem) * ${progress / 100})` }}
            />
            {normalized.map((milestone) => {
              const Icon = STATUS_ICON[milestone.status] ?? CheckCircle2;
              const reached = Boolean(milestone.reached);
              const current = Boolean(milestone.current);
              return (
                <div key={milestone.status} className="relative z-10 flex w-24 flex-col items-center gap-2 text-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                      reached
                        ? "bg-teal-500 border-teal-500 text-white"
                        : current
                          ? "bg-card border-teal-500 text-teal-500 shadow-lg shadow-teal-500/20"
                          : "bg-card border-secondary text-muted-foreground/40"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className={`text-xs font-medium ${current ? "text-teal-600" : reached ? "text-foreground" : "text-muted-foreground/50"}`}>
                      {milestone.displayName || STATUS_LABEL[milestone.status] || milestone.status}
                    </p>
                    {milestone.reachedAt && (
                      <p className="text-[10px] text-muted-foreground mt-0.5">{formatDateTime(milestone.reachedAt)}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export function OrderStatusHistoryList({ histories = [] }) {
  if (!histories.length) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
        아직 상태 이력이 없습니다.
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">상태 변경 이력</h3>
      </div>
      <div className="divide-y divide-border/60">
        {histories.map((history) => {
          const Icon = STATUS_ICON[history.changedStatus] ?? CheckCircle2;
          return (
            <div key={history.id ?? `${history.changedStatus}-${history.changedAt}`} className="flex gap-3 p-4">
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-foreground">
                    {STATUS_LABEL[history.changedStatus] ?? history.changedStatus}
                  </p>
                  {history.previousStatus && (
                    <span className="text-[11px] text-muted-foreground">
                      {STATUS_LABEL[history.previousStatus] ?? history.previousStatus} → {STATUS_LABEL[history.changedStatus] ?? history.changedStatus}
                    </span>
                  )}
                </div>
                {history.note && <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{history.note}</p>}
                <p className="mt-1 text-[11px] text-muted-foreground/70">{formatDateTime(history.changedAt)}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
