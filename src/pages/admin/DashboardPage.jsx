import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { Card } from "../../components/shared";
import { useDarkMode } from "../../hooks/useDarkMode";

const MONTHS = ["1월", "2월", "3월", "4월", "5월", "6월"];

const BAR_DATA = MONTHS.map((m, i) => ({
  month: m,
  fee: [12, 15, 11, 18, 22, 19][i] * 100000,
  payout: [48, 52, 45, 61, 78, 68][i] * 100000,
}));

const LINE_DATA = MONTHS.map((m, i) => ({
  month: m,
  generated: [142, 168, 155, 201, 243, 227][i],
  success: [138, 161, 149, 195, 237, 219][i],
}));

// Sparkline mini component
function Sparkline({ data, color }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * 60;
    const y = 20 - ((v - min) / range) * 18;
    return `${x},${y}`;
  });
  return (
    <svg width="64" height="24" viewBox="0 0 64 24" className="shrink-0">
      <polyline
        points={pts.join(" ")}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const KPI_CARDS = [
  {
    title: "총 플랫폼 수익",
    value: "₩97,200,000",
    change: "+18.3%",
    up: true,
    icon: DollarSign,
    color: "#2563EB",
    sparkData: [48, 52, 45, 61, 78, 97],
  },
  {
    title: "정산 지급 금액",
    value: "₩352,000,000",
    change: "+12.7%",
    up: true,
    icon: TrendingUp,
    color: "#0D9488",
    sparkData: [280, 295, 270, 310, 342, 352],
  },
  {
    title: "청구 성공률",
    value: "96.9%",
    change: "-0.4%p",
    up: false,
    icon: CheckCircle2,
    color: "#16A34A",
    sparkData: [97.2, 97.8, 96.1, 97.5, 97.3, 96.9],
  },
  {
    title: "활성 DLQ 오류율",
    value: "0.8%",
    change: "+0.3%p",
    up: false,
    icon: AlertTriangle,
    color: "#DC2626",
    sparkData: [0.3, 0.2, 0.5, 0.4, 0.5, 0.8],
  },
];

function KPICard({ title, value, change, up, icon: Icon, color, sparkData }) {
  return (
    <Card className="p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: `${color}15` }}
          >
            <Icon className="w-4 h-4" style={{ color }} />
          </div>
          <p className="text-xs font-medium text-muted-foreground">{title}</p>
        </div>
        <Sparkline data={sparkData} color={color} />
      </div>
      <div className="flex items-end justify-between">
        <p className="text-2xl font-bold text-foreground tracking-tight">
          {value}
        </p>
        <div
          className={`flex items-center gap-1 text-xs font-semibold ${up ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"}`}
        >
          {up ? (
            <TrendingUp className="w-3.5 h-3.5" />
          ) : (
            <TrendingDown className="w-3.5 h-3.5" />
          )}
          {change}
        </div>
      </div>
    </Card>
  );
}

function fmt(v) {
  return `₩${(v / 10000).toFixed(0)}만`;
}

export default function AdminDashboard() {
  const { dark } = useDarkMode();

  // Recharts doesn't support CSS vars natively — derive colors from mode
  const tickColor = dark ? "#94A3B8" : "#6B7280";
  const gridColor = dark ? "rgba(241,245,249,0.08)" : "rgba(26,29,46,0.06)";
  const tooltipStyle = {
    borderRadius: 12,
    border: `1px solid ${dark ? "rgba(241,245,249,0.12)" : "rgba(26,29,46,0.1)"}`,
    background: dark ? "#1E293B" : "#ffffff",
    color: dark ? "#F1F5F9" : "#1A1D2E",
    fontSize: 12,
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      <div>
        <h1 className="text-xl font-semibold text-foreground">
          통합 관제 대시보드
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          플랫폼 전체 현황 · 2024년 6월 기준
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {KPI_CARDS.map((k) => (
          <KPICard key={k.title} {...k} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-5">
        {/* Bar chart */}
        <Card className="p-5">
          <div className="mb-4">
            <p className="text-sm font-semibold text-foreground">수익 비교</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              플랫폼 수수료 vs 수리점 정산액 (단위: 만원)
            </p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={BAR_DATA} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: tickColor }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={fmt}
                tick={{ fontSize: 10, fill: tickColor }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(v) => fmt(v)}
                labelStyle={{ fontSize: 12, color: tooltipStyle.color }}
                contentStyle={tooltipStyle}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar
                dataKey="fee"
                name="플랫폼수수료"
                fill="#2563EB"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="payout"
                name="수리점정산"
                fill="#0D9488"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Line chart */}
        <Card className="p-5">
          <div className="mb-4">
            <p className="text-sm font-semibold text-foreground">
              보험 청구 패킷 현황
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              생성된 청구 vs 성공 전송 (실시간)
            </p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={LINE_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: tickColor }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: tickColor }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                labelStyle={{ fontSize: 12, color: tooltipStyle.color }}
                contentStyle={tooltipStyle}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line
                type="monotone"
                dataKey="generated"
                name="생성된청구"
                stroke="#2563EB"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="success"
                name="성공전송"
                stroke="#0D9488"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
                strokeDasharray="4 2"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Summary table */}
      <Card className="p-5">
        <p className="text-sm font-semibold text-foreground mb-4">
          최근 이상 징후 요약
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border/40">
                {["이벤트", "발생 시각", "보험사", "처리 상태"].map((h) => (
                  <th
                    key={h}
                    className="text-left py-2 px-3 text-muted-foreground font-medium"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                {
                  event: "DLQ 패킷 전송 실패",
                  time: "2024.06.13 14:32",
                  carrier: "KB손해보험",
                  status: "retry",
                  statusColor:
                    "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30",
                },
                {
                  event: "해시 검증 불일치",
                  time: "2024.06.13 11:15",
                  carrier: "메리츠화재",
                  status: "경고",
                  statusColor:
                    "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30",
                },
                {
                  event: "배치 정산 지연",
                  time: "2024.06.12 23:58",
                  carrier: "내부",
                  status: "resolved",
                  statusColor:
                    "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30",
                },
              ].map((r, i) => (
                <tr
                  key={i}
                  className="border-b border-border/20 hover:bg-secondary/50 transition-colors"
                >
                  <td className="py-3 px-3 font-medium text-foreground">
                    {r.event}
                  </td>
                  <td className="py-3 px-3 text-muted-foreground font-mono">
                    {r.time}
                  </td>
                  <td className="py-3 px-3 text-muted-foreground">
                    {r.carrier}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${r.statusColor}`}
                    >
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
