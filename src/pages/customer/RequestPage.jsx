import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import {
  CheckCircle2,
  ChevronRight,
  Image,
  Loader2,
  MapPin,
  Shield,
  X,
} from "lucide-react";
import { Button, Card } from "../../components/shared";
import {
  createCustomerRepairOrder,
  getCustomerInsurancePolicies,
  getRepairShops,
} from "../../api/customerRepairOrderApi";

const STEPS = [
  "파손 설명",
  "사진 업로드",
  "서비스 센터·방문일시",
  "보험 선택·제출",
];

const TIME_SLOTS = [
  "10:00",
  "11:00",
  "12:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
];

function toArray(data) {
  if (Array.isArray(data)) return data;
  return data?.content ?? data?.items ?? [];
}

function getTomorrowDate() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10);
}

function formatMoney(value) {
  if (value === null || value === undefined || value === "") return "-";
  return `${Number(value).toLocaleString("ko-KR")}원`;
}

function shopNameOf(shop) {
  return shop.shopName ?? shop.name ?? shop.centerName ?? `수리점 #${shop.id}`;
}

function policyTitleOf(policy) {
  return (
      policy.productName ??
      policy.insuranceProductName ??
      policy.product?.productName ??
      policy.insuranceProduct?.productName ??
      policy.providerName ??
      `보험 #${policy.id}`
  );
}

function policyProviderOf(policy) {
  return (
      policy.providerName ??
      policy.insuranceProduct?.providerName ??
      policy.product?.providerName ??
      policy.providerType ??
      "보험"
  );
}

