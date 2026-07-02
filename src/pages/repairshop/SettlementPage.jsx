import { useState, useEffect } from "react";
import {
  ChevronDown,
  Printer,
  Download,
  TrendingUp,
  Loader2,
} from "lucide-react";
import { Card, Badge } from "../../components/shared";
import {
  fetchSettlements,
  fetchSettlementDetail,
  fetchSettlementOrders,
  downloadSettlementExcel,
} from "../../api/settlement";

function fmt(n) {
  return "₩" + Number(n).toLocaleString("ko-KR");
}

export default function ShopSettlementPage() {
  const [months, setMonths] = useState([]);
  const [month, setMonth] = useState(null);
  const [detail, setDetail] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState(null);

  // 월별 정산 목록 조회
  useEffect(() => {
    fetchSettlements()
      .then((res) => {
        const data = res.data.data ?? [];
        setMonths(data);
        if (data.length > 0) setMonth(data[0].settlementMonth);
      })
      .catch(() => setError("정산 목록을 불러오지 못했습니다."))
      .finally(() => setLoadingList(false));
  }, []);

  // 특정 월 정산 상세 조회
  useEffect(() => {
    if (!month) return;
    setLoadingDetail(true);
    fetchSettlementDetail(month)
      .then((res) => setDetail(res.data.data))
      .catch(() => setError("정산 상세를 불러오지 못했습니다."))
      .finally(() => setLoadingDetail(false));
  }, [month]);

  // 특정 월 건별 결제 내역 조회
  useEffect(() => {
    if (!month) return;
    setLoadingOrders(true);
    fetchSettlementOrders(month)
      .then((res) => setOrders(res.data.data ?? []))
      .catch(() => setOrders([]))
      .finally(() => setLoadingOrders(false));
  }, [month]);

  // 다운로드
  const handleDownload = async () => {
    if (!month || downloading) return;
    setDownloading(true);
    try {
      await downloadSettlementExcel(month);
    } catch {
      setError("다운로드에 실패했습니다.");
    } finally {
      setDownloading(false);
    }
  };

  if (loadingList) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-accent" />
      </div>
    );
  }

  if (error && !detail) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-muted-foreground">
        {error}
      </div>
    );
  }

  if (months.length === 0) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-muted-foreground">
        정산 내역이 없습니다.
      </div>
    );
  }

  // 수수료·순수입 계산 (FE)
  const gross = detail?.totalPaymentAmount ?? 0;
  const fee = Math.round(gross * 0.1);
  const net = gross - fee;
  const orderCount = detail?.orderCount ?? 0;
  const totalExpectedRefund = detail?.totalExpectedRefundAmount ?? 0;
  const displayMonth = month ? month.replace("-", "년 ") + "월" : "";

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            월말 정산 리포트
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            월별 매출 및 수수료 현황
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
          <button
            onClick={handleDownload}
            disabled={downloading || !month}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium bg-accent text-white rounded-xl hover:bg-accent/90 transition-colors disabled:opacity-50"
          >
            {downloading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            {downloading ? "다운로드 중..." : "Excel 다운로드"}
          </button>
        </div>
      </div>

      {/* Month picker */}
      <div className="relative w-fit">
        <select
          value={month ?? ""}
          onChange={(e) => setMonth(e.target.value)}
          className="appearance-none pl-4 pr-10 py-2.5 text-sm bg-card border border-border rounded-xl text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-accent/30 cursor-pointer"
        >
          {months.map((m) => (
            <option key={m.settlementMonth} value={m.settlementMonth}>
              {m.settlementMonth.replace("-", "년 ")}월
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
      </div>

      {loadingDetail ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-accent" />
        </div>
      ) : (
        <>
          {/* KPI cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                label: "총 수리 매출",
                value: fmt(gross),
                sub: displayMonth,
                color: "text-foreground",
              },
              {
                label: "플랫폼 수수료",
                value: fmt(fee),
                sub: "수수료율 10%",
                color: "text-red-600 dark:text-red-400",
              },
              {
                label: "순 수취 금액",
                value: fmt(net),
                sub: "수수료 제외",
                color: "text-green-700 dark:text-green-400",
              },
              {
                label: "결제 완료 건수",
                value: `${orderCount}건`,
                sub: `예상 환급 총합 ${fmt(totalExpectedRefund)}`,
                color: "text-foreground",
              },
            ].map((k) => (
              <Card key={k.label} className="px-4 py-4 flex flex-col gap-1">
                <p className="text-xs text-muted-foreground">{k.label}</p>
                <p className={`text-xl font-bold ${k.color}`}>{k.value}</p>
                <p className="text-[11px] text-muted-foreground">{k.sub}</p>
              </Card>
            ))}
          </div>

          {/* Fee breakdown */}
          <Card className="p-5 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-accent" />
              <h3 className="text-sm font-semibold text-foreground">
                {displayMonth} 수수료 정산 요약
              </h3>
              <Badge variant="green" className="ml-auto">
                집계 완료
              </Badge>
            </div>
            <div className="flex flex-col gap-2 text-sm">
              {[
                {
                  label: "총 수리 결제 수령액",
                  value: fmt(gross),
                  note: "고객이 CareMate 인앱 결제로 선결제한 금액 합산",
                },
                {
                  label: "플랫폼 수수료 (10%)",
                  value: `-${fmt(fee)}`,
                  note: "월말 플랫폼에 납부해야 할 수수료",
                },
                {
                  label: "최종 순수입",
                  value: fmt(net),
                  note: "수수료 납부 후 수리점 순 수취액",
                  bold: true,
                },
              ].map((r) => (
                <div
                  key={r.label}
                  className={`flex items-start justify-between gap-2 py-2.5 border-b border-border/40 last:border-0 ${r.bold ? "font-semibold text-base" : ""}`}
                >
                  <div>
                    <p className={r.bold ? "text-foreground font-semibold" : "text-muted-foreground"}>
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

          {/* 주문 상세 테이블 — payments.paidAt 기준 건별 결제 내역 */}
          <Card className="overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground">
                {displayMonth} 수리 내역 ({orderCount}건)
              </h3>
            </div>

            {loadingOrders ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : orders.length === 0 ? (
              <div className="py-12 text-center text-sm text-muted-foreground">
                해당 월에 결제 완료된 수리 내역이 없습니다.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border/40 bg-secondary/50">
                      {[
                        "주문번호",
                        "고객명",
                        "결제 금액",
                        "예상 환급액",
                        "결제 일시",
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
                        key={o.orderId}
                        className="border-b border-border/20 hover:bg-secondary/40 transition-colors"
                      >
                        <td className="py-3 px-4 font-mono text-foreground whitespace-nowrap">
                          {o.orderNo}
                        </td>
                        <td className="py-3 px-4 text-foreground font-medium">
                          {o.customerName}
                        </td>
                        <td className="py-3 px-4 font-semibold text-foreground">
                          {fmt(o.totalPaidAmount)}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {fmt(o.expectedRefundAmount)}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground whitespace-nowrap font-mono">
                          {o.paidAt
                            ? new Date(o.paidAt).toLocaleString("ko-KR")
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {/* Monthly trend */}
          <Card className="p-5 flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-foreground">
              월별 매출 추이
            </h3>
            <div className="flex items-end gap-2 h-28">
              {[...months].reverse().map((m) => {
                const maxGross = Math.max(...months.map((s) => s.totalPaymentAmount));
                const height = maxGross > 0
                  ? Math.round((m.totalPaymentAmount / maxGross) * 96)
                  : 0;
                const isActive = m.settlementMonth === month;
                return (
                  <button
                    key={m.settlementMonth}
                    onClick={() => setMonth(m.settlementMonth)}
                    className="flex-1 flex flex-col items-center gap-1 group"
                  >
                    <span className="text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                      {fmt(m.totalPaymentAmount).replace("₩", "")}
                    </span>
                    <div
                      className={`w-full rounded-t-lg transition-all ${isActive ? "bg-accent" : "bg-secondary hover:bg-accent/30"}`}
                      style={{ height: `${height}px` }}
                    />
                    <span className={`text-[10px] ${isActive ? "text-accent font-semibold" : "text-muted-foreground"}`}>
                      {m.settlementMonth.split("-")[1]}월
                    </span>
                  </button>
                );
              })}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

