import { useState, useEffect } from "react";
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
  Loader2,
} from "lucide-react";
import { Button, Card } from "../../components/shared";
import { getRepairOrders, getInsurancePolicies } from "../../api/customerService";

const PAYMENT_METHODS = [
  { id: "card", label: "신용카드", icon: CreditCard },
  { id: "mobile", label: "간편결제 (카카오페이·토스)", icon: Smartphone },
];

function fmt(n) {
  return n.toLocaleString("ko-KR") + "원";
}

function ClaimPackageScreen({ policies }) {
  const [downloading, setDownloading] = useState(null);

  const handleDownload = (name) => {
    setDownloading(name);
    setTimeout(() => setDownloading(null), 2000);
  };

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div className="flex items-start gap-4 p-5 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700/50 rounded-2xl">
        <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-800/50 flex items-center justify-center shrink-0 mt-0.5">
          <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-green-900 dark:text-green-300">
            결제 완료
          </h2>
          <p className="text-sm text-green-700 dark:text-green-400 mt-0.5">
            수리 대금이 결제되어 수리점으로 지급되었습니다.
          </p>
          <p className="text-xs text-green-600 dark:text-green-400 mt-1.5 leading-relaxed">
            아래에서 보험사별 청구 패키지를 다운로드하고, 해당 보험사 제출
            페이지로 이동하여 서류를 제출하세요.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-foreground" />
          <h3 className="text-sm font-semibold text-foreground">
            보험사별 청구 패키지
          </h3>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          CareMate가 보험사별 제출 서류 패키지를 자동 생성했습니다.
        </p>
        <div className="p-3 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700/50 rounded-xl flex items-start gap-2 text-xs text-amber-700 dark:text-amber-400">
          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>
            실제 보험금 수령액은 보험사 심사 결과에 따라 달라질 수 있습니다.
          </span>
        </div>

        {policies.map((p) => (
          <Card key={p.id} className="p-5 flex flex-col gap-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {p.productName}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {p.providerName}
                </p>
              </div>
            </div>
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
            <button
              onClick={() => handleDownload(p.productName)}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                downloading === p.productName
                  ? "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-700/50"
                  : "bg-accent text-white hover:bg-accent/90 border-accent"
              }`}
            >
              <Download className="w-4 h-4" />
              {downloading === p.productName ? "다운로드 중..." : "패키지 다운로드"}
            </button>
          </Card>
        ))}
      </div>

      <Card className="p-5 flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-foreground">
          청구 절차 안내
        </h3>
        <div className="flex flex-col gap-3">
          {[
            { step: "01", label: "패키지 다운로드", desc: "보험사별 청구 패키지를 PDF로 다운로드합니다." },
            { step: "02", label: "보험사 제출 사이트 이동", desc: "해당 보험사 청구 페이지로 이동합니다." },
            { step: "03", label: "서류 제출", desc: "다운로드한 패키지 파일을 첨부하여 보험 청구를 제출합니다." },
            { step: "04", label: "심사 대기", desc: "보험사 심사 결과는 각 보험사 앱/홈페이지에서 직접 확인하세요." },
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

      <Button
        variant="secondary"
        size="md"
        className="self-start"
        onClick={() => (window.location.href = "/customer/dashboard")}
      >
        대시보드로 돌아가기
      </Button>
    </div>
  );
}

export default function PaymentPage() {
  const [method, setMethod] = useState("card");
  const [paid, setPaid] = useState(false);
  const [policies, setPolicies] = useState([]);
  const [latestOrder, setLatestOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getRepairOrders(0, 1).catch(() => ({ data: { data: { content: [] } } })),
      getInsurancePolicies().catch(() => ({ data: { data: [] } })),
    ]).then(([orderRes, policyRes]) => {
      const orders = orderRes.data.data?.content ?? [];
      if (orders.length > 0) setLatestOrder(orders[0]);
      setPolicies((policyRes.data.data ?? []).filter((p) => p.status === "ACTIVE"));
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-accent" />
      </div>
    );
  }

  if (paid) return <ClaimPackageScreen policies={policies} />;

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-semibold text-foreground">결제 센터</h1>
        <p className="text-sm text-muted-foreground mt-1">
          수리 대금을 결제하면 보험 청구 패키지가 자동 생성됩니다.
        </p>
      </div>

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
        <Card className="p-5 flex flex-col gap-4">
          <h3 className="text-sm font-semibold text-foreground">
            수리 정보
          </h3>
          {latestOrder ? (
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">접수번호</span>
                <span className="font-medium text-foreground font-mono">
                  {latestOrder.orderNo}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">수리점</span>
                <span className="font-medium text-foreground">
                  {latestOrder.shopName}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              진행 중인 수리 건이 없습니다.
            </p>
          )}

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

        <Card className="p-5 flex flex-col gap-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-700/50">
          <div className="flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-accent" />
            <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300">
              적용 보험
            </h3>
          </div>
          <p className="text-xs text-blue-600 dark:text-blue-400 leading-relaxed">
            결제 완료 후 아래 보험 기준으로 청구 패키지가 생성됩니다.
          </p>
          <div className="flex flex-col gap-3">
            {policies.map((p) => (
              <div
                key={p.id}
                className="bg-card/70 rounded-xl p-3.5 flex items-center justify-between gap-2"
              >
                <div>
                  <p className="text-xs font-semibold text-foreground">
                    {p.productName}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {p.providerName}
                  </p>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-700/50 font-medium">
                  활성
                </span>
              </div>
            ))}
            {policies.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4">
                활성화된 보험이 없습니다.
              </p>
            )}
          </div>
        </Card>
      </div>

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
          disabled={!latestOrder}
        >
          <CreditCard className="w-4 h-4" />
          결제하기
        </Button>
      </div>
    </div>
  );
}