import { useState, useEffect } from "react";
import {
  Plus,
  X,
  Shield,
  ChevronRight,
  Loader2,
  Trash2,
} from "lucide-react";
import { Button, Card, Badge } from "../../components/shared";
import {
  getInsurancePolicies,
  deleteInsurancePolicy,
  createInsurancePolicy,
  getInsuranceProducts,
} from "../../api/customerService";

function DetailsModal({ policy, onClose, onDelete }) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onDelete(policy.id);
      onClose();
    } catch {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <p className="text-sm font-semibold text-foreground">
              {policy.productName}
            </p>
            <p className="text-xs text-muted-foreground font-mono">
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
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-xs text-muted-foreground">보험사</span>
              <p className="font-medium text-foreground">{policy.providerName}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">유형</span>
              <p className="font-medium text-foreground">
                {policy.providerType === "TELECOM" ? "통신사 보험" : "카드 보험"}
              </p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">시작일</span>
              <p className="font-medium text-foreground">{policy.startDate}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">종료일</span>
              <p className="font-medium text-foreground">{policy.endDate}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">연간 청구 횟수</span>
              <p className="font-medium text-foreground">
                {policy.annualClaimCount ?? 0}회
              </p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">연간 청구 금액</span>
              <p className="font-medium text-foreground">
                {(policy.annualClaimedAmount ?? 0).toLocaleString("ko-KR")}원
              </p>
            </div>
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
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Trash2 className="w-3.5 h-3.5" />
            )}
            보험 해지
          </Button>
        </div>
      </div>
    </div>
  );
}

function AddPolicyModal({ onClose, onCreated }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [policyNumber, setPolicyNumber] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    getInsuranceProducts()
      .then(({ data }) => setProducts(data.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    if (!selectedProduct || !policyNumber || !startDate || !endDate) return;
    setCreating(true);
    setError(null);
    try {
      await createInsurancePolicy({
        insuranceProductId: selectedProduct.id,
        policyNumber,
        startDate,
        endDate,
      });
      onCreated();
    } catch (e) {
      setError(e.response?.data?.error?.message || "등록에 실패했습니다.");
      setCreating(false);
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
        <div className="p-6 flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              보험 상품 선택
            </label>
            {loading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-accent" />
              </div>
            ) : (
              <div className="flex flex-col gap-2 max-h-40 overflow-y-auto">
                {products.map((prod) => (
                  <div
                    key={prod.id}
                    onClick={() => setSelectedProduct(prod)}
                    className={`p-3 border rounded-xl cursor-pointer transition-all ${
                      selectedProduct?.id === prod.id
                        ? "border-accent bg-accent/10"
                        : "border-border hover:border-accent/40"
                    }`}
                  >
                    <p className="text-sm font-medium text-foreground">
                      {prod.productName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {prod.providerName} ·{" "}
                      {prod.providerType === "TELECOM"
                        ? "통신사"
                        : "카드"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              증권 번호
            </label>
            <input
              type="text"
              value={policyNumber}
              onChange={(e) => setPolicyNumber(e.target.value)}
              placeholder="예: CC-2024-9182-01"
              className="px-3.5 py-2.5 text-sm bg-secondary border border-border rounded-xl text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                시작일
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3.5 py-2.5 text-sm bg-secondary border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                종료일
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3.5 py-2.5 text-sm bg-secondary border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all"
              />
            </div>
          </div>
          {error && (
            <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
          )}
        </div>
        <div className="px-6 pb-5 flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            className="flex-1"
            onClick={onClose}
          >
            취소
          </Button>
          <Button
            variant="accent"
            size="sm"
            className="flex-1"
            onClick={handleCreate}
            disabled={
              creating || !selectedProduct || !policyNumber || !startDate || !endDate
            }
          >
            {creating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Plus className="w-3.5 h-3.5" />
            )}
            연동하기
          </Button>
        </div>
      </div>
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
            <p className="text-sm font-semibold text-foreground">
              {policy.productName}
            </p>
            <p className="text-xs text-muted-foreground">
              {policy.providerName}
            </p>
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground font-mono">
        {policy.policyNumber}
      </p>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="flex flex-col gap-0.5">
          <span className="text-muted-foreground">시작일</span>
          <span className="font-medium text-foreground">{policy.startDate}</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-muted-foreground">종료일</span>
          <span className="font-medium text-foreground">{policy.endDate}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-border/40">
        <Badge variant={policy.status === "ACTIVE" ? "green" : "muted"}>
          {policy.status === "ACTIVE" ? "활성화" : "비활성화"}
        </Badge>
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          상세 보기 <ChevronRight className="w-3 h-3" />
        </span>
      </div>
    </Card>
  );
}

export default function InsurancePage() {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [showAdd, setShowAdd] = useState(false);

  const loadPolicies = () => {
    setLoading(true);
    getInsurancePolicies()
      .then(({ data }) => setPolicies(data.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadPolicies();
  }, []);

  const handleDelete = async (id) => {
    await deleteInsurancePolicy(id);
    setPolicies((prev) => prev.filter((p) => p.id !== id));
  };

  const activePolicies = policies.filter((p) => p.status === "ACTIVE");

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
        <Button variant="accent" size="sm" onClick={() => setShowAdd(true)}>
          <Plus className="w-4 h-4" />
          보험 연동하기
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-accent" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "연동된 보험", value: `${policies.length}개` },
              { label: "활성화된 보험", value: `${activePolicies.length}개` },
              {
                label: "총 청구 횟수",
                value: `${policies.reduce((a, p) => a + (p.annualClaimCount ?? 0), 0)}회`,
              },
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

          <div className="grid md:grid-cols-3 gap-4">
            {policies.map((p) => (
              <PolicyCard
                key={p.id}
                policy={p}
                onView={() => setModal(p)}
              />
            ))}
          </div>

          {policies.length === 0 && (
            <Card className="p-8 text-center">
              <p className="text-sm text-muted-foreground">
                연동된 보험이 없습니다. 보험을 연동해 보세요.
              </p>
            </Card>
          )}
        </>
      )}

      {modal && (
        <DetailsModal
          policy={modal}
          onClose={() => setModal(null)}
          onDelete={handleDelete}
        />
      )}
      {showAdd && (
        <AddPolicyModal
          onClose={() => setShowAdd(false)}
          onCreated={() => {
            setShowAdd(false);
            loadPolicies();
          }}
        />
      )}
    </div>
  );
}