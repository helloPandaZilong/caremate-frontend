import { useState, useEffect, useCallback } from "react";
import { Search, Plus, Edit2, Trash2, X, ChevronDown, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Button, Card } from "../../components/shared";
import {
  getInsuranceProducts,
  createInsuranceProduct,
  updateInsuranceProduct,
  deleteInsuranceProduct,
} from "../../api/admin";

// ── 상수 ──────────────────────────────────────────────────────────────────────

/** 폼 초기값 — 등록 모달 열 때마다 이 값으로 리셋 */
const EMPTY_FORM = {
  productName: "",
  providerType: "TELECOM",  // TELECOM(통신사 제공) | CARD(카드사 제공)
  providerName: "",
  billingCycleMonths: 1,
  billingAmount: 0,
  monthlyFeeEquivalent: 0,
  coveragePerIncident: 0,
  annualLimit: 0,
  annualClaimLimit: 2,
  selfPayType: "FIXED",     // FIXED(정액) | RATE(정률)
  selfPayAmount: 0,
  selfPayRate: "0.00",
  minSelfPayAmount: 0,
  claimChannelType: "WEBSITE", // WEBSITE | KAKAO
  claimChannelValue: "",
  summaryNote: "",
};

/** providerType 한글 레이블 */
const PROVIDER_TYPE_LABEL = { TELECOM: "통신사", CARD: "카드사" };

/** selfPayType 한글 레이블 */
const SELF_PAY_TYPE_LABEL = { FIXED: "정액", RATE: "정률" };

/** claimChannelType 한글 레이블 */
const CHANNEL_TYPE_LABEL = { WEBSITE: "웹사이트", KAKAO: "카카오" };

// ── 유틸 함수 ─────────────────────────────────────────────────────────────────

/** 숫자를 한국 통화 형식으로 포맷 (예: 1000000 → 1,000,000원) */
const fmt = (n) => (n != null ? n.toLocaleString("ko-KR") + "원" : "-");

// ── 공통 입력 컴포넌트 ─────────────────────────────────────────────────────────

