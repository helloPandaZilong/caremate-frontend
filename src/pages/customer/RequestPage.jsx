import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import {
  CheckCircle2,
  ChevronRight,
  Image,
  Video,
  MapPin,
  Shield,
  X,
  Loader2,
  Sparkles,
} from "lucide-react";
import { Button, Card, UploadZone, StarRating } from "../../components/shared";
import {
  getRepairShops,
  getInsurancePolicies,
  createRepairOrder,
  diagnoseImage,
  getShopOperatingHours,
  getReservationCount,
} from "../../api/customerService";

const STEPS = [
  "사진·영상 업로드",
  "파손 설명",
  "서비스 센터 선택",
  "보험 선택",
];

const DEMO_SHOPS = [
  { id: 901, shopName: "폰케어 강남점", address: "서울 강남구 테헤란로 152", phone: "02-555-1234", avgRating: 4.8, reviewCount: 132 },
  { id: 902, shopName: "스마트픽스 홍대점", address: "서울 마포구 양화로 160", phone: "02-332-5678", avgRating: 4.6, reviewCount: 87 },
  { id: 903, shopName: "닥터폰 건대입구점", address: "서울 광진구 아차산로 272", phone: "02-446-9012", avgRating: 4.9, reviewCount: 204 },
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

function StepIndicator({ current }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {STEPS.map((s, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={s} className="flex items-center gap-2">
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

const todayStr = () => new Date().toISOString().split("T")[0];

export default function RequestPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const preselectedShop = location.state?.selectedShop ?? null;
  const [step, setStep] = useState(0);
  const [damage, setDamage] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [selectedDate, setSelectedDate] = useState(todayStr());
  const [selectedShop, setSelectedShop] = useState(preselectedShop);
  const [selectedPolicies, setSelectedPolicies] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [diagnosing, setDiagnosing] = useState(false);
  const [aiDiagnosis, setAiDiagnosis] = useState(null);
  const [diagnoseFailed, setDiagnoseFailed] = useState(false);

  const [shops, setShops] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [loadingShops, setLoadingShops] = useState(true);
  const [loadingPolicies, setLoadingPolicies] = useState(true);
  const [operatingHours, setOperatingHours] = useState(null);
  const [reservationCounts, setReservationCounts] = useState({});
  const [loadingCounts, setLoadingCounts] = useState(false);

  useEffect(() => {
    getRepairShops()
      .then(({ data }) => {
        const list = data.data ?? [];
        const base = list.length > 0 ? list : DEMO_SHOPS;
        const merged =
          preselectedShop && !base.some((s) => s.id === preselectedShop.id)
            ? [preselectedShop, ...base]
            : base;
        setShops(merged);
      })
      .catch(() => setShops(preselectedShop ? [preselectedShop, ...DEMO_SHOPS] : DEMO_SHOPS))
      .finally(() => setLoadingShops(false));
    getInsurancePolicies()
      .then(({ data }) => setPolicies(data.data ?? []))
      .catch(() => setPolicies([]))
      .finally(() => setLoadingPolicies(false));
  }, []);

  useEffect(() => {
    if (!selectedShop) { setOperatingHours(null); return; }
    setOperatingHours(null);
    getShopOperatingHours(selectedShop.id)
      .then(({ data }) => setOperatingHours(data.data?.hours ?? []))
      .catch(() => setOperatingHours([]));
  }, [selectedShop]);

  const todayHours = operatingHours?.find(
    (h) => h.dayOfWeek === new Date(`${selectedDate}T00:00:00`).getDay(),
  );
  const isShopClosedToday = !!todayHours && (todayHours.closed || todayHours.isClosed);
  const isSlotWithinHours = (t) => {
    if (!todayHours || isShopClosedToday) return false;
    const open = todayHours.openTime?.slice(0, 5);
    const close = todayHours.closeTime?.slice(0, 5);
    if (!open || !close) return true;
    return t >= open && t < close;
  };

  useEffect(() => {
    if (selectedSlot && !isSlotWithinHours(selectedSlot)) setSelectedSlot("");
  }, [selectedShop, selectedDate, operatingHours]);

  useEffect(() => {
    if (!selectedShop || isShopClosedToday) { setReservationCounts({}); return; }
    let cancelled = false;
    setLoadingCounts(true);
    Promise.all(
      TIME_SLOTS.map((t) =>
        getReservationCount(selectedShop.id, `${selectedDate}T${t}:00`)
          .then(({ data }) => [t, data.data?.count ?? 0])
          .catch(() => [t, null]),
      ),
    ).then((entries) => {
      if (cancelled) return;
      setReservationCounts(Object.fromEntries(entries));
    }).finally(() => {
      if (!cancelled) setLoadingCounts(false);
    });
    return () => { cancelled = true; };
  }, [selectedShop, selectedDate, isShopClosedToday]);

  const togglePolicy = (id) => {
    setSelectedPolicies((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setUploadedFiles((prev) => [...prev, ...files]);
  };

  const removeFile = (index) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
    setAiDiagnosis(null);
  };

  const handleDiagnose = async () => {
    const imageFile = uploadedFiles.find((f) => f.type.startsWith("image/"));
    if (!imageFile) return;
    setDiagnosing(true);
    setAiDiagnosis(null);
    setDiagnoseFailed(false);
    try {
      const { data } = await diagnoseImage(imageFile);
      setAiDiagnosis(data.data?.diagnosis ?? data.diagnosis ?? "진단 결과를 가져오지 못했습니다.");
    } catch {
      setDiagnoseFailed(true);
    } finally {
      setDiagnosing(false);
    }
  };

  const applyDiagnosis = () => {
    if (aiDiagnosis) setDamage(aiDiagnosis);
    setStep(1);
  };

  const isPolicyExhausted = (p) =>
    p.annualClaimLimit != null &&
    (p.remainingClaimCount ?? p.annualClaimLimit - (p.annualClaimCount ?? 0)) <= 0;

  const handleSubmit = async () => {
    if (!selectedShop) { setSubmitError("서비스 센터를 선택해주세요."); return; }
    if (!selectedSlot) { setSubmitError("방문 시간을 선택해주세요."); return; }
    if (!isSlotWithinHours(selectedSlot)) {
      setSubmitError("선택한 시간은 서비스 센터의 운영 시간이 아닙니다. 다른 시간을 선택해주세요.");
      return;
    }
    if (selectedPolicies.length === 0) { setSubmitError("보험을 1개 이상 선택해주세요."); return; }
    const exhaustedPolicy = policies.find(
      (p) => selectedPolicies.includes(p.id) && isPolicyExhausted(p),
    );
    if (exhaustedPolicy) {
      setSubmitError(
        `선택한 보험(${exhaustedPolicy.productName})은 이번 보험 기간의 청구 횟수를 모두 사용했습니다. 잔여 횟수가 남아있다면 정상적으로 접수할 수 있으니, 보험을 재등록한 후 다시 접수해주세요.`,
      );
      return;
    }
    const reservedVisitAt = `${selectedDate}T${selectedSlot}:00`;
    if (new Date(reservedVisitAt) < new Date()) {
      setSubmitError("현재 시간 이전으로는 예약할 수 없습니다.");
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      await createRepairOrder({
        repairShopId: selectedShop.id,
        damageDescription: damage,
        reservedVisitAt,
        policyIds: selectedPolicies,
        images: uploadedFiles,
      });
      setSubmitted(true);
    } catch (e) {
      setSubmitError(
        e.response?.data?.error?.message || "접수에 실패했습니다. (백엔드에 해당 수리점/보험 데이터가 없을 수 있습니다)",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  const isStepComplete = [
    true,
    damage.trim().length > 0,
    !!selectedShop && !!selectedSlot,
    selectedPolicies.length > 0,
  ][step];

  if (submitted) {
    return (
      <div className="max-w-2xl">
        <Card className="p-8 text-center flex flex-col items-center gap-4">
          <CheckCircle2 className="w-12 h-12 text-accent" />
          <h2 className="text-lg font-semibold text-foreground">접수가 완료되었습니다!</h2>
          <p className="text-sm text-muted-foreground">대시보드에서 진행 상황을 확인하세요.</p>
          <Button variant="accent" size="md" onClick={() => navigate("/customer/dashboard")}>
            대시보드로 이동
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-foreground">
          비대면 A/S 접수
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          단계별로 정보를 입력하면 빠르게 접수됩니다.
        </p>
      </div>

      <StepIndicator current={step} />

      {/* Step 0: Media upload */}
      {step === 0 && (
        <Card className="p-6 flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-foreground">
              파손 사진·영상 업로드
            </label>
            <p className="text-xs text-muted-foreground">
              파손 부위가 잘 보이는 사진 또는 영상을 업로드해주세요. (선택)
            </p>
          </div>

          <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-6 cursor-pointer hover:border-accent/40 transition-all">
            <Image className="w-8 h-8 text-muted-foreground mb-2" />
            <span className="text-sm text-muted-foreground">클릭하여 파일 선택</span>
            <span className="text-xs text-muted-foreground/60 mt-1">JPG, PNG, MP4 · 장당 최대 50MB</span>
            <input
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          <div className="flex gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Image className="w-3.5 h-3.5" />
              이미지 권장: 3장 이상
            </span>
            <span className="flex items-center gap-1.5">
              <Video className="w-3.5 h-3.5" />
              영상: 30초 이내
            </span>
          </div>

          {uploadedFiles.length > 0 && (
            <>
              <div className="flex gap-2 flex-wrap">
                {uploadedFiles.map((f, i) => (
                  <div
                    key={i}
                    className="relative w-20 h-20 rounded-xl bg-secondary border border-border flex items-center justify-center group"
                  >
                    {f.type.startsWith("image/") ? (
                      <img
                        src={URL.createObjectURL(f)}
                        alt={f.name}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    ) : (
                      <Image className="w-6 h-6 text-muted-foreground" />
                    )}
                    <p className="text-[10px] text-muted-foreground absolute bottom-1 left-0 right-0 text-center truncate px-1 bg-black/30 rounded-b-xl">
                      {f.name}
                    </p>
                    <button
                      onClick={() => removeFile(i)}
                      className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* AI 진단 버튼 */}
              {uploadedFiles.some((f) => f.type.startsWith("image/")) && (
                <button
                  onClick={handleDiagnose}
                  disabled={diagnosing}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent/10 border border-accent/30 text-accent text-sm font-medium hover:bg-accent/20 transition-all disabled:opacity-60"
                >
                  {diagnosing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  {diagnosing ? "AI 분석 중..." : "AI로 파손 진단하기"}
                </button>
              )}

              {/* AI 진단 실패 */}
              {diagnoseFailed && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200">
                  <p className="text-sm text-red-600">AI 진단에 실패했습니다.</p>
                </div>
              )}

              {/* AI 진단 결과 */}
              {aiDiagnosis && (
                <div className="flex flex-col gap-3 p-4 rounded-xl bg-accent/5 border border-accent/20">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-accent" />
                    <span className="text-xs font-semibold text-accent">AI 진단 결과</span>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">{aiDiagnosis}</p>
                  <button
                    onClick={applyDiagnosis}
                    className="self-start px-3 py-1.5 text-xs font-medium bg-accent text-white rounded-lg hover:bg-accent/90 transition-all"
                  >
                    이 내용으로 파손 설명 채우기 →
                  </button>
                </div>
              )}
            </>
          )}
        </Card>
      )}

      {/* Step 1: Damage description */}
      {step === 1 && (
        <Card className="p-6 flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-foreground">
              파손 상황 설명
            </label>
            <p className="text-xs text-muted-foreground">
              어떤 상황에서, 어떤 부분이 파손되었는지 자세히 기술해주세요.
            </p>
          </div>
          <textarea
            value={damage}
            onChange={(e) => setDamage(e.target.value)}
            placeholder="예: 핸드폰을 떨어뜨려 전면 유리가 깨졌습니다. 터치는 일부 작동하지만 우측 하단에서 미인식 구간이 발생하고 있습니다."
            rows={6}
            className="w-full px-3.5 py-3 text-sm bg-secondary border border-border rounded-xl text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 resize-none transition-all"
          />

          <div className="flex flex-wrap gap-2">
            {["액정 파손", "침수", "배터리 불량", "카메라 파손"].map(
              (t) => (
                <button
                  key={t}
                  onClick={() => setDamage((d) => (d ? d + ", " + t : t))}
                  className="px-3 py-1 text-xs font-medium bg-card border border-border rounded-full hover:border-accent/40 hover:text-accent transition-all"
                >
                  + {t}
                </button>
              ),
            )}
          </div>
        </Card>
      )}

      {/* Step 2: Service center */}
      {step === 2 && (() => {
        const now = new Date();
        return (
        <Card className="p-6 flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-foreground">
              서비스 센터 선택
            </label>
          </div>

          {loadingShops ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-accent" />
            </div>
          ) : (
            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
              {shops.map((shop) => (
                <div
                  key={shop.id}
                  onClick={() => setSelectedShop(shop)}
                  className={`flex items-center gap-3 p-3.5 border rounded-xl cursor-pointer transition-all ${
                    selectedShop?.id === shop.id
                      ? "border-accent bg-accent/10"
                      : "border-border hover:border-accent/40"
                  }`}
                >
                  <MapPin className="w-4 h-4 text-accent shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">{shop.shopName}</p>
                    <p className="text-xs text-muted-foreground">{shop.address}</p>
                    <StarRating rating={shop.avgRating} reviewCount={shop.reviewCount} size="sm" className="mt-1" />
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-muted-foreground">
              방문 날짜
            </label>
            <input
              type="date"
              value={selectedDate}
              min={todayStr()}
              onChange={(e) => {
                const value = e.target.value;
                setSelectedDate(value < todayStr() ? todayStr() : value);
              }}
              className="px-3.5 py-2.5 text-sm bg-secondary border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-muted-foreground">
              방문 시간 선택
            </label>
            {isShopClosedToday ? (
              <p className="text-xs text-red-500">
                선택하신 날짜는 해당 서비스 센터의 휴무일입니다. 다른 날짜를 선택해주세요.
              </p>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                {TIME_SLOTS.map((t) => {
                  const isToday = selectedDate === todayStr();
                  const isPast = isToday && t <= now.toTimeString().slice(0, 5);
                  const outsideHours = !isSlotWithinHours(t);
                  const disabled = isPast || outsideHours;
                  const count = reservationCounts[t];
                  return (
                    <button
                      key={t}
                      onClick={() => !disabled && setSelectedSlot(t)}
                      disabled={disabled}
                      title={outsideHours && !isPast ? "운영 시간이 아닙니다" : undefined}
                      className={`flex flex-col items-center gap-0.5 py-2 text-xs font-medium rounded-xl border transition-all ${
                        disabled
                          ? "bg-secondary border-border text-muted-foreground/40 cursor-not-allowed"
                          : selectedSlot === t
                            ? "bg-accent text-white border-accent"
                            : "bg-card border-border text-foreground hover:border-accent/40"
                      }`}
                    >
                      <span>{t}</span>
                      {!outsideHours && (
                        <span
                          className={`text-[10px] font-normal ${
                            selectedSlot === t ? "text-white/80" : "text-muted-foreground"
                          }`}
                        >
                          {loadingCounts ? "…" : count != null ? `예약 ${count}명` : ""}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </Card>
        );
      })()}

      {/* Step 3: Insurance selection */}
      {step === 3 && (
        <Card className="p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-foreground">
              보험 정책 선택
            </label>
            <p className="text-xs text-muted-foreground">
              이번 수리에 적용할 보험을 선택하세요. 복수 선택 가능.
            </p>
          </div>

          {loadingPolicies ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-accent" />
            </div>
          ) : policies.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <Shield className="w-8 h-8 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">
                연동된 보험이 없습니다. 보험을 연동한 후 다시 접수해주세요.
              </p>
              <Button variant="secondary" size="sm" onClick={() => navigate("/customer/insurance")}>
                보험 연동하러 가기
              </Button>
            </div>
          ) : (
            policies.map((p) => {
              const checked = selectedPolicies.includes(p.id);
              const isActive = p.status === "ACTIVE";
              const exhausted = isPolicyExhausted(p);
              const selectable = isActive && !exhausted;
              return (
                <div
                  key={p.id}
                  onClick={() => selectable && togglePolicy(p.id)}
                  className={`flex items-start gap-3 p-4 border rounded-xl transition-all ${
                    !selectable
                      ? "opacity-50 cursor-not-allowed bg-secondary"
                      : checked
                        ? "border-accent bg-accent/10 cursor-pointer"
                        : "border-border hover:border-border/70 cursor-pointer"
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
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-foreground">
                        {p.productName}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {p.providerName}
                    </p>
                    {p.policyNumber && (
                      <p className="text-xs text-muted-foreground mt-1">
                        증권번호: {p.policyNumber}
                      </p>
                    )}
                    {exhausted && (
                      <p className="text-xs text-red-500 mt-1">
                        청구 횟수를 모두 사용했습니다. 잔여 횟수가 남아있다면 정상 접수할 수 있으니, 보험을 재등록해주세요.
                      </p>
                    )}
                  </div>
                  {!selectable && (
                    <Shield className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                  )}
                </div>
              );
            })
          )}

          {submitError && (
            <div className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-xl p-3">
              {submitError}
            </div>
          )}
        </Card>
      )}

      {/* Footer buttons */}
      <div className="flex items-center justify-between mt-6">
        <Button
          variant="secondary"
          size="md"
          onClick={prev}
          disabled={step === 0}
        >
          이전
        </Button>
        <div className="flex gap-2">
          <Button variant="ghost" size="md">
            취소
          </Button>
          {step < STEPS.length - 1 ? (
            <Button
              variant="accent"
              size="md"
              onClick={next}
              disabled={!isStepComplete}
            >
              다음 단계
            </Button>
          ) : (
            <Button
              variant="accent"
              size="md"
              onClick={handleSubmit}
              disabled={submitting || !isStepComplete}
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              {submitting ? "접수 중..." : "접수 제출"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
