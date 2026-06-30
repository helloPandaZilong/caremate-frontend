import { useState, useEffect, useCallback } from "react";
import {
  RefreshCw, CheckCircle2, XCircle, Shield, ShieldCheck, ShieldAlert,
  ScanLine, Activity, LogIn, X, ChevronRight, Search,
} from "lucide-react";
import { Card, Badge, Button } from "../../components/shared";
import {
  getSettlementLogs,
  getLoginHistory,
  scanPaymentIntegrity,
  verifyPaymentIntegrity,
  getIntegrityLogs,
} from "../../api/audit";

// ── 날짜 포맷 ────────────────────────────────────────────────────────
function fmtDate(dt) {
  if (!dt) return "-";
  return new Date(dt).toLocaleString("ko-KR", {
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    hour12: false,
  });
}

// ── JSON 모달 ────────────────────────────────────────────────────────
function JsonModal({ title, json, onClose }) {
  let formatted = json;
  try { formatted = JSON.stringify(JSON.parse(json), null, 2); } catch { /* 원본 사용 */ }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl mx-4 bg-card border border-border rounded-2xl shadow-2xl max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/40">
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="overflow-auto p-5 flex-1">
          <pre className="text-[11px] font-mono text-foreground whitespace-pre-wrap break-all leading-relaxed">
            {formatted}
          </pre>
        </div>
      </div>
    </div>
  );
}

// ── 정산 상태 뱃지 ────────────────────────────────────────────────────
function SettlementStatusBadge({ status }) {
  if (status === "SUCCESS") {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-green-600 dark:text-green-400">
        <CheckCircle2 className="w-3.5 h-3.5" /> 성공
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-500 dark:text-red-400">
      <XCircle className="w-3.5 h-3.5" /> 실패
    </span>
  );
}

// ── 로그인 상태 뱃지 ──────────────────────────────────────────────────
function LoginStatusBadge({ success }) {
  if (success) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-green-600 dark:text-green-400">
        <CheckCircle2 className="w-3.5 h-3.5" /> 성공
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-500 dark:text-red-400">
      <XCircle className="w-3.5 h-3.5" /> 실패
    </span>
  );
}

function RoleBadge({ role }) {
  const map = {
    ADMIN:       { label: "관리자",  variant: "red"     },
    REPAIR_SHOP: { label: "수리점",  variant: "yellow"  },
    CUSTOMER:    { label: "고객",    variant: "default" },
  };
  const { label, variant } = map[role] ?? { label: role ?? "알 수 없음", variant: "default" };
  return <Badge variant={variant}>{label}</Badge>;
}

// ── 무결성 상태 뱃지 ──────────────────────────────────────────────────
function IntegrityStatusBadge({ status }) {
  if (status === "VERIFIED") {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-green-600 dark:text-green-400">
        <ShieldCheck className="w-3.5 h-3.5" /> 정상
      </span>
    );
  }
  if (status === "TAMPERED") {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-500 dark:text-red-400">
        <ShieldAlert className="w-3.5 h-3.5" /> 위변조 의심
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-yellow-600 dark:text-yellow-400">
      <ScanLine className="w-3.5 h-3.5" /> 미검증
    </span>
  );
}

