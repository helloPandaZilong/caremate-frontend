import { useState, useEffect, useCallback } from "react";
import {
  Award, Search, CheckCircle2, XCircle, Trash2,
  RotateCcw, AlertTriangle, X,
} from "lucide-react";
import { Card, Badge } from "../../components/shared";
import {
  getShopsLmsStatus,
  deleteLmsGuide,
  deleteAllLmsGuides,
} from "../../api/admin";

// ── Helpers ────────────────────────────────────────────────────────────────────

function fmtDate(isoStr) {
  if (!isoStr) return null;
  const d = new Date(isoStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

const GUIDE_LABELS = {
  REPAIR_REPORT_GUIDE:    "수리 리포트 작성 기준",
  PLATFORM_PROCESS_GUIDE: "A/S 처리 절차 안내",
};

// ── Confirmation modal ─────────────────────────────────────────────────────────

function ConfirmModal({ info, onConfirm, onCancel, loading }) {
  const isAll = info.type === "all";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">수료 기록 삭제</p>
              <p className="text-xs text-muted-foreground mt-0.5">{info.shopName}</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-1 rounded-lg hover:bg-secondary transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
        <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
          {isAll
            ? `"${info.shopName}"의 모든 가이드 수료 기록을 삭제합니다. 해당 계정은 LMS를 재수료해야 합니다.`
            : `"${info.shopName}"의 "${info.guideLabel}" 수료 기록을 삭제합니다.`}
          <br />
          <span className="font-medium text-foreground">이 작업은 되돌릴 수 없습니다.</span>
        </p>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 text-sm border border-border rounded-xl hover:bg-secondary transition-colors text-foreground"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 text-sm font-semibold bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors disabled:opacity-60"
          >
            {loading ? "삭제 중..." : "삭제"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Guide status cell ──────────────────────────────────────────────────────────

function GuideCell({ guide, guideType, memberId, shopName, onDelete }) {
  if (!guide) return <span className="text-xs text-muted-foreground">-</span>;

  return (
    <div className="flex flex-col gap-1 items-start">
      {guide.completed ? (
        <>
          <div className="flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            수료 완료
          </div>
          <span className="text-[11px] text-muted-foreground">
            {guide.score}% · {fmtDate(guide.confirmedAt)}
          </span>
          <button
            onClick={() =>
              onDelete({
                type: "guide",
                memberId,
                guideType,
                shopName,
                guideLabel: GUIDE_LABELS[guideType],
              })
            }
            className="flex items-center gap-1 text-[11px] text-red-500 hover:text-red-700 transition-colors mt-0.5"
          >
            <Trash2 className="w-3 h-3" />
            삭제
          </button>
        </>
      ) : (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <XCircle className="w-3.5 h-3.5" />
          미수료
        </div>
      )}
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function AdminLMSManagePage() {
  const [rows, setRows]                   = useState([]);
  const [totalPages, setTotalPages]       = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage]                   = useState(0);
  const [keyword, setKeyword]             = useState("");
  const [debouncedKw, setDebouncedKw]     = useState("");
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState(null);
  const [confirmModal, setConfirmModal]   = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Debounce keyword → reset to page 0 when it changes
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedKw(keyword);
      setPage(0);
    }, 300);
    return () => clearTimeout(t);
  }, [keyword]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getShopsLmsStatus({
        keyword: debouncedKw || undefined,
        page,
        size: 20,
      });
      const pd = res.data.data;
      setRows(pd.content ?? []);
      setTotalPages(pd.totalPages ?? 0);
      setTotalElements(pd.totalElements ?? 0);
    } catch {
      setError("데이터를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [debouncedKw, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async () => {
    if (!confirmModal) return;
    setDeleteLoading(true);
    try {
      if (confirmModal.type === "guide") {
        await deleteLmsGuide(confirmModal.memberId, confirmModal.guideType);
      } else {
        await deleteAllLmsGuides(confirmModal.memberId);
      }
      setConfirmModal(null);
      fetchData();
    } finally {
      setDeleteLoading(false);
    }
  };

  // Per-page stats (reflects visible rows only)
  const allCompleted     = rows.filter((r) => r.allCompleted).length;
  const partialCompleted = rows.filter(
    (r) => !r.allCompleted && (r.repairReportGuide?.completed || r.platformProcessGuide?.completed),
  ).length;
  const notCompleted     = rows.length - allCompleted - partialCompleted;

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-foreground">LMS 수료 관리</h1>
        <p className="text-sm text-muted-foreground mt-1">
          수리점 계정별 가이드 수료 현황을 확인하고 관리하세요.
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "전체 수리점 계정", value: totalElements, sub: "개 계정" },
          { label: "전 과정 수료 완료", value: allCompleted,     sub: `/ ${rows.length}명 (현재 페이지)` },
          { label: "부분 수료",         value: partialCompleted, sub: "명" },
          { label: "미수료",             value: notCompleted,     sub: "명" },
        ].map((k) => (
          <Card key={k.label} className="px-4 py-4">
            <p className="text-xs text-muted-foreground">{k.label}</p>
            <p className="text-2xl font-bold text-foreground mt-1">{k.value}</p>
            <p className="text-[11px] text-muted-foreground">{k.sub}</p>
          </Card>
        ))}
      </div>

      {/* Overall rate bar */}
      {rows.length > 0 && (
        <Card className="p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-accent" />
              <p className="text-sm font-semibold text-foreground">전체 수료율 (현재 페이지)</p>
            </div>
            <span className="text-sm font-bold text-accent">
              {Math.round((allCompleted / rows.length) * 100)}%
            </span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all duration-700"
              style={{ width: `${(allCompleted / rows.length) * 100}%` }}
            />
          </div>
          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-accent" />
              전 과정 수료 {allCompleted}명
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              부분 수료 {partialCompleted}명
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-muted" />
              미수료 {notCompleted}명
            </span>
          </div>
        </Card>
      )}

      {/* Search + refresh */}
      <div className="flex items-center gap-3">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="수리점명 검색..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-secondary border border-border rounded-xl text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all"
          />
        </div>
        <button
          onClick={fetchData}
          title="새로고침"
          className="p-2 rounded-xl hover:bg-secondary border border-border transition-colors"
        >
          <RotateCcw className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-14">
            <RotateCcw className="w-5 h-5 text-muted-foreground animate-spin" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-14 text-sm text-muted-foreground gap-2">
            <AlertTriangle className="w-4 h-4" />
            {error}
          </div>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 gap-2 text-muted-foreground">
            <Award className="w-8 h-8 opacity-30" />
            <p className="text-sm">수리점 계정이 없습니다.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-secondary/50 border-b border-border">
                  {[
                    "수리점명",
                    "이메일",
                    "상태",
                    "수리 리포트 가이드",
                    "A/S 처리 절차 가이드",
                    "전체 수료",
                    "관리",
                  ].map((h) => (
                    <th
                      key={h}
                      className="py-3 px-4 text-left text-muted-foreground font-semibold whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.memberId}
                    className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors"
                  >
                    {/* 수리점명 */}
                    <td className="py-3.5 px-4">
                      <p className="font-medium text-foreground">{row.shopName ?? "-"}</p>
                      <p className="text-[11px] text-muted-foreground font-mono">
                        #{row.memberId}
                      </p>
                    </td>

                    {/* 이메일 */}
                    <td className="py-3.5 px-4 text-muted-foreground whitespace-nowrap">
                      {row.email}
                    </td>

                    {/* 계정 상태 */}
                    <td className="py-3.5 px-4">
                      <Badge variant={row.memberStatus === "ACTIVE" ? "green" : "red"}>
                        {row.memberStatus === "ACTIVE" ? "활성" : "차단"}
                      </Badge>
                    </td>

                    {/* 수리 리포트 가이드 */}
                    <td className="py-3.5 px-4">
                      <GuideCell
                        guide={row.repairReportGuide}
                        guideType="REPAIR_REPORT_GUIDE"
                        memberId={row.memberId}
                        shopName={row.shopName ?? `#${row.memberId}`}
                        onDelete={setConfirmModal}
                      />
                    </td>

                    {/* A/S 처리 절차 가이드 */}
                    <td className="py-3.5 px-4">
                      <GuideCell
                        guide={row.platformProcessGuide}
                        guideType="PLATFORM_PROCESS_GUIDE"
                        memberId={row.memberId}
                        shopName={row.shopName ?? `#${row.memberId}`}
                        onDelete={setConfirmModal}
                      />
                    </td>

                    {/* 전체 수료 */}
                    <td className="py-3.5 px-4">
                      {row.allCompleted ? (
                        <div className="flex items-center gap-1 text-green-600 dark:text-green-400 font-semibold">
                          <Award className="w-3.5 h-3.5" />
                          완료
                        </div>
                      ) : (
                        <span className="text-muted-foreground">미완료</span>
                      )}
                    </td>

                    {/* 관리 */}
                    <td className="py-3.5 px-4">
                      {(row.repairReportGuide?.completed || row.platformProcessGuide?.completed) && (
                        <button
                          onClick={() =>
                            setConfirmModal({
                              type: "all",
                              memberId: row.memberId,
                              shopName: row.shopName ?? `#${row.memberId}`,
                            })
                          }
                          className="flex items-center gap-1 text-[11px] text-red-500 hover:text-red-700 font-medium transition-colors whitespace-nowrap"
                        >
                          <Trash2 className="w-3 h-3" />
                          전체 삭제
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-3 py-1.5 text-xs rounded-lg border border-border hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            이전
          </button>
          <span className="text-xs text-muted-foreground">
            {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="px-3 py-1.5 text-xs rounded-lg border border-border hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            다음
          </button>
        </div>
      )}

      {/* Confirmation modal */}
      {confirmModal && (
        <ConfirmModal
          info={confirmModal}
          onConfirm={handleDelete}
          onCancel={() => setConfirmModal(null)}
          loading={deleteLoading}
        />
      )}
    </div>
  );
}
