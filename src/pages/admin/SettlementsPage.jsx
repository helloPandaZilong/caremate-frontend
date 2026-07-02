import { useState, useEffect, useCallback } from "react";
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
} from "lucide-react";
import { Card, Badge } from "../../components/shared";
import {
  getAdminMonthlySettlements,
  getAdminShopSettlementDetail,
  runSettlementBatch,
  getBatchExecutionLogs,
} from "../../api/settlement";

function fmt(n) {
  return "₩" + Number(n ?? 0).toLocaleString("ko-KR");
}

// 플랫폼 수수료율 — 프론트 표시 전용 참고값. monthly_settlements 테이블에는
// 수수료 관련 컬럼이 없으며(9.3 — 순수 매출 집계 통계), 백엔드 계산·저장값이 아니다.
const FEE_RATE = 0.1;
const fee = (gross) => Math.round(Number(gross ?? 0) * FEE_RATE);

function currentYearMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

// ── 배치/정산 상태 배지 ──────────────────────────────────────────────────────
const STATUS_CONFIG = {
  SUCCESS: { label: "성공", variant: "green", icon: CheckCircle2 },
  PARTIAL_FAIL: { label: "부분 실패", variant: "yellow", icon: AlertTriangle },
  FAILED: { label: "실패", variant: "red", icon: XCircle },
  SKIPPED: { label: "중복 실행 방지(이미 완료됨)", variant: "muted", icon: MinusCircle },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.FAILED;
  const Icon = cfg.icon;
  return (
    <Badge variant={cfg.variant}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </Badge>
  );
}

export default function SettlementsPage() {
  // ── 정산 통계 ──────────────────────────────────────────────────────────────
  const [yearMonth, setYearMonth] = useState(currentYearMonth());
  const [stats, setStats] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);

  // ── 수리점 상세 이력 ──────────────────────────────────────────────────────
  const [selectedShop, setSelectedShop] = useState(null); // { id }
  const [shopDetail, setShopDetail] = useState([]);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // ── 배치 수동 실행 ────────────────────────────────────────────────────────
  const [batchMonth, setBatchMonth] = useState(currentYearMonth());
  const [running, setRunning] = useState(false);
  const [lastRunResult, setLastRunResult] = useState(null);

  // ── 배치 실행 로그 ────────────────────────────────────────────────────────
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(true);

  // 정산 통계 로드 (연월 필터, 빈 값이면 전체)
  const loadStats = useCallback(async (ym) => {
    setLoadingStats(true);
    try {
      const res = await getAdminMonthlySettlements(ym || undefined);
      const data = res.data.data ?? [];
      // 최신월 → 수리점ID 순 정렬
      data.sort(
        (a, b) =>
          b.settlementMonth.localeCompare(a.settlementMonth) ||
          a.repairShopId - b.repairShopId,
      );
      setStats(data);
    } catch {
      toast.error("정산 통계를 불러오지 못했습니다.");
    } finally {
      setLoadingStats(false);
    }
  }, []);

  // 배치 실행 로그 로드
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

  useEffect(() => {
    loadStats(yearMonth);
  }, [yearMonth, loadStats]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  // 수리점 클릭 → 정산 이력 조회
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

  // 배치 수동 실행
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

      if (result.status === "SUCCESS") {
        toast.success(`${batchMonth} 정산 배치가 성공적으로 완료되었습니다.`);
      } else if (result.status === "PARTIAL_FAIL") {
        toast.warning(`${batchMonth} 정산 배치가 일부 수리점에서 실패했습니다.`);
      } else if (result.status === "SKIPPED") {
        toast.info(result.message ?? "이미 실행된 배치입니다.");
      } else {
        toast.error(result.message ?? "배치 실행에 실패했습니다.");
      }

      // 실행 결과가 반영된 최신 통계·로그로 갱신
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

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">
          월말 정산 배치 관제
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          수리점별 매출 정산 통계 조회 및 월말 배치 수동 실행/재실행을 관리합니다.
        </p>
      </div>

      {/* ── 배치 수동 실행 ────────────────────────────────────────────── */}
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
              <StatusBadge status={lastRunResult.status} />
              <span className="text-xs text-muted-foreground">
                {lastRunResult.message}
              </span>
            </div>
          )}
        </div>
      </Card>

      {/* ── 정산 통계 ─────────────────────────────────────────────────── */}
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
            <p className="text-sm text-muted-foreground">
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
                  {[
                    "정산월",
                    "수리점 ID",
                    "총 결제 매출",
                    "결제 건수",
                    `플랫폼 수수료(${FEE_RATE * 100}%)`,
                    "예상 환급 총합",
                    "",
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
                {stats.map((s) => (
                  <tr
                    key={s.settlementId}
                    className="border-b border-border/20 hover:bg-secondary/40 transition-colors"
                  >
                    <td className="py-3 px-4 font-mono text-foreground">
                      {s.settlementMonth}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      #{s.repairShopId}
                    </td>
                    <td className="py-3 px-4 font-semibold text-foreground">
                      {fmt(s.totalPaymentAmount)}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {s.orderCount}건
                    </td>
                    <td className="py-3 px-4 text-red-600 dark:text-red-400 font-medium">
                      {fmt(fee(s.totalPaymentAmount))}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {fmt(s.totalExpectedRefundAmount)}
                    </td>
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
              <button
                onClick={() => setSelectedShop(null)}
                className="p-1 rounded-lg hover:bg-secondary transition-colors"
              >
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
                  <div
                    key={d.settlementId}
                    className="flex items-center justify-between text-xs bg-card border border-border rounded-xl px-4 py-2.5"
                  >
                    <span className="font-mono font-medium text-foreground w-20">
                      {d.settlementMonth}
                    </span>
                    <span className="text-muted-foreground">
                      매출 {fmt(d.totalPaymentAmount)}
                    </span>
                    <span className="text-muted-foreground">
                      {d.orderCount}건
                    </span>
                    <span className="text-red-600 dark:text-red-400">
                      수수료 {fmt(fee(d.totalPaymentAmount))}
                    </span>
                    <span className="text-muted-foreground">
                      예상환급 {fmt(d.totalExpectedRefundAmount)}
                    </span>
                    <span className="text-muted-foreground/70">
                      {d.createdAt
                        ? new Date(d.createdAt).toLocaleString("ko-KR")
                        : "—"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Card>

      {/* ── 배치 실행 로그 ────────────────────────────────────────────── */}
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">
            배치 실행 로그
          </h3>
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
            <p className="text-sm text-muted-foreground">
              아직 실행된 배치가 없습니다.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border/40 bg-secondary/50">
                  {[
                    "정산월",
                    "실행 일시",
                    "대상 수리점 수",
                    "성공",
                    "실패",
                    "집계 총액",
                    "상태",
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
                {logs.map((l) => (
                  <tr
                    key={l.id}
                    className="border-b border-border/20 hover:bg-secondary/40 transition-colors"
                  >
                    <td className="py-3 px-4 font-mono text-foreground">
                      {l.settlementMonth}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground whitespace-nowrap font-mono">
                      {l.executedAt
                        ? new Date(l.executedAt).toLocaleString("ko-KR")
                        : "—"}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {l.targetShopCount}개
                    </td>
                    <td className="py-3 px-4 text-green-700 dark:text-green-400 font-medium">
                      {l.successCount}
                    </td>
                    <td className="py-3 px-4 text-red-600 dark:text-red-400 font-medium">
                      {l.failCount}
                    </td>
                    <td className="py-3 px-4 font-semibold text-foreground">
                      {fmt(l.totalAmount)}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={l.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

