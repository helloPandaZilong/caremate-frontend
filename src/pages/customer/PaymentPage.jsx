import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
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
import {
  fetchPaymentInfo,
  readyPayment,
  confirmPayment,
  failPayment,
  fetchReceipt,
} from "../../api/payment";

function fmt(n) {
  return Number(n).toLocaleString("ko-KR") + "원";
}

// ── Post-Payment: Claim Package Screen ───────────────────────────────────────

function ClaimPackageScreen({ paymentId, confirmData }) {
  const navigate = useNavigate();
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!paymentId) return;
    fetchReceipt(paymentId)
      .then((res) => setReceipt(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [paymentId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-accent" />
      </div>
    );
  }

  const total = receipt?.totalPaidAmount ?? confirmData?.totalPaidAmount ?? 0;
  const expectedRefund = receipt?.expectedRefundAmount ?? confirmData?.expectedRefundAmount ?? 0;
  const claims = confirmData?.claims ?? [];

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
            수리 대금 <strong>{fmt(total)}</strong>이 결제되어 수리점으로
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
            {receipt?.orderNo ?? "-"}
          </span>
        </div>
        <div className="flex flex-col divide-y divide-border/40 text-sm mb-4">
          <div className="flex justify-between py-2.5">
            <span className="text-muted-foreground">결제 수단</span>
            <span className="font-medium text-foreground">
              {receipt?.paymentMethod ?? "PG"}
            </span>
          </div>
          <div className="flex justify-between py-2.5">
            <span className="text-muted-foreground">결제 일시</span>
            <span className="font-medium text-foreground">
              {receipt?.paidAt ? new Date(receipt.paidAt).toLocaleString("ko-KR") : "-"}
            </span>
          </div>
          <div className="flex justify-between py-3 font-semibold text-base">
            <span>합계 (결제 완료)</span>
            <span className="text-green-700 dark:text-green-400">
              {fmt(total)}
            </span>
          </div>
        </div>
        {receipt?.pgReceiptUrl && (
          <a
            href={receipt.pgReceiptUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs text-accent hover:underline font-medium"
          >
            <Download className="w-3.5 h-3.5" />
            PG 영수증 보기
          </a>
        )}
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

        {/* 총 예상 환급액 */}
        <div className="flex justify-between items-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-700/50">
          <span className="text-sm font-medium text-blue-700 dark:text-blue-400">
            총 예상 환급액
          </span>
          <span className="text-lg font-bold text-blue-800 dark:text-blue-300">
            ≈ {fmt(expectedRefund)}
          </span>
        </div>

        {/* 보험사별 청구 내역 */}
        {claims.length > 0 ? (
          claims.map((claim) => (
            <Card key={claim.claimId} className="p-5 flex flex-col gap-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {claim.providerType === "TELECOM" ? "통신사 보험" : "카드사 보험"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    청구 순서 {claim.claimOrder}순위
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">예상 환급액</p>
                  <p className="text-base font-bold text-accent">
                    ≈ {fmt(claim.expectedAmount)}
                  </p>
                </div>
              </div>

              {/* 패키지 포함 서류 — 5번 API 완성 후 실제 다운로드 연결 예정 */}
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

              {/* Actions — 5번 claim-request, package, submission-link API 완성 후 연결 예정 */}
              <div className="flex gap-2">
                <button
                  disabled
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border bg-secondary text-muted-foreground border-border cursor-not-allowed"
                >
                  <Download className="w-4 h-4" />
                  패키지 다운로드 (준비 중)
                </button>
                <button
                  disabled
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border border-border text-muted-foreground cursor-not-allowed"
                >
                  <ExternalLink className="w-4 h-4" />
                  제출 사이트 (준비 중)
                </button>
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-5 text-center text-sm text-muted-foreground">
            청구 내역이 없습니다. 원클릭 청구 요청 후 다시 확인해주세요.
          </Card>
        )}
      </div>

      {/* Guide */}
      <Card className="p-5 flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-foreground">청구 절차 안내</h3>
        <div className="flex flex-col gap-3">
          {[
            { step: "01", label: "패키지 다운로드", desc: "보험사별 청구 패키지를 PDF로 다운로드합니다." },
            { step: "02", label: "보험사 제출 사이트 이동", desc: "위 '제출 사이트' 버튼을 클릭하여 해당 보험사 청구 페이지로 이동합니다." },
            { step: "03", label: "서류 제출", desc: "다운로드한 패키지 파일을 첨부하여 보험 청구를 제출합니다." },
            { step: "04", label: "심사 대기", desc: "보험사 심사 결과는 각 보험사 앱/홈페이지에서 직접 확인하세요." },
          ].map((g) => (
            <div key={g.step} className="flex gap-3 text-sm">
              <span className="text-lg font-bold text-border leading-none shrink-0 w-8"
                style={{ fontFamily: "'DM Sans', sans-serif" }}>
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

      <Button variant="secondary" size="md" className="self-start" onClick={() => navigate("/customer/dashboard")}>
        대시보드로 돌아가기
      </Button>
    </div>
  );
}

// ── Payment Form Screen ───────────────────────────────────────────────────────

export default function PaymentPage() {
  const { orderId: orderIdParam } = useParams();
  const orderId = Number(orderIdParam);
  const navigate = useNavigate();
  const [method, setMethod] = useState("card");
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState(null);

  // 결제 완료 후 상태
  const [paid, setPaid] = useState(false);
  const [paymentId, setPaymentId] = useState(null);
  const [confirmData, setConfirmData] = useState(null);

  // 결제 정보 조회 (GET /api/customer/payments/info/{orderId})
  useEffect(() => {
    if (!orderId) return;
    fetchPaymentInfo(orderId)
      .then((res) => setPaymentInfo(res.data.data))
      .catch(() => setError("결제 정보를 불러오지 못했습니다."))
      .finally(() => setLoading(false));
  }, [orderId]);

  // 결제하기 버튼 클릭
  const handlePayment = async () => {
    if (paying) return;
    setPaying(true);
    setError(null);

    try {
      // 1. 결제 준비 (POST /api/customer/payments/ready)
      const readyRes = await readyPayment(orderId);
      const { paymentKey, amount } = readyRes.data.data;

      // 2. PG SDK 호출 (실제 PG 연동 시 여기서 PG SDK 실행)
      //    현재는 바로 confirm으로 진행 (테스트용)

      // 3. 결제 승인 (POST /api/customer/payments/confirm)
      const confirmRes = await confirmPayment(orderId, paymentKey, amount);
      const confirmResult = confirmRes.data.data;

      setPaymentId(confirmResult.paymentId);
      setConfirmData(confirmResult);
      setPaid(true);
    } catch (err) {
      // 결제 실패 처리 (POST /api/customer/payments/fail)
      const errorCode = err.response?.data?.error?.code ?? "UNKNOWN";
      const errorMessage = err.response?.data?.error?.message ?? "결제 중 오류가 발생했습니다.";
      await failPayment(orderId, errorCode, errorMessage).catch(console.error);
      setError(errorMessage);
    } finally {
      setPaying(false);
    }
  };

  if (paid) {
    return <ClaimPackageScreen paymentId={paymentId} confirmData={confirmData} />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-accent" />
      </div>
    );
  }

  if (error && !paymentInfo) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-muted-foreground">
        {error}
      </div>
    );
  }

  const total = paymentInfo?.totalRepairCost ?? 0;

  const PAYMENT_METHODS = [
    { id: "card", label: "신용카드", icon: CreditCard },
    { id: "mobile", label: "간편결제 (카카오페이·토스)", icon: Smartphone },
  ];

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
            <div className="flex justify-between py-2.5 text-sm">
              <span className="text-muted-foreground">주문번호</span>
              <span className="font-medium text-foreground font-mono">
                {paymentInfo?.orderNo ?? "-"}
              </span>
            </div>
            <div className="flex justify-between py-2.5 text-sm">
              <span className="text-muted-foreground">현재 상태</span>
              <span className="font-medium text-foreground">
                {paymentInfo?.status ?? "-"}
              </span>
            </div>
            <div className="flex justify-between py-3 text-base font-semibold">
              <span className="text-foreground">결제 금액 합계</span>
              <span className="text-foreground">{fmt(total)}</span>
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-2 border-t border-border/40">
            <p className="text-xs font-medium text-muted-foreground">결제 수단</p>
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
                <span className="text-sm font-medium text-foreground">{label}</span>
              </label>
            ))}
          </div>
        </Card>

        {/* Insurance estimate preview — 5번 insurance-claims API 완성 후 연결 예정 */}
        <Card className="p-5 flex flex-col gap-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-700/50">
          <div className="flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-accent" />
            <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300">
              보험 환급 예상액
            </h3>
          </div>
          <p className="text-xs text-blue-600 dark:text-blue-400 leading-relaxed">
            결제 완료 후 보험 약관에 따라 예상 환급액이 산출됩니다.
            실제 수령액은 보험사 심사 결과에 따라 다를 수 있습니다.
          </p>
          <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
            결제 완료 후 예상 환급액이 표시됩니다.
          </div>
        </Card>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700/50 rounded-xl text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

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
          onClick={handlePayment}
          disabled={paying}
        >
          {paying ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <CreditCard className="w-4 h-4" />
          )}
          {paying ? "결제 처리 중..." : `${fmt(total)} 결제하기`}
        </Button>
      </div>
    </div>
  );
}
