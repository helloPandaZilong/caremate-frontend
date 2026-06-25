import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  Users,
  Search,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ShieldOff,
  ShieldCheck,
} from "lucide-react";
import {
  getAdminCustomers,
  getAdminShops,
  toggleCustomerBlock,
  toggleShopBlock,
} from "../../api/admin";

// ── 상태 배지 ─────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  ACTIVE: {
    label: "정상",
    className:
      "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-700/40",
  },
  BLOCKED: {
    label: "차단됨",
    className:
      "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-700/40",
  },
  INACTIVE: {
    label: "승인 대기",
    className:
      "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700",
  },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.INACTIVE;
  return (
    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${cfg.className}`}>
      {cfg.label}
    </span>
  );
}

// ── 가입 방식 배지 ─────────────────────────────────────────────────────────────

function ProviderBadge({ provider }) {
  if (provider === "google") {
    return (
      <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-700/40">
        Google
      </span>
    );
  }
  return (
    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border">
      이메일
    </span>
  );
}

// ── 페이지네이션 ──────────────────────────────────────────────────────────────

function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  // 현재 페이지 앞뒤로 최대 2페이지까지 노출
  const range = [];
  for (
    let i = Math.max(0, page - 2);
    i <= Math.min(totalPages - 1, page + 2);
    i++
  ) {
    range.push(i);
  }

  return (
    <div className="flex items-center justify-center gap-1 mt-4">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 0}
        className="p-1.5 rounded-lg hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft className="w-4 h-4 text-muted-foreground" />
      </button>

      {range[0] > 0 && (
        <>
          <button onClick={() => onPageChange(0)} className="w-7 h-7 text-xs rounded-lg hover:bg-secondary text-muted-foreground transition-colors">
            1
          </button>
          {range[0] > 1 && <span className="text-xs text-muted-foreground px-1">…</span>}
        </>
      )}

      {range.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`w-7 h-7 text-xs rounded-lg font-medium transition-colors ${
            p === page
              ? "bg-accent text-white"
              : "hover:bg-secondary text-muted-foreground"
          }`}
        >
          {p + 1}
        </button>
      ))}

      {range[range.length - 1] < totalPages - 1 && (
        <>
          {range[range.length - 1] < totalPages - 2 && (
            <span className="text-xs text-muted-foreground px-1">…</span>
          )}
          <button onClick={() => onPageChange(totalPages - 1)} className="w-7 h-7 text-xs rounded-lg hover:bg-secondary text-muted-foreground transition-colors">
            {totalPages}
          </button>
        </>
      )}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages - 1}
        className="p-1.5 rounded-lg hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      </button>
    </div>
  );
}

// ── 회원 테이블 행 ─────────────────────────────────────────────────────────────

function MemberRow({ member, type, onBlockToggle }) {
  const [loading, setLoading] = useState(false);
  const isPending = member.status === "INACTIVE";
  const isBlocked = member.status === "BLOCKED";

  const handleToggle = async () => {
    setLoading(true);
    try {
      const res = type === "customer"
        ? await toggleCustomerBlock(member.id)
        : await toggleShopBlock(member.id);
      const newStatus = res.data.data.status;
      onBlockToggle(member.id, newStatus);
      toast.success(
        newStatus === "BLOCKED"
          ? `${member.name}님 계정을 차단했습니다.`
          : `${member.name}님 차단을 해제했습니다.`
      );
    } catch {
      toast.error("처리 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <tr className="border-b border-border last:border-0 hover:bg-secondary/40 transition-colors">
      {/* 이름 */}
      <td className="px-4 py-3">
        <span className="text-sm font-medium text-foreground">{member.name}</span>
      </td>

      {/* 이메일 */}
      <td className="px-4 py-3">
        <span className="text-sm text-muted-foreground">{member.email}</span>
      </td>

      {/* 연락처 */}
      <td className="px-4 py-3 hidden md:table-cell">
        <span className="text-sm text-muted-foreground">
          {member.phoneNumber || "—"}
        </span>
      </td>

      {/* 가입 방식 */}
      <td className="px-4 py-3 hidden lg:table-cell">
        <ProviderBadge provider={member.provider} />
      </td>

      {/* 상태 */}
      <td className="px-4 py-3">
        <StatusBadge status={member.status} />
      </td>

      {/* 가입일 */}
      <td className="px-4 py-3 hidden lg:table-cell">
        <span className="text-xs text-muted-foreground">
          {member.createdAt
            ? new Date(member.createdAt).toLocaleDateString("ko-KR")
            : "—"}
        </span>
      </td>

      {/* 차단/해제 버튼 */}
      <td className="px-4 py-3 text-right">
        {isPending ? (
          // 승인 대기 수리점은 차단 불가 — ShopApprovals 페이지에서 처리
          <span className="text-xs text-muted-foreground">승인 후 가능</span>
        ) : (
          <button
            onClick={handleToggle}
            disabled={loading}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              isBlocked
                ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-700/40 hover:bg-green-100 dark:hover:bg-green-900/40"
                : "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-700/40 hover:bg-red-100 dark:hover:bg-red-900/40"
            }`}
          >
            {loading ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : isBlocked ? (
              <ShieldCheck className="w-3 h-3" />
            ) : (
              <ShieldOff className="w-3 h-3" />
            )}
            {isBlocked ? "해제" : "차단"}
          </button>
        )}
      </td>
    </tr>
  );
}

