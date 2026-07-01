import { useState, useEffect } from "react";
import { Plus, X, Shield, ChevronRight, Loader2, Trash2 } from "lucide-react";
import { Button, Card, Badge } from "../../components/shared";
import {
  getInsurancePolicies,
  createInsurancePolicy,
  deleteInsurancePolicy,
  getInsuranceProducts,
} from "../../api/customerService";

function DetailsModal({ policy, onClose, onDelete }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <p className="text-sm font-semibold text-foreground">
              {policy.productName}
            </p>
            <p className="text-xs text-muted-foreground">
              {policy.policyNumber}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
        <div className="p-6 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground">제공사</span>
              <span className="font-medium text-foreground">
                {policy.providerName}
              </span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground">상태</span>
              <Badge
                variant={policy.status === "ACTIVE" ? "green" : "muted"}
                className="w-fit"
              >
                {policy.status === "ACTIVE" ? "활성화" : policy.status}
              </Badge>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground">가입일</span>
              <span className="font-medium text-foreground">
                {policy.startDate}
              </span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground">만료일</span>
              <span className="font-medium text-foreground">
                {policy.endDate}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-4 pt-1">
            <UsageBar
              label="청구 횟수"
              used={policy.annualClaimCount ?? 0}
              limit={policy.annualClaimLimit}
              remaining={policy.remainingClaimCount}
              unit="회"
            />
            <UsageBar
              label="청구 금액"
              used={policy.annualClaimedAmount ?? 0}
              limit={policy.annualLimit}
              remaining={policy.remainingAmount}
              formatValue={(v) => `${v.toLocaleString()}원`}
            />
          </div>
        </div>
        <div className="px-6 pb-5 flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            className="flex-1"
            onClick={onClose}
          >
            닫기
          </Button>
          <Button
            variant="danger"
            size="sm"
            className="flex-1"
            onClick={() => onDelete(policy.id)}
          >
            <Trash2 className="w-4 h-4" />
            연동 해제
          </Button>
        </div>
      </div>
    </div>
  );
}

