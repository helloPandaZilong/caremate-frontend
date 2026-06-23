import { useState } from "react";
import {
  Award,
  CheckCircle2,
  XCircle,
  Search,
  ChevronDown,
  RotateCcw,
} from "lucide-react";
import { Card, Badge } from "../../components/shared";

const LMS_DATA = [
  {
    shopId: "SH-001",
    shopName: "강남 스마트케어",
    employeeCount: 3,
    completions: [
      {
        name: "박기술",
        REPAIR_REPORT_GUIDE: {
          status: "COMPLETED",
          score: 5,
          date: "2024.05.20",
        },
        PLATFORM_PROCESS_GUIDE: {
          status: "COMPLETED",
          score: 4,
          date: "2024.05.21",
        },
        allDone: true,
      },
      {
        name: "이수리",
        REPAIR_REPORT_GUIDE: {
          status: "COMPLETED",
          score: 4,
          date: "2024.06.01",
        },
        PLATFORM_PROCESS_GUIDE: {
          status: "IN_PROGRESS",
          score: null,
          date: null,
        },
        allDone: false,
      },
      {
        name: "김부품",
        REPAIR_REPORT_GUIDE: { status: "NOT_STARTED", score: null, date: null },
        PLATFORM_PROCESS_GUIDE: {
          status: "NOT_STARTED",
          score: null,
          date: null,
        },
        allDone: false,
      },
    ],
  },
  {
    shopId: "SH-002",
    shopName: "서초 아이폰 전문점",
    employeeCount: 2,
    completions: [
      {
        name: "최아이",
        REPAIR_REPORT_GUIDE: {
          status: "COMPLETED",
          score: 5,
          date: "2024.04.10",
        },
        PLATFORM_PROCESS_GUIDE: {
          status: "COMPLETED",
          score: 5,
          date: "2024.04.11",
        },
        allDone: true,
      },
      {
        name: "정폰",
        REPAIR_REPORT_GUIDE: {
          status: "COMPLETED",
          score: 4,
          date: "2024.05.15",
        },
        PLATFORM_PROCESS_GUIDE: {
          status: "NOT_STARTED",
          score: null,
          date: null,
        },
        allDone: false,
      },
    ],
  },
  {
    shopId: "SH-003",
    shopName: "역삼 갤럭시 수리",
    employeeCount: 2,
    completions: [
      {
        name: "한수리",
        REPAIR_REPORT_GUIDE: { status: "NOT_STARTED", score: null, date: null },
        PLATFORM_PROCESS_GUIDE: {
          status: "NOT_STARTED",
          score: null,
          date: null,
        },
        allDone: false,
      },
      {
        name: "오갤럭",
        REPAIR_REPORT_GUIDE: { status: "IN_PROGRESS", score: null, date: null },
        PLATFORM_PROCESS_GUIDE: {
          status: "NOT_STARTED",
          score: null,
          date: null,
        },
        allDone: false,
      },
    ],
  },
];

const STATUS_BADGE = {
  COMPLETED: {
    label: "수료",
    icon: CheckCircle2,
    color: "text-green-600 dark:text-green-400",
  },
  IN_PROGRESS: {
    label: "진행 중",
    icon: RotateCcw,
    color: "text-amber-600 dark:text-amber-400",
  },
  NOT_STARTED: {
    label: "미시작",
    icon: XCircle,
    color: "text-muted-foreground",
  },
};

function StatusCell({ status, score, date }) {
  const cfg = STATUS_BADGE[status];
  const Icon = cfg.icon;
  return (
    <div className="flex flex-col items-center gap-0.5">
      <div
        className={`flex items-center gap-1 text-xs font-medium ${cfg.color}`}
      >
        <Icon className="w-3.5 h-3.5" />
        {cfg.label}
      </div>
      {score !== null && (
        <span className="text-[10px] text-muted-foreground">
          {score}/5점 · {date}
        </span>
      )}
    </div>
  );
}