// ── 메인 페이지 ───────────────────────────────────────────────────────────────

export default function MembersPage() {
  const [tab, setTab]         = useState("customer"); // "customer" | "shop"
  const [keyword, setKeyword] = useState("");
  const [inputVal, setInputVal] = useState(""); // 검색창 입력값 (미확정)
  const [page, setPage]       = useState(0);
  const [data, setData]       = useState(null);   // PageResponse
  const [loading, setLoading] = useState(false);

  // 탭 변경 시 검색어·페이지 초기화
  const handleTabChange = (newTab) => {
    setTab(newTab);
    setKeyword("");
    setInputVal("");
    setPage(0);
  };

  // 검색 실행
  const handleSearch = () => {
    setKeyword(inputVal);
    setPage(0);
  };

  // 데이터 로드
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, size: 20, ...(keyword ? { keyword } : {}) };
      const res = tab === "customer"
        ? await getAdminCustomers(params)
        : await getAdminShops(params);
      setData(res.data.data);
    } catch {
      toast.error("회원 목록을 불러오는 데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }, [tab, keyword, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 차단/해제 후 목록 내 해당 회원 상태를 즉시 반영 (낙관적 업데이트)
  const handleBlockToggle = (memberId, newStatus) => {
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        content: prev.content.map((m) =>
          m.id === memberId ? { ...m, status: newStatus } : m
        ),
      };
    });
  };

  const members = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;
  const totalElements = data?.totalElements ?? 0;

  return (
    <div className="flex flex-col gap-6">
      {/* 헤더 */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
            <Users className="w-4 h-4 text-accent" />
          </div>
          <h1 className="text-xl font-bold text-foreground">회원 관리</h1>
        </div>
        <p className="text-sm text-muted-foreground pl-10.5">
          고객 및 수리점 계정의 차단·해제를 관리합니다.
        </p>
      </div>

      {/* 탭 + 검색 */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {/* 탭 선택 */}
        <div className="flex border-b border-border">
          {[
            { id: "customer", label: "일반 고객" },
            { id: "shop",     label: "수리점" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => handleTabChange(t.id)}
              className={`flex-1 py-3 text-sm font-medium transition-all ${
                tab === t.id
                  ? "text-accent border-b-2 border-accent bg-accent/5"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* 검색바 */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="이름으로 검색"
              className="w-full pl-8 pr-3 py-2 text-sm bg-secondary border border-border rounded-xl text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all"
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-4 py-2 text-sm font-medium bg-accent text-white rounded-xl hover:bg-accent/90 transition-colors"
          >
            검색
          </button>
        </div>

        {/* 결과 요약 */}
        {!loading && data && (
          <div className="px-4 py-2 border-b border-border bg-secondary/30">
            <span className="text-xs text-muted-foreground">
              총 <strong className="text-foreground">{totalElements.toLocaleString()}</strong>명
              {keyword && (
                <> — <span className="text-accent">"{keyword}"</span> 검색 결과</>
              )}
            </span>
          </div>
        )}

        {/* 테이블 */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16 gap-2 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">불러오는 중...</span>
            </div>
          ) : members.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Users className="w-8 h-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                {keyword ? "검색 결과가 없습니다." : "등록된 회원이 없습니다."}
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">이름</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">이메일</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground hidden md:table-cell">연락처</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground hidden lg:table-cell">가입 방식</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">상태</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground hidden lg:table-cell">가입일</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">차단 관리</th>
                </tr>
              </thead>
              <tbody>
                {members.map((member) => (
                  <MemberRow
                    key={member.id}
                    member={member}
                    type={tab}
                    onBlockToggle={handleBlockToggle}
                  />
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* 페이지네이션 */}
        {!loading && totalPages > 1 && (
          <div className="px-4 pb-4">
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}
