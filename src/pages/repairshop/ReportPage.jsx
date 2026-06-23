import { useState } from "react";
import {
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Save,
  ArrowLeft,
  Clock,
  FileText,
} from "lucide-react";
import { Button, Card, Badge, UploadZone } from "../../components/shared";

// ── Data ──────────────────────────────────────────────────────────────────────

const REPORT_ITEMS = [
  {
    id: "1",
    orderNo: "CM-20240613-0042",
    customer: "김민준",
    device: "iPhone 15 Pro 실버 256GB",
    issue: "전면 유리 균열, 터치 미인식",
    receivedAt: "2024.06.13",
    visitAt: "2024.06.13 14:00",
    status: "in_progress",
    hasReport: false,
  },
  {
    id: "2",
    orderNo: "CM-20240613-0039",
    customer: "이수연",
    device: "Galaxy S24 Ultra",
    issue: "배터리 팽창, 발열",
    receivedAt: "2024.06.13",
    visitAt: "2024.06.13 10:00",
    status: "pending",
    hasReport: false,
  },
  {
    id: "3",
    orderNo: "CM-20240612-0031",
    customer: "박도현",
    device: "iPhone 14 블랙",
    issue: "카메라 렌즈 파손",
    receivedAt: "2024.06.12",
    visitAt: "2024.06.12 11:00",
    status: "pending",
    hasReport: false,
  },
  {
    id: "4",
    orderNo: "CM-20240611-0024",
    customer: "최지아",
    device: "Pixel 8 Pro",
    issue: "침수 수리",
    receivedAt: "2024.06.11",
    visitAt: "2024.06.11 15:00",
    status: "completed",
    hasReport: true,
  },
  {
    id: "5",
    orderNo: "CM-20240610-0018",
    customer: "정우성",
    device: "Galaxy Z Flip 5",
    issue: "힌지 파손",
    receivedAt: "2024.06.10",
    visitAt: "2024.06.10 13:00",
    status: "completed",
    hasReport: true,
  },
  {
    id: "6",
    orderNo: "CM-20240609-0011",
    customer: "한예슬",
    device: "iPhone 13 mini",
    issue: "스피커 불량",
    receivedAt: "2024.06.09",
    visitAt: "2024.06.09 16:00",
    status: "pending",
    hasReport: false,
  },
];

const STATUS_CONFIG = {
  pending: { label: "리포트 작성 필요", badgeVariant: "yellow" },
  in_progress: { label: "수리 진행 중", badgeVariant: "accent" },
  completed: { label: "완료", badgeVariant: "green" },
};

// ── List Page ─────────────────────────────────────────────────────────────────

const PAGE_SIZE = 4;

