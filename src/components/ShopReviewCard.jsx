import { useState, useEffect } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button, Card, StarRatingInput } from "./shared";
import { createShopReview, getOrderShopReview } from "../api/customerService";

export default function ShopReviewCard({ orderId, shopName, className = "" }) {
  const [rating, setRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [checking, setChecking] = useState(true);
  const [existingRating, setExistingRating] = useState(null);
  const [dismissed, setDismissed] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getOrderShopReview(orderId)
      .then(({ data }) => {
        if (cancelled) return;
        setExistingRating(data.data?.rating ?? null);
      })
      .catch(() => {})
      .finally(() => !cancelled && setChecking(false));
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  if (dismissed) return null;

  const handleSubmit = async () => {
    if (rating === 0 || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await createShopReview({ repairOrderId: orderId, rating });
      setExistingRating(rating);
    } catch (e) {
      const code = e.response?.data?.error?.code;
      if (code === "DUPLICATE_RESOURCE") {
        // 서버에는 이미 리뷰가 있음 — 최신 값을 다시 조회해 화면과 동기화
        try {
          const { data } = await getOrderShopReview(orderId);
          setExistingRating(data.data?.rating ?? null);
        } catch {
          setError("이미 등록된 리뷰가 있습니다.");
        }
      } else {
        setError(e.response?.data?.error?.message || "리뷰 등록에 실패했습니다.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (checking) {
    return (
      <Card className={`p-5 flex items-center justify-center ${className}`}>
        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
      </Card>
    );
  }

  if (existingRating != null) {
    return (
      <Card className={`p-5 flex items-center gap-3 ${className}`}>
        <CheckCircle2 className="w-5 h-5 text-accent shrink-0" />
        <p className="text-sm font-medium text-foreground">
          별점 {existingRating}점을 남겨주셨습니다. 소중한 리뷰 감사합니다!
        </p>
      </Card>
    );
  }

  return (
    <Card className={`p-5 flex flex-col gap-3 ${className}`}>
      <div>
        <h3 className="text-sm font-semibold text-foreground">
          {shopName ? `${shopName}, 어떠셨나요?` : "이번 수리는 어떠셨나요?"}
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          별점을 남겨주시면 다른 고객에게 큰 도움이 됩니다. (선택)
        </p>
      </div>

      <StarRatingInput value={rating} onChange={setRating} />

      {error && <p className="text-xs text-red-500">{error}</p>}

      <div className="flex gap-2">
        <Button
          variant="accent"
          size="sm"
          onClick={handleSubmit}
          disabled={rating === 0 || submitting}
        >
          {submitting ? "등록 중..." : "리뷰 남기기"}
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setDismissed(true)}>
          나중에 하기
        </Button>
      </div>
    </Card>
  );
}
