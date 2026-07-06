import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  DollarSign,
  CheckCircle2,
  ShieldCheck,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { Card } from "../../components/shared";
import { useDarkMode } from "../../hooks/useDarkMode";
import { getAdminDashboard } from "../../api/admin";

// ── 유틸 ───────────────────────────────────────────────────────────────────────

function fmtWon(v) {
  if (v == null) return "₩0";
  if (v >= 100_000_000) return `₩${(v / 100_000_000).toFixed(1)}억`;
  if (v >= 10_000) return `₩${Math.round(v / 10_000).toLocaleString()}만`;
  return `₩${v.toLocaleString()}`;
}

function fmtWonShort(v) {
  return `₩${(v / 10_000).toFixed(0)}만`;
}

function fmtDate(s) {
  if (!s) return "-";
  const d = new Date(s);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

// "2026-02" → "2월"
function fmtMonth(ym) {
  if (!ym) return "";
  const m = parseInt(ym.split("-")[1], 10);
  return `${m}월`;
}

// ── KPI 카드 ───────────────────────────────────────────────────────────────────

function KPICard({ title, value, icon: Icon, color, sub }) {
  return (
    <Card className="p-5 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: `${color}18` }}
        >
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
        <p className="text-xs font-medium text-muted-foreground leading-tight">
          {title}
        </p>
      </div>
      <p className="text-2xl font-bold text-foreground tracking-tight">
        {value}
      </p>
      {sub && (
        <p className="text-[11px] text-muted-foreground -mt-1">{sub}</p>
      )}
    </Card>
  );
}

// ── 이상 징후 타입 배지 색상 ────────────────────────────────────────────────────

function anomalyBadge(type) {
  if (type === "DLQ")
    return "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30";
  if (type === "결제_무결성")
    return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30";
  return "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30";
}

function anomalyLabel(type) {
  if (type === "DLQ") return "DLQ";
  if (type === "결제_무결성") return "무결성 위반";
  return "배치 정산";
}

// ── 로딩 스켈레톤 ───────────────────────────────────────────────────────────────

function Skeleton({ className }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-secondary/60 ${className}`}
    />
  );
}

// ── 메인 컴포넌트 ───────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const { dark } = useDarkMode();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = () => {
    setLoading(true);
    setError(null);
    getAdminDashboard()
      .then(setData)
      .catch(() => setError("데이터를 불러오지 못했습니다."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  // Recharts 색상 (CSS 변수 미지원)
  const tickColor = dark ? "#94A3B8" : "#6B7280";
  const gridColor = dark
    ? "rgba(241,245,249,0.08)"
    : "rgba(26,29,46,0.06)";
  const tooltipStyle = {
    borderRadius: 12,
    border: `1px solid ${dark ? "rgba(241,245,249,0.12)" : "rgba(26,29,46,0.1)"}`,
    background: dark ? "#1E293B" : "#ffffff",
    color: dark ? "#F1F5F9" : "#1A1D2E",
    fontSize: 12,
  };

  // 차트 데이터 가공
  const barData = (data?.monthlyRevenue ?? []).map((r) => ({
    month: fmtMonth(r.month),
    platformRevenue: r.platformRevenue,
    settlementTotal: r.settlementTotal,
  }));

  const lineData = (data?.monthlyClaimPackets ?? []).map((r) => ({
    month: fmtMonth(r.month),
    total: r.successCount + r.failedCount,
    success: r.successCount,
  }));

  const m = data?.metrics;

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      {/* 헤더 */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            통합 관제 대시보드
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            플랫폼 전체 현황 · 최근 6개월 기준
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          새로 고침
        </button>
      </div>

      {/* 오류 메시지 */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-4 py-3 rounded-lg">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* KPI 카드 4개 */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-5 flex flex-col gap-3">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-7 w-1/2" />
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="총 플랫폼 수익"
            value={m ? fmtWon(m.totalPlatformRevenue) : "₩0"}
            icon={DollarSign}
            color="#D97706"
            sub="정산 총액의 10% 수수료 수익"
          />
          <KPICard
            title="수리점 전체 정산 총액"
            value={m ? fmtWon(m.totalSettlementAmount) : "₩0"}
            icon={TrendingUp}
            color="#0D9488"
            sub="월별 정산 누적 합계 (수수료 차감 전)"
          />
          <KPICard
            title="실시간 엔진 가동 성공률"
            value={m ? `${m.settlementEngineSuccessRate}%` : "100%"}
            icon={CheckCircle2}
            color="#16A34A"
            sub="정산 엔진 실행 기준"
          />
          <KPICard
            title="보험 청구 패키지 생성 성공률"
            value={m ? `${m.claimPackageSuccessRate}%` : "100%"}
            icon={ShieldCheck}
            color="#6366F1"
            sub="AuditLog 기준"
          />
        </div>
      )}

      {/* 차트 2개 */}
      <div className="grid md:grid-cols-2 gap-5">
        {/* 막대 그래프 — 월별 수익 비교 (플랫폼 수익 vs 수리점 정산 총액) */}
        <Card className="p-5">
          <div className="mb-4">
            <p className="text-sm font-semibold text-foreground">
              월별 수익 비교
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              플랫폼 수익(수수료 10%) vs 수리점 전체 정산 총액 (단위: 만원)
            </p>
          </div>
          {loading ? (
            <Skeleton className="h-[220px]" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData} barCategoryGap="25%">
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: tickColor }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={fmtWonShort}
                  tick={{ fontSize: 10, fill: tickColor }}
                  axisLine={false}
                  tickLine={false}
                  width={52}
                />
                <Tooltip
                  formatter={(v, name) => [fmtWonShort(v), name]}
                  labelStyle={{ fontSize: 12, color: tooltipStyle.color }}
                  contentStyle={tooltipStyle}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar
                  dataKey="settlementTotal"
                  name="수리점 정산 총액"
                  fill="#0D9488"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="platformRevenue"
                  name="플랫폼 수익"
                  fill="#D97706"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* 꼭짓점 그래프 — 월별 보험 청구 패킷 */}
        <Card className="p-5">
          <div className="mb-4">
            <p className="text-sm font-semibold text-foreground">
              월별 보험 청구 패킷 현황
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              생성된 청구 패킷 vs 성공 처리 건수
            </p>
          </div>
          {loading ? (
            <Skeleton className="h-[220px]" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: tickColor }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: tickColor }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  labelStyle={{ fontSize: 12, color: tooltipStyle.color }}
                  contentStyle={tooltipStyle}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line
                  type="monotone"
                  dataKey="total"
                  name="총 청구"
                  stroke="#D97706"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="success"
                  name="성공 처리"
                  stroke="#0D9488"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                  strokeDasharray="4 2"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      {/* 최근 이상 징후 3개 */}
      <Card className="p-5">
        <p className="text-sm font-semibold text-foreground mb-4">
          최근 이상 징후
        </p>
        {loading ? (
          <div className="flex flex-col gap-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-10" />
            ))}
          </div>
        ) : !data?.recentAnomalies?.length ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            최근 이상 징후가 없습니다.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border/40">
                  {["유형", "설명", "발생 시각"].map((h) => (
                    <th
                      key={h}
                      className="text-left py-2 px-3 text-muted-foreground font-medium"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.recentAnomalies.map((a, i) => (
                  <tr
                    key={i}
                    className="border-b border-border/20 hover:bg-secondary/50 transition-colors"
                  >
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${anomalyBadge(a.type)}`}
                      >
                        {anomalyLabel(a.type)}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-foreground font-medium">
                      {a.description}
                    </td>
                    <td className="py-3 px-3 text-muted-foreground font-mono whitespace-nowrap">
                      {fmtDate(a.occurredAt)}
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
