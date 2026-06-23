import { useState } from "react";
import { RefreshCw, Shield, ShieldAlert, RotateCcw } from "lucide-react";
import { Card, Badge, Button } from "../../components/shared";

const DLQ_ITEMS = [
  {
    id: "DLQ-2024-0891",
    carrier: "KB손해보험",
    payload: '{"claimId":"CLM-7821","amount":324000,"policy":"POL-001"}',
    timestamp: "2024.06.13 14:32:51",
    retries: 3,
    errorCode: "CONNECTION_TIMEOUT",
  },
  {
    id: "DLQ-2024-0890",
    carrier: "메리츠화재",
    payload: '{"claimId":"CLM-7819","amount":180000,"policy":"POL-003"}',
    timestamp: "2024.06.13 11:15:23",
    retries: 5,
    errorCode: "INVALID_SIGNATURE",
  },
  {
    id: "DLQ-2024-0887",
    carrier: "현대해상",
    payload: '{"claimId":"CLM-7810","amount":520000,"policy":"POL-004"}',
    timestamp: "2024.06.12 22:44:07",
    retries: 2,
    errorCode: "RATE_LIMIT_EXCEEDED",
  },
  {
    id: "DLQ-2024-0881",
    carrier: "DB손해보험",
    payload: '{"claimId":"CLM-7805","amount":270000,"policy":"POL-005"}',
    timestamp: "2024.06.12 18:30:12",
    retries: 1,
    errorCode: "MALFORMED_PACKET",
  },
];

const AUDIT_ITEMS = [
  {
    txId: "TX-2024-0612-001",
    hash: "a3f8b2c1d9e4f7a0b5c8d2e1f6a9b3c7",
    modified: "2024.06.13 09:00:00",
    status: "verified",
  },
  {
    txId: "TX-2024-0612-002",
    hash: "e7d2a5f8c3b6e9d4a7f2c5b8e1d6a3f9",
    modified: "2024.06.13 09:15:33",
    status: "verified",
  },
  {
    txId: "TX-2024-0612-003",
    hash: "c1b4a7d0f3e6c9b2a5d8f1e4c7b0a3d6",
    modified: "2024.06.13 10:02:41",
    status: "tampered",
  },
  {
    txId: "TX-2024-0612-004",
    hash: "f5e8b1a4c7d0f3e6b9a2d5c8f1e4b7a0",
    modified: "2024.06.13 10:44:18",
    status: "verified",
  },
  {
    txId: "TX-2024-0612-005",
    hash: "d9c2a5f8b1e4d7c0a3f6b9e2c5d8a1f4",
    modified: "2024.06.13 11:15:23",
    status: "tampered",
  },
  {
    txId: "TX-2024-0612-006",
    hash: "b3a6d9f2c5e8a1d4f7c0b3e6a9d2f5c8",
    modified: "2024.06.13 11:55:02",
    status: "verified",
  },
];

export default function AuditPage() {
  const [tab, setTab] = useState("dlq");
  const [retrying, setRetrying] = useState(null);
  const [batchRetrying, setBatchRetrying] = useState(false);

  const handleRetry = (id) => {
    setRetrying(id);
    setTimeout(() => setRetrying(null), 2000);
  };

  const handleBatchRetry = () => {
    setBatchRetrying(true);
    setTimeout(() => setBatchRetrying(false), 3000);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            청구 예외 및 데이터 무결성 감사
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            DLQ 오류 관리 및 변조 감지 로그
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-xs font-medium text-red-600 dark:text-red-400">
            DLQ {DLQ_ITEMS.length}건 미처리
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border/40">
        {[
          ["dlq", "청구 패킷 실패 (DLQ)"],
          ["audit", "데이터 무결성 감사 로그"],
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
            {t === "dlq" && (
              <span className="ml-2 px-1.5 py-0.5 text-[10px] bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full font-semibold">
                {DLQ_ITEMS.length}
              </span>
            )}
            {t === "audit" && (
              <span className="ml-2 px-1.5 py-0.5 text-[10px] bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-full font-semibold">
                {AUDIT_ITEMS.filter((a) => a.status === "tampered").length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* DLQ Tab */}
      {tab === "dlq" && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              총 {DLQ_ITEMS.length}건의 전송 실패 항목이 대기 중입니다.
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={handleBatchRetry}
              className={batchRetrying ? "opacity-70 pointer-events-none" : ""}
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${batchRetrying ? "animate-spin" : ""}`}
              />
              {batchRetrying ? "재전송 중..." : "전체 일괄 재전송"}
            </Button>
          </div>

          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border/40 bg-secondary/50">
                    {[
                      "DLQ ID",
                      "보험사",
                      "에러 코드",
                      "재시도",
                      "발생 시각",
                      "페이로드 (요약)",
                      "Action",
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
                  {DLQ_ITEMS.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-border/20 hover:bg-red-50/30 dark:hover:bg-red-900/10 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono text-red-600 dark:text-red-400 font-medium">
                        {item.id}
                      </td>
                      <td className="py-3 px-4 font-medium text-foreground">
                        {item.carrier}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="red">{item.errorCode}</Badge>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {item.retries}회
                      </td>
                      <td className="py-3 px-4 text-muted-foreground font-mono whitespace-nowrap">
                        {item.timestamp}
                      </td>
                      <td className="py-3 px-4">
                        <code className="text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded max-w-48 block truncate">
                          {item.payload}
                        </code>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleRetry(item.id)}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium bg-accent/10 text-accent rounded-lg hover:bg-accent/15 transition-colors border border-accent/20"
                        >
                          <RotateCcw
                            className={`w-3 h-3 ${retrying === item.id ? "animate-spin" : ""}`}
                          />
                          {retrying === item.id ? "재전송 중" : "Retry"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Audit Tab */}
      {tab === "audit" && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              전체 {AUDIT_ITEMS.length}건 중{" "}
              <span className="text-red-600 dark:text-red-400 font-semibold">
                {AUDIT_ITEMS.filter((a) => a.status === "tampered").length}건
                변조 의심
              </span>
            </p>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                무결성 확인
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-red-500 dark:text-red-400" />
                변조 감지
              </span>
            </div>
          </div>

          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border/40 bg-secondary/50">
                    {[
                      "트랜잭션 ID",
                      "SHA-256 해시",
                      "수정 이력 타임스탬프",
                      "무결성 상태",
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
                  {AUDIT_ITEMS.map((item) => (
                    <tr
                      key={item.txId}
                      className={`border-b border-border/20 transition-colors ${
                        item.status === "tampered"
                          ? "bg-red-50/40 dark:bg-red-900/10 hover:bg-red-50/60 dark:hover:bg-red-900/20"
                          : "hover:bg-secondary/40"
                      }`}
                    >
                      <td className="py-3 px-4 font-mono font-medium text-foreground">
                        {item.txId}
                      </td>
                      <td className="py-3 px-4">
                        <code
                          className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                            item.status === "tampered"
                              ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                              : "bg-secondary text-muted-foreground"
                          }`}
                        >
                          {item.hash}
                        </code>
                      </td>
                      <td className="py-3 px-4 font-mono text-muted-foreground">
                        {item.modified}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {item.status === "verified" ? (
                            <Shield className="w-4 h-4 text-green-600 dark:text-green-400" />
                          ) : (
                            <ShieldAlert className="w-4 h-4 text-red-500 dark:text-red-400" />
                          )}
                          <span
                            className={`font-semibold ${item.status === "verified" ? "text-green-700 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                          >
                            {item.status === "verified"
                              ? "Verified Secure"
                              : "⚠ Tampering Detected"}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