function StepIndicator({ current }) {
  return (
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-1">
        {STEPS.map((s, i) => {
          const done = i < current;
          const active = i === current;
          return (
              <div key={s} className="flex items-center gap-2 shrink-0">
                <div className="flex items-center gap-2">
                  <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                          done
                              ? "bg-accent text-white"
                              : active
                                  ? "bg-foreground text-background"
                                  : "bg-secondary text-muted-foreground"
                      }`}
                  >
                    {done ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                  </div>
                  <span
                      className={`text-xs font-medium hidden md:block ${active ? "text-foreground" : "text-muted-foreground"}`}
                  >
                {s}
              </span>
                </div>
                {i < STEPS.length - 1 && (
                    <ChevronRight className="w-4 h-4 text-muted-foreground/40 shrink-0" />
                )}
              </div>
          );
        })}
      </div>
  );
}

function FileUploadBox({ files, onChange, onRemove }) {
  const handleFiles = (fileList) => {
    const nextFiles = Array.from(fileList || []);
    if (!nextFiles.length) return;

    const merged = [...files, ...nextFiles].slice(0, 5);
    const invalid = merged.find((file) => {
      const validType = ["image/jpeg", "image/png"].includes(file.type);
      const validSize = file.size <= 10 * 1024 * 1024;
      return !validType || !validSize;
    });

    if (invalid) {
      toast.error("사진은 JPG/PNG만 가능하고 각 10MB 이하여야 합니다.");
      return;
    }

    onChange(merged);
  };

  return (
      <div className="flex flex-col gap-4">
        <label className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center gap-3 text-center hover:border-accent/40 hover:bg-accent/3 transition-all cursor-pointer">
          <input
              type="file"
              accept="image/jpeg,image/png"
              multiple
              className="hidden"
              onChange={(e) => {
                handleFiles(e.target.files);
                e.target.value = "";
              }}
          />
          <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
            <Image className="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">파손 사진 드래그 또는 클릭</p>
            <p className="text-xs text-muted-foreground mt-0.5">JPG, PNG · 최대 5장 · 각 10MB 이하</p>
          </div>
        </label>

        {files.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {files.map((file, index) => (
                  <div key={`${file.name}-${index}`} className="relative rounded-xl bg-secondary border border-border p-3 min-h-24">
                    <button
                        type="button"
                        onClick={() => onRemove(index)}
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center shadow"
                        title="삭제"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <div className="flex items-start gap-2">
                      <Image className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-foreground truncate">{file.name}</p>
                        <p className="text-[11px] text-muted-foreground mt-1">
                          {(file.size / 1024 / 1024).toFixed(2)}MB
                        </p>
                      </div>
                    </div>
                  </div>
              ))}
            </div>
        )}
      </div>
  );
}

export default function RequestPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [damage, setDamage] = useState("");
  const [images, setImages] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState("10:00");
  const [selectedDate, setSelectedDate] = useState(getTomorrowDate);
  const [selectedShopId, setSelectedShopId] = useState("");
  const [selectedPolicies, setSelectedPolicies] = useState([]);
  const [shops, setShops] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [loadingMeta, setLoadingMeta] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let alive = true;
    async function loadMeta() {
      setLoadingMeta(true);
      try {
        const [shopData, policyData] = await Promise.all([
          getRepairShops({ page: 0, size: 100 }),
          getCustomerInsurancePolicies({ status: "ACTIVE" }),
        ]);
        if (!alive) return;
        const nextShops = toArray(shopData);
        const nextPolicies = toArray(policyData).filter((policy) => (policy.status ?? "ACTIVE") === "ACTIVE");
        setShops(nextShops);
        setPolicies(nextPolicies);
        setSelectedShopId((prev) => prev || String(nextShops[0]?.id ?? ""));
        setSelectedPolicies((prev) => prev.length ? prev : nextPolicies.slice(0, 2).map((policy) => policy.id));
      } catch (error) {
        toast.error(error.message || "수리점/보험 정보를 불러오지 못했습니다.");
      } finally {
        if (alive) setLoadingMeta(false);
      }
    }

    loadMeta();
    return () => {
      alive = false;
    };
  }, []);

  const selectedShop = useMemo(
      () => shops.find((shop) => String(shop.id) === String(selectedShopId)),
      [shops, selectedShopId],
  );

  const reservedVisitAt = selectedDate && selectedSlot
      ? `${selectedDate}T${selectedSlot}:00+09:00`
      : "";

  const togglePolicy = (id) => {
    setSelectedPolicies((prev) =>
        prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  };

  const validateStep = (targetStep = step) => {
    if (targetStep === 0 && damage.trim().length < 10) {
      toast.error("파손 상황은 10자 이상 입력해주세요.");
      return false;
    }
    if (targetStep === 1 && images.length < 1) {
      toast.error("파손 사진을 최소 1장 업로드해주세요.");
      return false;
    }
    if (targetStep === 2 && (!selectedShopId || !selectedDate || !selectedSlot)) {
      toast.error("수리점과 방문 일시를 선택해주세요.");
      return false;
    }
    if (targetStep === 3 && selectedPolicies.length < 1) {
      toast.error("적용할 보험을 1개 이상 선택해주세요.");
      return false;
    }
    return true;
  };

  const next = () => {
    if (!validateStep(step)) return;
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const prev = () => setStep((s) => Math.max(s - 1, 0));

  const submit = async () => {
    if (![0, 1, 2, 3].every((s) => validateStep(s))) return;
    setSubmitting(true);
    try {
      const result = await createCustomerRepairOrder({
        repairShopId: selectedShopId,
        damageDescription: damage.trim(),
        reservedVisitAt,
        memberInsurancePolicyIds: selectedPolicies,
        images,
      });
      const orderId = result?.orderId ?? result?.id;
      if (orderId) {
        localStorage.setItem("caremate-current-order-id", String(orderId));
      }
      toast.success(`A/S 접수가 완료되었습니다. ${result?.orderNo ? `접수번호: ${result.orderNo}` : ""}`);
      navigate(orderId ? `/customer/repair-orders/${orderId}/status` : "/customer/repair-orders/status");
    } catch (error) {
      toast.error(error.message || "A/S 접수 제출 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
      <div className="max-w-2xl">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-foreground">비대면 A/S 접수</h1>
          <p className="text-sm text-muted-foreground mt-1">
            백엔드 multipart API로 파손 정보, 사진, 센터, 방문일시, 보험을 한 번에 접수합니다.
          </p>
        </div>

        <StepIndicator current={step} />

        {loadingMeta && (
            <Card className="p-4 mb-4 flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              수리점과 가입 보험 정보를 불러오는 중입니다.
            </Card>
        )}

        {/* Step 0: Damage description */}
        {step === 0 && (
            <Card className="p-6 flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-foreground">파손 상황 설명</label>
                <p className="text-xs text-muted-foreground">
                  어떤 상황에서, 어떤 부분이 파손되었는지 10~500자로 입력해주세요.
                </p>
              </div>
              <textarea
                  value={damage}
                  maxLength={500}
                  onChange={(e) => setDamage(e.target.value)}
                  placeholder="예: 핸드폰을 떨어뜨려 전면 유리가 깨졌습니다. 터치는 일부 작동하지만 우측 하단에서 미인식 구간이 발생하고 있습니다."
                  rows={6}
                  className="w-full px-3.5 py-3 text-sm bg-secondary border border-border rounded-xl text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 resize-none transition-all"
              />
              <div className="flex justify-between text-[11px] text-muted-foreground">
                <span>최소 10자 이상</span>
                <span>{damage.length}/500</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {["액정 파손", "침수", "배터리 불량", "카메라 파손", "버튼 고장"].map((t) => (
                    <button
                        type="button"
                        key={t}
                        onClick={() => setDamage((d) => (d ? `${d}, ${t}` : t))}
                        className="px-3 py-1 text-xs font-medium bg-card border border-border rounded-full hover:border-accent/40 hover:text-accent transition-all"
                    >
                      + {t}
                    </button>
                ))}
              </div>
            </Card>
        )}

        {/* Step 1: Image upload */}
        {step === 1 && (
            <Card className="p-6 flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-foreground">파손 사진 업로드</label>
                <p className="text-xs text-muted-foreground">
                  백엔드 규약에 맞춰 images 파트로 전송됩니다. 사진은 1~5장, JPG/PNG만 가능합니다.
                </p>
              </div>
              <FileUploadBox
                  files={images}
                  onChange={setImages}
                  onRemove={(index) => setImages((prev) => prev.filter((_, i) => i !== index))}
              />
            </Card>
        )}

        {/* Step 2: Service center and visit time */}
        {step === 2 && (
            <Card className="p-6 flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-foreground">서비스 센터 선택</label>
                <p className="text-xs text-muted-foreground">GET /api/repair-shops 응답으로 목록을 구성합니다.</p>
              </div>

              {shops.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border p-5 text-sm text-muted-foreground text-center">
                    조회된 수리점이 없습니다. 백엔드 시드 데이터 또는 수리점 승인을 확인해주세요.
                  </div>
              ) : (
                  <div className="grid gap-2">
                    {shops.map((shop) => {
                      const checked = String(selectedShopId) === String(shop.id);
                      return (
                          <button
                              type="button"
                              key={shop.id}
                              onClick={() => setSelectedShopId(String(shop.id))}
                              className={`text-left flex items-center gap-3 rounded-xl border p-3.5 transition-all ${
                                  checked ? "border-accent bg-accent/10" : "border-border bg-secondary hover:border-accent/40"
                              }`}
                          >
                            <MapPin className="w-4 h-4 text-accent shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-foreground">{shopNameOf(shop)}</p>
                              <p className="text-xs text-muted-foreground truncate">{shop.address ?? shop.phone ?? "주소 정보 없음"}</p>
                            </div>
                            {checked && <CheckCircle2 className="w-4 h-4 text-accent" />}
                          </button>
                      );
                    })}
                  </div>
              )}

              {selectedShop && (
                  <div className="rounded-xl bg-secondary border border-border p-3 text-xs text-muted-foreground">
                    선택된 센터: <b className="text-foreground">{shopNameOf(selectedShop)}</b>
                    {selectedShop.phone ? ` · ${selectedShop.phone}` : ""}
                  </div>
              )}

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium text-muted-foreground">방문 날짜</label>
                  <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="px-3.5 py-2.5 text-sm bg-secondary border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium text-muted-foreground">방문 시간</label>
                  <select
                      value={selectedSlot}
                      onChange={(e) => setSelectedSlot(e.target.value)}
                      className="px-3.5 py-2.5 text-sm bg-secondary border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all"
                  >
                    {TIME_SLOTS.map((time) => (
                        <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground">전송 값: {reservedVisitAt || "-"}</p>
            </Card>
        )}

        {/* Step 3: Insurance selection */}
        {step === 3 && (
            <Card className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-foreground">가입 보험 선택</label>
                <p className="text-xs text-muted-foreground">
                  GET /api/customer/insurance-policies 응답 중 ACTIVE 보험을 선택합니다. 최소 1건이 필요합니다.
                </p>
              </div>

              {policies.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border p-5 text-sm text-muted-foreground text-center">
                    등록된 ACTIVE 보험이 없습니다. 먼저 “보험 관리”에서 가입 보험을 등록해주세요.
                  </div>
              ) : (
                  policies.map((policy) => {
                    const checked = selectedPolicies.includes(policy.id);
                    return (
                        <div
                            key={policy.id}
                            onClick={() => togglePolicy(policy.id)}
                            className={`flex items-start gap-3 p-4 border rounded-xl transition-all cursor-pointer ${
                                checked ? "border-accent bg-accent/10" : "border-border hover:border-border/70"
                            }`}
                        >
                          <div
                              className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                                  checked ? "bg-accent border-accent" : "border-border"
                              }`}
                          >
                            {checked && <CheckCircle2 className="w-3 h-3 text-white" />}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between gap-3">
                              <p className="text-sm font-semibold text-foreground">{policyTitleOf(policy)}</p>
                              <span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent font-medium">
                        {policy.providerType ?? policy.insuranceProduct?.providerType ?? "보험"}
                      </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">{policyProviderOf(policy)}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              증권번호: {policy.policyNumber ?? "-"} · 만료일: {policy.endDate ?? "-"}
                            </p>
                            {(policy.coveragePerIncident || policy.insuranceProduct?.coveragePerIncident) && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  사고 한도: {formatMoney(policy.coveragePerIncident ?? policy.insuranceProduct?.coveragePerIncident)}
                                </p>
                            )}
                          </div>
                          <Shield className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                        </div>
                    );
                  })
              )}

              <div className="rounded-xl bg-secondary border border-border p-4 text-xs text-muted-foreground leading-relaxed">
                제출 API: <b className="text-foreground">POST /api/customer/repair-orders</b><br />
                request JSON과 images 파일 배열을 multipart/form-data 단일 요청으로 전송합니다.
              </div>
            </Card>
        )}

        {/* Footer buttons */}
        <div className="flex items-center justify-between mt-6">
          <Button variant="secondary" size="md" onClick={prev} disabled={step === 0 || submitting}>
            이전
          </Button>
          <div className="flex gap-2">
            <Button variant="ghost" size="md" disabled={submitting} onClick={() => navigate("/customer/dashboard")}>
              취소
            </Button>
            {step < STEPS.length - 1 ? (
                <Button variant="accent" size="md" onClick={next} disabled={loadingMeta || submitting}>
                  다음 단계
                </Button>
            ) : (
                <Button variant="accent" size="md" onClick={submit} disabled={loadingMeta || submitting}>
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  {submitting ? "접수 제출 중..." : "접수 제출 (RECEIVED)"}
                </Button>
            )}
          </div>
        </div>
      </div>
  );
}
