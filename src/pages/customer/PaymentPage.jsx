import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router";
import {
  CreditCard,
  Smartphone,
  CheckCircle2,
  Download,
  ExternalLink,
  FileText,
  Receipt,
  ArrowRight,
  Info,
  Loader2,
  Wrench,
  Undo2,
} from "lucide-react";
import { Button, Card, Badge } from "../../components/shared";
import ShopReviewCard from "../../components/ShopReviewCard";
import { useAuth } from "../../contexts/AuthContext";
import {
  fetchPaymentInfo,
  readyPayment,
  confirmPayment,
  failPayment,
  fetchReceipt,
  cancelPayment,
} from "../../api/payment";
// 5번(청구) API 추가
import { getClaimEstimates, requestClaimPackage } from "../../api/claim";

function fmt(n) {
  return Number(n ?? 0).toLocaleString("ko-KR") + "원";
}

// 결제 정보 조회(PAYABLE_STATUSES)에서 나올 수 있는 상태만 다룬다 —
// customer/DashboardPage.jsx의 STATUS_LABEL과 동일한 표기 기준.
const STATUS_LABEL_KO = {
  REPAIR_DONE: "수리완료",
  PAYMENT_COMPLETED: "결제완료",
  CLAIM_REQUESTED: "청구요청",
  CLAIM_COMPLETED: "청구완료",
};

const STATUS_VARIANT_KO = {
  REPAIR_DONE: "yellow",
  PAYMENT_COMPLETED: "green",
  CLAIM_REQUESTED: "accent",
  CLAIM_COMPLETED: "green",
};

// 청구 완료 여부 (CALCULATED = 아직 청구 안 함)
const isClaimed = (claim) => claim.status !== "CALCULATED";

// ── 토스페이먼츠 결제창 SDK (v1) ─────────────────────────────────────────────
// index.html에서 <script src="https://js.tosspayments.com/v1/payment">로 전역 로드됨
const TOSS_CLIENT_KEY = import.meta.env.VITE_TOSS_CLIENT_KEY;

// 결제수단 라디오 값 → 토스 v1 결제창 requestPayment()의 첫 번째 파라미터(한글 고정값)
const TOSS_METHOD_MAP = {
  card: "카드",
  mobile: "휴대폰",
};

function getTossPayments() {
  if (!window.TossPayments) {
    throw new Error(
      "토스페이먼츠 SDK를 불러오지 못했습니다. 새로고침 후 다시 시도해주세요.",
    );
  }
  return window.TossPayments(TOSS_CLIENT_KEY);
}