function ReportList({ onSelect }) {
  const [page, setPage] = useState(0);
  const [filter, setFilter] = useState("all");

  const filtered = REPORT_ITEMS.filter(
    (r) => filter === "all" || r.status === filter,
  );
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const pendingCount = REPORT_ITEMS.filter(
    (r) => r.status !== "completed",
  ).length;

  return (
    <div className="flex flex-col gap-5 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">수리 리포트</h1>
          <p className="text-sm text-muted-foreground mt-1">
            리포트 작성이 필요한 건수:{" "}
            <span className="text-accent font-semibold">{pendingCount}건</span>
          </p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-secondary p-0.5 rounded-xl w-fit">
        {["all", "pending", "in_progress", "completed"].map((f) => {
          const labels = {
            all: "전체",
            pending: "작성 필요",
            in_progress: "수리 중",
            completed: "완료",
          };
          return (
            <button
              key={f}
              onClick={() => {
                setFilter(f);
                setPage(0);
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                filter === f
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {labels[f]}
            </button>
          );
        })}
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-3">
        {paged.map((item) => {
          const cfg = STATUS_CONFIG[item.status];
          return (
            <Card
              key={item.id}
              onClick={() => onSelect(item)}
              className="p-5 cursor-pointer hover:border-accent/30 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col gap-2 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono text-muted-foreground">
                      {item.orderNo}
                    </span>
                    <Badge variant={cfg.badgeVariant}>{cfg.label}</Badge>
                    {item.hasReport && (
                      <span className="flex items-center gap-1 text-[11px] text-green-600 dark:text-green-400">
                        <FileText className="w-3 h-3" />
                        리포트 완성
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {item.customer}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {item.device}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground bg-secondary px-2.5 py-1 rounded-lg inline-block w-fit">
                    {item.issue}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      접수: {item.receivedAt}
                    </span>
                    <span>방문 예약: {item.visitAt}</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0 mt-1" />
              </div>
            </Card>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-3 py-1.5 text-xs font-medium border border-border rounded-lg hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            이전
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              className={`w-7 h-7 text-xs font-medium rounded-lg transition-all ${
                page === i
                  ? "bg-accent text-white"
                  : "border border-border hover:bg-secondary text-foreground"
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            className="px-3 py-1.5 text-xs font-medium border border-border rounded-lg hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            다음
          </button>
        </div>
      )}
    </div>
  );
}

// ── Detail / Write Page ───────────────────────────────────────────────────────

function CurrencyInput({ label, value, onChange }) {
  const formatted = value
    ? Number(value.replace(/[^0-9]/g, "")).toLocaleString("ko-KR")
    : "";
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-muted-foreground">
        {label}
      </label>
      <div className="relative">
        <input
          value={formatted}
          onChange={(e) => onChange(e.target.value.replace(/[^0-9]/g, ""))}
          placeholder="0"
          className="w-full pl-3.5 pr-10 py-2.5 text-sm bg-secondary border border-border rounded-xl text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all text-right"
        />

        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
          원
        </span>
      </div>
    </div>
  );
}

function ReportDetail({ item, onBack }) {
  const [repairStatus, setRepairStatus] = useState("repairing");
  const [partCost, setPartCost] = useState("");
  const [laborCost, setLaborCost] = useState("");
  const [log, setLog] = useState("");
  const [saved, setSaved] = useState(false);

  const total = (Number(partCost) || 0) + (Number(laborCost) || 0);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="flex flex-col gap-5 max-w-2xl">
      {/* Back + header */}
      <div>
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          리포트 목록으로
        </button>
        <h1 className="text-xl font-semibold text-foreground">
          수리 리포트 작성
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">{item.orderNo}</p>
      </div>

      {/* Status switch */}
      <Card
        className={`p-4 flex items-center justify-between gap-4 ${
          repairStatus === "completed"
            ? "bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700/50"
            : "bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-700/50"
        }`}
      >
        <div className="flex items-center gap-3">
          {repairStatus === "completed" ? (
            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
          )}
          <div>
            <p
              className={`text-sm font-semibold ${repairStatus === "completed" ? "text-green-800 dark:text-green-300" : "text-amber-800 dark:text-amber-300"}`}
            >
              {repairStatus === "completed"
                ? "수리 완료 · 결제 대기"
                : "수리 진행 중"}
            </p>
            <p
              className={`text-xs mt-0.5 ${repairStatus === "completed" ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400"}`}
            >
              {repairStatus === "completed"
                ? "리포트 저장 시 고객에게 결제 요청이 발송됩니다."
                : "수리 완료 후 상태를 변경하세요."}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-card rounded-lg p-0.5 shrink-0 border border-border">
          {[
            ["repairing", "수리중"],
            ["completed", "수리완료"],
          ].map(([v, l]) => (
            <button
              key={v}
              onClick={() => setRepairStatus(v)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                repairStatus === v
                  ? v === "completed"
                    ? "bg-green-500 text-white shadow-sm"
                    : "bg-amber-500 text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </Card>

      {/* Order info */}
      <div className="flex items-center gap-3 p-3 bg-secondary rounded-xl text-xs text-muted-foreground">
        <span className="font-mono font-medium text-foreground">
          {item.orderNo}
        </span>
        <span>·</span>
        <span>
          {item.customer} · {item.device}
        </span>
        <span>·</span>
        <span>{item.issue}</span>
      </div>

      {/* Cost inputs */}
      <Card className="p-5 flex flex-col gap-5">
        <h3 className="text-sm font-semibold text-foreground">비용 입력</h3>
        <div className="grid grid-cols-2 gap-4">
          <CurrencyInput
            label="부품비"
            value={partCost}
            onChange={setPartCost}
          />
          <CurrencyInput
            label="공임비"
            value={laborCost}
            onChange={setLaborCost}
          />
        </div>
        <div className="flex justify-between items-center p-3.5 bg-secondary rounded-xl">
          <span className="text-sm font-medium text-muted-foreground">
            합계
          </span>
          <span className="text-base font-bold text-foreground">
            {total.toLocaleString("ko-KR")}원
          </span>
        </div>
      </Card>

      {/* Log */}
      <Card className="p-5 flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-foreground">
          정비 내용 기록
        </h3>
        <textarea
          value={log}
          onChange={(e) => setLog(e.target.value)}
          placeholder="수행한 수리 내용을 상세히 기술해주세요."
          rows={5}
          className="w-full px-3.5 py-3 text-sm bg-secondary border border-border rounded-xl text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 resize-none transition-all"
        />
      </Card>

      {/* Uploads */}
      <Card className="p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">
            증빙 서류 업로드
          </h3>
          <span className="text-xs text-red-500 font-medium">* 필수</span>
        </div>
        <p className="text-xs text-muted-foreground">
          보험 청구 패키지 생성을 위해 공식 수리 영수증과 결제 확인서를
          업로드하세요.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <UploadZone
            label="공식 수리 영수증 (PDF)"
            sublabel="PDF · 최대 10MB"
          />
          <UploadZone
            label="결제 확인서 이미지"
            sublabel="JPG, PNG · 최대 5MB"
          />
        </div>
      </Card>

      {/* Save */}
      <div className="flex items-center justify-between p-4 bg-card border border-border rounded-2xl">
        {saved ? (
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm font-medium animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" />
            저장 완료. 고객에게 알림이 발송되었습니다.
          </div>
        ) : (
          <div />
        )}
        <Button variant="accent" size="md" onClick={handleSave}>
          <Save className="w-4 h-4" />
          리포트 저장 및 고객 알림 발송
        </Button>
      </div>
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────

export default function ReportPage() {
  const [selected, setSelected] = useState(null);

  if (selected) {
    return <ReportDetail item={selected} onBack={() => setSelected(null)} />;
  }

  return <ReportList onSelect={setSelected} />;
}
