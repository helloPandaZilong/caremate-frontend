import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import {
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Save,
  ArrowLeft,
  Clock,
  FileText,
  Play,
  Plus,
  X as XIcon,
  Sparkles,
  Info,
  Upload,
  Camera,
  ImagePlus,
  Download,
} from "lucide-react";
import { Button, Card, Badge } from "../../components/shared";
import { getOrders, startRepair, completeRepair, repairImpossible, parseRepairFile, submitReportFeedback, uploadOrderImage, getOrderImages, deleteOrderImage, saveReport, downloadReportPdf, getReport } from "../../api/repairshopApi";

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
  impossible: { label: "수리 불가", badgeVariant: "red" },
};

// ── List Page ─────────────────────────────────────────────────────────────────

const PAGE_SIZE = 4;

// 백엔드 status → 화면 status 매핑
const BE_STATUS_MAP = {
  IN_REPAIR: "in_progress",        // 수리 중
  REPAIR_DONE: "completed",
  REPAIR_IMPOSSIBLE: "impossible", // 수리 불가 — 결제 없음
  PAYMENT_COMPLETED: "completed",
  CLAIM_REQUESTED: "completed",
  CLAIM_COMPLETED: "completed",
};

function fmtDate(s) {
  if (!s) return "-";
  const d = new Date(s);
  return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,"0")}.${String(d.getDate()).padStart(2,"0")}`;
}

function ReportList({ onSelect }) {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [filter, setFilter] = useState("all");
  const [customerName, setCustomerName] = useState("");
  const [items, setItems] = useState(REPORT_ITEMS);
  const [startingId, setStartingId] = useState(null);

  const loadOrders = useCallback(() => {
    getOrders({ size: 100 })
      .then((data) => {
        const raw = data?.content ?? data ?? [];
        if (!raw.length) { setItems([]); return; }
        const mapped = raw
          .filter((o) => BE_STATUS_MAP[o.status])   // RECEIVED는 대시보드에서 처리
          .map((o) => ({
            id: o.id,
            orderNo: o.orderNo,
            customer: o.customerName,
            device: null,
            issue: o.damageDescription ?? null,
            receivedAt: fmtDate(o.createdAt),
            visitAt: fmtDate(o.reservedVisitAt) + (o.reservedVisitAt ? " " + String(new Date(o.reservedVisitAt).getHours()).padStart(2,"0") + ":00" : ""),
            status: BE_STATUS_MAP[o.status],
            hasReport: ["REPAIR_DONE","PAYMENT_COMPLETED","CLAIM_REQUESTED","CLAIM_COMPLETED"].includes(o.status),
            rawStatus: o.status,
          }));
        setItems(mapped);
      })
      .catch(() => {});
  }, []);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  async function handleStartRepair(item) {
    if (!window.confirm("수리를 시작하시겠습니까?")) return;
    setStartingId(item.id);
    try {
      await startRepair(item.id);
      loadOrders();
    } catch {
      alert("처리 중 오류가 발생했습니다.");
    } finally {
      setStartingId(null);
    }
  }

  const filtered = items.filter((r) => {
    if (filter !== "all" && r.status !== filter) return false;
    if (customerName.trim() && !r.customer?.toLowerCase().includes(customerName.trim().toLowerCase())) return false;
    return true;
  });
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const pendingCount = items.filter(
    (r) => r.status === "in_progress",
  ).length;

  return (
    <div className="flex flex-col gap-5 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">수리 리포트</h1>
          <p className="text-sm text-muted-foreground mt-1">
            리포트 작성이 필요한 건수:{" "}
            <button
              className="text-accent font-semibold hover:underline"
              onClick={() => { setFilter("in_progress"); setPage(0); }}
            >{pendingCount}건</button>
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2">
        <div className="relative">
          <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            placeholder="고객명 검색"
            value={customerName}
            onChange={e => { setCustomerName(e.target.value); setPage(0); }}
            className="pl-7 pr-3 py-1.5 text-xs rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
        {customerName && (
          <button
            className="text-xs text-muted-foreground hover:text-foreground"
            onClick={() => { setCustomerName(""); setPage(0); }}
          >초기화</button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-secondary p-0.5 rounded-xl w-fit">
        {["all", "in_progress", "completed", "impossible"].map((f) => {
          const labels = {
            all: "전체",
            in_progress: "수리 중",
            completed: "완료",
            impossible: "수리 불가",
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
              className="p-5 hover:border-accent/30 hover:shadow-md transition-all"
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

                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  {/* ACCEPTED → 수리 시작 */}
                  {item.status === "pending" && (
                    <button
                      onClick={() => handleStartRepair(item)}
                      disabled={startingId === item.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-accent text-white hover:bg-accent/90 disabled:opacity-50 transition-all"
                    >
                      <Play className="w-3 h-3" />
                      {startingId === item.id ? "처리 중..." : "수리 시작"}
                    </button>
                  )}
                  {/* IN_REPAIR → 리포트 작성 */}
                  {item.status === "in_progress" && (
                    <button
                      onClick={() => onSelect(item)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-accent text-white hover:bg-accent/90 transition-all"
                    >
                      리포트 작성
                    </button>
                  )}
                  {/* 완료 → 내역 이동 + (결제완료면 뱃지 / 아니면 수정하기) */}
                  {item.status === "completed" && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => navigate(`/shop/orders/${item.id}`)}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg border border-border text-muted-foreground hover:bg-secondary transition-all"
                      >
                        내역 이동
                      </button>
                      {["PAYMENT_COMPLETED", "CLAIM_REQUESTED", "CLAIM_COMPLETED"].includes(item.rawStatus) ? (
                        <span className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-green-100 text-green-700 border border-green-200">
                          결제 완료
                        </span>
                      ) : (
                        <button
                          onClick={() => onSelect(item)}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-accent text-white hover:bg-accent/90 transition-all"
                        >
                          수정하기
                        </button>
                      )}
                    </div>
                  )}
                  {/* 수리 불가 → 내역 이동만 */}
                  {item.status === "impossible" && (
                    <button
                      onClick={() => navigate(`/shop/orders/${item.id}`)}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg border border-border text-muted-foreground hover:bg-secondary transition-all"
                    >
                      내역 이동
                    </button>
                  )}
                </div>
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

const REPAIR_RESULT_OPTIONS = [
  { value: "success", label: "정상 완료" },
  { value: "partial", label: "부분 완료" },
  { value: "fail",    label: "수리 불가" },
];
const WARRANTY_OPTIONS = ["없음", "1개월", "3개월", "6개월", "1년"];

function ReportDetail({ item, onBack }) {
  const [repairStatus, setRepairStatus] = useState(
    item.rawStatus !== "IN_REPAIR" ? "completed" : "repairing"
  );
  const [laborCost, setLaborCost] = useState("");
  const [saved, setSaved] = useState(false);
  // 이미 REPAIR_DONE인 경우 또는 이번 세션에서 전이 완료된 경우 재호출 방지
  const [statusTransitioned, setStatusTransitioned] = useState(
    item.rawStatus !== "IN_REPAIR"
  );
  const [saving, setSaving] = useState(false);
  const [aiDraft, setAiDraft] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [aiSnapshot, setAiSnapshot] = useState(null); // AI 원본 결과 보존 (피드백용)

  // 수리 불가 처리
  const [showImpossibleModal, setShowImpossibleModal] = useState(false);
  const [impossibleReason, setImpossibleReason] = useState("");
  const [impossibleLoading, setImpossibleLoading] = useState(false);

  const handleRepairImpossible = async () => {
    if (!impossibleReason.trim()) return;
    setImpossibleLoading(true);
    try {
      await repairImpossible(item.id, impossibleReason);
      setShowImpossibleModal(false);
      onBack(); // 목록으로 복귀
    } catch {
      alert("처리 중 오류가 발생했습니다.");
    } finally {
      setImpossibleLoading(false);
    }
  };

  // 수리 사진 상태
  const [beforeImages, setBeforeImages] = useState([]); // { url, uploading }
  const [afterImages, setAfterImages] = useState([]);

  const handleImageUpload = async (file, type) => {
    if (!file) return;
    const placeholder = { url: URL.createObjectURL(file), uploading: true };
    if (type === "BEFORE_REPAIR") setBeforeImages((prev) => [...prev, placeholder]);
    else setAfterImages((prev) => [...prev, placeholder]);

    try {
      const { id, imageUrl } = await uploadOrderImage(item.id, type, file);
      const replace = (prev) =>
        prev.map((img) => (img.url === placeholder.url ? { id, url: imageUrl, uploading: false } : img));
      if (type === "BEFORE_REPAIR") setBeforeImages(replace);
      else setAfterImages(replace);
    } catch {
      // 업로드 실패 시 placeholder 제거
      const remove = (prev) => prev.filter((img) => img.url !== placeholder.url);
      if (type === "BEFORE_REPAIR") setBeforeImages(remove);
      else setAfterImages(remove);
      alert("사진 업로드에 실패했습니다. 다시 시도해주세요.");
    }
  };

  // 정비 내용 구조화 상태
  const [diagnosis, setDiagnosis] = useState("");
  const [repairRows, setRepairRows] = useState([{ item: "", part: "", qty: "1", unitPrice: "" }]);
  const [repairResult, setRepairResult] = useState("");
  const [warranty, setWarranty] = useState("3개월");
  const [remarks, setRemarks] = useState("");

  // 기존 저장된 리포트 + 이미지 로드
  useEffect(() => {
    Promise.all([
      getReport(item.id).catch(() => null),
      getOrderImages(item.id).catch(() => null),
    ]).then(([report, imgData]) => {
      if (report) {
        if (report.troubleDescription) setDiagnosis(report.troubleDescription);
        if (report.repairRows?.length) setRepairRows(report.repairRows.map((r) => ({
          item: r.item ?? "",
          part: r.part ?? "",
          qty: String(r.qty ?? 1),
          unitPrice: String(r.unitPrice ?? ""),
        })));
        if (report.repairResult) setRepairResult(report.repairResult);
        if (report.warranty) setWarranty(report.warranty);
        if (report.laborCost) setLaborCost(String(report.laborCost));
        if (report.remarks) setRemarks(report.remarks);
      }
      if (imgData) {
        const before = (imgData.beforeRepair ?? []).map((i) => ({ id: i.id, url: i.url, uploading: false }));
        const after  = (imgData.afterRepair  ?? []).map((i) => ({ id: i.id, url: i.url, uploading: false }));
        setBeforeImages(before);
        setAfterImages(after);
      }
    });
  }, [item.id]);

  const addRow = () => setRepairRows((r) => [...r, { item: "", part: "", qty: "1", unitPrice: "" }]);
  const removeRow = (i) => setRepairRows((r) => r.filter((_, idx) => idx !== i));
  const updateRow = (i, field, val) =>
    setRepairRows((r) => r.map((row, idx) => (idx === i ? { ...row, [field]: val } : row)));

  const partCost = repairRows.reduce((sum, row) => sum + (Number(row.qty) || 0) * (Number(row.unitPrice) || 0), 0);
  const total = partCost + (Number(laborCost) || 0);

  const handleSave = async () => {
    // 수정 모드(statusTransitioned)면 고객 알림 재발송 안내
    if (statusTransitioned) {
      const ok = window.confirm(
        "수정 내용이 저장되고 고객에게 변경 알림이 발송됩니다.\n계속하시겠습니까?"
      );
      if (!ok) return;
    }
    setSaving(true);
    try {
      // 1. 리포트 DB 저장
      await saveReport(item.id, {
        troubleDescription: diagnosis,
        repairRows: repairRows.map((r) => ({
          item: r.item,
          part: r.part,
          qty: Number(r.qty) || 1,
          unitPrice: Number(r.unitPrice) || 0,
        })),
        partsCost: partCost,
        laborCost: Number(laborCost) || 0,
        totalRepairCost: total,
        repairResult: repairResult || "success",
        warranty,
        remarks,
      });

      // 2. 수리 완료 상태 전이 (아직 전이 안 된 경우에만)
      if (repairStatus === "completed" && !statusTransitioned) {
        await completeRepair(item.id);
        setStatusTransitioned(true);
      }

      // 3. AI 피드백 저장 (AI 사용한 경우에만)
      if (aiSnapshot) {
        submitReportFeedback({
          orderId: item.id,
          aiDraft: aiSnapshot,
          finalData: { diagnosis, repairRows, repairResult, warranty, laborCost: Number(laborCost) || 0, remarks },
        }).catch(() => {});
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      alert("처리 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadPdf = async () => {
    try {
      await downloadReportPdf(item.id, item.customer);
    } catch {
      alert("PDF 다운로드에 실패했습니다. 리포트를 먼저 저장해주세요.");
    }
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
        {statusTransitioned ? (
          <span className="px-3 py-1.5 text-xs font-medium rounded-md bg-green-500 text-white shadow-sm shrink-0">
            수리완료
          </span>
        ) : (
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
        )}
      </Card>

      {/* 수정 모드 안내 배너 */}
      {statusTransitioned && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50">
          <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 dark:text-amber-400">
            이미 고객에게 알림이 발송된 리포트입니다. 수정 시 고객에게 변경 알림이 자동 발송됩니다. 결제 완료 후에는 수정이 불가능합니다.
          </p>
        </div>
      )}

      {/* AI 초안 배너 */}
      {aiDraft && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-700/50 animate-in fade-in slide-in-from-top-2 duration-300">
          <Info className="w-4 h-4 text-violet-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs font-semibold text-violet-700 dark:text-violet-300">AI 초안이 작성됐어요.</p>
            <p className="text-xs text-violet-600 dark:text-violet-400 mt-0.5">내용을 검토하고 필요한 부분을 수정한 뒤 저장해주세요.</p>
          </div>
          <button onClick={() => setAiDraft(false)} className="text-violet-400 hover:text-violet-600 transition-colors">
            <XIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Order info */}
      <div className="flex items-center gap-3 p-3 bg-secondary rounded-xl text-xs text-muted-foreground flex-wrap">
        <span className="font-mono font-medium text-foreground">
          {item.orderNo}
        </span>
        <span>·</span>
        <span>{item.customer}</span>
        {item.device && item.device !== "-" && <><span>·</span><span>{item.device}</span></>}
        {item.issue && item.issue !== "-" && <><span>·</span><span>{item.issue}</span></>}
      </div>

      {/* 정비 내용 기록 */}
      <Card className="p-5 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">정비 내용 기록</h3>
          <div className="flex items-center gap-2">
            {/* 파일 업로드 버튼 */}
            <label className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-violet-300 text-violet-600 transition-colors ${aiGenerating ? "opacity-50 cursor-not-allowed pointer-events-none" : "hover:bg-violet-50 cursor-pointer"}`}>
              <Upload className="w-3.5 h-3.5" />
              파일 첨부
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file || aiGenerating) return;
                  setAiError(null);
                  setAiGenerating(true);
                  try {
                    const result = await parseRepairFile(file, {
                      customer: item.customer,
                      device: item.device,
                      issue: item.issue,
                    });

                    // 고객 이름 무결성 검사
                    if (item.customer) {
                      const parsedName = result.customerName?.trim() || null;
                      if (!parsedName) {
                        setAiError(`파일에 고객 이름이 없습니다. 현재 주문 고객: ${item.customer} — 파일을 확인해주세요.`);
                        return;
                      }
                      const normalize = (s) => s.replace(/\s/g, "").toLowerCase();
                      if (normalize(parsedName) !== normalize(item.customer)) {
                        setAiError(`고객 이름이 다릅니다. 주문: ${item.customer} / 파일: ${parsedName} — 파일을 확인해주세요.`);
                        return;
                      }
                    }

                    if (result.diagnosis)   setDiagnosis(result.diagnosis);
                    if (result.repairRows?.length) setRepairRows(result.repairRows.map((r) => ({
                      item: r.item ?? "",
                      part: r.part ?? "",
                      qty: String(r.qty ?? 1),
                      unitPrice: String(r.unitPrice ?? ""),
                    })));
                    if (result.repairResult) setRepairResult(result.repairResult);
                    if (result.warranty)    setWarranty(result.warranty);
                    if (result.laborCost)   setLaborCost(String(result.laborCost));
                    if (result.remarks)     setRemarks(result.remarks);
                    setAiSnapshot(result); // AI 원본 보존 (피드백용)
                    setAiDraft(true);
                  } catch {
                    setAiError("AI 서버가 일시적으로 혼잡합니다. 잠시 후 다시 시도해주세요.");
                  } finally {
                    setAiGenerating(false);
                    e.target.value = "";
                  }
                }}
              />
            </label>
            {/* AI 생성 상태 표시 */}
            {aiGenerating && (
              <span className="flex items-center gap-1.5 text-xs text-violet-500 font-medium">
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                AI 분석 중...
              </span>
            )}
          </div>
          {/* AI 에러 메시지 */}
          {aiError && (
            <p className="text-xs text-red-500 mt-1">{aiError}</p>
          )}
        </div>

        {/* 고장 진단 결과 */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-muted-foreground">고장 진단 결과</label>
          <textarea
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
            placeholder="점검 후 확인된 고장 원인 및 상태를 기입하세요."
            rows={3}
            className="w-full px-3.5 py-3 text-sm bg-secondary border border-border rounded-xl text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-accent/30 resize-none transition-all"
          />
        </div>

        {/* 수리 내역 테이블 */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-muted-foreground">수리 내역</label>
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-secondary">
                <tr>
                  {["수리 항목", "부품명", "수량", "단가 (원)", ""].map((h) => (
                    <th key={h} className="px-3 py-2 text-left font-medium text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {repairRows.map((row, i) => {
                  const amount = (Number(row.qty) || 0) * (Number(row.unitPrice) || 0);
                  return (
                    <tr key={i} className="border-t border-border">
                      <td className="px-2 py-1.5">
                        <input
                          value={row.item}
                          onChange={(e) => updateRow(i, "item", e.target.value)}
                          placeholder="예: 액정 교체"
                          className="w-full px-2 py-1 bg-transparent text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
                        />
                      </td>
                      <td className="px-2 py-1.5">
                        <input
                          value={row.part}
                          onChange={(e) => updateRow(i, "part", e.target.value)}
                          placeholder="예: LCD 패널"
                          className="w-full px-2 py-1 bg-transparent text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
                        />
                      </td>
                      <td className="px-2 py-1.5 w-14">
                        <input
                          value={row.qty}
                          onChange={(e) => updateRow(i, "qty", e.target.value)}
                          type="number" min="1"
                          className="w-full px-2 py-1 bg-transparent text-foreground text-center focus:outline-none"
                        />
                      </td>
                      <td className="px-2 py-1.5 w-28">
                        <input
                          value={row.unitPrice}
                          onChange={(e) => updateRow(i, "unitPrice", e.target.value.replace(/[^0-9]/g, ""))}
                          placeholder="0"
                          className="w-full px-2 py-1 bg-transparent text-foreground text-right focus:outline-none placeholder:text-muted-foreground/50"
                        />
                      </td>
                      <td className="px-2 py-1.5 w-8 text-center">
                        <button
                          type="button"
                          onClick={() => removeRow(i)}
                          disabled={repairRows.length === 1}
                          className="p-1 rounded text-muted-foreground hover:text-red-500 disabled:opacity-30 transition-colors"
                        >
                          <XIcon className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <button
            type="button"
            onClick={addRow}
            className="flex items-center gap-1.5 text-xs text-accent hover:text-accent/80 font-medium w-fit transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            항목 추가
          </button>
        </div>

        {/* 수리 결과 + 보증 기간 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-muted-foreground">수리 결과</label>
            <div className="flex gap-1.5">
              {REPAIR_RESULT_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRepairResult(value)}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-all ${
                    repairResult === value
                      ? value === "success" ? "bg-green-500 text-white border-green-500"
                        : value === "partial" ? "bg-amber-500 text-white border-amber-500"
                        : "bg-red-500 text-white border-red-500"
                      : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-muted-foreground">품질 보증 기간</label>
            <div className="flex gap-1.5 flex-wrap">
              {WARRANTY_OPTIONS.map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => setWarranty(w)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                    warranty === w
                      ? "bg-accent text-white border-accent"
                      : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 비고 */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-muted-foreground">비고</label>
          <textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="고객 전달 사항, 추가 점검 권고 항목 등을 입력하세요."
            rows={2}
            className="w-full px-3.5 py-3 text-sm bg-secondary border border-border rounded-xl text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-accent/30 resize-none transition-all"
          />
        </div>
      </Card>

      {/* Cost inputs */}
      <Card className="p-5 flex flex-col gap-5">
        <h3 className="text-sm font-semibold text-foreground">비용 입력</h3>
        <div className="grid grid-cols-2 gap-4">
          {/* 부품비: 수리 내역 테이블 누계 자동 반영 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">부품비 (수리 내역 합계)</label>
            <div className="relative">
              <input
                readOnly
                value={partCost.toLocaleString("ko-KR")}
                className="w-full pl-3.5 pr-10 py-2.5 text-sm bg-secondary/50 border border-border rounded-xl text-foreground text-right cursor-default"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">원</span>
            </div>
          </div>
          <CurrencyInput
            label="공임비"
            value={laborCost}
            onChange={setLaborCost}
          />
        </div>
        <div className="flex justify-between items-center p-3.5 bg-secondary rounded-xl">
          <span className="text-sm font-medium text-muted-foreground">합계</span>
          <span className="text-base font-bold text-foreground">{total.toLocaleString("ko-KR")}원</span>
        </div>
      </Card>

      {/* 수리 사진 */}
      <Card className="p-5 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Camera className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-foreground">수리 사진</h3>
        </div>

        {[
          { label: "수리 전", type: "BEFORE_REPAIR", images: beforeImages },
          { label: "수리 후", type: "AFTER_REPAIR",  images: afterImages  },
        ].map(({ label, type, images }) => (
          <div key={type} className="flex flex-col gap-2">
            <p className="text-xs font-medium text-muted-foreground">{label}</p>
            <div className="flex flex-wrap gap-2">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className="relative w-20 h-20 rounded-xl overflow-hidden border border-border bg-secondary group"
                >
                  <img
                    src={img.url}
                    alt={`${label} ${idx + 1}`}
                    className={`w-full h-full object-cover transition-opacity ${img.uploading ? "opacity-40" : "opacity-100"}`}
                    onError={(e) => { e.currentTarget.style.display = "none"; }}
                  />
                  {img.uploading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                  {!img.uploading && (
                    <button
                      onClick={async () => {
                        if (img.id) {
                          try { await deleteOrderImage(item.id, img.id); } catch {}
                        }
                        const remove = (prev) => prev.filter((_, i) => i !== idx);
                        if (type === "BEFORE_REPAIR") setBeforeImages(remove);
                        else setAfterImages(remove);
                      }}
                      className="absolute top-1 right-1 w-5 h-5 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <XIcon className="w-3 h-3 text-white" />
                    </button>
                  )}
                </div>
              ))}

              {/* 추가 버튼 */}
              <label className="w-20 h-20 rounded-xl border-2 border-dashed border-border hover:border-accent hover:bg-accent/5 flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors">
                <ImagePlus className="w-5 h-5 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground">추가</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file, type);
                    e.target.value = "";
                  }}
                />
              </label>
            </div>
          </div>
        ))}
      </Card>

      {/* Save */}
      <div className="flex items-center justify-between p-4 bg-card border border-border rounded-2xl">
        {saved ? (
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm font-medium animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" />
            {statusTransitioned
              ? "수정 내용이 저장되고 고객에게 변경 알림이 발송됐습니다."
              : repairStatus === "completed"
              ? "리포트가 저장되고 고객에게 알림이 발송됐습니다."
              : "임시 저장됐습니다."}
          </div>
        ) : (
          /* 수리 불가 처리 버튼 — IN_REPAIR 상태에서만 노출 */
          item.rawStatus === "IN_REPAIR" ? (
            <button
              onClick={() => setShowImpossibleModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium border border-red-200 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
            >
              수리 불가 처리
            </button>
          ) : <div />
        )}
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadPdf}
            disabled={!statusTransitioned}
            title={!statusTransitioned ? "리포트 저장 및 고객 알림 발송 후 PDF를 다운로드할 수 있습니다." : undefined}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium border border-border rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-muted-foreground transition-all"
          >
            <Download className="w-4 h-4" />
            PDF 다운로드
          </button>
          {statusTransitioned ? (
            /* 이미 저장+알림 완료 → 수정하기 (알림 없음) */
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium border border-border rounded-xl text-foreground hover:bg-secondary disabled:opacity-50 transition-all"
            >
              <Save className="w-4 h-4" />
              {saving ? "저장 중..." : "수정하기"}
            </button>
          ) : repairStatus === "completed" ? (
            /* 수리완료 선택 + 미저장 → 저장 + 알림 발송 */
            <Button variant="accent" size="md" onClick={handleSave} disabled={saving}>
              <Save className="w-4 h-4" />
              {saving ? "처리 중..." : "리포트 저장 및 고객 알림 발송"}
            </Button>
          ) : (
            /* 수리중 → 임시 저장 */
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium border border-border rounded-xl text-foreground hover:bg-secondary disabled:opacity-50 transition-all"
            >
              <Save className="w-4 h-4" />
              {saving ? "저장 중..." : "임시 저장"}
            </button>
          )}
        </div>
      </div>

      {/* 수리 불가 모달 */}
      {showImpossibleModal && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
          onClick={() => setShowImpossibleModal(false)}
        >
          <div
            className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-semibold text-foreground mb-1">수리 불가 처리</h3>
            <p className="text-sm text-muted-foreground mb-4">
              고객에게 수리 불가 사유가 전달됩니다. 결제 요청은 발송되지 않습니다.
            </p>
            <textarea
              className="w-full px-3.5 py-3 text-sm bg-secondary border border-border rounded-xl text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-red-400/30 resize-none"
              placeholder="수리 불가 사유를 입력해주세요..."
              rows={4}
              value={impossibleReason}
              onChange={(e) => setImpossibleReason(e.target.value)}
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                className="px-4 py-2 text-sm font-medium border border-border rounded-xl text-muted-foreground hover:bg-secondary transition-all"
                onClick={() => setShowImpossibleModal(false)}
              >
                취소
              </button>
              <button
                className="px-4 py-2 text-sm font-medium bg-red-500 hover:bg-red-600 text-white rounded-xl disabled:opacity-50 transition-all"
                disabled={!impossibleReason.trim() || impossibleLoading}
                onClick={handleRepairImpossible}
              >
                {impossibleLoading ? "처리 중..." : "수리 불가 확정"}
              </button>
            </div>
          </div>
        </div>
      )}
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
