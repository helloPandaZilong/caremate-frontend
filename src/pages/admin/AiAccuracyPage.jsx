import { useState, useEffect } from "react";
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  BarChart2,
  RefreshCw,
  Clock,
} from "lucide-react";
import { getAiAccuracyStats } from "../../api/admin";

// ── 필드 한글 라벨 ─────────────────────────────────────────────────────────────

const FIELD_LABELS = {
  diagnosis:   "고장 진단",
  repairRows:  "수리 내역",
  repairResult: "수리 결과",
  warranty:    "보증 기간",
  laborCost:   "공임비",
  remarks:     "특이사항",
};

// ── 날짜 포맷 ──────────────────────────────────────────────────────────────────

function fmtDate(s) {
  if (!s) return "-";
  const d = new Date(s);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

// ── 보정률 색상 ────────────────────────────────────────────────────────────────

function rateColor(rate) {
  if (rate >= 50) return "bg-red-500";
  if (rate >= 30) return "bg-amber-400";
  return "bg-green-500";
}

function rateTextColor(rate) {
  if (rate >= 50) return "text-red-600 dark:text-red-400";
  if (rate >= 30) return "text-amber-600 dark:text-amber-400";
  return "text-green-600 dark:text-green-400";
}

// ── 컴포넌트 ───────────────────────────────────────────────────────────────────

export default function AiAccuracyPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = () => {
    setLoading(true);
    setError(false);
    getAiAccuracyStats()
      .then(setStats)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  // ── 로딩 / 에러 ─────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-6 h-6 text-accent animate-spin" />
          <p className="text-sm text-muted-foreground">데이터 불러오는 중…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="flex flex-col items-center gap-3">
          <AlertCircle className="w-6 h-6 text-destructive" />
          <p className="text-sm text-muted-foreground">데이터를 불러오지 못했습니다.</p>
          <button
            onClick={load}
            className="text-xs text-accent hover:underline"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  const {
    totalCount,
    noCorrectionCount,
    accuracyRate,
    fieldCorrectionCounts = {},
    fieldCorrectionRates = {},
    recentLogs = [],
  } = stats ?? {};

  // 보정률 가장 높은 필드
  const topField = Object.entries(fieldCorrectionRates)
    .sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">AI 정확도 현황</h1>
          <p className="text-sm text-muted-foreground mt-1">
            수리점이 AI 초안을 얼마나 보정했는지 집계한 데이터예요.
          </p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          새로고침
        </button>
      </div>

      {/* 요약 카드 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* 총 파싱 횟수 */}
        <div className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Sparkles className="w-4 h-4" />
            <span className="text-xs font-medium">총 AI 파싱 횟수</span>
          </div>
          <p className="text-3xl font-bold text-foreground">{totalCount}<span className="text-base font-normal text-muted-foreground ml-1">건</span></p>
        </div>

        {/* 정확도 */}
        <div className={`bg-card border rounded-2xl p-5 flex flex-col gap-2 ${
          accuracyRate >= 80
            ? "border-green-200 dark:border-green-700/50 bg-green-50 dark:bg-green-900/20"
            : accuracyRate >= 50
            ? "border-amber-200 dark:border-amber-700/50 bg-amber-50 dark:bg-amber-900/20"
            : "border-red-200 dark:border-red-700/50 bg-red-50 dark:bg-red-900/20"
        }`}>
          <div className="flex items-center gap-2 text-muted-foreground">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-xs font-medium">무보정 정확도</span>
          </div>
          <p className={`text-3xl font-bold ${
            accuracyRate >= 80 ? "text-green-700 dark:text-green-300"
            : accuracyRate >= 50 ? "text-amber-700 dark:text-amber-300"
            : "text-red-700 dark:text-red-300"
          }`}>
            {accuracyRate}<span className="text-base font-normal ml-0.5">%</span>
          </p>
          <p className="text-xs text-muted-foreground">{noCorrectionCount}건 무보정</p>
        </div>

        {/* 최다 보정 필드 */}
        <div className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <BarChart2 className="w-4 h-4" />
            <span className="text-xs font-medium">최다 보정 필드</span>
          </div>
          {topField && topField[1] > 0 ? (
            <>
              <p className="text-2xl font-bold text-foreground">
                {FIELD_LABELS[topField[0]] ?? topField[0]}
              </p>
              <p className={`text-xs font-semibold ${rateTextColor(topField[1])}`}>
                보정률 {topField[1]}%
              </p>
            </>
          ) : (
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">없음 🎉</p>
          )}
        </div>
      </div>

      {/* 필드별 보정률 */}
      <div className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-4">
        <h2 className="text-sm font-semibold text-foreground">필드별 보정률</h2>
        <div className="flex flex-col gap-3">
          {Object.entries(fieldCorrectionRates)
            .sort((a, b) => b[1] - a[1])
            .map(([field, rate]) => (
              <div key={field} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-foreground font-medium">
                    {FIELD_LABELS[field] ?? field}
                  </span>
                  <span className={`font-semibold ${rateTextColor(rate)}`}>
                    {rate}%
                    <span className="text-muted-foreground font-normal ml-1">
                      ({fieldCorrectionCounts[field]}건)
                    </span>
                  </span>
                </div>
                <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${rateColor(rate)}`}
                    style={{ width: `${Math.min(rate, 100)}%` }}
                  />
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* 최근 로그 */}
      <div className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-4">
        <h2 className="text-sm font-semibold text-foreground">최근 피드백 로그</h2>
        {recentLogs.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            아직 기록된 피드백이 없습니다.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 pr-4 text-muted-foreground font-medium">주문 ID</th>
                  <th className="text-left py-2 pr-4 text-muted-foreground font-medium">보정 필드</th>
                  <th className="text-left py-2 text-muted-foreground font-medium">일시</th>
                </tr>
              </thead>
              <tbody>
                {recentLogs.map((log) => (
                  <tr key={log.id} className="border-b border-border last:border-0 hover:bg-secondary/50 transition-colors">
                    <td className="py-2.5 pr-4 font-mono text-foreground">#{log.orderId}</td>
                    <td className="py-2.5 pr-4">
                      {!log.correctedFields || log.correctedFields.length === 0 ? (
                        <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400 font-medium">
                          <CheckCircle2 className="w-3 h-3" />
                          무보정
                        </span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {log.correctedFields.map((f) => (
                            <span
                              key={f}
                              className="px-1.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 font-medium"
                            >
                              {FIELD_LABELS[f] ?? f}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="py-2.5 text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {fmtDate(log.createdAt)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
