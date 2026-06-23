import { useState } from "react";
import {
  ChevronDown,
  Printer,
  Download,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { Card, Badge } from "../../components/shared";

function fmt(n) {
  return "₩" + n.toLocaleString("ko-KR");
}

const MONTHS = [
  "2024-06",
  "2024-05",
  "2024-04",
  "2024-03",
  "2024-02",
  "2024-01",
];

// Per-month summary data
const MONTH_SUMMARIES = {
  "2024-06": {
    gross: 12400000,
    feeRate: 10,
    fee: 1240000,
    net: 11160000,
    settled: false,
    dueDate: "2024.07.05",
  },
  "2024-05": {
    gross: 9800000,
    feeRate: 10,
    fee: 980000,
    net: 8820000,
    settled: true,
    dueDate: "2024.06.05",
  },
  "2024-04": {
    gross: 11200000,
    feeRate: 10,
    fee: 1120000,
    net: 10080000,
    settled: true,
    dueDate: "2024.05.05",
  },
  "2024-03": {
    gross: 7600000,
    feeRate: 10,
    fee: 760000,
    net: 6840000,
    settled: true,
    dueDate: "2024.04.05",
  },
  "2024-02": {
    gross: 8900000,
    feeRate: 10,
    fee: 890000,
    net: 8010000,
    settled: true,
    dueDate: "2024.03.05",
  },
  "2024-01": {
    gross: 6300000,
    feeRate: 10,
    fee: 630000,
    net: 5670000,
    settled: true,
    dueDate: "2024.02.05",
  },
};

// Repair order details per month
const JUNE_ORDERS = [
  {
    id: "CM-20240613-0042",
    customer: "김민준",
    device: "iPhone 15 Pro",
    amount: 370000,
    date: "06.13",
    settled: false,
  },
  {
    id: "CM-20240613-0039",
    customer: "이수연",
    device: "Galaxy S24 Ultra",
    amount: 280000,
    date: "06.13",
    settled: false,
  },
  {
    id: "CM-20240612-0031",
    customer: "박도현",
    device: "iPhone 14",
    amount: 150000,
    date: "06.12",
    settled: false,
  },
  {
    id: "CM-20240611-0024",
    customer: "최지아",
    device: "Pixel 8 Pro",
    amount: 520000,
    date: "06.11",
    settled: false,
  },
  {
    id: "CM-20240610-0018",
    customer: "정우성",
    device: "Galaxy Z Flip 5",
    amount: 890000,
    date: "06.10",
    settled: false,
  },
  {
    id: "CM-20240608-0014",
    customer: "한예슬",
    device: "iPhone 13 mini",
    amount: 80000,
    date: "06.08",
    settled: false,
  },
  {
    id: "CM-20240605-0009",
    customer: "이재원",
    device: "Galaxy S23",
    amount: 340000,
    date: "06.05",
    settled: false,
  },
  {
    id: "CM-20240602-0003",
    customer: "김서연",
    device: "iPhone 15",
    amount: 210000,
    date: "06.02",
    settled: false,
  },
];

export default function ShopSettlementPage() {
  const [month, setMonth] = useState("2024-06");
  const summary = MONTH_SUMMARIES[month];
  const orders = month === "2024-06" ? JUNE_ORDERS : [];

  const displayMonth = month.replace("-", "년 ") + "월";

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            월말 정산 리포트
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            강남 스마트케어 · 월별 매출 및 수수료 현황
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium border border-border rounded-xl hover:bg-secondary transition-colors text-foreground"
          >
            <Printer className="w-4 h-4" />
            인쇄
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium bg-accent text-white rounded-xl hover:bg-accent/90 transition-colors">
            <Download className="w-4 h-4" />
            PDF 다운로드
          </button>
        </div>
      </div>

      {/* Month picker */}
      <div className="relative w-fit">
        <select
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="appearance-none pl-4 pr-10 py-2.5 text-sm bg-card border border-border rounded-xl text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-accent/30 cursor-pointer"
        >
          {MONTHS.map((m) => (
            <option key={m} value={m}>
              {m.replace("-", "년 ")}월
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
      </div>

      {/* Unsettled alert */}
      {!summary.settled && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700/50 rounded-2xl">
          <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
              수수료 납부 대기 중
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
              {displayMonth} 플랫폼 수수료 <strong>{fmt(summary.fee)}</strong>{" "}
              납부 기한: {summary.dueDate}까지
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
              관리자의 수수료 청구 요청 확인 후 플랫폼 수수료를 납부해 주세요.
            </p>
          </div>
        </div>
      )}

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "총 수리 매출",
            value: fmt(summary.gross),
            sub: `${displayMonth}`,
            color: "text-foreground",
          },
          {
            label: "플랫폼 수수료",
            value: fmt(summary.fee),
            sub: `수수료율 ${summary.feeRate}%`,
            color: "text-red-600 dark:text-red-400",
          },
          {
            label: "순 수취 금액",
            value: fmt(summary.net),
            sub: "수수료 제외",
            color: "text-green-700 dark:text-green-400",
          },
          {
            label: "수수료 납부",
            value: summary.settled ? "완료" : "대기",
            sub: summary.settled ? "정상 납부" : `기한: ${summary.dueDate}`,
            color: summary.settled
              ? "text-green-600 dark:text-green-400"
              : "text-amber-600 dark:text-amber-400",
          },
        ].map((k) => (
          <Card key={k.label} className="px-4 py-4 flex flex-col gap-1">
            <p className="text-xs text-muted-foreground">{k.label}</p>
            <p className={`text-xl font-bold ${k.color}`}>{k.value}</p>
            <p className="text-[11px] text-muted-foreground">{k.sub}</p>
          </Card>
        ))}
      </div>

      {/* Fee breakdown box */}
      <Card className="p-5 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-accent" />
          <h3 className="text-sm font-semibold text-foreground">
            {displayMonth} 수수료 정산 요약
          </h3>
          <Badge
            variant={summary.settled ? "green" : "yellow"}
            className="ml-auto"
          >
            {summary.settled ? "납부 완료" : "납부 대기"}
          </Badge>
        </div>
        <div className="flex flex-col gap-2 text-sm">
          {[
            {
              label: "총 수리 결제 수령액",
              value: fmt(summary.gross),
              note: "고객이 CareMate 인앱 결제로 선결제한 금액 합산",
            },
            {
              label: `플랫폼 수수료 (${summary.feeRate}%)`,
              value: `-${fmt(summary.fee)}`,
              note: "월말 플랫폼에 납부해야 할 수수료",
            },
            {
              label: "최종 순수입",
              value: fmt(summary.net),
              note: "수수료 납부 후 수리점 순 수취액",
              bold: true,
            },
          ].map((r) => (
            <div
              key={r.label}
              className={`flex items-start justify-between gap-2 py-2.5 border-b border-border/40 last:border-0 ${r.bold ? "font-semibold text-base" : ""}`}
            >
              <div>
                <p
                  className={
                    r.bold
                      ? "text-foreground font-semibold"
                      : "text-muted-foreground"
                  }
                >
                  {r.label}
                </p>
                <p className="text-[11px] text-muted-foreground/70 mt-0.5">
                  {r.note}
                </p>
              </div>
              <span
                className={
                  r.bold
                    ? "text-green-700 dark:text-green-400 font-bold text-base shrink-0"
                    : r.label.includes("수수료")
                      ? "text-red-500 dark:text-red-400 shrink-0"
                      : "text-foreground shrink-0"
                }
              >
                {r.value}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Order detail table */}
      <Card className="overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">
            {displayMonth} 수리 내역 ({orders.length > 0 ? orders.length : "—"}
            건)
          </h3>
        </div>
        {orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border/40 bg-secondary/40">
                  {[
                    "주문번호",
                    "고객명",
                    "기기",
                    "수리일",
                    "결제액",
                    "수수료(10%)",
                    "순수입",
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
                {orders.map((o) => (
                  <tr
                    key={o.id}
                    className="border-b border-border/20 hover:bg-secondary/40 transition-colors"
                  >
                    <td className="py-3 px-4 font-mono text-muted-foreground">
                      {o.id}
                    </td>
                    <td className="py-3 px-4 font-medium text-foreground">
                      {o.customer}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {o.device}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      2024.{o.date}
                    </td>
                    <td className="py-3 px-4 font-medium text-foreground">
                      {fmt(o.amount)}
                    </td>
                    <td className="py-3 px-4 text-red-500 dark:text-red-400">
                      {fmt(Math.round(o.amount * 0.1))}
                    </td>
                    <td className="py-3 px-4 font-semibold text-green-700 dark:text-green-400">
                      {fmt(Math.round(o.amount * 0.9))}
                    </td>
                  </tr>
                ))}
                <tr className="bg-secondary/60 font-semibold text-sm">
                  <td className="py-3 px-4 text-foreground" colSpan={4}>
                    합계
                  </td>
                  <td className="py-3 px-4 text-foreground">
                    {fmt(orders.reduce((a, o) => a + o.amount, 0))}
                  </td>
                  <td className="py-3 px-4 text-red-500 dark:text-red-400">
                    {fmt(
                      Math.round(
                        orders.reduce((a, o) => a + o.amount, 0) * 0.1,
                      ),
                    )}
                  </td>
                  <td className="py-3 px-4 text-green-700 dark:text-green-400">
                    {fmt(
                      Math.round(
                        orders.reduce((a, o) => a + o.amount, 0) * 0.9,
                      ),
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-sm text-muted-foreground">
            해당 월의 상세 내역이 없습니다.
          </div>
        )}
      </Card>

      {/* Monthly trend */}
      <Card className="p-5 flex flex-col gap-4">
        <h3 className="text-sm font-semibold text-foreground">
          월별 매출 추이
        </h3>
        <div className="flex items-end gap-2 h-28">
          {MONTHS.slice()
            .reverse()
            .map((m) => {
              const s = MONTH_SUMMARIES[m];
              const maxGross = Math.max(
                ...Object.values(MONTH_SUMMARIES).map((v) => v.gross),
              );
              const height = Math.round((s.gross / maxGross) * 96);
              const isActive = m === month;
              return (
                <button
                  key={m}
                  onClick={() => setMonth(m)}
                  className="flex-1 flex flex-col items-center gap-1 group"
                >
                  <span className="text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                    {fmt(s.gross).replace("₩", "")}
                  </span>
                  <div
                    className={`w-full rounded-t-lg transition-all ${isActive ? "bg-accent" : "bg-secondary hover:bg-accent/30"}`}
                    style={{ height: `${height}px` }}
                  />

                  <span
                    className={`text-[10px] ${isActive ? "text-accent font-semibold" : "text-muted-foreground"}`}
                  >
                    {m.split("-")[1]}월
                  </span>
                </button>
              );
            })}
        </div>
      </Card>
    </div>
  );
}
