import { useState } from "react";
import {
  CreditCard,
  Smartphone,
  CheckCircle2,
  TrendingDown,
  Download,
  ExternalLink,
  FileText,
  Receipt,
  ArrowRight,
  Info,
} from "lucide-react";
import { Button, Card } from "../../components/shared";

const INVOICE_ITEMS = [
  { label: "전면 유리 교체 (파트비)", amount: 180000 },
  { label: "액정 모듈 교체 (파트비)", amount: 120000 },
  { label: "공임비", amount: 50000 },
  { label: "출장 방문비", amount: 20000 },
];

const TOTAL = INVOICE_ITEMS.reduce((a, i) => a + i.amount, 0);

// Per-policy reimbursement estimates
const POLICY_ESTIMATES = [
  {
    name: "Carrier Care (SKT)",
    coverage: 80,
    deductible: 30000,
    estimated: Math.min(Math.round((TOTAL - 30000) * 0.8), 800000),
    submitUrl: "https://www.tworld.co.kr/insurance-claim",
    carrier: "SKT 보험",
  },
  {
    name: "프리미엄 카드 폰케어",
    coverage: 60,
    deductible: 50000,
    estimated: Math.min(Math.round((TOTAL - 50000) * 0.6), 500000),
    submitUrl: "https://www.shinhancard.com/claim",
    carrier: "신한카드",
  },
];

const PAYMENT_METHODS = [
  { id: "card", label: "신용카드", icon: CreditCard },
  { id: "mobile", label: "간편결제 (카카오페이·토스)", icon: Smartphone },
];

function fmt(n) {
  return n.toLocaleString("ko-KR") + "원";
}

// ── Post-Payment: Claim Package Screen ───────────────────────────────────────

