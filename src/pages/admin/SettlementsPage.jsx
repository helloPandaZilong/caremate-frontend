import { useState } from "react";
import {
  ChevronDown,
  Send,
  CheckCircle2,
  Bell,
  Clock,
  AlertCircle,
} from "lucide-react";
import { Card, Badge } from "../../components/shared";

const FEE_LEDGER = [
  {
    shopId: "SH-001",
    shopName: "강남 스마트케어",
    gross: 12400000,
    feeRate: 10,
    fee: 1240000,
    status: "PENDING",
    dueDate: "2024.07.05",
    notifiedAt: null,
  },
  {
    shopId: "SH-002",
    shopName: "서초 아이폰 전문점",
    gross: 8700000,
    feeRate: 10,
    fee: 870000,
    status: "NOTIFIED",
    dueDate: "2024.07.05",
    notifiedAt: "2024.06.30 09:12",
  },
  {
    shopId: "SH-003",
    shopName: "역삼 갤럭시 수리",
    gross: 6200000,
    feeRate: 10,
    fee: 620000,
    status: "PAID",
    dueDate: "2024.07.05",
    notifiedAt: "2024.06.30 09:12",
  },
  {
    shopId: "SH-004",
    shopName: "선릉 올폰 서비스",
    gross: 3800000,
    feeRate: 10,
    fee: 380000,
    status: "OVERDUE",
    dueDate: "2024.06.05",
    notifiedAt: "2024.05.31 10:00",
  },
  {
    shopId: "SH-005",
    shopName: "삼성 공식 서비스센터",
    gross: 28600000,
    feeRate: 10,
    fee: 2860000,
    status: "PAID",
    dueDate: "2024.07.05",
    notifiedAt: "2024.06.30 09:12",
  },
  {
    shopId: "SH-006",
    shopName: "마포 폰닥터",
    gross: 5100000,
    feeRate: 10,
    fee: 510000,
    status: "PENDING",
    dueDate: "2024.07.05",
    notifiedAt: null,
  },
  {
    shopId: "SH-007",
    shopName: "홍대 아이케어",
    gross: 7300000,
    feeRate: 10,
    fee: 730000,
    status: "NOTIFIED",
    dueDate: "2024.07.05",
    notifiedAt: "2024.06.30 09:12",
  },
];

const STATUS_CONFIG = {
  PAID: { label: "납부 완료", badge: "green" },
  PENDING: { label: "청구 전", badge: "muted" },
  NOTIFIED: { label: "청구 요청 발송됨", badge: "yellow" },
  OVERDUE: { label: "연체", badge: "red" },
};

function fmt(n) {
  return "₩" + n.toLocaleString("ko-KR");
}

