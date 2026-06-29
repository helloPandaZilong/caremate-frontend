import { useState, useEffect, useCallback } from "react";
import {
  Award,
  CheckCircle2,
  XCircle,
  Search,
  ChevronDown,
  Trash2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Card, Badge, Button } from "../../components/shared";
import {
  getShopsLmsStatus,
  deleteLmsGuide,
  deleteAllLmsGuides,
} from "../../api/admin";

// ── 삭제 확인 모달 ─────────────────────────────────────────────────────────────

function ConfirmModal({ open, title, description, onConfirm, onCancel, loading }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4 flex flex-col gap-5">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{title}</p>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{description}</p>
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="secondary" size="sm" onClick={onCancel} disabled={loading}>
            취소
          </Button>
          <Button
            size="sm"
            className="bg-red-600 hover:bg-red-700 text-white border-0"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "삭제 중..." : "삭제"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── 가이드 상태 셀 ─────────────────────────────────────────────────────────────

function GuideStatusCell({ guide }) {
  if (!guide || !guide.completed) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <XCircle className="w-3.5 h-3.5" />
        미수료
      </div>
    );
  }
  const date = guide.confirmedAt
    ? new Date(guide.confirmedAt).toLocaleDateString("ko-KR", {
        year: "2-digit",
        month: "2-digit",
        day: "2-digit",
      })
    : "-";
  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400">
        <CheckCircle2 className="w-3.5 h-3.5" />
        수료 완료
      </div>
      <span className="text-[10px] text-muted-foreground">
        {guide.score}% · {date}
      </span>
    </div>
  );
}

// ── 수리점 아코디언 카드 ────────────────────────────────────────────────────────