export default function AdminLMSManagePage() {
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState("SH-001");

  const filtered = LMS_DATA.filter(
    (s) => s.shopName.includes(query) || s.shopId.includes(query),
  );

  const totalShops = LMS_DATA.length;
  const fullyCompleted = LMS_DATA.filter((s) =>
    s.completions.every((c) => c.allDone),
  ).length;
  const totalEmployees = LMS_DATA.reduce((a, s) => a + s.employeeCount, 0);
  const completedEmployees = LMS_DATA.reduce(
    (a, s) => a + s.completions.filter((c) => c.allDone).length,
    0,
  );

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      <div>
        <h1 className="text-xl font-semibold text-foreground">LMS 수료 관리</h1>
        <p className="text-sm text-muted-foreground mt-1">
          수리점별 직원 교육 이수 현황을 확인하세요.
        </p>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "전체 수리점", value: totalShops, sub: "파트너" },
          {
            label: "전 직원 수료 완료",
            value: `${fullyCompleted}/${totalShops}`,
            sub: "수리점",
          },
          { label: "전체 직원 수", value: totalEmployees, sub: "명" },
          {
            label: "수료 완료 직원",
            value: `${completedEmployees}/${totalEmployees}`,
            sub: "명",
          },
        ].map((k) => (
          <Card key={k.label} className="px-4 py-4">
            <p className="text-xs text-muted-foreground">{k.label}</p>
            <p className="text-2xl font-bold text-foreground mt-1">{k.value}</p>
            <p className="text-[11px] text-muted-foreground">{k.sub}</p>
          </Card>
        ))}
      </div>

      {/* Overall completion rate bar */}
      <Card className="p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-accent" />
            <p className="text-sm font-semibold text-foreground">전체 수료율</p>
          </div>
          <span className="text-sm font-bold text-accent">
            {Math.round((completedEmployees / totalEmployees) * 100)}%
          </span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-accent rounded-full transition-all duration-700"
            style={{ width: `${(completedEmployees / totalEmployees) * 100}%` }}
          />
        </div>
        <div className="flex items-center gap-6 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-accent" />
            수료 완료 {completedEmployees}명
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            진행 중
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-muted" />
            미시작
          </span>
        </div>
      </Card>

      {/* Search */}
      <div className="relative w-64">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="수리점 검색..."
          className="w-full pl-9 pr-4 py-2 text-sm bg-secondary border border-border rounded-xl text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all"
        />
      </div>

      {/* Shop accordions */}
      <div className="flex flex-col gap-3">
        {filtered.map((shop) => {
          const isExpanded = expanded === shop.shopId;
          const allDone = shop.completions.every((c) => c.allDone);
          const doneCount = shop.completions.filter((c) => c.allDone).length;

          return (
            <Card key={shop.shopId} className="overflow-hidden">
              {/* Shop header */}
              <button
                onClick={() => setExpanded(isExpanded ? null : shop.shopId)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-secondary transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${allDone ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400" : "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"}`}
                  >
                    {allDone ? <Award className="w-4 h-4" /> : shop.shopName[0]}
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-foreground">
                        {shop.shopName}
                      </p>
                      <Badge variant={allDone ? "green" : "yellow"}>
                        {allDone
                          ? "전원 수료"
                          : `${doneCount}/${shop.employeeCount}명 수료`}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground font-mono">
                      {shop.shopId} · 직원 {shop.employeeCount}명
                    </p>
                  </div>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`}
                />
              </button>

              {/* Employee table */}
              {isExpanded && (
                <div className="border-t border-border overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-secondary/50 border-b border-border">
                        {[
                          "직원명",
                          "수리 리포트 작성 기준",
                          "A/S 처리 절차 안내",
                          "전체 수료",
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
                      {shop.completions.map((emp) => (
                        <tr
                          key={emp.name}
                          className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors"
                        >
                          <td className="py-3 px-4 font-medium text-foreground">
                            {emp.name}
                          </td>
                          <td className="py-3 px-4">
                            <StatusCell {...emp.REPAIR_REPORT_GUIDE} />
                          </td>
                          <td className="py-3 px-4">
                            <StatusCell {...emp.PLATFORM_PROCESS_GUIDE} />
                          </td>
                          <td className="py-3 px-4">
                            {emp.allDone ? (
                              <div className="flex items-center gap-1 text-green-600 text-xs font-semibold">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                수료 완료
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 text-muted-foreground text-xs">
                                <XCircle className="w-3.5 h-3.5" />
                                미완료
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
