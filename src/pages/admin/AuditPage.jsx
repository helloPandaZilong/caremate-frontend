import { useState, useEffect, useCallback } from "react";
import {
  RefreshCw, RotateCcw, CheckCircle2, XCircle, Clock,
  AlertTriangle, Shield, ShieldCheck, ShieldAlert, ScanLine,
} from "lucide-react";
import { Card, Badge, Button } from "../../components/shared";
import {
  getDlqList,
  retryDlqItem,
  retryAllDlqItems,
  getAuditLogs,
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

// ── 상태 뱃지 ────────────────────────────────────────────────────────
function DlqStatusBadge({ status }) {
  const map = {
    PENDING:  { label: "대기 중",    variant: "yellow" },
    RETRYING: { label: "재시도 중",  variant: "yellow" },
    RESOLVED: { label: "해결됨",     variant: "green"  },
    DEAD:     { label: "재시도 초과", variant: "red"    },
  };
  const { label, variant } = map[status] ?? { label: status, variant: "default" };
  return <Badge variant={variant}>{label}</Badge>;
}

function AuditStatusBadge({ status }) {
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
      <Clock className="w-3.5 h-3.5" /> 미검증
    </span>
  );
}

// ── DLQ 탭 ───────────────────────────────────────────────────────────
function DlqTab() {
  const [items, setItems]                 = useState([]);
  const [totalElements, setTotal]         = useState(0);
  const [loading, setLoading]             = useState(true);
  const [page, setPage]                   = useState(0);
  const [retrying, setRetrying]           = useState(null);
  const [batchRetrying, setBatchRetrying] = useState(false);
  const [batchMsg, setBatchMsg]           = useState(null);

  const fetchDlq = useCallback(async (p = 0) => {
    setLoading(true);
    try {
      const res = await getDlqList({ page: p, size: 15 });
      const data = res.data?.data;
      setItems(data?.content ?? []);
      setTotal(data?.totalElements ?? 0);
      setPage(p);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDlq(0); }, [fetchDlq]);

  const handleRetry = async (dlqId) => {
    setRetrying(dlqId);
    try { await retryDlqItem(dlqId); } catch { /* AuditService가 처리 */ }
    finally {
      setRetrying(null);
      await fetchDlq(page);
    }
  };

  const handleBatchRetry = async () => {
    setBatchRetrying(true);
    setBatchMsg(null);
    try {
      const res = await retryAllDlqItems();
      // 202 Accepted — 메시지만 반환
      setBatchMsg(res.data?.data ?? "일괄 재시도 요청이 접수되었습니다.");
    } catch {
      setBatchMsg("일괄 재시도 요청 중 오류가 발생했습니다.");
    } finally {
      setBatchRetrying(false);
    }
  };

  const pendingCount = items.filter(
    (i) => i.status === "PENDING" || i.status === "DEAD"
  ).length;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          총 <span className="font-semibold text-foreground">{totalElements}</span>건 ·
          처리 필요{" "}
          <span className="text-red-500 dark:text-red-400 font-semibold">{pendingCount}건</span>
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchDlq(page)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-lg bg-secondary text-muted-foreground hover:text-foreground hover:bg-muted transition-colors border border-border/40"
          >
            <RefreshCw className="w-3 h-3" /> 새로고침
          </button>
          <Button
            variant="primary" size="sm"
            onClick={handleBatchRetry}
            className={batchRetrying ? "opacity-70 pointer-events-none" : ""}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${batchRetrying ? "animate-spin" : ""}`} />
            {batchRetrying ? "요청 중..." : "전체 일괄 재시도"}
          </Button>
        </div>
      </div>

      {batchMsg && (
        <div className="text-xs px-4 py-2.5 rounded-xl bg-accent/10 border border-accent/20 text-accent font-medium">
          {batchMsg}
          <span className="ml-2 text-muted-foreground font-normal">
            (처리 완료 후 목록을 새로고침 하세요)
          </span>
        </div>
      )}

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border/40 bg-secondary/50">
                {["DLQ ID","주문번호","요청자","보험사","에러 코드","재시도","상태","최초 발생","페이로드 요약","Action"]
                  .map((h) => (
                    <th key={h} className="text-left py-3 px-3 text-muted-foreground font-semibold whitespace-nowrap">
                      {h}
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-muted-foreground">
                    <RefreshCw className="w-4 h-4 animate-spin inline mr-2" /> 로딩 중...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-muted-foreground">
                    <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2 opacity-70" />
                    <p className="font-medium">DLQ 항목 없음</p>
                    <p className="text-[11px] mt-1 opacity-70">처리되지 않은 패키지 생성 실패 건이 없습니다.</p>
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr
                    key={item.dlqId}
                    className={`border-b border-border/20 transition-colors ${
                      item.status === "DEAD"
                        ? "bg-red-50/20 dark:bg-red-900/10"
                        : item.status === "RESOLVED"
                          ? "opacity-50"
                          : "hover:bg-red-50/20 dark:hover:bg-red-900/10"
                    }`}
                  >
                    <td className="py-3 px-3 font-mono text-[11px] text-red-600 dark:text-red-400 font-medium whitespace-nowrap">
                      {item.dlqId}
                    </td>
                    <td className="py-3 px-3 font-medium text-foreground whitespace-nowrap">{item.orderNo}</td>
                    <td className="py-3 px-3 text-muted-foreground">{item.requesterId}</td>
                    <td className="py-3 px-3 font-medium text-foreground whitespace-nowrap">{item.insurerInfo || "-"}</td>
                    <td className="py-3 px-3">
                      {item.errorCode
                        ? <Badge variant="red">{item.errorCode}</Badge>
                        : <span className="text-muted-foreground">-</span>}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`font-semibold ${item.retryCount >= 2 ? "text-red-500" : "text-foreground"}`}>
                        {item.retryCount}회
                      </span>
                    </td>
                    <td className="py-3 px-3"><DlqStatusBadge status={item.status} /></td>
                    <td className="py-3 px-3 font-mono text-muted-foreground whitespace-nowrap text-[11px]">
                      {fmtDate(item.firstFailedAt)}
                    </td>
                    <td className="py-3 px-3 max-w-[200px]">
                      <code className="text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded block truncate">
                        {item.payloadSummary ?? "-"}
                      </code>
                    </td>
                    <td className="py-3 px-3">
                      {item.status !== "RESOLVED" && (
                        <button
                          onClick={() => handleRetry(item.dlqId)}
                          disabled={retrying === item.dlqId}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium bg-accent/10 text-accent rounded-lg hover:bg-accent/15 transition-colors border border-accent/20 disabled:opacity-50"
                        >
                          <RotateCcw className={`w-3 h-3 ${retrying === item.dlqId ? "animate-spin" : ""}`} />
                          {retrying === item.dlqId ? "재시도 중" : "Retry"}
                        </button>
                      )}
                    </td>
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

// ── 감사 로그 탭 ──────────────────────────────────────────────────────
function AuditLogTab() {
  const [items, setItems]         = useState([]);
  const [totalElements, setTotal] = useState(0);
  const [loading, setLoading]     = useState(true);
  const [page, setPage]           = useState(0);
  const [statusFilter, setFilter] = useState("");

  const fetchLogs = useCallback(async (p = 0, status = "") => {
    setLoading(true);
    try {
      const params = { page: p, size: 15 };
      if (status) params.status = status;
      const res = await getAuditLogs(params);
      const data = res.data?.data;
      setItems(data?.content ?? []);
      setTotal(data?.totalElements ?? 0);
      setPage(p);
    } catch { setItems([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchLogs(0, statusFilter); }, [fetchLogs, statusFilter]);

  const failedCount = items.filter((i) => i.status === "FAILED").length;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          총 <span className="font-semibold text-foreground">{totalElements}</span>건 ·
          이 페이지 실패 <span className="text-red-500 dark:text-red-400 font-semibold">{failedCount}건</span>
        </p>
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-lg bg-secondary text-foreground border border-border/40 outline-none focus:border-accent transition-colors"
          >
            <option value="">전체</option>
            <option value="SUCCESS">성공만</option>
            <option value="FAILED">실패만</option>
          </select>
          <button
            onClick={() => fetchLogs(page, statusFilter)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-lg bg-secondary text-muted-foreground hover:text-foreground hover:bg-muted transition-colors border border-border/40"
          >
            <RefreshCw className="w-3 h-3" /> 새로고침
          </button>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border/40 bg-secondary/50">
                {["이벤트 ID","주문번호","요청자","보험사","상태","에러 코드","DLQ ID","재시도 횟수","발생 시각","페이로드 요약"]
                  .map((h) => (
                    <th key={h} className="text-left py-3 px-3 text-muted-foreground font-semibold whitespace-nowrap">
                      {h}
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-muted-foreground">
                    <RefreshCw className="w-4 h-4 animate-spin inline mr-2" /> 로딩 중...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-muted-foreground">
                    <Clock className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="font-medium">감사 로그 없음</p>
                    <p className="text-[11px] mt-1 opacity-70">청구 패키지 생성 이벤트가 기록되지 않았습니다.</p>
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr
                    key={item.id}
                    className={`border-b border-border/20 transition-colors ${
                      item.status === "FAILED"
                        ? "bg-red-50/30 dark:bg-red-900/10 hover:bg-red-50/50 dark:hover:bg-red-900/20"
                        : "hover:bg-secondary/40"
                    }`}
                  >
                    <td className="py-3 px-3 font-mono text-[10px] text-muted-foreground whitespace-nowrap">{item.eventId}</td>
                    <td className="py-3 px-3 font-medium text-foreground whitespace-nowrap">{item.orderNo}</td>
                    <td className="py-3 px-3 text-muted-foreground">{item.requesterId}</td>
                    <td className="py-3 px-3 text-foreground whitespace-nowrap">{item.insurerInfo || "-"}</td>
                    <td className="py-3 px-3"><AuditStatusBadge status={item.status} /></td>
                    <td className="py-3 px-3">
                      {item.errorCode
                        ? <Badge variant="red">{item.errorCode}</Badge>
                        : <span className="text-muted-foreground">-</span>}
                    </td>
                    <td className="py-3 px-3 font-mono text-[10px] text-red-600 dark:text-red-400 whitespace-nowrap">
                      {item.dlqId ?? "-"}
                    </td>
                    <td className="py-3 px-3 text-center font-semibold text-foreground">{item.retryAttempt}</td>
                    <td className="py-3 px-3 font-mono text-muted-foreground text-[11px] whitespace-nowrap">{fmtDate(item.createdAt)}</td>
                    <td className="py-3 px-3 max-w-[200px]">
                      <code className="text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded block truncate">
                        {item.payloadSummary ?? "-"}
                      </code>
                    </td>
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

// ── 결제 무결성 감사 탭 ───────────────────────────────────────────────
function IntegrityTab() {
  const [items, setItems]           = useState([]);
  const [totalElements, setTotal]   = useState(0);
  const [loading, setLoading]       = useState(true);
  const [statusFilter, setFilter]   = useState("");
  const [scanning, setScanning]     = useState(false);
  const [verifying, setVerifying]   = useState(false);
  const [actionMsg, setActionMsg]   = useState(null);
  const [verifyResult, setVerifyResult] = useState(null);

  const fetchLogs = useCallback(async (status = "") => {
    setLoading(true);
    try {
      const params = { page: 0, size: 50 };
      if (status) params.status = status;
      const res = await getIntegrityLogs(params);
      const data = res.data?.data;
      setItems(data?.content ?? []);
      setTotal(data?.totalElements ?? 0);
    } catch { setItems([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchLogs(statusFilter); }, [fetchLogs, statusFilter]);

  const handleScan = async () => {
    setScanning(true);
    setActionMsg(null);
    setVerifyResult(null);
    try {
      const res = await scanPaymentIntegrity();
      setActionMsg({ type: "info", text: res.data?.data ?? "스캔 완료" });
      await fetchLogs(statusFilter);
    } catch {
      setActionMsg({ type: "error", text: "스캔 중 오류가 발생했습니다." });
    } finally { setScanning(false); }
  };

  const handleVerify = async () => {
    setVerifying(true);
    setActionMsg(null);
    setVerifyResult(null);
    try {
      const res = await verifyPaymentIntegrity();
      setVerifyResult(res.data?.data);
      await fetchLogs(statusFilter);
    } catch {
      setActionMsg({ type: "error", text: "검증 중 오류가 발생했습니다." });
    } finally { setVerifying(false); }
  };

  const tamperedCount = items.filter((i) => i.status === "TAMPERED").length;
  const verifiedCount = items.filter((i) => i.status === "VERIFIED").length;
  const pendingCount  = items.filter((i) => i.status === "PENDING").length;

  return (
    <div className="flex flex-col gap-4">
      {/* 요약 카드 */}
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

      {/* 액션 바 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-lg bg-secondary text-foreground border border-border/40 outline-none focus:border-accent transition-colors"
          >
            <option value="">전체</option>
            <option value="PENDING">미검증</option>
            <option value="VERIFIED">정상</option>
            <option value="TAMPERED">위변조 의심</option>
          </select>
          <span className="text-xs text-muted-foreground">
            미검증 {pendingCount}건
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchLogs(statusFilter)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-lg bg-secondary text-muted-foreground hover:text-foreground hover:bg-muted transition-colors border border-border/40"
          >
            <RefreshCw className="w-3 h-3" /> 새로고침
          </button>
          <Button
            variant="outline" size="sm"
            onClick={handleScan}
            className={scanning ? "opacity-70 pointer-events-none" : ""}
          >
            <ScanLine className={`w-3.5 h-3.5 ${scanning ? "animate-pulse" : ""}`} />
            {scanning ? "스캔 중..." : "전체 스캔"}
          </Button>
          <Button
            variant="primary" size="sm"
            onClick={handleVerify}
            className={verifying ? "opacity-70 pointer-events-none" : ""}
          >
            <ShieldCheck className={`w-3.5 h-3.5 ${verifying ? "animate-pulse" : ""}`} />
            {verifying ? "검증 중..." : "무결성 검증 실행"}
          </Button>
        </div>
      </div>

      {/* 액션 결과 메시지 */}
      {actionMsg && (
        <div className={`text-xs px-4 py-2.5 rounded-xl font-medium border ${
          actionMsg.type === "error"
            ? "bg-red-50/20 border-red-200/30 text-red-500 dark:text-red-400"
            : "bg-accent/10 border-accent/20 text-accent"
        }`}>
          {actionMsg.text}
        </div>
      )}

      {verifyResult && (
        <div className={`text-xs px-4 py-3 rounded-xl border ${
          verifyResult.tampered > 0
            ? "bg-red-50/20 border-red-200/40 dark:bg-red-900/10"
            : "bg-green-50/20 border-green-200/40 dark:bg-green-900/10"
        }`}>
          <p className={`font-semibold mb-1 ${verifyResult.tampered > 0 ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}`}>
            {verifyResult.tampered > 0 ? "⚠️ 위변조 의심 항목이 감지되었습니다" : "✅ 모든 결제 데이터가 정상입니다"}
          </p>
          <p className="text-muted-foreground">{verifyResult.message}</p>
        </div>
      )}

      {/* 테이블 */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border/40 bg-secondary/50">
                {["결제 ID","주문 ID","회원 ID","결제 금액","결제 수단","결제일시","SHA-256 해시","상태","검증 일시"]
                  .map((h) => (
                    <th key={h} className="text-left py-3 px-3 text-muted-foreground font-semibold whitespace-nowrap">
                      {h}
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-muted-foreground">
                    <RefreshCw className="w-4 h-4 animate-spin inline mr-2" /> 로딩 중...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-muted-foreground">
                    <Shield className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="font-medium">스캔 기록 없음</p>
                    <p className="text-[11px] mt-1 opacity-70">
                      '전체 스캔' 버튼을 클릭하여 결제 데이터 무결성 감사를 시작하세요.
                    </p>
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr
                    key={item.id}
                    className={`border-b border-border/20 transition-colors ${
                      item.status === "TAMPERED"
                        ? "bg-red-50/20 dark:bg-red-900/10 hover:bg-red-50/40 dark:hover:bg-red-900/20"
                        : item.status === "VERIFIED"
                          ? "hover:bg-green-50/10 dark:hover:bg-green-900/10"
                          : "hover:bg-secondary/40"
                    }`}
                  >
                    <td className="py-3 px-3 font-medium text-foreground">{item.paymentId}</td>
                    <td className="py-3 px-3 text-muted-foreground">{item.repairOrderId}</td>
                    <td className="py-3 px-3 text-muted-foreground">{item.memberId}</td>
                    <td className="py-3 px-3 font-medium text-foreground whitespace-nowrap">
                      {item.totalPaidAmount?.toLocaleString("ko-KR")}원
                    </td>
                    <td className="py-3 px-3 text-muted-foreground">{item.paymentMethod}</td>
                    <td className="py-3 px-3 font-mono text-muted-foreground text-[11px] whitespace-nowrap">
                      {fmtDate(item.paidAt)}
                    </td>
                    <td className="py-3 px-3 max-w-[160px]">
                      <span
                        title={item.expectedHash}
                        className={`font-mono text-[10px] block truncate ${
                          item.status === "TAMPERED" ? "text-red-500" : "text-muted-foreground"
                        }`}
                      >
                        {item.expectedHash ? item.expectedHash.substring(0, 16) + "..." : "-"}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <IntegrityStatusBadge status={item.status} />
                    </td>
                    <td className="py-3 px-3 font-mono text-muted-foreground text-[11px] whitespace-nowrap">
                      {fmtDate(item.verifiedAt)}
                    </td>
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

// ── 메인 페이지 ───────────────────────────────────────────────────────
export default function AuditPage() {
  const [tab, setTab] = useState("dlq");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">감사 및 DLQ 관리</h1>
          <p className="text-sm text-muted-foreground mt-1">
            청구 패키지 이벤트 로그 · DLQ 오류 재시도 · 결제 데이터 무결성 감사
          </p>
        </div>
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-500" />
          <span className="text-xs font-medium text-red-600 dark:text-red-400">
            실패 항목은 DLQ 탭에서 재시도
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border/40">
        {[
          ["dlq",       "청구 패킷 실패 (DLQ)"],
          ["audit",     "청구 이벤트 감사 로그"],
          ["integrity", "결제 무결성 감사"],
        ].map(([t, l]) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all -mb-px ${
              tab === t
                ? "border-accent text-accent"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      {tab === "dlq"       && <DlqTab />}
      {tab === "audit"     && <AuditLogTab />}
      {tab === "integrity" && <IntegrityTab />}
    </div>
  );
}
