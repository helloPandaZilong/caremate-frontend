import { useState } from "react";
import {
  Phone,
  ChevronDown,
  ChevronUp,
  Bell,
  CheckCircle2,
  Clock,
  Wrench,
  Package,
  Truck,
} from "lucide-react";
import { Card, Badge } from "../../components/shared";

const STAGES = [
  { id: 1, label: "접수", icon: CheckCircle2 },
  { id: 2, label: "수리중", icon: Wrench },
  { id: 3, label: "수리완료", icon: Package },
  { id: 4, label: "결제대기", icon: Clock },
  { id: 5, label: "인도완료", icon: Truck },
];

const CURRENT_STAGE = 2;

const NOTIFICATIONS = [
  {
    id: 1,
    msg: "수리 리포트가 도착했습니다. 견적을 확인해 주세요.",
    time: "방금 전",
    dot: "bg-accent",
    read: false,
  },
  {
    id: 2,
    msg: "담당 기사님이 배정되었습니다. 박기술 기사 (010-1234-5678)",
    time: "1시간 전",
    dot: "bg-teal-500",
    read: false,
  },
  {
    id: 3,
    msg: "A/S 접수가 완료되었습니다. 예약 번호: #AS-2024-0612",
    time: "3시간 전",
    dot: "bg-muted-foreground",
    read: true,
  },
  {
    id: 4,
    msg: "보험 인증이 완료되었습니다. 'Carrier Care' 정책 적용 예정.",
    time: "어제",
    dot: "bg-muted-foreground",
    read: true,
  },
  {
    id: 5,
    msg: "서비스 센터 도착 안내: 강남 스마트케어에서 기기를 수령했습니다.",
    time: "어제",
    dot: "bg-muted-foreground",
    read: true,
  },
];

function StatusStepper() {
  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <div className="flex items-center justify-between relative">
        {/* Connecting line */}
        <div className="absolute top-5 left-6 right-6 h-0.5 bg-secondary z-0" />
        <div
          className="absolute top-5 left-6 h-0.5 bg-teal-500 z-0 transition-all duration-500"
          style={{
            width: `${((CURRENT_STAGE - 1) / (STAGES.length - 1)) * 100}%`,
          }}
        />

        {STAGES.map((stage) => {
          const Icon = stage.icon;
          const done = stage.id < CURRENT_STAGE;
          const active = stage.id === CURRENT_STAGE;
          return (
            <div
              key={stage.id}
              className="flex flex-col items-center gap-2 relative z-10"
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                  done
                    ? "bg-teal-500 border-teal-500"
                    : active
                      ? "bg-card border-teal-500 shadow-lg shadow-teal-500/20"
                      : "bg-card border-secondary"
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${done ? "text-white" : active ? "text-teal-500" : "text-muted-foreground/40"}`}
                />
              </div>
              <span
                className={`text-xs font-medium ${active ? "text-teal-600" : done ? "text-foreground" : "text-muted-foreground/50"}`}
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

function ASRequestCard() {
  const [expanded, setExpanded] = useState(false);
  return (
    <Card className="p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">
          진행 중인 A/S 요청
        </h3>
        <Badge variant="teal">수리중</Badge>
      </div>

      <div className="flex items-center gap-3 bg-secondary rounded-xl p-3">
        <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
          <Phone className="w-5 h-5 text-accent" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">
            iPhone 15 Pro · 실버 256GB
          </p>
          <p className="text-xs text-muted-foreground">
            접수번호: #AS-2024-0612
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">담당 수리점</span>
          <span className="font-medium text-foreground">강남 스마트케어</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">예약 일시</span>
          <span className="font-medium text-foreground">2024.06.13 14:00</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">적용 보험</span>
          <span className="font-medium text-accent">Carrier Care</span>
        </div>
      </div>

      {/* Expandable breakdown */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between py-2 px-3 bg-secondary rounded-xl text-xs font-medium text-foreground hover:bg-secondary/80 transition-colors"
      >
        <span>초기 파손 상세 내역</span>
        {expanded ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </button>
      {expanded && (
        <div className="flex flex-col gap-2 text-xs text-muted-foreground px-1 animate-in fade-in slide-in-from-top-1 duration-150">
          <p>• 전면 유리 균열 (좌측 하단 ~ 우측 상단 대각선)</p>
          <p>• 터치 일부 미인식 구간 발생</p>
          <p>• 후면 카메라 렌즈 흠집 (기능 정상)</p>
          <p>• 사이드 버튼 헐거움</p>
        </div>
      )}
    </Card>
  );
}

function NotificationFeed() {
  return (
    <Card className="p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">실시간 알림</h3>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          <span className="text-xs text-muted-foreground">실시간 연결됨</span>
        </div>
      </div>
      <div className="flex flex-col divide-y divide-border/40">
        {NOTIFICATIONS.map((n) => (
          <div
            key={n.id}
            className={`flex gap-3 py-3 ${n.read ? "opacity-60" : ""}`}
          >
            <div className="flex flex-col items-center gap-1 shrink-0 pt-1">
              <div className={`w-2 h-2 rounded-full ${n.dot}`} />
              {n.id < NOTIFICATIONS.length && (
                <div className="w-px flex-1 bg-border/40" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p
                className={`text-xs leading-relaxed ${n.read ? "text-muted-foreground" : "text-foreground font-medium"}`}
              >
                {n.msg}
              </p>
              <p className="text-[11px] text-muted-foreground/60 mt-0.5">
                {n.time}
              </p>
            </div>
            {!n.read && (
              <Bell className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" />
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

export default function CustomerDashboard() {
  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-semibold text-foreground">대시보드</h1>
        <p className="text-sm text-muted-foreground mt-1">
          안녕하세요, 김민준 님. 현재 진행 중인 A/S가 있습니다.
        </p>
      </div>

      <StatusStepper />

      <div className="grid md:grid-cols-2 gap-5">
        <ASRequestCard />
        <NotificationFeed />
      </div>
    </div>
  );
}