// ── Post-Payment: Claim Package Screen ───────────────────────────────────────
// orderId 추가로 받음 (청구 API에 필요). claims 는 confirmData 대신 조회.
function ClaimPackageScreen({ orderId, paymentId, confirmData, onRefunded }) {
  const navigate = useNavigate();
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);

  // claims 를 API로 조회 (status·상품정보·제출링크 포함)
  const [claims, setClaims] = useState([]);
  const [downloading, setDownloading] = useState(false);
  const [claimError, setClaimError] = useState(null);
  const [showWarning, setShowWarning] = useState(false);

  // 환불(결제 취소) — PAYMENT_COMPLETED 상태(=아직 청구 전)에서만 가능
  const [refunding, setRefunding] = useState(false);
  const [refundError, setRefundError] = useState(null);
  const [showRefundConfirm, setShowRefundConfirm] = useState(false);

  // 영수증 조회 — paymentId가 없으면 로딩 즉시 해제
  useEffect(() => {
    if (!paymentId) {
      setLoading(false);
      return;
    }
    fetchReceipt(paymentId)
      .then((res) => setReceipt(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [paymentId]);

  // 예상 내역 조회 (재사용 위해 함수로)
  const reloadEstimates = async () => {
    const data = await getClaimEstimates(orderId);
    setClaims(data);
  };

  useEffect(() => {
    if (!orderId) return;
    reloadEstimates().catch(() =>
      setClaimError("청구 내역을 불러오지 못했습니다."),
    );
  }, [orderId]);

  const anyClaimed = claims.some(isClaimed);

  // 청구하기 = zip 다운로드 + 재조회
  const handleClaim = async () => {
    if (downloading) return;
    setShowWarning(false);
    setDownloading(true);
    setClaimError(null);
    try {
      const blob = await requestClaimPackage(orderId); // 200 = 청구 완료

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `보험청구패키지_${receipt?.orderNo ?? orderId}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      await reloadEstimates(); // status 갱신 → 제출버튼 활성화
    } catch (e) {
      setClaimError(
        "청구 서류 생성 실패: " +
          (e.response?.data?.error?.message ?? e.message ?? "알 수 없는 오류"),
      );
    } finally {
      setDownloading(false);
    }
  };

  // 제출 버튼 → 미리 받은 링크로 이동
  const handleSubmit = (claim) => {
    if (!isClaimed(claim)) return;
    window.open(claim.claimChannelValue, "_blank", "noopener");
  };

  // 환불 요청 — 청구 전(anyClaimed === false)에만 노출/허용됨
  const handleRefund = async () => {
    if (refunding || !paymentId) return;
    setRefunding(true);
    setRefundError(null);
    try {
      await cancelPayment(paymentId);
      setShowRefundConfirm(false);
      // 서버가 repair_orders.status 를 REPAIR_DONE 으로 롤백함 → 결제 폼 화면으로 되돌아가기
      onRefunded?.();
    } catch (e) {
      setRefundError(
        "환불 처리 실패: " +
          (e.response?.data?.error?.message ?? e.message ?? "알 수 없는 오류"),
      );
    } finally {
      setRefunding(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-accent" />
      </div>
    );
  }

  const total = receipt?.totalPaidAmount ?? confirmData?.totalPaidAmount ?? 0;

  // 총 예상환급액 = 보험사별 claims 합산 (화면의 카드 합과 일치).
  // claims 가 아직 안 불러와졌을 때만 payment 에 기록된 총액으로 대체.
  const claimsLoaded = claims.length > 0;
  const expectedRefund = claimsLoaded
    ? claims.reduce((a, c) => a + (c.expectedAmount ?? 0), 0)
    : (receipt?.expectedRefundAmount ?? confirmData?.expectedRefundAmount ?? 0);

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
            예상 보험 환급금을 확인하고, 제출용 서류를 청구한 뒤 보험사에
            제출하세요.
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
              {receipt?.paidAt
                ? new Date(receipt.paidAt).toLocaleString("ko-KR")
                : "-"}
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

        {/* 환불 요청 — 청구(claim-request) 이전에만 가능. 청구 후에는 서버가 409로 거부한다 */}
        {!anyClaimed && (
          <div className="mt-4 pt-4 border-t border-border/40">
            {refundError && (
              <p className="text-xs text-red-600 mb-2">{refundError}</p>
            )}
            <button
              onClick={() => setShowRefundConfirm(true)}
              disabled={refunding}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-red-600 dark:hover:text-red-400 font-medium transition-colors"
            >
              <Undo2 className="w-3.5 h-3.5" />
              결제 취소·환불 요청
            </button>
          </div>
        )}
      </Card>

      {/* Insurance claim packages */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-foreground" />
          <h3 className="text-sm font-semibold text-foreground">
            보험사별 예상 환급금
          </h3>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          통신사 보험 적용 후 남은 금액에 카드사 보험이 적용됩니다. 서류를
          청구한 뒤 각 보험사 제출 페이지로 이동하여 직접 제출해 주세요.
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

        {claimError && (
          <p className="text-xs text-red-600 py-1">{claimError}</p>
        )}

        {/* 보험사별 청구 내역 (API 조회 결과) */}
        {claims.length > 0
          ? claims.map((claim) => (
              <Card key={claim.claimId} className="p-5 flex flex-col gap-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {claim.providerName}
                      <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                        {claim.providerType === "TELECOM" ? "통신사" : "카드사"}
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {claim.productName}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {claim.selfPayType === "RATE"
                        ? `자기부담 ${claim.selfPayRate}% (최소 ${fmt(claim.minSelfPayAmount)})`
                        : `자기부담 ${fmt(claim.selfPayAmount)}`}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-muted-foreground">예상 환급액</p>
                    <p className="text-base font-bold text-accent">
                      ≈ {fmt(claim.expectedAmount)}
                    </p>
                  </div>
                </div>

                {/* 제출 버튼 — 항상 표시, status 로 활성/비활성 */}
                <button
                  onClick={() => handleSubmit(claim)}
                  disabled={!isClaimed(claim)}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                    isClaimed(claim)
                      ? "border-border text-foreground hover:bg-secondary cursor-pointer"
                      : "border-border text-muted-foreground bg-secondary cursor-not-allowed"
                  }`}
                >
                  <ExternalLink className="w-4 h-4" />
                  {isClaimed(claim)
                    ? `${claim.providerName} 제출하러 가기`
                    : "청구 후 제출 가능"}
                </button>
              </Card>
            ))
          : !claimError && (
              <Card className="p-5 text-center text-sm text-muted-foreground">
                산출된 예상 환급금이 없습니다.
              </Card>
            )}

        {/* 청구하기 / 다시 다운로드 (주문당 1개) */}
        {claims.length > 0 &&
          (!anyClaimed ? (
            <Button
              variant="accent"
              size="lg"
              onClick={() => setShowWarning(true)}
              disabled={downloading}
            >
              {downloading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              {downloading ? "서류 생성 중…" : "보험 제출용 서류 청구하기"}
            </Button>
          ) : (
            <div className="flex flex-col gap-2 p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700/50 rounded-2xl">
              <span className="flex items-center gap-2 text-sm font-medium text-green-700 dark:text-green-400">
                <CheckCircle2 className="w-4 h-4" />
                청구가 완료되었습니다. 각 보험사 제출 버튼으로 서류를
                제출하세요.
              </span>
              <button
                onClick={() => setShowWarning(true)}
                disabled={downloading}
                className="self-start flex items-center gap-1.5 text-xs text-accent hover:underline font-medium"
              >
                <Download className="w-3.5 h-3.5" />
                {downloading ? "다운로드 중…" : "청구 서류 다시 다운로드"}
              </button>
            </div>
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
              label: "서류 청구",
              desc: "‘서류 청구하기’로 제출용 패키지(zip)를 다운로드합니다.",
            },
            {
              step: "02",
              label: "보험사 제출 사이트 이동",
              desc: "각 보험사 ‘제출하러 가기’ 버튼으로 청구 페이지로 이동합니다.",
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

      {/* 별점 리뷰 (선택) */}
      <ShopReviewCard orderId={orderId} shopName={receipt?.shopName} />

      <Button
        variant="secondary"
        size="md"
        className="self-start"
        onClick={() => navigate("/customer/dashboard")}
      >
        대시보드로 돌아가기
      </Button>

      {/* 경고 모달 — 처음 청구 vs 재다운로드 */}
      {showWarning && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowWarning(false)}
        >
          <div
            className="bg-card rounded-2xl shadow-2xl w-full max-w-sm p-6"
            onClick={(ev) => ev.stopPropagation()}
          >
            <h4 className="text-base font-semibold text-foreground mb-3">
              {anyClaimed ? "재다운로드 확인" : "청구 전 확인"}
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              {anyClaimed ? (
                <>
                  이미 청구 서류를 다운로드하셨습니다. 다시
                  다운로드하시겠습니까?
                  <br />
                  보험 제출용 서류(zip)가 다운로드됩니다.
                </>
              ) : (
                <>
                  청구를 진행하면{" "}
                  <b className="text-foreground">
                    이 결제는 환불받을 수 없습니다.
                  </b>{" "}
                  그래도 진행하시겠습니까?
                  <br />
                  보험 제출용 서류(zip)가 다운로드됩니다.
                </>
              )}
            </p>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                className="flex-1"
                onClick={() => setShowWarning(false)}
              >
                취소
              </Button>
              <Button
                variant={anyClaimed ? "accent" : "danger"}
                size="sm"
                className="flex-1"
                onClick={handleClaim}
              >
                {anyClaimed ? "다시 다운로드" : "청구하고 다운로드"}
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* 환불 확인 모달 */}
      {showRefundConfirm && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => !refunding && setShowRefundConfirm(false)}
        >
          <div
            className="bg-card rounded-2xl shadow-2xl w-full max-w-sm p-6"
            onClick={(ev) => ev.stopPropagation()}
          >
            <h4 className="text-base font-semibold text-foreground mb-3">
              결제 취소·환불 확인
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              결제하신{" "}
              <b className="text-foreground">{fmt(total)}</b>이(가) 취소되어
              환불됩니다. 취소 후에는 결제 대기 상태로 되돌아가며, 다시
              결제를 진행하실 수 있습니다.
            </p>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                className="flex-1"
                onClick={() => setShowRefundConfirm(false)}
                disabled={refunding}
              >
                취소
              </Button>
              <Button
                variant="danger"
                size="sm"
                className="flex-1"
                onClick={handleRefund}
                disabled={refunding}
              >
                {refunding ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "환불하기"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Payment Form Screen ───────────────────────────────────────────────────────

export default function PaymentPage() {
  const { orderId: orderIdParam } = useParams();
  const orderId = Number(orderIdParam);
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [method, setMethod] = useState("card");
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState(null);

  // 결제 완료 후 상태
  const [paid, setPaid] = useState(false);
  const [paymentId, setPaymentId] = useState(null);
  const [confirmData, setConfirmData] = useState(null);

  // 토스 successUrl 리다이렉트로 돌아왔을 때 — 서버에 결제 승인 재검증 요청
  // (18.9: 서버가 PG 단건조회로 승인 상태·금액을 재검증한 뒤에만 처리)
  // tossOrderId: 토스가 successUrl 쿼리파라미터로 돌려준 orderId (ready 단계에서 발급한 결제 시도 전용 값)
  const handleConfirm = useCallback(
    async (paymentKey, tossOrderId, amount) => {
      setPaying(true);
      setError(null);
      try {
        const confirmRes = await confirmPayment(
          orderId,
          paymentKey,
          tossOrderId,
          amount,
        );
        const confirmResult = confirmRes.data.data;
        setPaymentId(confirmResult.paymentId);
        setConfirmData(confirmResult);
        setPaid(true);
      } catch (err) {
        const errorMessage =
          err.response?.data?.error?.message ??
          "결제 승인 중 오류가 발생했습니다.";
        setError(errorMessage);
      } finally {
        setPaying(false);
        setLoading(false);
      }
    },
    [orderId],
  );

  // 진입 시 토스 리다이렉트(successUrl/failUrl) 쿼리파라미터 처리 또는 일반 진입 처리
  useEffect(() => {
    if (!orderId) return;

    const paymentKey = searchParams.get("paymentKey");
    const tossOrderId = searchParams.get("orderId"); // 토스가 돌려준 값 — 내부 PK(orderId 라우트 파라미터)와는 별개
    const amountParam = searchParams.get("amount");
    const failCode = searchParams.get("code");

    // 1) 토스 successUrl 리다이렉트 — paymentKey/orderId/amount가 쿼리로 돌아옴
    if (paymentKey && tossOrderId && amountParam) {
      setSearchParams({}, { replace: true }); // 새로고침 시 중복 승인 방지를 위해 쿼리 정리
      handleConfirm(paymentKey, tossOrderId, Number(amountParam));
      return;
    }

    // 2) 토스 failUrl 리다이렉트 — code/message가 쿼리로 돌아옴 (사용자 취소, 인증 실패 등)
    if (failCode) {
      const message = searchParams.get("message") || "결제가 취소되었습니다.";
      setSearchParams({}, { replace: true });
      failPayment(orderId, failCode, message).catch(console.error);
      setError(message);
    }

    // 3) 일반 진입 — 결제 정보 조회 (GET /api/customer/payments/info/{orderId})
    fetchPaymentInfo(orderId)
      .then((res) => {
        const info = res.data.data;
        setPaymentInfo(info);
        // 이미 결제된 상태(PAYMENT_COMPLETED / CLAIM_COMPLETED)면 ClaimPackageScreen으로 바로 이동
        if (info.status === 'PAYMENT_COMPLETED' || info.status === 'CLAIM_COMPLETED') {
          setPaymentId(info.paymentId ?? null);
          setPaid(true);
        }
      })
      .catch((err) => {
        const code = err.response?.data?.error?.code;
        const message = err.response?.data?.error?.message;
        if (code === "INVALID_STATE_TRANSITION") {
          setError(
            (prev) =>
              prev ??
              "아직 결제할 수 없는 주문입니다. 수리 완료(리포트 작성) 이후에 결제가 가능합니다.",
          );
        } else if (code === "RESOURCE_NOT_FOUND") {
          setError(
            (prev) => prev ?? "존재하지 않는 주문이거나 접근 권한이 없습니다.",
          );
        } else {
          setError(
            (prev) => prev ?? message ?? "결제 정보를 불러오지 못했습니다.",
          );
        }
        // eslint-disable-next-line no-console
        console.error("[결제 정보 조회 실패]", code, message, err);
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  // 결제하기 버튼 클릭 — 결제 준비 후 토스 결제창 호출
  const handlePayment = async () => {
    if (paying) return;
    setPaying(true);
    setError(null);

    try {
      // 1. 결제 준비 (POST /api/customer/payments/ready)
      const readyRes = await readyPayment(orderId);
      const { tossOrderId, orderName, customerKey, amount } =
        readyRes.data.data;

      // 2. 토스 결제창 호출 — 성공/실패 시 동일 페이지(쿼리파라미터로 구분)로 리다이렉트
      const tossPayments = getTossPayments();
      const returnUrl = `${window.location.origin}/customer/payment/${orderId}`;

      await tossPayments.requestPayment(TOSS_METHOD_MAP[method], {
        amount,
        orderId: tossOrderId, // ready 단계에서 발급한 결제 시도 전용 토스 orderId(영구 1회용이라 매번 새로 발급됨)
        orderName,
        customerKey,
        customerName: user?.name,
        successUrl: returnUrl,
        failUrl: returnUrl,
      });
      // 정상 흐름이라면 브라우저가 위 URL로 리다이렉트되어 이 아래 코드는 실행되지 않음
    } catch (err) {
      // 사용자가 결제창을 닫거나 인증 도중 취소한 경우 등 (예: code === "USER_CANCEL")
      const message = err?.message ?? "결제 진행 중 오류가 발생했습니다.";
      setError(message);
      setPaying(false);
    }
  };

  if (paid) {
    return (
      <ClaimPackageScreen
        orderId={orderId}
        paymentId={paymentId}
        confirmData={confirmData}
        onRefunded={() => {
          // 환불 완료 — 서버가 REPAIR_DONE 으로 롤백했으므로 결제 폼 화면으로 되돌아가서 최신 상태 재조회
          setPaid(false);
          setPaymentId(null);
          setConfirmData(null);
          setLoading(true);
          fetchPaymentInfo(orderId)
            .then((res) => setPaymentInfo(res.data.data))
            .catch(() => {})
            .finally(() => setLoading(false));
        }}
      />
    );
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
    { id: "mobile", label: "휴대폰 결제", icon: Smartphone },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-semibold text-foreground">결제 센터</h1>
        <p className="text-sm text-muted-foreground mt-1">
          수리 대금을 결제하면 보험 청구 패키지를 생성할 수 있습니다.
        </p>
      </div>

      {/* Flow notice */}
      <div className="flex items-center gap-3 flex-wrap text-xs text-muted-foreground">
        {[
          "수리 대금 전액 결제 (수리점 지급)",
          "청구 패키지 생성 하기",
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
              <Badge variant={STATUS_VARIANT_KO[paymentInfo?.status] || "muted"}>
                {STATUS_LABEL_KO[paymentInfo?.status] || paymentInfo?.status || "-"}
              </Badge>
            </div>
            <div className="flex justify-between py-3 text-base font-semibold">
              <span className="text-foreground">결제 금액 합계</span>
              <span className="text-foreground">{fmt(total)}</span>
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

        {/* 수리 내역 — repair_reports 상세 */}
        <Card className="p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Wrench className="w-4 h-4 text-accent" />
            <h3 className="text-sm font-semibold text-foreground">
              수리 내역 상세
            </h3>
          </div>

          {paymentInfo?.troubleDescription && (
            <p className="text-xs text-muted-foreground leading-relaxed bg-secondary/50 rounded-xl p-3">
              {paymentInfo.troubleDescription}
            </p>
          )}

          {paymentInfo?.repairRows?.length > 0 && (
            <div className="flex flex-col divide-y divide-border/40">
              {paymentInfo.repairRows.map((row, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-2 text-xs"
                >
                  <div>
                    <span className="font-medium text-foreground">
                      {row.item}
                    </span>
                    {row.part && (
                      <span className="text-muted-foreground ml-1.5">
                        · {row.part}
                      </span>
                    )}
                    {row.qty > 1 && (
                      <span className="text-muted-foreground ml-1.5">
                        × {row.qty}
                      </span>
                    )}
                  </div>
                  <span className="text-foreground font-medium shrink-0">
                    {fmt(row.unitPrice * (row.qty || 1))}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col divide-y divide-border/40 pt-2 border-t border-border/40">
            <div className="flex justify-between py-2 text-sm">
              <span className="text-muted-foreground">부품비</span>
              <span className="font-medium text-foreground">
                {fmt(paymentInfo?.partsCost)}
              </span>
            </div>
            <div className="flex justify-between py-2 text-sm">
              <span className="text-muted-foreground">공임비</span>
              <span className="font-medium text-foreground">
                {fmt(paymentInfo?.laborCost)}
              </span>
            </div>
            <div className="flex justify-between py-2.5 text-sm font-semibold">
              <span className="text-foreground">총 수리비</span>
              <span className="text-foreground">{fmt(total)}</span>
            </div>
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
            결제 완료 후 보험 청구 패키지를 생성할 수 있습니다.
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