export default function SettlementsPage() {
  const [month, setMonth] = useState("2024-06");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [ledger, setLedger] = useState(FEE_LEDGER);
  const [sendingSingle, setSendingSingle] = useState(null);

  const pendingCount = ledger.filter((r) => r.status === "PENDING").length;
  const totalFee = ledger.reduce((a, r) => a + r.fee, 0);
  const collectedFee = ledger
    .filter((r) => r.status === "PAID")
    .reduce((a, r) => a + r.fee, 0);

  const handleBulkSend = () => {
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSent(true);
      setLedger((prev) =>
        prev.map((r) =>
          r.status === "PENDING"
            ? { ...r, status: "NOTIFIED", notifiedAt: "2024.07.01 10:00" }
            : r,
        ),
      );
      setTimeout(() => setSent(false), 4000);
    }, 2000);
  };

  const handleSingleNotify = (shopId) => {
    setSendingSingle(shopId);
    setTimeout(() => {
      setSendingSingle(null);
      setLedger((prev) =>
        prev.map((r) =>
          r.shopId === shopId
            ? { ...r, status: "NOTIFIED", notifiedAt: "방금 전" }
            : r,
        ),
      );
    }, 1500);
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">
          수수료 청구 요청 관리
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          수리점별 월말 플랫폼 수수료 청구 현황을 관리합니다.
        </p>
      </div>

      {/* Top controls */}
      <div className="flex items-center gap-3 flex-wrap justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="appearance-none pl-3.5 pr-8 py-2.5 text-sm bg-card border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all"
            >
              {["2024-06", "2024-05", "2024-04", "2024-03"].map((m) => (
                <option key={m} value={m}>
                  {m.replace("-", "년 ")}월
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-xl text-xs text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            청구 미발송 {pendingCount}개 수리점
          </div>
        </div>

        {/* Bulk send button */}
        <div className="flex flex-col items-end gap-2">
          {sent && (
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-xs font-medium animate-in fade-in">
              <CheckCircle2 className="w-3.5 h-3.5" />
              일괄 수수료 청구 요청이 모든 수리점으로 발송되었습니다.
            </div>
          )}
          <button
            onClick={handleBulkSend}
            disabled={sending || pendingCount === 0}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              pendingCount === 0
                ? "bg-secondary text-muted-foreground cursor-not-allowed"
                : sending
                  ? "bg-accent/70 text-white cursor-not-allowed"
                  : "bg-accent text-white hover:bg-accent/90 shadow-lg shadow-accent/20"
            }`}
          >
            {sending ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                발송 중...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                월말 수수료 청구 요청 일괄 발송
              </>
            )}
          </button>
          <p className="text-[11px] text-muted-foreground">
            청구 미발송 수리점 {pendingCount}곳에 알림 메시지를 일괄 발송합니다.
          </p>
        </div>
      </div>

      {/* KPI summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "총 청구 수수료",
            value: fmt(totalFee),
            color: "text-foreground",
          },
          {
            label: "수납 완료",
            value: fmt(collectedFee),
            color: "text-green-700 dark:text-green-400",
          },
          {
            label: "미수납",
            value: fmt(totalFee - collectedFee),
            color: "text-amber-600 dark:text-amber-400",
          },
          {
            label: "수납률",
            value: `${Math.round((collectedFee / totalFee) * 100)}%`,
            color:
              collectedFee / totalFee > 0.7
                ? "text-green-600 dark:text-green-400"
                : "text-red-500 dark:text-red-400",
          },
        ].map((k) => (
          <Card key={k.label} className="px-4 py-4">
            <p className="text-xs text-muted-foreground">{k.label}</p>
            <p className={`text-xl font-bold mt-1 ${k.color}`}>{k.value}</p>
          </Card>
        ))}
      </div>

      {/* Main table */}
      <div className="grid md:grid-cols-[1fr_300px] gap-5 items-start">
        <Card className="overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">
              수리점별 수수료 청구 현황
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border/40 bg-secondary/50">
                  {[
                    "수리점 ID",
                    "수리점명",
                    "총 매출",
                    "수수료율",
                    "청구 수수료",
                    "납부 기한",
                    "발송 일시",
                    "상태",
                    "개별 발송",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left py-3 px-3 text-muted-foreground font-semibold whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ledger.map((row) => {
                  const cfg = STATUS_CONFIG[row.status];
                  return (
                    <tr
                      key={row.shopId}
                      className="border-b border-border/20 hover:bg-secondary/40 transition-colors"
                    >
                      <td className="py-3 px-3 font-mono text-muted-foreground">
                        {row.shopId}
                      </td>
                      <td className="py-3 px-3 font-medium text-foreground whitespace-nowrap">
                        {row.shopName}
                      </td>
                      <td className="py-3 px-3 text-foreground">
                        {fmt(row.gross)}
                      </td>
                      <td className="py-3 px-3 text-muted-foreground">
                        {row.feeRate}%
                      </td>
                      <td className="py-3 px-3 font-semibold text-foreground">
                        {fmt(row.fee)}
                      </td>
                      <td className="py-3 px-3 text-muted-foreground whitespace-nowrap">
                        {row.dueDate}
                      </td>
                      <td className="py-3 px-3 text-muted-foreground whitespace-nowrap font-mono">
                        {row.notifiedAt ?? (
                          <span className="text-muted-foreground/40">
                            미발송
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <Badge variant={cfg.badge}>{cfg.label}</Badge>
                      </td>
                      <td className="py-3 px-3">
                        {row.status === "PENDING" && (
                          <button
                            onClick={() => handleSingleNotify(row.shopId)}
                            disabled={sendingSingle === row.shopId}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium bg-accent/10 text-accent rounded-lg hover:bg-accent/15 transition-colors border border-accent/20 whitespace-nowrap disabled:opacity-50"
                          >
                            {sendingSingle === row.shopId ? (
                              <span className="w-3 h-3 border border-accent/30 border-t-accent rounded-full animate-spin" />
                            ) : (
                              <Bell className="w-3 h-3" />
                            )}
                            청구 발송
                          </button>
                        )}
                        {row.status === "OVERDUE" && (
                          <button
                            onClick={() => handleSingleNotify(row.shopId)}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors border border-red-200 dark:border-red-700/50 whitespace-nowrap"
                          >
                            <AlertCircle className="w-3 h-3" />
                            독촉 발송
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Info widget */}
        <Card className="p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-accent" />
            <p className="text-sm font-semibold text-foreground">
              정산 프로세스 안내
            </p>
          </div>
          <div className="flex flex-col gap-3 text-xs text-muted-foreground">
            {[
              {
                step: "1",
                title: "결제 수령",
                desc: "고객 결제 대금이 수리점으로 직접 지급됩니다.",
              },
              {
                step: "2",
                title: "수수료 청구 발송",
                desc: "월말 관리자가 각 수리점에 수수료 청구 요청 알림을 발송합니다.",
              },
              {
                step: "3",
                title: "수리점 납부",
                desc: "수리점은 알림 수신 후 납부 기한(월 5일)까지 플랫폼 수수료를 납부합니다.",
              },
              {
                step: "4",
                title: "납부 확인",
                desc: "납부 완료 시 상태가 PAID로 전환됩니다.",
              },
            ].map((s) => (
              <div key={s.step} className="flex gap-3">
                <span className="w-5 h-5 rounded-full bg-accent text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                  {s.step}
                </span>
                <div>
                  <p className="font-medium text-foreground">{s.title}</p>
                  <p className="mt-0.5 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-border/40">
            <p className="text-[11px] text-muted-foreground">
              배치 자동 실행: 매월 말일 자정 (KST)
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              납부 기한: 익월 5일
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              연체 시 서비스 제한 처리
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