/** 레이블 + 입력 필드를 세트로 묶은 소형 컴포넌트 */
function Field({ label, required, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-muted-foreground">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

/** 텍스트/숫자 input */
function TextInput({ name, value, onChange, type = "text", placeholder = "", min, step }) {
  return (
    <input
      name={name}
      value={value}
      onChange={onChange}
      type={type}
      min={min}
      step={step}
      placeholder={placeholder}
      className="px-3.5 py-2.5 text-sm bg-secondary border border-border rounded-xl text-foreground
                 placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-accent/30
                 focus:border-accent/50 transition-all"
    />
  );
}

/** select 드롭다운 */
function SelectInput({ name, value, onChange, options }) {
  return (
    <div className="relative">
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full appearance-none px-3.5 py-2.5 text-sm bg-secondary border border-border rounded-xl
                   text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50
                   transition-all"
      >
        {options.map(({ value: v, label }) => (
          <option key={v} value={v}>{label}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
    </div>
  );
}

/** 섹션 헤더 */
function SectionHeader({ title }) {
  return (
    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 pt-1">
      {title}
    </p>
  );
}

// ── 테이블 스켈레톤 (로딩 중 표시) ───────────────────────────────────────────

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 4 }).map((_, i) => (
        <tr key={i} className="border-b border-border/20">
          {Array.from({ length: 8 }).map((__, j) => (
            <td key={j} className="py-3 px-4">
              <div className="h-3.5 bg-secondary rounded animate-pulse" style={{ width: j === 2 ? "8rem" : "4rem" }} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

// ── 빈 상태 표시 ─────────────────────────────────────────────────────────────

function EmptyState({ query, providerType }) {
  const isFiltered = query || providerType !== "전체";
  return (
    <tr>
      <td colSpan={8} className="py-16 text-center text-muted-foreground text-sm">
        {isFiltered ? "검색 결과가 없습니다." : "등록된 보험 상품이 없습니다. '새 상품 등록' 버튼을 눌러 추가하세요."}
      </td>
    </tr>
  );
}

// ── 상품 등록/수정 모달 ───────────────────────────────────────────────────────

/**
 * 보험 상품 등록 및 수정을 하나의 모달로 처리합니다.
 * - mode === "create": 빈 폼으로 열기, 저장 시 POST
 * - mode === "edit":   기존 데이터로 채워진 폼으로 열기, 저장 시 PUT
 *
 * @param {object}   props.product  수정 모드일 때 초기 데이터 (mode === "edit" 시 필수)
 * @param {string}   props.mode     "create" | "edit"
 * @param {Function} props.onClose  취소·완료 시 호출
 * @param {Function} props.onSaved  저장 완료 시 상위로 저장된 데이터 전달
 */
function ProductModal({ product, mode, onClose, onSaved }) {
  // mode === "edit" 이면 기존 데이터로 폼 초기화, 아니면 빈 폼
  const [form, setForm] = useState(() =>
    mode === "edit" && product
      ? {
          ...product,
          selfPayRate: product.selfPayRate?.toString() ?? "0.00",
        }
      : { ...EMPTY_FORM }
  );
  const [saving, setSaving] = useState(false);

  /** 일반 input / select 변경 핸들러 */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  /** 제출 시 숫자 타입 변환 후 API 호출 */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 필수 필드 간단 검증
    if (!form.productName.trim()) {
      toast.error("상품명을 입력하세요.");
      return;
    }
    if (!form.providerName.trim()) {
      toast.error("제공사명을 입력하세요.");
      return;
    }
    if (!form.claimChannelValue.trim()) {
      toast.error("청구 채널 URL/ID를 입력하세요.");
      return;
    }

    // 백엔드 타입에 맞게 변환 (문자열 → 숫자)
    const payload = {
      ...form,
      billingCycleMonths:  parseInt(form.billingCycleMonths)  || 1,
      billingAmount:       parseInt(form.billingAmount)        || 0,
      monthlyFeeEquivalent:parseInt(form.monthlyFeeEquivalent) || 0,
      coveragePerIncident: parseInt(form.coveragePerIncident)  || 0,
      annualLimit:         parseInt(form.annualLimit)          || 0,
      annualClaimLimit:    parseInt(form.annualClaimLimit)     || 0,
      selfPayAmount:       parseInt(form.selfPayAmount)        || 0,
      selfPayRate:         parseFloat(form.selfPayRate)        || 0,
      minSelfPayAmount:    parseInt(form.minSelfPayAmount)     || 0,
    };

    setSaving(true);
    try {
      if (mode === "create") {
        const res = await createInsuranceProduct(payload);
        const newId = res.data.data.productId;
        toast.success("보험 상품이 등록되었습니다.");
        onSaved({ ...payload, id: newId });
      } else {
        await updateInsuranceProduct(product.id, payload);
        toast.success("보험 상품이 수정되었습니다.");
        onSaved({ ...payload, id: product.id, createdAt: product.createdAt });
      }
      onClose();
    } catch (err) {
      const msg = err.response?.data?.error?.message || "저장 중 오류가 발생했습니다.";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">

        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <div>
            <p className="text-base font-semibold text-foreground">
              {mode === "create" ? "새 보험 상품 등록" : "보험 상품 수정"}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {mode === "create"
                ? "보험 상품 파라미터를 설정합니다. * 표시는 필수 항목입니다."
                : `ID: ${product.id} — 변경할 항목을 수정 후 저장하세요.`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* 폼 바디 */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">

          {/* ── 기본 정보 ─────────────────────────────────────────── */}
          <div>
            <SectionHeader title="기본 정보" />
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Field label="상품명" required>
                  <TextInput
                    name="productName"
                    value={form.productName}
                    onChange={handleChange}
                    placeholder="예: KB스마트폰케어 Standard"
                  />
                </Field>
              </div>
              <Field label="제공사 유형" required>
                <SelectInput
                  name="providerType"
                  value={form.providerType}
                  onChange={handleChange}
                  options={[
                    { value: "TELECOM", label: "통신사 (TELECOM)" },
                    { value: "CARD",    label: "카드사 (CARD)" },
                  ]}
                />
              </Field>
              <Field label="제공사명" required>
                <TextInput
                  name="providerName"
                  value={form.providerName}
                  onChange={handleChange}
                  placeholder="예: SK텔레콤, 신한카드"
                />
              </Field>
            </div>
          </div>

          {/* ── 청구 정보 ─────────────────────────────────────────── */}
          <div>
            <SectionHeader title="청구 정보" />
            <div className="grid grid-cols-3 gap-4">
              <Field label="청구 주기 (개월)" required>
                <TextInput
                  name="billingCycleMonths"
                  value={form.billingCycleMonths}
                  onChange={handleChange}
                  type="number"
                  min="1"
                  placeholder="1"
                />
              </Field>
              <Field label="청구 금액 (원)" required>
                <TextInput
                  name="billingAmount"
                  value={form.billingAmount}
                  onChange={handleChange}
                  type="number"
                  min="0"
                  placeholder="0"
                />
              </Field>
              <Field label="월 환산 보험료 (원)" required>
                <TextInput
                  name="monthlyFeeEquivalent"
                  value={form.monthlyFeeEquivalent}
                  onChange={handleChange}
                  type="number"
                  min="0"
                  placeholder="0"
                />
              </Field>
            </div>
          </div>

          {/* ── 보장 정보 ─────────────────────────────────────────── */}
          <div>
            <SectionHeader title="보장 정보" />
            <div className="grid grid-cols-3 gap-4">
              <Field label="1회 보장 한도 (원)" required>
                <TextInput
                  name="coveragePerIncident"
                  value={form.coveragePerIncident}
                  onChange={handleChange}
                  type="number"
                  min="0"
                  placeholder="0"
                />
              </Field>
              <Field label="연간 보장 한도 (원)" required>
                <TextInput
                  name="annualLimit"
                  value={form.annualLimit}
                  onChange={handleChange}
                  type="number"
                  min="0"
                  placeholder="0"
                />
              </Field>
              <Field label="연간 청구 횟수" required>
                <TextInput
                  name="annualClaimLimit"
                  value={form.annualClaimLimit}
                  onChange={handleChange}
                  type="number"
                  min="0"
                  placeholder="2"
                />
              </Field>
            </div>
          </div>

          {/* ── 자기부담금 ────────────────────────────────────────── */}
          <div>
            <SectionHeader title="자기부담금" />
            <div className="grid grid-cols-2 gap-4">
              <Field label="자기부담금 유형" required>
                <SelectInput
                  name="selfPayType"
                  value={form.selfPayType}
                  onChange={handleChange}
                  options={[
                    { value: "FIXED", label: "정액 (FIXED) — 고정 금액 차감" },
                    { value: "RATE",  label: "정률 (RATE) — 수리비의 일정 비율" },
                  ]}
                />
              </Field>
              <Field label="정액 자기부담금 (원)" required>
                <TextInput
                  name="selfPayAmount"
                  value={form.selfPayAmount}
                  onChange={handleChange}
                  type="number"
                  min="0"
                  placeholder="0"
                />
              </Field>
              <Field label="정률 자기부담 비율 (%)" required>
                <TextInput
                  name="selfPayRate"
                  value={form.selfPayRate}
                  onChange={handleChange}
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  placeholder="0.00"
                />
              </Field>
              <Field label="최소 자기부담금 (원)" required>
                <TextInput
                  name="minSelfPayAmount"
                  value={form.minSelfPayAmount}
                  onChange={handleChange}
                  type="number"
                  min="0"
                  placeholder="0"
                />
              </Field>
            </div>
          </div>

          {/* ── 청구 채널 ─────────────────────────────────────────── */}
          <div>
            <SectionHeader title="청구 채널" />
            <div className="grid grid-cols-2 gap-4">
              <Field label="채널 유형" required>
                <SelectInput
                  name="claimChannelType"
                  value={form.claimChannelType}
                  onChange={handleChange}
                  options={[
                    { value: "WEBSITE", label: "웹사이트 (WEBSITE)" },
                    { value: "KAKAO",   label: "카카오 채널 (KAKAO)" },
                  ]}
                />
              </Field>
              <Field label="채널 URL / 카카오 ID" required>
                <TextInput
                  name="claimChannelValue"
                  value={form.claimChannelValue}
                  onChange={handleChange}
                  placeholder={
                    form.claimChannelType === "WEBSITE"
                      ? "https://claim.example.com"
                      : "@channel-id"
                  }
                />
              </Field>
            </div>
          </div>

          {/* ── 비고 ──────────────────────────────────────────────── */}
          <div>
            <SectionHeader title="비고 (선택)" />
            <textarea
              name="summaryNote"
              value={form.summaryNote}
              onChange={handleChange}
              rows={3}
              placeholder="보험 적용 범위, 면책 사항 등 관리자 참고 메모를 입력하세요. (최대 255자)"
              maxLength={255}
              className="w-full px-3.5 py-2.5 text-sm bg-secondary border border-border rounded-xl text-foreground
                         placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-accent/30
                         focus:border-accent/50 resize-none transition-all"
            />
          </div>

          {/* 푸터 — 폼 내부에 배치해 submit 트리거 */}
          <div className="flex gap-3 justify-end pt-2 border-t border-border">
            <Button type="button" variant="secondary" size="md" onClick={onClose}>
              취소
            </Button>
            <Button type="submit" variant="accent" size="md" disabled={saving}>
              {saving ? "저장 중..." : mode === "create" ? "등록" : "저장"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── 삭제 확인 모달 ────────────────────────────────────────────────────────────

/**
 * 삭제 전 확인 단계를 거쳐 실수로 인한 삭제를 방지합니다.
 *
 * @param {object}   props.product  삭제 대상 상품
 * @param {Function} props.onClose  취소 시 호출
 * @param {Function} props.onDeleted 삭제 완료 시 호출
 */
function DeleteConfirmModal({ product, onClose, onDeleted }) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteInsuranceProduct(product.id);
      toast.success(`'${product.productName}' 상품이 삭제되었습니다.`);
      onDeleted(product.id);
      onClose();
    } catch (err) {
      const msg = err.response?.data?.error?.message || "삭제 중 오류가 발생했습니다.";
      toast.error(msg);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col gap-5">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">보험 상품 삭제</p>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              <span className="font-medium text-foreground">{product.productName}</span>을(를)
              삭제하면 복구할 수 없습니다. 이미 가입된 고객 보험과 연결된 경우 삭제가 거부될 수 있습니다.
            </p>
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" size="sm" onClick={onClose}>취소</Button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-4 py-2 text-sm font-medium rounded-xl bg-red-500 hover:bg-red-600
                       text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {deleting ? "삭제 중..." : "삭제 확인"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── 메인 페이지 컴포넌트 ──────────────────────────────────────────────────────

export default function PoliciesPage() {
  // ── 데이터 상태 ──────────────────────────────────────────────────────────────
  const [products, setProducts]     = useState([]);  // 전체 목록 (서버 응답)
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);

  // ── 필터 상태 ────────────────────────────────────────────────────────────────
  const [query, setQuery]           = useState("");          // 상품명 검색
  const [providerFilter, setProviderFilter] = useState("전체"); // 전체 | TELECOM | CARD

  // ── 모달 상태 ────────────────────────────────────────────────────────────────
  const [modalMode, setModalMode]   = useState(null);    // null | "create" | "edit"
  const [editTarget, setEditTarget] = useState(null);    // 수정 대상 상품
  const [deleteTarget, setDeleteTarget] = useState(null); // 삭제 대상 상품

  // ── 목록 조회 ────────────────────────────────────────────────────────────────
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getInsuranceProducts();
      setProducts(res.data.data ?? []);
    } catch (err) {
      setError("보험 상품 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // ── 클라이언트 사이드 필터링 ─────────────────────────────────────────────────
  const filtered = products.filter((p) => {
    const matchQuery = p.productName.toLowerCase().includes(query.toLowerCase());
    const matchProvider = providerFilter === "전체" || p.providerType === providerFilter;
    return matchQuery && matchProvider;
  });

  // ── 이벤트 핸들러 ────────────────────────────────────────────────────────────

  /** 등록 완료 — 목록 앞에 추가 (서버 재조회 없이 즉시 반영) */
  const handleCreated = (newProduct) => {
    setProducts((prev) => [newProduct, ...prev]);
  };

  /** 수정 완료 — 해당 항목만 교체 */
  const handleUpdated = (updatedProduct) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
    );
  };

  /** 삭제 완료 — 해당 항목 제거 */
  const handleDeleted = (deletedId) => {
    setProducts((prev) => prev.filter((p) => p.id !== deletedId));
  };

  // ── 렌더링 ───────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-6">

      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">보험 약관(상품) 관리</h1>
          <p className="text-sm text-muted-foreground mt-1">
            통신사·카드사 제휴 보험 상품의 파라미터를 등록하고 관리합니다.
          </p>
        </div>
        <Button variant="accent" size="sm" onClick={() => setModalMode("create")}>
          <Plus className="w-4 h-4" />
          새 상품 등록
        </Button>
      </div>

      {/* 오류 배너 */}
      {error && (
        <div className="flex items-center gap-3 px-4 py-3 bg-red-50 dark:bg-red-900/20 rounded-xl text-sm text-red-700 dark:text-red-400">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {error}
          <button
            onClick={fetchProducts}
            className="ml-auto text-xs underline underline-offset-2 hover:opacity-80"
          >
            다시 시도
          </button>
        </div>
      )}

      {/* 필터 바 */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* 상품명 검색 */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="상품명 검색..."
            className="pl-9 pr-4 py-2 text-sm bg-card border border-border rounded-xl text-foreground
                       placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-accent/30
                       focus:border-accent/50 transition-all w-52"
          />
        </div>

        {/* 제공사 유형 필터 */}
        <div className="relative">
          <select
            value={providerFilter}
            onChange={(e) => setProviderFilter(e.target.value)}
            className="appearance-none pl-3.5 pr-8 py-2 text-sm bg-card border border-border rounded-xl
                       text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30
                       focus:border-accent/50 transition-all"
          >
            {["전체", "TELECOM", "CARD"].map((v) => (
              <option key={v} value={v}>
                {v === "전체" ? "전체" : PROVIDER_TYPE_LABEL[v]}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
        </div>

        <span className="text-xs text-muted-foreground">
          {loading ? "불러오는 중..." : `${filtered.length}건 표시 중`}
        </span>
      </div>

      {/* 테이블 */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border/40 bg-secondary/50">
                {[
                  "ID",
                  "상품명",
                  "제공사 유형",
                  "제공사명",
                  "청구금액",
                  "1회 보장한도",
                  "연간 청구 횟수",
                  "Actions",
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
              {loading ? (
                <TableSkeleton />
              ) : filtered.length === 0 ? (
                <EmptyState query={query} providerType={providerFilter} />
              ) : (
                filtered.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-border/20 hover:bg-secondary/40 transition-colors"
                  >
                    {/* ID */}
                    <td className="py-3 px-4 font-mono text-muted-foreground">#{p.id}</td>

                    {/* 상품명 */}
                    <td className="py-3 px-4 font-medium text-foreground max-w-48 truncate" title={p.productName}>
                      {p.productName}
                    </td>

                    {/* 제공사 유형 */}
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        p.providerType === "TELECOM"
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                          : "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                      }`}>
                        {PROVIDER_TYPE_LABEL[p.providerType] ?? p.providerType}
                      </span>
                    </td>

                    {/* 제공사명 */}
                    <td className="py-3 px-4 text-foreground whitespace-nowrap">{p.providerName}</td>

                    {/* 청구금액 */}
                    <td className="py-3 px-4 font-medium text-foreground whitespace-nowrap">
                      {fmt(p.billingAmount)}
                      <span className="text-muted-foreground font-normal">
                        /{p.billingCycleMonths}개월
                      </span>
                    </td>

                    {/* 1회 보장한도 */}
                    <td className="py-3 px-4 font-medium text-foreground whitespace-nowrap">
                      {fmt(p.coveragePerIncident)}
                    </td>

                    {/* 연간 청구 횟수 */}
                    <td className="py-3 px-4 text-foreground">
                      {p.annualClaimLimit}회/년
                    </td>

                    {/* 액션 */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {/* 수정 버튼 */}
                        <button
                          onClick={() => {
                            setEditTarget(p);
                            setModalMode("edit");
                          }}
                          className="p-1.5 rounded-lg hover:bg-accent/10 text-accent transition-colors"
                          title="수정"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {/* 삭제 버튼 */}
                        <button
                          onClick={() => setDeleteTarget(p)}
                          className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors"
                          title="삭제"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* 등록 / 수정 모달 */}
      {modalMode === "create" && (
        <ProductModal
          mode="create"
          onClose={() => setModalMode(null)}
          onSaved={handleCreated}
        />
      )}
      {modalMode === "edit" && editTarget && (
        <ProductModal
          mode="edit"
          product={editTarget}
          onClose={() => { setModalMode(null); setEditTarget(null); }}
          onSaved={handleUpdated}
        />
      )}

      {/* 삭제 확인 모달 */}
      {deleteTarget && (
        <DeleteConfirmModal
          product={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  );
}