// ── 정산 엔진 이력 탭 ────────────────────────────────────────────────
function SettlementLogTab() {
  const PAGE_SIZE = 20;

  const [items, setItems]               = useState([]);
  const [page, setPage]                 = useState(0);
  const [totalPages, setTotalPages]     = useState(0);
  const [loading, setLoading]           = useState(true);
  const [statusFilter, setFilter]       = useState("");
  const [searchInput, setSearchInput]   = useState("");
  const [repairOrderId, setRepairOrderId] = useState(""); // 실제 검색에 사용
  const [modal, setModal]               = useState(null);

  // 요약 카드용 전체 집계 (필터 무관)
  const [totalAll, setTotalAll]         = useState(0);
  const [totalSuccess, setTotalSuccess] = useState(0);
  const [totalFail, setTotalFail]       = useState(0);

  const fetchSummary = useCallback(async () => {
    try {
      const [allRes, sucRes, failRes] = await Promise.all([
        getSettlementLogs({ page: 0, size: 1 }),
        getSettlementLogs({ status: "SUCCESS", page: 0, size: 1 }),
        getSettlementLogs({ status: "FAILED",  page: 0, size: 1 }),
      ]);
      setTotalAll(allRes.data?.data?.totalElements  ?? 0);
      setTotalSuccess(sucRes.data?.data?.totalElements  ?? 0);
      setTotalFail(failRes.data?.data?.totalElements ?? 0);
    } catch { /* silent */ }
  }, []);

  const fetchLogs = useCallback(async (status, orderId, pg) => {
    setLoading(true);
    try {
      const params = { page: pg, size: PAGE_SIZE };
      if (status)  params.status        = status;
      if (orderId) params.repairOrderId = orderId;
      const res = await getSettlementLogs(params);
      const data = res.data?.data;
      setItems(data?.content ?? []);
      setTotalPages(data?.totalPages ?? 0);
    } catch { setItems([]); }
    finally { setLoading(false); }
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchSummary(); fetchLogs("", "", 0); }, []);

  const handleFilterChange = (val) => {
    setFilter(val); setPage(0);
    fetchLogs(val, repairOrderId, 0);
  };
  const handleSearch = () => {
    const trimmed = searchInput.trim();
    setRepairOrderId(trimmed); setPage(0);
    fetchLogs(statusFilter, trimmed, 0);
  };
  const handleSearchClear = () => {
    setSearchInput(""); setRepairOrderId(""); setPage(0);
    fetchLogs(statusFilter, "", 0);
  };
  const handleRefresh = () => { fetchSummary(); fetchLogs(statusFilter, repairOrderId, page); };

  return (
    <div className="flex flex-col gap-4">
      {modal && (
        <JsonModal title={modal.title} json={modal.json} onClose={() => setModal(null)} />
      )}

      {/* 요약 카드 — 전체 집계 기준 */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Activity className="w-4 h-4 text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">총 실행 횟수</p>
              <p className="text-xl font-bold text-foreground">{totalAll.toLocaleString()}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">성공</p>
              <p className="text-xl font-bold text-green-600 dark:text-green-400">
                {totalSuccess.toLocaleString()}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
              <XCircle className="w-4 h-4 text-red-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">실패</p>
              <p className="text-xl font-bold text-red-500">{totalFail.toLocaleString()}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* 액션 바 */}
      <div className="flex items-center justify-between gap-3">
        {/* 주문 ID 검색 */}
        <div className="flex items-center gap-1.5">
          <div className="relative flex items-center">
            <Search className="absolute left-2.5 w-3 h-3 text-muted-foreground pointer-events-none" />
            <input
              type="number"
              min="1"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="주문 ID 검색"
              className="pl-7 pr-2 py-1.5 text-xs w-36 rounded-lg bg-secondary text-foreground border border-border/40 outline-none focus:border-accent transition-colors placeholder:text-muted-foreground/60 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-2.5 py-1.5 text-xs rounded-lg bg-accent text-accent-foreground hover:opacity-90 transition-opacity"
          >
            검색
          </button>
          {repairOrderId && (
            <button
              onClick={handleSearchClear}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg bg-secondary text-muted-foreground border border-border/40 hover:text-foreground transition-colors"
            >
              <X className="w-3 h-3" /> 초기화
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => handleFilterChange(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-lg bg-secondary text-foreground border border-border/40 outline-none focus:border-accent transition-colors"
          >
            <option value="">전체</option>
            <option value="SUCCESS">성공만</option>
            <option value="FAILED">실패만</option>
          </select>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-lg bg-secondary text-muted-foreground hover:text-foreground hover:bg-muted transition-colors border border-border/40"
          >
            <RefreshCw className="w-3 h-3" /> 새로고침
          </button>
        </div>
      </div>

      {/* 테이블 */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border/40 bg-secondary/50">
                {["ID", "주문 ID", "실행 일시", "상태", "입력 스냅샷", "산출 스냅샷"].map((h) => (
                  <th key={h} className="text-left py-3 px-3 text-muted-foreground font-semibold whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground">
                    <RefreshCw className="w-4 h-4 animate-spin inline mr-2" /> 로딩 중...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-muted-foreground">
                    <Activity className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="font-medium">정산 엔진 실행 이력 없음</p>
                    <p className="text-[11px] mt-1 opacity-70">결제 완료 후 정산 엔진이 실행된 이력이 없습니다.</p>
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr
                    key={item.id}
                    className={`border-b border-border/20 transition-colors ${
                      item.status === "FAILED"
                        ? "bg-red-50/20 dark:bg-red-900/10 hover:bg-red-50/40 dark:hover:bg-red-900/20"
                        : "hover:bg-secondary/40"
                    }`}
                  >
                    <td className="py-3 px-3 font-mono text-muted-foreground">{item.id}</td>
                    <td className="py-3 px-3 font-medium text-foreground">{item.repairOrderId}</td>
                    <td className="py-3 px-3 font-mono text-muted-foreground text-[11px] whitespace-nowrap">
                      {fmtDate(item.executedAt)}
                    </td>
                    <td className="py-3 px-3">
                      <SettlementStatusBadge status={item.status} />
                    </td>
                    <td className="py-3 px-3">
                      <button
                        onClick={() => setModal({ title: `입력 스냅샷 — 주문 ${item.repairOrderId}`, json: item.inputSnapshot })}
                        className="inline-flex items-center gap-1 text-[11px] text-accent hover:underline"
                      >
                        상세보기 <ChevronRight className="w-3 h-3" />
                      </button>
                    </td>
                    <td className="py-3 px-3">
                      <button
                        onClick={() => setModal({ title: `산출 스냅샷 — 주문 ${item.repairOrderId}`, json: item.outputSnapshot })}
                        className={`inline-flex items-center gap-1 text-[11px] hover:underline ${
                          item.status === "FAILED" ? "text-red-500" : "text-accent"
                        }`}
                      >
                        상세보기 <ChevronRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 px-4 py-3 border-t border-border/40">
            <button
              onClick={() => {
                const newPage = Math.max(0, page - 1);
                setPage(newPage);
                fetchLogs(statusFilter, repairOrderId, newPage);
              }}
              disabled={page === 0}
              className="px-3 py-1.5 text-xs rounded-lg bg-secondary text-muted-foreground border border-border/40 hover:text-foreground hover:bg-muted disabled:opacity-40 disabled:pointer-events-none transition-colors"
            >
              이전
            </button>
            <span className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">{page + 1}</span>
              {" / "}
              {totalPages}
            </span>
            <button
              onClick={() => {
                const newPage = Math.min(totalPages - 1, page + 1);
                setPage(newPage);
                fetchLogs(statusFilter, repairOrderId, newPage);
              }}
              disabled={page >= totalPages - 1}
              className="px-3 py-1.5 text-xs rounded-lg bg-secondary text-muted-foreground border border-border/40 hover:text-foreground hover:bg-muted disabled:opacity-40 disabled:pointer-events-none transition-colors"
            >
              다음
            </button>
          </div>
        )}
      </Card>
    </div>
  );
}

// ── 결제 무결성 감사 탭 ───────────────────────────────────────────────
function IntegrityTab() {
  const [items, setItems]               = useState([]);
  const [totalElements, setTotal]       = useState(0);
  const [loading, setLoading]           = useState(true);
  const [statusFilter, setFilter]       = useState("");
  const [searchInput, setSearchInput]   = useState("");
  const [paymentId, setPaymentId]       = useState(""); // 실제 검색에 사용
  const [scanning, setScanning]         = useState(false);
  const [verifying, setVerifying]       = useState(false);
  const [actionMsg, setActionMsg]       = useState(null);
  const [verifyResult, setVerifyResult] = useState(null);

  const fetchLogs = useCallback(async (status = "", pid = "") => {
    setLoading(true);
    try {
      const params = { page: 0, size: 50 };
      if (status) params.status    = status;
      if (pid)    params.paymentId = pid;
      const res = await getIntegrityLogs(params);
      const data = res.data?.data;
      setItems(data?.content ?? []);
      setTotal(data?.totalElements ?? 0);
    } catch { setItems([]); }
    finally { setLoading(false); }
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchLogs("", ""); }, []);

  const handleFilterChange = (val) => {
    setFilter(val);
    fetchLogs(val, paymentId);
  };
  const handleSearch = () => {
    const trimmed = searchInput.trim();
    setPaymentId(trimmed);
    fetchLogs(statusFilter, trimmed);
  };
  const handleSearchClear = () => {
    setSearchInput(""); setPaymentId("");
    fetchLogs(statusFilter, "");
  };

  const handleScan = async () => {
    setScanning(true); setActionMsg(null); setVerifyResult(null);
    try {
      const res = await scanPaymentIntegrity();
      setActionMsg({ type: "info", text: res.data?.data ?? "스캔 완료" });
      await fetchLogs(statusFilter, paymentId);
    } catch {
      setActionMsg({ type: "error", text: "스캔 중 오류가 발생했습니다." });
    } finally { setScanning(false); }
  };

  const handleVerify = async () => {
    setVerifying(true); setActionMsg(null); setVerifyResult(null);
    try {
      const res = await verifyPaymentIntegrity();
      setVerifyResult(res.data?.data);
      await fetchLogs(statusFilter, paymentId);
    } catch {
      setActionMsg({ type: "error", text: "검증 중 오류가 발생했습니다." });
    } finally { setVerifying(false); }
  };

  const tamperedCount = items.filter((i) => i.status === "TAMPERED").length;
  const verifiedCount = items.filter((i) => i.status === "VERIFIED").length;
  const pendingCount  = items.filter((i) => i.status === "PENDING").length;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <ScanLine className="w-4 h-4 text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">스캔된 결제</p>
              <p className="text-xl font-bold text-foreground">{totalElements}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-green-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">정상</p>
              <p className="text-xl font-bold text-green-600 dark:text-green-400">{verifiedCount}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4 text-red-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">위변조 의심</p>
              <p className="text-xl font-bold text-red-500">{tamperedCount}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex items-center justify-between gap-3">
        {/* 결제 ID 검색 */}
        <div className="flex items-center gap-1.5">
          <div className="relative flex items-center">
            <Search className="absolute left-2.5 w-3 h-3 text-muted-foreground pointer-events-none" />
            <input
              type="number"
              min="1"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="결제 ID 검색"
              className="pl-7 pr-2 py-1.5 text-xs w-36 rounded-lg bg-secondary text-foreground border border-border/40 outline-none focus:border-accent transition-colors placeholder:text-muted-foreground/60 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-2.5 py-1.5 text-xs rounded-lg bg-accent text-accent-foreground hover:opacity-90 transition-opacity"
          >
            검색
          </button>
          {paymentId && (
            <button
              onClick={handleSearchClear}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg bg-secondary text-muted-foreground border border-border/40 hover:text-foreground transition-colors"
            >
              <X className="w-3 h-3" /> 초기화
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => handleFilterChange(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-lg bg-secondary text-foreground border border-border/40 outline-none focus:border-accent transition-colors"
          >
            <option value="">전체</option>
            <option value="PENDING">미검증</option>
            <option value="VERIFIED">정상</option>
            <option value="TAMPERED">위변조 의심</option>
          </select>
          <span className="text-xs text-muted-foreground">미검증 {pendingCount}건</span>
          <button
            onClick={() => fetchLogs(statusFilter, paymentId)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-lg bg-secondary text-muted-foreground hover:text-foreground hover:bg-muted transition-colors border border-border/40"
          >
            <RefreshCw className="w-3 h-3" /> 새로고침
          </button>
          <Button variant="outline" size="sm" onClick={handleScan}
            className={scanning ? "opacity-70 pointer-events-none" : ""}>
            <ScanLine className={`w-3.5 h-3.5 ${scanning ? "animate-pulse" : ""}`} />
            {scanning ? "스캔 중..." : "전체 스캔"}
          </Button>
          <Button variant="primary" size="sm" onClick={handleVerify}
            className={verifying ? "opacity-70 pointer-events-none" : ""}>
            <ShieldCheck className={`w-3.5 h-3.5 ${verifying ? "animate-pulse" : ""}`} />
            {verifying ? "검증 중..." : "무결성 검증 실행"}
          </Button>
        </div>
      </div>

      {actionMsg && (
        <div className={`text-xs px-4 py-2.5 rounded-xl font-medium border ${
          actionMsg.type === "error"
            ? "bg-red-50/20 border-red-200/30 text-red-500 dark:text-red-400"
            : "bg-accent/10 border-accent/20 text-accent"
        }`}>{actionMsg.text}</div>
      )}

      {verifyResult && (
        <div className={`text-xs px-4 py-3 rounded-xl border ${
          verifyResult.tampered > 0
            ? "bg-red-50/20 border-red-200/40 dark:bg-red-900/10"
            : "bg-green-50/20 border-green-200/40 dark:bg-green-900/10"
        }`}>
          <p className={`font-semibold mb-1 ${verifyResult.tampered > 0 ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}`}>
            {verifyResult.tampered > 0 ? "위변조 의심 항목이 감지되었습니다" : "모든 결제 데이터가 정상입니다"}
          </p>
          <p className="text-muted-foreground">{verifyResult.message}</p>
        </div>
      )}

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border/40 bg-secondary/50">
                {["결제 ID", "주문 ID", "회원 ID", "결제 금액", "결제 수단", "결제일시", "SHA-256 해시", "상태", "검증 일시"].map((h) => (
                  <th key={h} className="text-left py-3 px-3 text-muted-foreground font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="py-12 text-center text-muted-foreground">
                  <RefreshCw className="w-4 h-4 animate-spin inline mr-2" /> 로딩 중...
                </td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={9} className="py-10 text-center text-muted-foreground">
                  <Shield className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="font-medium">스캔 기록 없음</p>
                  <p className="text-[11px] mt-1 opacity-70">'전체 스캔' 버튼을 클릭하여 결제 데이터 무결성 감사를 시작하세요.</p>
                </td></tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className={`border-b border-border/20 transition-colors ${
                    item.status === "TAMPERED"
                      ? "bg-red-50/20 dark:bg-red-900/10 hover:bg-red-50/40 dark:hover:bg-red-900/20"
                      : item.status === "VERIFIED"
                        ? "hover:bg-green-50/10 dark:hover:bg-green-900/10"
                        : "hover:bg-secondary/40"
                  }`}>
                    <td className="py-3 px-3 font-medium text-foreground">{item.paymentId}</td>
                    <td className="py-3 px-3 text-muted-foreground">{item.repairOrderId}</td>
                    <td className="py-3 px-3 text-muted-foreground">{item.memberId}</td>
                    <td className="py-3 px-3 font-medium text-foreground whitespace-nowrap">
                      {item.totalPaidAmount?.toLocaleString("ko-KR")}원
                    </td>
                    <td className="py-3 px-3 text-muted-foreground">{item.paymentMethod}</td>
                    <td className="py-3 px-3 font-mono text-muted-foreground text-[11px] whitespace-nowrap">{fmtDate(item.paidAt)}</td>
                    <td className="py-3 px-3 max-w-[160px]">
                      <span title={item.expectedHash} className={`font-mono text-[10px] block truncate ${
                        item.status === "TAMPERED" ? "text-red-500" : "text-muted-foreground"
                      }`}>
                        {item.expectedHash ? item.expectedHash.substring(0, 16) + "..." : "-"}
                      </span>
                    </td>
                    <td className="py-3 px-3"><IntegrityStatusBadge status={item.status} /></td>
                    <td className="py-3 px-3 font-mono text-muted-foreground text-[11px] whitespace-nowrap">{fmtDate(item.verifiedAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ── 로그인 접속 이력 탭 ───────────────────────────────────────────────
function LoginHistoryTab() {
  const PAGE_SIZE = 20;

  const [items, setItems]               = useState([]);
  const [page, setPage]                 = useState(0);
  const [totalPages, setTotalPages]     = useState(0);
  const [loading, setLoading]           = useState(true);
  const [successFilter, setSuccess]     = useState("");
  const [roleFilter, setRole]           = useState("");
  const [searchInput, setSearchInput]   = useState("");
  const [nameFilter, setNameFilter]     = useState(""); // 실제 검색에 사용

  // 요약 카드용 전체 집계 (필터 무관)
  const [totalAll, setTotalAll]         = useState(0);
  const [totalSuccess, setTotalSuccess] = useState(0);
  const [totalFail, setTotalFail]       = useState(0);

  const fetchSummary = useCallback(async () => {
    try {
      const [allRes, sucRes, failRes] = await Promise.all([
        getLoginHistory({ page: 0, size: 1 }),
        getLoginHistory({ success: true,  page: 0, size: 1 }),
        getLoginHistory({ success: false, page: 0, size: 1 }),
      ]);
      setTotalAll(allRes.data?.data?.totalElements  ?? 0);
      setTotalSuccess(sucRes.data?.data?.totalElements  ?? 0);
      setTotalFail(failRes.data?.data?.totalElements ?? 0);
    } catch { /* silent */ }
  }, []);

  const fetchLogs = useCallback(async (success, role, name, pg) => {
    setLoading(true);
    try {
      const params = { page: pg, size: PAGE_SIZE };
      if (success !== "") params.success = success;
      if (role    !== "") params.role    = role;
      if (name    !== "") params.name    = name;
      const res = await getLoginHistory(params);
      const data = res.data?.data;
      setItems(data?.content ?? []);
      setTotalPages(data?.totalPages ?? 0);
    } catch { setItems([]); }
    finally { setLoading(false); }
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchSummary(); fetchLogs("", "", "", 0); }, []);

  const handleSuccessChange = (val) => {
    setSuccess(val); setPage(0);
    fetchLogs(val, roleFilter, nameFilter, 0);
  };
  const handleRoleChange = (val) => {
    setRole(val); setPage(0);
    fetchLogs(successFilter, val, nameFilter, 0);
  };
  const handleSearch = () => {
    const trimmed = searchInput.trim();
    setNameFilter(trimmed); setPage(0);
    fetchLogs(successFilter, roleFilter, trimmed, 0);
  };
  const handleSearchClear = () => {
    setSearchInput(""); setNameFilter(""); setPage(0);
    fetchLogs(successFilter, roleFilter, "", 0);
  };
  const handleRefresh = () => { fetchSummary(); fetchLogs(successFilter, roleFilter, nameFilter, page); };

  return (
    <div className="flex flex-col gap-4">
      {/* 요약 카드 — 전체 집계 기준 */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <LogIn className="w-4 h-4 text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">총 접속 이력</p>
              <p className="text-xl font-bold text-foreground">{totalAll.toLocaleString()}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">성공</p>
              <p className="text-xl font-bold text-green-600 dark:text-green-400">
                {totalSuccess.toLocaleString()}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
              <XCircle className="w-4 h-4 text-red-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">실패</p>
              <p className="text-xl font-bold text-red-500">{totalFail.toLocaleString()}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* 검색 + 필터 + 새로고침 */}
      <div className="flex items-center justify-between gap-3">
        {/* 이름 검색 */}
        <div className="flex items-center gap-1.5">
          <div className="relative flex items-center">
            <Search className="absolute left-2.5 w-3 h-3 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="이름 검색"
              className="pl-7 pr-2 py-1.5 text-xs w-32 rounded-lg bg-secondary text-foreground border border-border/40 outline-none focus:border-accent transition-colors placeholder:text-muted-foreground/60"
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-2.5 py-1.5 text-xs rounded-lg bg-accent text-accent-foreground hover:opacity-90 transition-opacity"
          >
            검색
          </button>
          {nameFilter && (
            <button
              onClick={handleSearchClear}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg bg-secondary text-muted-foreground border border-border/40 hover:text-foreground transition-colors"
            >
              <X className="w-3 h-3" /> 초기화
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <select
            value={successFilter}
            onChange={(e) => handleSuccessChange(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-lg bg-secondary text-foreground border border-border/40 outline-none focus:border-accent transition-colors"
          >
            <option value="">전체</option>
            <option value="true">성공만</option>
            <option value="false">실패만</option>
          </select>
          <select
            value={roleFilter}
            onChange={(e) => handleRoleChange(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-lg bg-secondary text-foreground border border-border/40 outline-none focus:border-accent transition-colors"
          >
            <option value="">전체 역할</option>
            <option value="ADMIN">관리자</option>
            <option value="REPAIR_SHOP">수리점</option>
            <option value="CUSTOMER">고객</option>
          </select>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-lg bg-secondary text-muted-foreground hover:text-foreground hover:bg-muted transition-colors border border-border/40"
          >
            <RefreshCw className="w-3 h-3" /> 새로고침
          </button>
        </div>
      </div>

      {/* 테이블 */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border/40 bg-secondary/50">
                {["이름", "이메일", "역할", "접속 결과", "IP 주소", "User-Agent", "접속 일시"].map((h) => (
                  <th key={h} className="text-left py-3 px-3 text-muted-foreground font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="py-12 text-center text-muted-foreground">
                  <RefreshCw className="w-4 h-4 animate-spin inline mr-2" /> 로딩 중...
                </td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={7} className="py-10 text-center text-muted-foreground">
                  <LogIn className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="font-medium">접속 이력 없음</p>
                  <p className="text-[11px] mt-1 opacity-70">조건에 맞는 로그인 이력이 없습니다.</p>
                </td></tr>
              ) : (
                items.map((item, idx) => (
                  <tr
                    key={idx}
                    className={`border-b border-border/20 transition-colors ${
                      !item.success
                        ? "bg-red-50/20 dark:bg-red-900/10 hover:bg-red-50/40 dark:hover:bg-red-900/20"
                        : item.role === "ADMIN"
                          ? "bg-yellow-50/10 dark:bg-yellow-900/5 hover:bg-yellow-50/20"
                          : "hover:bg-secondary/40"
                    }`}
                  >
                    <td className="py-3 px-3 font-medium text-foreground whitespace-nowrap">{item.name}</td>
                    <td className="py-3 px-3 text-muted-foreground">{item.email}</td>
                    <td className="py-3 px-3"><RoleBadge role={item.role} /></td>
                    <td className="py-3 px-3"><LoginStatusBadge success={item.success} /></td>
                    <td className="py-3 px-3 font-mono text-muted-foreground text-[11px]">{item.ipAddress ?? "-"}</td>
                    <td className="py-3 px-3 max-w-[220px]">
                      <span title={item.userAgent} className="text-[10px] text-muted-foreground block truncate">
                        {item.userAgent ?? "-"}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-muted-foreground text-[11px] whitespace-nowrap">
                      {fmtDate(item.loginAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 px-4 py-3 border-t border-border/40">
            <button
              onClick={() => {
                const newPage = Math.max(0, page - 1);
                setPage(newPage);
                fetchLogs(successFilter, roleFilter, nameFilter, newPage);
              }}
              disabled={page === 0}
              className="px-3 py-1.5 text-xs rounded-lg bg-secondary text-muted-foreground border border-border/40 hover:text-foreground hover:bg-muted disabled:opacity-40 disabled:pointer-events-none transition-colors"
            >
              이전
            </button>
            <span className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">{page + 1}</span>
              {" / "}
              {totalPages}
            </span>
            <button
              onClick={() => {
                const newPage = Math.min(totalPages - 1, page + 1);
                setPage(newPage);
                fetchLogs(successFilter, roleFilter, nameFilter, newPage);
              }}
              disabled={page >= totalPages - 1}
              className="px-3 py-1.5 text-xs rounded-lg bg-secondary text-muted-foreground border border-border/40 hover:text-foreground hover:bg-muted disabled:opacity-40 disabled:pointer-events-none transition-colors"
            >
              다음
            </button>
          </div>
        )}
      </Card>
    </div>
  );
}

// ── 메인 페이지 ───────────────────────────────────────────────────────
export default function AuditPage() {
  const [tab, setTab] = useState("settlement");

  const TABS = [
    { key: "settlement", label: "정산 엔진 이력" },
    { key: "integrity",  label: "결제 무결성"   },
    { key: "login",      label: "로그인 접속 이력" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">운영 감사 관리</h1>
        <p className="text-sm text-muted-foreground mt-1">
          정산 엔진 실행 이력 · 결제 데이터 무결성 · 로그인 접속 이력
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border/40">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all -mb-px ${
              tab === key
                ? "border-accent text-accent"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "settlement" && <SettlementLogTab />}
      {tab === "integrity"  && <IntegrityTab />}
      {tab === "login"      && <LoginHistoryTab />}
    </div>
  );
}
