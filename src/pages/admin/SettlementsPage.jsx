import { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "sonner";
import {
  Calendar,
  PlayCircle,
  RefreshCw,
  Loader2,
  Store,
  X,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  MinusCircle,
  History,
  Send,
  BellOff,
  ChevronDown,
} from "lucide-react";
import { Card, Badge } from "../../components/shared";
import {
  getAdminMonthlySettlements,
  getAdminShopSettlementDetail,
  runSettlementBatch,
  getBatchExecutionLogs,
  getCommissionBillings,
  notifyShop as apiNotifyShop,
  notifyAllPending as apiNotifyAllPending,
  updateShopFeeRate as apiUpdateFeeRate,
  updateCommissionDueDate as apiUpdateDueDate,
} from "../../api/settlement";

// ── Formatters & Helpers ───────────────────────────────────────────────────────
const fmt = (n) => "₩" + Number(n ?? 0).toLocaleString("ko-KR");
const FEE_RATE = 0.1;
const fee = (gross) => Math.round(Number(gross ?? 0) * FEE_RATE);

function currentYearMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function recentMonths(n) {
  const result = [];
  const now = new Date();
  for (let i = 0; i < n; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    result.push(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    );
  }
  return result;
}

// ── Status Configs ─────────────────────────────────────────────────────────────
const BATCH_STATUS = {
  SUCCESS:      { label: "성공",                       variant: "green",  icon: CheckCircle2 },
  PARTIAL_FAIL: { label: "부분 실패",                  variant: "yellow", icon: AlertTriangle },
  FAILED:       { label: "실패",                       variant: "red",    icon: XCircle },
  SKIPPED:      { label: "중복 실행 방지(이미 완료됨)", variant: "muted",  icon: MinusCircle },
};

const BILLING_STATUS = {
  PENDING:  { label: "미발송",       variant: "muted",  icon: BellOff },
  NOTIFIED: { label: "청구 발송됨",  variant: "accent", icon: Send },
  PAID:     { label: "납부 완료",    variant: "green",  icon: CheckCircle2 },
  OVERDUE:  { label: "연체",         variant: "red",    icon: AlertTriangle },
};

function BatchStatusBadge({ status }) {
  const cfg = BATCH_STATUS[status] ?? BATCH_STATUS.FAILED;
  const Icon = cfg.icon;
  return (
    <Badge variant={cfg.variant}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </Badge>
  );
}

function BillingStatusBadge({ status }) {
  const cfg = BILLING_STATUS[status] ?? BILLING_STATUS.PENDING;
  const Icon = cfg.icon;
  return (
    <Badge variant={cfg.variant}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </Badge>
  );
}

const PAGE_SIZE = 10;

// ── Main Component ─────────────────────────────────────────────────────────────
export default function SettlementsPage() {
  const [activeTab, setActiveTab] = useState("batch");
  const MONTHS = useMemo(() => recentMonths(6), []);

  // ── Tab 1: 배치 관제 State ────────────────────────────────────────────────────
  const [yearMonth, setYearMonth] = useState(currentYearMonth());
  const [stats, setStats] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [selectedShop, setSelectedShop] = useState(null);
  const [shopDetail, setShopDetail] = useState([]);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [batchMonth, setBatchMonth] = useState(currentYearMonth());
  const [running, setRunning] = useState(false);
  const [lastRunResult, setLastRunResult] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(true);

  // ── Tab 2: 수수료 청구 State ──────────────────────────────────────────────────
  const [commissionMonth, setCommissionMonth] = useState(MONTHS[0]);
  const [billings, setBillings] = useState([]);
  const [loadingBillings, setLoadingBillings] = useState(false);
  const [sendingId, setSendingId] = useState(null);
  const [sendingAll, setSendingAll] = useState(false);
  const [editingRate, setEditingRate] = useState(null);    // { shopId, value }
  const [editingDueDate, setEditingDueDate] = useState(null); // { settlementId, value }
  // 페이징
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  // 서버 집계 (전체 페이지 기준)
  const [serverTotalFee, setServerTotalFee] = useState(0);
  const [serverPendingCount, setServerPendingCount] = useState(0);

  // ── Tab 1: Loaders ────────────────────────────────────────────────────────────
  const loadStats = useCallback(async (ym) => {
    setLoadingStats(true);
    try {
      const res = await getAdminMonthlySettlements(ym || undefined);
      const data = res.data.data ?? [];
      data.sort(
        (a, b) =>
          b.settlementMonth.localeCompare(a.settlementMonth) ||
          a.repairShopId - b.repairShopId
      );
      setStats(data);
    } catch {
      toast.error("정산 통계를 불러오지 못했습니다.");
    } finally {
      setLoadingStats(false);
    }
  }, []);

  const loadLogs = useCallback(async () => {
    setLoadingLogs(true);
    try {
      const res = await getBatchExecutionLogs();
      setLogs(res.data.data ?? []);
    } catch {
      toast.error("배치 실행 로그를 불러오지 못했습니다.");
    } finally {
      setLoadingLogs(false);
    }
  }, []);

  useEffect(() => { loadStats(yearMonth); }, [yearMonth, loadStats]);
  useEffect(() => { loadLogs(); }, [loadLogs]);

  const handleShopClick = async (shopId) => {
    setSelectedShop({ id: shopId });
    setLoadingDetail(true);
    try {
      const res = await getAdminShopSettlementDetail(shopId);
      const data = res.data.data ?? [];
      data.sort((a, b) => b.settlementMonth.localeCompare(a.settlementMonth));
      setShopDetail(data);
    } catch {
      toast.error("수리점 정산 상세를 불러오지 못했습니다.");
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleRunBatch = async () => {
    if (!/^\d{4}-\d{2}$/.test(batchMonth)) {
      toast.error("연월 형식은 yyyy-MM 이어야 합니다. (예: 2026-06)");
      return;
    }
    setRunning(true);
    setLastRunResult(null);
    try {
      const res = await runSettlementBatch(batchMonth);
      const result = res.data.data;
      setLastRunResult(result);
      if (result.status === "SUCCESS")
        toast.success(`${batchMonth} 정산 배치가 성공적으로 완료되었습니다.`);
      else if (result.status === "PARTIAL_FAIL")
        toast.warning(`${batchMonth} 정산 배치가 일부 수리점에서 실패했습니다.`);
      else if (result.status === "SKIPPED")
        toast.info(result.message ?? "이미 실행된 배치입니다.");
      else
        toast.error(result.message ?? "배치 실행에 실패했습니다.");
      await Promise.all([loadStats(yearMonth), loadLogs()]);
    } catch (e) {
      const message =
        e.response?.data?.error?.message ?? "배치 실행 중 오류가 발생했습니다.";
      setLastRunResult({ settlementMonth: batchMonth, status: "FAILED", message });
      toast.error(message);
    } finally {
      setRunning(false);
    }
  };

  // ── Tab 2: Loaders & Actions ──────────────────────────────────────────────────
  const loadBillings = useCallback(async (ym, pg = 0) => {
    setLoadingBillings(true);
    try {
      const res = await getCommissionBillings(ym, pg, PAGE_SIZE);
      const data = res.data.data ?? {};
      setBillings(data.content ?? []);
      setTotalPages(data.totalPages ?? 0);
      setTotalElements(data.totalElements ?? 0);
      setServerTotalFee(data.totalFeeAmount ?? 0);
      setServerPendingCount(data.pendingCount ?? 0);
    } catch {
      toast.error("수수료 청구 현황을 불러오지 못했습니다.");
    } finally {
      setLoadingBillings(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "commission") loadBillings(commissionMonth, page);
  }, [activeTab, commissionMonth, page, loadBillings]);

  const handleNotifyShop = async (settlementId) => {
    setSendingId(settlementId);
    try {
      const res = await apiNotifyShop(settlementId);
      const updated = res.data.data;
      setBillings((prev) =>
        prev.map((b) => (b.settlementId === updated.settlementId ? updated : b))
      );
      setServerPendingCount((prev) => Math.max(0, prev - 1));
      toast.success("청구 요청 알림을 발송했습니다.");
    } catch {
      toast.error("청구 요청 발송에 실패했습니다.");
    } finally {
      setSendingId(null);
    }
  };

  const handleNotifyAll = async () => {
    if (serverPendingCount === 0) {
      toast.info("발송 대상(미발송) 수리점이 없습니다.");
      return;
    }
    const prevPending = serverPendingCount;
    setSendingAll(true);
    try {
      await apiNotifyAllPending(commissionMonth);
      await loadBillings(commissionMonth, page);
      toast.success(`${prevPending}개 수리점에 청구 요청 알림을 일괄 발송했습니다.`);
    } catch {
      toast.error("일괄 발송에 실패했습니다.");
    } finally {
      setSendingAll(false);
    }
  };

  // ── 납부 기한 인라인 편집 핸들러 ────────────────────────────────────────────────
  const startEditDueDate = (b) =>
    setEditingDueDate({ settlementId: b.settlementId, value: b.dueDate ?? "" });

  const cancelEditDueDate = () => setEditingDueDate(null);

  const saveEditDueDate = async () => {
    if (!editingDueDate) return;
    const { settlementId, value } = editingDueDate;
    if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      toast.error("날짜 형식이 올바르지 않습니다.");
      cancelEditDueDate();
      return;
    }
    setEditingDueDate(null);
    try {
      const res = await apiUpdateDueDate(settlementId, value);
      const updated = res.data.data;
      setBillings((prev) =>
        prev.map((b) => (b.settlementId === updated.settlementId ? updated : b))
      );
      toast.success("납부 기한이 변경되었습니다.");
    } catch {
      toast.error("납부 기한 변경에 실패했습니다.");
      loadBillings(commissionMonth, page);
    }
  };

  const startEditRate = (b) =>
    setEditingRate({ shopId: b.repairShopId, value: String(b.feeRate) });

  const cancelEditRate = () => setEditingRate(null);

  const saveEditRate = async () => {
    if (!editingRate) return;
    const newRate = parseInt(editingRate.value, 10);
    if (isNaN(newRate) || newRate < 1 || newRate > 100) {
      toast.error("수수료율은 1~100 사이 숫자여야 합니다.");
      cancelEditRate();
      return;
    }
    const { shopId } = editingRate;
    setEditingRate(null);
    try {
      await apiUpdateFeeRate(shopId, newRate);
      setBillings((prev) =>
        prev.map((b) =>
          b.repairShopId === shopId
            ? { ...b, feeRate: newRate, feeAmount: Math.round((b.totalPaymentAmount * newRate) / 100) }
            : b
        )
      );
      toast.success("수수료율이 변경되었습니다.");
    } catch {
      toast.error("수수료율 변경에 실패했습니다.");
      loadBillings(commissionMonth);
    }
  };

  // ── Commission: 서버에서 받은 전체 기준 집계 ─────────────────────────────────────
  const commissionSummary = useMemo(() => ({
    total: totalElements,
    pending: serverPendingCount,
    totalFee: serverTotalFee,
  }), [totalElements, serverPendingCount, serverTotalFee]);

  // ── Render ─────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-semibold text-foreground">정산·배치 관리</h1>
        <p className="text-sm text-muted-foreground mt-1">
          월말 정산 배치 관제 및 수리점별 수수료 청구 요청을 관리합니다.
        </p>
      </div>

      {/* Tab Bar */}
      <div className="flex border-b border-border -mt-2">
        {[
          { key: "batch",      label: "월말 정산 배치 관제" },
          { key: "commission", label: "수수료 청구 관리" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors -mb-px whitespace-nowrap ${
              activeTab === t.key
                ? "border-accent text-accent"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Tab 1: 월말 정산 배치 관제 ──────────────────────────────────────── */}
      {activeTab === "batch" && (
        <div className="flex flex-col gap-6">
          {/* 배치 수동 실행 */}
          <Card className="p-5 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <PlayCircle className="w-4 h-4 text-accent" />
              <h3 className="text-sm font-semibold text-foreground">
                배치 수동 실행 / 재실행
              </h3>
            </div>
            <p className="text-xs text-muted-foreground -mt-2">
              자동 배치는 매달 말일 자정(KST)에 실행됩니다. 장애로 실행이 안 됐거나
              특정 월을 다시 집계해야 할 때 여기서 수동으로 실행하세요. 이미
              <span className="font-medium text-foreground"> 성공(SUCCESS)</span>
              으로 처리된 연월은 중복 실행이 자동으로 차단됩니다.
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <input
                  type="text"
                  value={batchMonth}
                  onChange={(e) => setBatchMonth(e.target.value)}
                  placeholder="2026-06"
                  className="pl-9 pr-3.5 py-2.5 text-sm bg-secondary border border-border rounded-xl text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all w-36 font-mono"
                />
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
              </div>
              <button
                onClick={handleRunBatch}
                disabled={running}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-accent text-white hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {running ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <PlayCircle className="w-4 h-4" />
                )}
                {running ? "실행 중..." : "배치 실행"}
              </button>
              {lastRunResult && (
                <div className="flex items-center gap-2 pl-2">
                  <BatchStatusBadge status={lastRunResult.status} />
                  <span className="text-xs text-muted-foreground">
                    {lastRunResult.message}
                  </span>
                </div>
              )}
            </div>
          </Card>

          {/* 정산 통계 */}
          <Card className="overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  월간 정산 통계 (수리점별)
                </h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  플랫폼 수수료는 매출의 {FEE_RATE * 100}%가 기본이며, 조정될 수 있습니다.
                </p>
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={yearMonth}
                  onChange={(e) => setYearMonth(e.target.value)}
                  placeholder="전체 조회는 비워두세요"
                  className="pl-9 pr-3.5 py-2 text-xs bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all w-56 font-mono"
                />
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            {loadingStats ? (
              <div className="flex items-center justify-center py-16 gap-2 text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm">불러오는 중...</span>
              </div>
            ) : stats.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Store className="w-8 h-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground text-center">
                  해당 조건으로 집계된 정산 데이터가 없습니다.
                  <br />
                  아직 배치가 실행되지 않았을 수 있습니다 — 위에서 배치를 실행해보세요.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border/40 bg-secondary/50">
                      {["정산월", "수리점 ID", "총 결제 매출", "결제 건수", `플랫폼 수수료(${FEE_RATE * 100}%)`, "예상 환급 총합", ""].map((h) => (
                        <th key={h} className="text-left py-3 px-4 text-muted-foreground font-semibold whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {stats.map((s) => (
                      <tr key={s.settlementId} className="border-b border-border/20 hover:bg-secondary/40 transition-colors">
                        <td className="py-3 px-4 font-mono text-foreground">{s.settlementMonth}</td>
                        <td className="py-3 px-4 text-muted-foreground">#{s.repairShopId}</td>
                        <td className="py-3 px-4 font-semibold text-foreground">{fmt(s.totalPaymentAmount)}</td>
                        <td className="py-3 px-4 text-muted-foreground">{s.orderCount}건</td>
                        <td className="py-3 px-4 text-red-600 dark:text-red-400 font-medium">{fmt(fee(s.totalPaymentAmount))}</td>
                        <td className="py-3 px-4 text-muted-foreground">{fmt(s.totalExpectedRefundAmount)}</td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleShopClick(s.repairShopId)}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium bg-accent/10 text-accent rounded-lg hover:bg-accent/15 transition-colors border border-accent/20 whitespace-nowrap"
                          >
                            <History className="w-3 h-3" />
                            이력 보기
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* 수리점 상세 이력 패널 */}
            {selectedShop && (
              <div className="border-t border-border px-5 py-4 bg-secondary/30">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Store className="w-3.5 h-3.5 text-accent" />
                    <h4 className="text-xs font-semibold text-foreground">
                      수리점 #{selectedShop.id} 정산 이력
                    </h4>
                  </div>
                  <button onClick={() => setSelectedShop(null)} className="p-1 rounded-lg hover:bg-secondary transition-colors">
                    <X className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                </div>
                {loadingDetail ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  </div>
                ) : shopDetail.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-4 text-center">
                    해당 수리점의 정산 이력이 없습니다.
                  </p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {shopDetail.map((d) => (
                      <div key={d.settlementId} className="flex items-center justify-between text-xs bg-card border border-border rounded-xl px-4 py-2.5">
                        <span className="font-mono font-medium text-foreground w-20">{d.settlementMonth}</span>
                        <span className="text-muted-foreground">매출 {fmt(d.totalPaymentAmount)}</span>
                        <span className="text-muted-foreground">{d.orderCount}건</span>
                        <span className="text-red-600 dark:text-red-400">수수료 {fmt(fee(d.totalPaymentAmount))}</span>
                        <span className="text-muted-foreground">예상환급 {fmt(d.totalExpectedRefundAmount)}</span>
                        <span className="text-muted-foreground/70">
                          {d.createdAt ? new Date(d.createdAt).toLocaleString("ko-KR") : "—"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* 배치 실행 로그 */}
          <Card className="overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground">배치 실행 로그</h3>
              <button
                onClick={loadLogs}
                disabled={loadingLogs}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingLogs ? "animate-spin" : ""}`} />
                새로고침
              </button>
            </div>
            {loadingLogs ? (
              <div className="flex items-center justify-center py-16 gap-2 text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm">불러오는 중...</span>
              </div>
            ) : logs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <History className="w-8 h-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">아직 실행된 배치가 없습니다.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border/40 bg-secondary/50">
                      {["정산월", "실행 일시", "대상 수리점 수", "성공", "실패", "집계 총액", "상태"].map((h) => (
                        <th key={h} className="text-left py-3 px-4 text-muted-foreground font-semibold whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((l) => (
                      <tr key={l.id} className="border-b border-border/20 hover:bg-secondary/40 transition-colors">
                        <td className="py-3 px-4 font-mono text-foreground">{l.settlementMonth}</td>
                        <td className="py-3 px-4 text-muted-foreground whitespace-nowrap font-mono">
                          {l.executedAt ? new Date(l.executedAt).toLocaleString("ko-KR") : "—"}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">{l.targetShopCount}개</td>
                        <td className="py-3 px-4 text-green-700 dark:text-green-400 font-medium">{l.successCount}</td>
                        <td className="py-3 px-4 text-red-600 dark:text-red-400 font-medium">{l.failCount}</td>
                        <td className="py-3 px-4 font-semibold text-foreground">{fmt(l.totalAmount)}</td>
                        <td className="py-3 px-4"><BatchStatusBadge status={l.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ── Tab 2: 수수료 청구 관리 ────────────────────────────────────────────── */}
      {activeTab === "commission" && (
        <div className="flex flex-col gap-4">
          {/* 헤더: 월 선택 + 요약 + 일괄 발송 */}
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              {/* 월 선택 드롭다운 */}
              <div className="relative">
                <select
                  value={commissionMonth}
                  onChange={(e) => { setPage(0); setCommissionMonth(e.target.value); }}
                  className="appearance-none pl-9 pr-8 py-2.5 text-sm bg-secondary border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all font-mono cursor-pointer"
                >
                  {MONTHS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            {/* 일괄 발송 버튼 */}
            <button
              onClick={handleNotifyAll}
              disabled={sendingAll || loadingBillings || commissionSummary.pending === 0}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-accent text-white hover:bg-accent/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {sendingAll ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {sendingAll ? "발송 중..." : "PENDING 전체 일괄 발송"}
            </button>
          </div>

          {/* 청구 테이블 */}
          <Card className="overflow-hidden">
            {loadingBillings ? (
              <div className="flex items-center justify-center py-20 gap-2 text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm">불러오는 중...</span>
              </div>
            ) : billings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Store className="w-8 h-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground text-center">
                  {commissionMonth}에 대한 정산 데이터가 없습니다.
                  <br />
                  월말 정산 배치 관제 탭에서 배치를 실행해보세요.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border/40 bg-secondary/50">
                      {[
                        "수리점명",
                        "총 결제매출",
                        "결제 건수",
                        "수수료율(%)",
                        "청구 수수료",
                        "납부 기한",
                        "발송 일시",
                        "상태",
                        "청구 발송",
                      ].map((h) => (
                        <th
                          key={h}
                          className="text-left py-3 px-4 text-muted-foreground font-semibold whitespace-nowrap"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {billings.map((b) => (
                      <tr
                        key={b.settlementId}
                        className="border-b border-border/20 hover:bg-secondary/30 transition-colors"
                      >
                        {/* 수리점명 */}
                        <td className="py-3 px-4">
                          <span className="font-medium text-foreground">{b.shopName}</span>
                          <span className="block text-muted-foreground/60 text-[10px]">
                            #{b.repairShopId}
                          </span>
                        </td>

                        {/* 총 결제매출 */}
                        <td className="py-3 px-4 font-semibold text-foreground whitespace-nowrap">
                          {fmt(b.totalPaymentAmount)}
                        </td>

                        {/* 결제 건수 */}
                        <td className="py-3 px-4 text-muted-foreground">
                          {b.orderCount}건
                        </td>

                        {/* 수수료율 — PENDING/OVERDUE만 인라인 편집 가능 */}
                        <td className="py-3 px-4">
                          {editingRate?.shopId === b.repairShopId ? (
                            <input
                              autoFocus
                              type="number"
                              min="1"
                              max="100"
                              value={editingRate.value}
                              onChange={(e) =>
                                setEditingRate({ ...editingRate, value: e.target.value })
                              }
                              onKeyDown={(e) => {
                                if (e.key === "Enter") saveEditRate();
                                if (e.key === "Escape") cancelEditRate();
                              }}
                              onBlur={saveEditRate}
                              className="w-16 px-2 py-1 text-xs bg-card border-2 border-accent rounded-lg text-foreground focus:outline-none font-mono"
                            />
                          ) : (b.billingStatus === "NOTIFIED" || b.billingStatus === "PAID") ? (
                            <span
                              className="px-2 py-1 text-muted-foreground font-semibold font-mono cursor-not-allowed"
                              title="청구 발송 또는 납부 완료 후에는 수수료율을 변경할 수 없습니다."
                            >
                              {b.feeRate}%
                            </span>
                          ) : (
                            <button
                              onClick={() => startEditRate(b)}
                              className="px-2 py-1 rounded-lg text-accent font-semibold hover:bg-accent/10 transition-colors border border-accent/30 font-mono"
                              title="클릭하여 수수료율 편집"
                            >
                              {b.feeRate}%
                            </button>
                          )}
                        </td>

                        {/* 청구 수수료 */}
                        <td className="py-3 px-4 text-red-600 dark:text-red-400 font-semibold whitespace-nowrap">
                          {fmt(b.feeAmount)}
                        </td>

                        {/* 납부 기한 — PENDING/OVERDUE만 인라인 편집 */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          {editingDueDate?.settlementId === b.settlementId ? (
                            <input
                              autoFocus
                              type="date"
                              value={editingDueDate.value}
                              onChange={(e) =>
                                setEditingDueDate({ ...editingDueDate, value: e.target.value })
                              }
                              onKeyDown={(e) => {
                                if (e.key === "Enter") saveEditDueDate();
                                if (e.key === "Escape") cancelEditDueDate();
                              }}
                              onBlur={saveEditDueDate}
                              className="w-36 px-2 py-1 text-xs bg-card border-2 border-accent rounded-lg text-foreground focus:outline-none font-mono"
                            />
                          ) : (b.billingStatus === "NOTIFIED" || b.billingStatus === "PAID") ? (
                            <span className="text-muted-foreground font-mono">
                              {b.dueDate ?? "—"}
                            </span>
                          ) : (
                            <button
                              onClick={() => startEditDueDate(b)}
                              className="px-2 py-1 rounded-lg text-foreground font-mono hover:bg-accent/10 hover:text-accent transition-colors border border-transparent hover:border-accent/30"
                              title="클릭하여 납부 기한 편집"
                            >
                              {b.dueDate ?? "—"}
                            </button>
                          )}
                        </td>

                        {/* 발송 일시 */}
                        <td className="py-3 px-4 text-muted-foreground font-mono whitespace-nowrap">
                          {b.notifiedAt ?? "—"}
                        </td>

                        {/* 상태 */}
                        <td className="py-3 px-4">
                          <BillingStatusBadge status={b.billingStatus} />
                        </td>

                        {/* 청구 발송 버튼 */}
                        <td className="py-3 px-4">
                          {b.billingStatus === "PAID" ? (
                            <span className="text-muted-foreground/60 text-[11px]">납부 완료</span>
                          ) : b.billingStatus === "NOTIFIED" ? (
                            <span className="text-muted-foreground/60 text-[11px]">발송됨</span>
                          ) : (
                            <button
                              onClick={() => handleNotifyShop(b.settlementId)}
                              disabled={sendingId === b.settlementId}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold rounded-lg bg-accent text-white hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                            >
                              {sendingId === b.settlementId ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Send className="w-3 h-3" />
                              )}
                              {b.billingStatus === "OVERDUE" ? "재발송" : "발송"}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1">
              <button
                onClick={() => setPage(0)}
                disabled={page === 0}
                className="px-2 py-1.5 text-xs rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                «
              </button>
              <button
                onClick={() => setPage((p) => p - 1)}
                disabled={page === 0}
                className="px-3 py-1.5 text-xs rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                ‹ 이전
              </button>
              {Array.from({ length: totalPages }, (_, i) => i).map((i) => (
                <button
                  key={i}
                  onClick={() => setPage(i)}
                  className={`w-8 h-8 text-xs rounded-lg transition-colors ${
                    i === page
                      ? "bg-accent text-white font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= totalPages - 1}
                className="px-3 py-1.5 text-xs rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                다음 ›
              </button>
              <button
                onClick={() => setPage(totalPages - 1)}
                disabled={page >= totalPages - 1}
                className="px-2 py-1.5 text-xs rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                »
              </button>
            </div>
          )}

          {/* 하단 집계 요약 */}
          {!loadingBillings && billings.length > 0 && (
            <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-secondary/60 border border-border text-xs">
              <div className="flex items-center gap-4">
                <span className="text-muted-foreground">
                  수리점 수
                  <span className="ml-1.5 font-semibold text-foreground">{commissionSummary.total}개</span>
                </span>
                {commissionSummary.pending > 0 && (
                  <span className="text-muted-foreground">
                    미발송
                    <span className="ml-1.5 font-semibold text-amber-600 dark:text-amber-400">{commissionSummary.pending}건</span>
                  </span>
                )}
              </div>
              <span className="text-muted-foreground">
                청구 수수료 합계
                <span className="ml-1.5 font-semibold text-red-600 dark:text-red-400 text-sm">
                  {fmt(commissionSummary.totalFee)}
                </span>
              </span>
            </div>
          )}

          {/* 안내 문구 */}
          <p className="text-[11px] text-muted-foreground pl-1">
            · 수수료율(%)·납부 기한 셀은 미발송(PENDING)·연체(OVERDUE) 상태에서만 클릭하여 변경할 수 있습니다.
            <br />
            · 발송 시 해당 수리점 담당자의 앱 알림으로 청구 요청이 전달됩니다.
            PAID 상태는 수동으로 관리하세요.
          </p>
        </div>
      )}
    </div>
  );
}