function ShopCard({ shop, expanded, onToggle, onRefresh }) {
  const [confirm, setConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const GUIDE_LABELS = {
    REPAIR_REPORT_GUIDE: "수리 리포트 작성 기준",
    PLATFORM_PROCESS_GUIDE: "A/S 처리 절차 안내",
  };

  const handleConfirm = async () => {
    setDeleting(true);
    try {
      if (confirm.type === "all") {
        await deleteAllLmsGuides(shop.memberId);
      } else {
        await deleteLmsGuide(shop.memberId, confirm.guideType);
      }
      setConfirm(null);
      onRefresh();
    } catch {
      setConfirm(null);
    } finally {
      setDeleting(false);
    }
  };

  const confirmTitle =
    confirm?.type === "all"
      ? "전체 수료 기록 삭제"
      : `'${GUIDE_LABELS[confirm?.guideType]}' 수료 기록 삭제`;

  const confirmDesc =
    confirm?.type === "all"
      ? `${shop.shopName}의 모든 LMS 수료 기록이 삭제됩니다. 수리점은 두 가이드를 다시 수료해야 합니다.`
      : `해당 수료 기록이 삭제됩니다. 수리점이 해당 가이드를 다시 수료해야 합니다.`;

  const hasAnyRecord =
    shop.repairReportGuide?.completed || shop.platformProcessGuide?.completed;

  return (
    <>
      <Card className="overflow-hidden">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-secondary transition-colors"
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                shop.allCompleted
                  ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                  : "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
              }`}
            >
              {shop.allCompleted ? <Award className="w-4 h-4" /> : shop.shopName[0]}
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-semibold text-foreground">{shop.shopName}</p>
                <Badge variant={shop.allCompleted ? "green" : "yellow"}>
                  {shop.allCompleted ? "전체 수료" : "미완료"}
                </Badge>
                {shop.memberStatus === "BLOCKED" && <Badge variant="red">차단됨</Badge>}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{shop.email}</p>
            </div>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-muted-foreground transition-transform shrink-0 ${
              expanded ? "rotate-180" : ""
            }`}
          />
        </button>

        {expanded && (
          <div className="border-t border-border">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-secondary/50 border-b border-border">
                  {["가이드", "수료 현황", ""].map((h, i) => (
                    <th
                      key={i}
                      className="py-3 px-4 text-left text-muted-foreground font-semibold whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    key: "REPAIR_REPORT_GUIDE",
                    label: "수리 리포트 작성 기준",
                    detail: shop.repairReportGuide,
                  },
                  {
                    key: "PLATFORM_PROCESS_GUIDE",
                    label: "A/S 처리 절차 안내",
                    detail: shop.platformProcessGuide,
                  },
                ].map((row) => (
                  <tr
                    key={row.key}
                    className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors"
                  >
                    <td className="py-3 px-4 font-medium text-foreground whitespace-nowrap">
                      {row.label}
                    </td>
                    <td className="py-3 px-4">
                      <GuideStatusCell guide={row.detail} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      {row.detail?.completed ? (
                        <button
                          onClick={() =>
                            setConfirm({ type: "guide", guideType: row.key })
                          }
                          className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors ml-auto"
                        >
                          <Trash2 className="w-3 h-3" />
                          삭제
                        </button>
                      ) : (
                        <span className="text-xs text-muted-foreground/30">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {hasAnyRecord && (
              <div className="flex justify-end px-4 py-3 border-t border-border">
                <button
                  onClick={() => setConfirm({ type: "all" })}
                  className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 dark:hover:text-red-400 font-medium transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  전체 수료 기록 삭제
                </button>
              </div>
            )}
          </div>
        )}
      </Card>

      <ConfirmModal
        open={!!confirm}
        title={confirmTitle}
        description={confirmDesc}
        onConfirm={handleConfirm}
        onCancel={() => setConfirm(null)}
        loading={deleting}
      />
    </>
  );
}

// ── 메인 페이지 ────────────────────────────────────────────────────────────────

export default function AdminLMSManagePage() {
  const [inputValue, setInputValue] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getShopsLmsStatus({ keyword: query || undefined, page, size: 20 });
      setData(res.data.data);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [query, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = (e) => {
    e.preventDefault();
    setQuery(inputValue);
    setPage(0);
    setExpanded(null);
  };

  const shops = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;

  const completedGuideCount = shops.reduce((acc, s) => {
    if (s.repairReportGuide?.completed) acc++;
    if (s.platformProcessGuide?.completed) acc++;
    return acc;
  }, 0);
  const totalGuideCount = shops.length * 2;
  const completionRate =
    totalGuideCount > 0 ? Math.round((completedGuideCount / totalGuideCount) * 100) : 0;
  const completedShops = shops.filter((s) => s.allCompleted).length;

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      <div>
        <h1 className="text-xl font-semibold text-foreground">LMS 수료 관리</h1>
        <p className="text-sm text-muted-foreground mt-1">
          수리점별 교육 이수 현황을 확인하고 수료 기록을 관리하세요.
        </p>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "전체 수리점", value: data ? data.totalElements : "-", sub: "파트너" },
          {
            label: "전체 수료 완료",
            value: data ? `${completedShops}/${shops.length}` : "-",
            sub: "수리점",
          },
          { label: "수료율", value: data ? `${completionRate}%` : "-", sub: "2개 가이드 기준" },
          {
            label: "미수료 가이드",
            value: data ? totalGuideCount - completedGuideCount : "-",
            sub: "건",
          },
        ].map((k) => (
          <Card key={k.label} className="px-4 py-4">
            <p className="text-xs text-muted-foreground">{k.label}</p>
            <p className="text-2xl font-bold text-foreground mt-1">{k.value}</p>
            <p className="text-[11px] text-muted-foreground">{k.sub}</p>
          </Card>
        ))}
      </div>

      {/* 수료율 바 */}
      {data && shops.length > 0 && (
        <Card className="p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-accent" />
              <p className="text-sm font-semibold text-foreground">수료율</p>
            </div>
            <span className="text-sm font-bold text-accent">{completionRate}%</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all duration-700"
              style={{ width: `${completionRate}%` }}
            />
          </div>
          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-accent" />
              수료 {completedGuideCount}건
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-muted" />
              미수료 {totalGuideCount - completedGuideCount}건
            </span>
          </div>
        </Card>
      )}

      {/* 검색 */}
      <form onSubmit={handleSearch} className="flex items-center gap-2">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="수리점 이름 검색..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-secondary border border-border rounded-xl text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all"
          />
        </div>
        <Button type="submit" variant="accent" size="sm">
          검색
        </Button>
        {query && (
          <button
            type="button"
            onClick={() => {
              setInputValue("");
              setQuery("");
              setPage(0);
            }}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            초기화
          </button>
        )}
      </form>

      {/* 목록 */}
      {loading ? (
        <div className="flex justify-center py-16">
          <p className="text-sm text-muted-foreground">불러오는 중...</p>
        </div>
      ) : shops.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-sm text-muted-foreground">
            {query
              ? `'${query}'에 해당하는 수리점이 없습니다.`
              : "등록된 수리점이 없습니다."}
          </p>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {shops.map((shop) => (
            <ShopCard
              key={shop.memberId}
              shop={shop}
              expanded={expanded === shop.memberId}
              onToggle={() =>
                setExpanded(expanded === shop.memberId ? null : shop.memberId)
              }
              onRefresh={fetchData}
            />
          ))}
        </div>
      )}

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setPage((p) => p - 1)}
            disabled={page === 0}
            className="p-2 rounded-xl border border-border hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-muted-foreground">
            {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= totalPages - 1}
            className="p-2 rounded-xl border border-border hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