function ClaimPackageScreen() {
  const [downloading, setDownloading] = useState(null);

  const handleDownload = (policyName) => {
    setDownloading(policyName);
    setTimeout(() => setDownloading(null), 2000);
  };

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      {/* Success header */}
      <div className="flex items-start gap-4 p-5 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700/50 rounded-2xl">
        <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-800/50 flex items-center justify-center shrink-0 mt-0.5">
          <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-green-900 dark:text-green-300">
            결제 완료
          </h2>
          <p className="text-sm text-green-700 dark:text-green-400 mt-0.5">
            수리 대금 <strong>{fmt(TOTAL)}</strong>이 결제되어 수리점으로
            지급되었습니다.
          </p>
          <p className="text-xs text-green-600 dark:text-green-400 mt-1.5 leading-relaxed">
            아래에서 보험사별 청구 패키지를 다운로드하고, 해당 보험사 제출
            페이지로 이동하여 서류를 제출하세요.
          </p>
        </div>
      </div>

      {/* Receipt summary */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Receipt className="w-4 h-4 text-accent" />
          <h3 className="text-sm font-semibold text-foreground">결제 영수증</h3>
          <span className="text-xs text-muted-foreground ml-auto font-mono">
            CM-20240613-0042
          </span>
        </div>
        <div className="flex flex-col divide-y divide-border/40 text-sm mb-4">
          {INVOICE_ITEMS.map((item) => (
            <div key={item.label} className="flex justify-between py-2.5">
              <span className="text-muted-foreground">{item.label}</span>
              <span className="font-medium text-foreground">
                {fmt(item.amount)}
              </span>
            </div>
          ))}
          <div className="flex justify-between py-3 font-semibold text-base">
            <span>합계 (결제 완료)</span>
            <span className="text-green-700 dark:text-green-400">
              {fmt(TOTAL)}
            </span>
          </div>
        </div>
        <button className="flex items-center gap-2 text-xs text-accent hover:underline font-medium">
          <Download className="w-3.5 h-3.5" />
          결제 영수증 PDF 다운로드
        </button>
      </Card>

      {/* Insurance claim packages */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-foreground" />
          <h3 className="text-sm font-semibold text-foreground">
            보험사별 청구 패키지
          </h3>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          CareMate가 보험사별 제출 서류 패키지를 자동 생성했습니다. 각 보험사
          패키지를 다운로드한 후 제출 사이트 링크로 이동하여 직접 제출해 주세요.
        </p>

        <div className="p-3 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700/50 rounded-xl flex items-start gap-2 text-xs text-amber-700 dark:text-amber-400">
          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>
            실제 보험금 수령액은 보험사 심사 결과에 따라 달라질 수 있습니다.
            CareMate는 청구 패키지 생성 및 제출 안내까지만 지원합니다.
          </span>
        </div>

        {POLICY_ESTIMATES.map((p) => (
          <Card key={p.name} className="p-5 flex flex-col gap-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {p.name}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {p.carrier}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">예상 환급액</p>
                <p className="text-base font-bold text-accent">
                  ≈ {fmt(p.estimated)}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  보장 {p.coverage}% · 자부담 {fmt(p.deductible)}
                </p>
              </div>
            </div>

            {/* Package contents */}
            <div className="bg-secondary rounded-xl p-3 flex flex-col gap-2">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                패키지 포함 서류
              </p>
              {[
                "결제 영수증 (CareMate 발행)",
                "정형 수리 리포트 (수리점 작성)",
                "파손 사진 증빙 (A4 편집본)",
              ].map((doc) => (
                <div
                  key={doc}
                  className="flex items-center gap-2 text-xs text-foreground"
                >
                  <CheckCircle2 className="w-3 h-3 text-green-500 shrink-0" />
                  {doc}
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => handleDownload(p.name)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                  downloading === p.name
                    ? "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-700/50"
                    : "bg-accent text-white hover:bg-accent/90 border-accent"
                }`}
              >
                <Download className="w-4 h-4" />
                {downloading === p.name ? "다운로드 중..." : "패키지 다운로드"}
              </button>
              <a
                href={p.submitUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border border-border text-foreground hover:bg-secondary transition-all"
              >
                <ExternalLink className="w-4 h-4" />
                {p.carrier} 제출 사이트
              </a>
            </div>
          </Card>
        ))}
      </div>

      {/* Guide */}
      <Card className="p-5 flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-foreground">
          청구 절차 안내
        </h3>
        <div className="flex flex-col gap-3">
          {[
            {
              step: "01",
              label: "패키지 다운로드",
              desc: "보험사별 청구 패키지를 PDF로 다운로드합니다.",
            },
            {
              step: "02",
              label: "보험사 제출 사이트 이동",
              desc: "위 '제출 사이트' 버튼을 클릭하여 해당 보험사 청구 페이지로 이동합니다.",
            },
            {
              step: "03",
              label: "서류 제출",
              desc: "다운로드한 패키지 파일을 첨부하여 보험 청구를 제출합니다.",
            },
            {
              step: "04",
              label: "심사 대기",
              desc: "보험사 심사 결과는 각 보험사 앱/홈페이지에서 직접 확인하세요.",
            },
          ].map((g) => (
            <div key={g.step} className="flex gap-3 text-sm">
              <span
                className="text-lg font-bold text-border leading-none shrink-0 w-8"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                {g.step}
              </span>
              <div>
                <p className="font-medium text-foreground">{g.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{g.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Button variant="secondary" size="md" className="self-start">
        대시보드로 돌아가기
      </Button>
    </div>
  );
}

// ── Payment Form Screen ───────────────────────────────────────────────────────

export default function PaymentPage() {
  const [method, setMethod] = useState("card");
  const [paid, setPaid] = useState(false);

  if (paid) return <ClaimPackageScreen />;

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-semibold text-foreground">결제 센터</h1>
        <p className="text-sm text-muted-foreground mt-1">
          수리 대금을 결제하면 보험 청구 패키지가 자동 생성됩니다.
        </p>
      </div>

      {/* Flow notice */}
      <div className="flex items-center gap-3 flex-wrap text-xs text-muted-foreground">
        {[
          "수리 대금 전액 결제 (수리점 지급)",
          "청구 패키지 자동 생성",
          "보험사 서류 제출 안내",
        ].map((s, i, arr) => (
          <div key={s} className="flex items-center gap-2">
            <span className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-accent text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                {i + 1}
              </span>
              {s}
            </span>
            {i < arr.length - 1 && (
              <ArrowRight className="w-3 h-3 text-muted-foreground/40" />
            )}
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {/* Invoice */}
        <Card className="p-5 flex flex-col gap-4">
          <h3 className="text-sm font-semibold text-foreground">
            수리 청구 명세서
          </h3>
          <div className="flex flex-col divide-y divide-border/40">
            {INVOICE_ITEMS.map((item) => (
              <div
                key={item.label}
                className="flex justify-between py-2.5 text-sm"
              >
                <span className="text-muted-foreground">{item.label}</span>
                <span className="font-medium text-foreground">
                  {fmt(item.amount)}
                </span>
              </div>
            ))}
            <div className="flex justify-between py-3 text-base font-semibold">
              <span className="text-foreground">결제 금액 합계</span>
              <span className="text-foreground">{fmt(TOTAL)}</span>
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-2 border-t border-border/40">
            <p className="text-xs font-medium text-muted-foreground">
              결제 수단
            </p>
            {PAYMENT_METHODS.map(({ id, label, icon: Icon }) => (
              <label
                key={id}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  method === id
                    ? "border-accent bg-accent/10"
                    : "border-border hover:border-border/70"
                }`}
              >
                <input
                  type="radio"
                  name="method"
                  value={id}
                  checked={method === id}
                  onChange={() => setMethod(id)}
                  className="accent-accent w-4 h-4"
                />
                <Icon className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">
                  {label}
                </span>
              </label>
            ))}
          </div>
        </Card>

        {/* Insurance estimate preview */}
        <Card className="p-5 flex flex-col gap-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-700/50">
          <div className="flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-accent" />
            <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300">
              보험 환급 예상액
            </h3>
          </div>
          <p className="text-xs text-blue-600 dark:text-blue-400 leading-relaxed">
            결제 완료 후 아래 예상액 기준으로 보험사별 청구 패키지가 생성됩니다.
            실제 수령액은 보험사 심사 결과에 따라 다를 수 있습니다.
          </p>
          <div className="flex flex-col gap-3">
            {POLICY_ESTIMATES.map((p) => (
              <div
                key={p.name}
                className="bg-card/70 rounded-xl p-3.5 flex items-center justify-between gap-2"
              >
                <div>
                  <p className="text-xs font-semibold text-foreground">
                    {p.name}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {p.coverage}% 보장 · 자부담 {fmt(p.deductible)}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-muted-foreground">예상 환급</p>
                  <p className="text-base font-bold text-accent">
                    ≈ {fmt(p.estimated)}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-blue-200 dark:border-blue-700/50 text-sm">
            <span className="text-blue-700 dark:text-blue-400 font-medium">
              총 예상 환급액
            </span>
            <span className="text-lg font-bold text-blue-800 dark:text-blue-300">
              ≈ {fmt(POLICY_ESTIMATES.reduce((a, p) => a + p.estimated, 0))}
            </span>
          </div>
        </Card>
      </div>

      {/* CTA */}
      <div className="flex flex-col md:flex-row items-center gap-4 p-5 bg-card border border-border rounded-2xl">
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">
            결제 즉시 청구 패키지가 생성됩니다
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            결제 금액은 수리점에 바로 지급됩니다. 이후 보험사 청구는 생성된
            패키지로 직접 진행하세요.
          </p>
        </div>
        <Button
          variant="accent"
          size="lg"
          className="shrink-0"
          onClick={() => setPaid(true)}
        >
          <CreditCard className="w-4 h-4" />
          {fmt(TOTAL)} 결제하기
        </Button>
      </div>
    </div>
  );
}