function AddPolicyModal({ onClose, onCreated }) {
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productId, setProductId] = useState("");
  const [policyNumber, setPolicyNumber] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [priorClaimCount, setPriorClaimCount] = useState("");
  const [priorClaimedAmount, setPriorClaimedAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    getInsuranceProducts()
      .then(({ data }) => setProducts(data.data ?? []))
      .catch(() => setProducts([]))
      .finally(() => setLoadingProducts(false));
  }, []);

  const selectedProduct = products.find((p) => String(p.id) === productId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!productId || !policyNumber || !startDate || !endDate) return;
    setSubmitting(true);
    setError(null);
    try {
      await createInsurancePolicy({
        insuranceProductId: Number(productId),
        policyNumber,
        startDate,
        endDate,
        priorClaimCount: priorClaimCount ? Number(priorClaimCount) : undefined,
        priorClaimedAmount: priorClaimedAmount ? Number(priorClaimedAmount) : undefined,
      });
      onCreated();
    } catch (err) {
      setError(
        err.response?.data?.error?.message || "보험 등록에 실패했습니다.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <p className="text-sm font-semibold text-foreground">보험 연동하기</p>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/50 rounded-xl text-xs text-red-700 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              보험 상품
            </label>
            {loadingProducts ? (
              <div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> 불러오는 중...
              </div>
            ) : (
              <select
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                required
                className="px-3 py-2 text-sm rounded-xl border border-border bg-card text-foreground"
              >
                <option value="">선택하세요</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.providerName} - {p.productName}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              증권번호
            </label>
            <input
              type="text"
              value={policyNumber}
              onChange={(e) => setPolicyNumber(e.target.value)}
              required
              className="px-3 py-2 text-sm rounded-xl border border-border bg-card text-foreground"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                가입일
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="px-3 py-2 text-sm rounded-xl border border-border bg-card text-foreground"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                만료일
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                className="px-3 py-2 text-sm rounded-xl border border-border bg-card text-foreground"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5 pt-3 border-t border-border/40">
            <p className="text-xs font-medium text-foreground">
              가입 전 기사용 내역 (선택)
            </p>
            <p className="text-[11px] text-muted-foreground -mt-1">
              CareMate 가입 전 다른 경로로 이미 청구한 횟수·금액이 있다면 입력해주세요.
            </p>
            <div className="grid grid-cols-2 gap-3 mt-1">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  기사용 청구 횟수
                  {selectedProduct && (
                    <span className="text-muted-foreground/60"> (한도 {selectedProduct.annualClaimLimit}회)</span>
                  )}
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={priorClaimCount}
                  onChange={(e) => setPriorClaimCount(e.target.value)}
                  placeholder="0"
                  className="px-3 py-2 text-sm rounded-xl border border-border bg-card text-foreground"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  기사용 청구 금액(원)
                  {selectedProduct && (
                    <span className="text-muted-foreground/60"> (한도 {selectedProduct.annualLimit?.toLocaleString()}원)</span>
                  )}
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={priorClaimedAmount}
                  onChange={(e) => setPriorClaimedAmount(e.target.value)}
                  placeholder="0"
                  className="px-3 py-2 text-sm rounded-xl border border-border bg-card text-foreground"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="flex-1"
              onClick={onClose}
            >
              취소
            </Button>
            <Button
              type="submit"
              variant="accent"
              size="sm"
              className="flex-1"
              disabled={submitting}
            >
              {submitting ? "등록 중..." : "등록하기"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function UsageBar({ label, used, limit, remaining, unit, formatValue }) {
  const ratio = limit ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  const barColor =
    ratio >= 90 ? "bg-red-500" : ratio >= 70 ? "bg-amber-500" : "bg-accent";
  const fmt = formatValue ?? ((v) => `${v}${unit}`);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground font-medium">{label}</span>
        <span
          className="font-bold text-foreground text-base"
          style={{ fontFamily: "'DM Sans', 'Noto Sans KR', sans-serif" }}
        >
          {fmt(used)}
          {limit != null && (
            <span className="text-muted-foreground font-normal text-sm"> / {fmt(limit)}</span>
          )}
        </span>
      </div>
      {limit != null && (
        <div className="h-3 rounded-full bg-secondary overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${barColor}`}
            style={{ width: `${ratio}%` }}
          />
        </div>
      )}
      {limit != null && (
        <div className="flex justify-end">
          <span
            className="text-sm font-bold text-accent"
            style={{ fontFamily: "'DM Sans', 'Noto Sans KR', sans-serif" }}
          >
            {label.includes("횟수") ? "잔여 횟수" : "잔여 금액"} {fmt(remaining ?? 0)}
          </span>
        </div>
      )}
    </div>
  );
}

function PolicyCard({ policy, onView }) {
  return (
    <Card
      onClick={onView}
      className="p-5 flex flex-col gap-4 cursor-pointer hover:border-accent/30 hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
            <Shield className="w-4 h-4 text-accent" />
          </div>
          <div>
            <p className="text-base font-semibold text-foreground">
              {policy.productName}
            </p>
            <p className="text-sm text-muted-foreground">
              {policy.providerName}
            </p>
          </div>
        </div>
        <Badge variant={policy.status === "ACTIVE" ? "green" : "muted"}>
          {policy.status === "ACTIVE" ? "활성화" : policy.status}
        </Badge>
      </div>

      <p
        className="text-sm text-muted-foreground"
        style={{ fontFamily: "'DM Sans', 'Noto Sans KR', sans-serif" }}
      >
        {policy.policyNumber}
      </p>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="flex flex-col gap-0.5">
          <span className="text-muted-foreground">가입일</span>
          <span className="font-medium text-foreground">
            {policy.startDate}
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-muted-foreground">만료일</span>
          <span className="font-medium text-foreground">
            {policy.endDate}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-3 pt-3 border-t border-border/40">
        <UsageBar
          label="청구 횟수"
          used={policy.annualClaimCount ?? 0}
          limit={policy.annualClaimLimit}
          remaining={policy.remainingClaimCount}
          unit="회"
        />
        <UsageBar
          label="청구 금액"
          used={policy.annualClaimedAmount ?? 0}
          limit={policy.annualLimit}
          remaining={policy.remainingAmount}
          formatValue={(v) => `${v.toLocaleString()}원`}
        />
        <div className="flex justify-end">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            상세 보기 <ChevronRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </Card>
  );
}

export default function InsurancePage() {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [detailsModal, setDetailsModal] = useState(null);
  const [addModal, setAddModal] = useState(false);

  const loadPolicies = () => {
    setLoading(true);
    getInsurancePolicies()
      .then(({ data }) => setPolicies(data.data ?? []))
      .catch((e) =>
        setError(
          e.response?.data?.error?.message || "보험 목록을 불러올 수 없습니다.",
        ),
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadPolicies();
  }, []);

  const handleDelete = async (policyId) => {
    try {
      await deleteInsurancePolicy(policyId);
      setDetailsModal(null);
      loadPolicies();
    } catch (e) {
      setError(
        e.response?.data?.error?.message || "보험 해제에 실패했습니다.",
      );
    }
  };

  const activeCount = policies.filter((p) => p.status === "ACTIVE").length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            내 보험 관리
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            연동된 보험 정책을 한 곳에서 관리하세요.
          </p>
        </div>
        <Button variant="accent" size="sm" onClick={() => setAddModal(true)}>
          <Plus className="w-4 h-4" />
          보험 연동하기
        </Button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/50 rounded-xl text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {[
          { label: "연동된 보험", value: `${policies.length}개` },
          { label: "활성화된 보험", value: `${activeCount}개` },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-card border border-border rounded-2xl px-5 py-4"
          >
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="text-2xl font-semibold text-foreground mt-1">
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="w-6 h-6 animate-spin text-accent" />
        </div>
      ) : policies.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-sm text-muted-foreground">
            연동된 보험이 없습니다. 보험을 연동해 보세요.
          </p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-3 gap-4">
          {policies.map((p) => (
            <PolicyCard key={p.id} policy={p} onView={() => setDetailsModal(p)} />
          ))}
        </div>
      )}

      {detailsModal && (
        <DetailsModal
          policy={detailsModal}
          onClose={() => setDetailsModal(null)}
          onDelete={handleDelete}
        />
      )}

      {addModal && (
        <AddPolicyModal
          onClose={() => setAddModal(false)}
          onCreated={() => {
            setAddModal(false);
            loadPolicies();
          }}
        />
      )}
    </div>
  );
}
