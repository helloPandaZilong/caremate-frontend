import { useState, useEffect } from "react";
import {
  CheckCircle2,
  ChevronRight,
  Image,
  Video,
  MapPin,
  Shield,
  X,
  Loader2,
  Star,
} from "lucide-react";
import { Button, Card, UploadZone } from "../../components/shared";
import {
  getRepairShops,
  getInsurancePolicies,
  createRepairOrder,
} from "../../api/customerService";

const STEPS = [
  "파손 설명",
  "사진·영상 업로드",
  "서비스 센터 선택",
  "보험 선택",
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

export default function RequestPage() {
  const [step, setStep] = useState(0);
  const [damage, setDamage] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [selectedShop, setSelectedShop] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [selectedPolicies, setSelectedPolicies] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const [shops, setShops] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [loadingShops, setLoadingShops] = useState(true);
  const [loadingPolicies, setLoadingPolicies] = useState(true);

  useEffect(() => {
    getRepairShops()
      .then(({ data }) => setShops(data.data ?? []))
      .catch(() => {})
      .finally(() => setLoadingShops(false));
    getInsurancePolicies()
      .then(({ data }) => setPolicies(data.data ?? []))
      .catch(() => {})
      .finally(() => setLoadingPolicies(false));
  }, []);

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
  };

  const handleSubmit = async () => {
    if (!selectedShop || !selectedSlot || selectedPolicies.length === 0) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const reservedVisitAt = `${selectedDate}T${selectedSlot}:00`;
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
        e.response?.data?.error?.message || "접수에 실패했습니다.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  if (submitted) {
    return (
      <div className="max-w-2xl">
        <Card className="p-8 text-center flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <CheckCircle2 className="w-7 h-7 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">
            A/S 접수가 완료되었습니다
          </h2>
          <p className="text-sm text-muted-foreground">
            대시보드에서 진행 상태를 확인하실 수 있습니다.
          </p>
          <Button
            variant="accent"
            size="md"
            onClick={() => (window.location.href = "/customer/dashboard")}
          >
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

      {/* Step 0: Damage description */}
      {step === 0 && (
        <Card className="p-6 flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-foreground">
              파손 상황 설명
            </label>
            <p className="text-xs text-muted-foreground">
              어떤 상황에서, 어떤 부분이 파손되었는지 자세히 기술해주세요. (최소
              5자 이상)
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
            {["액정 파손", "침수", "배터리 불량", "카메라 파손", "분실"].map(
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

      {/* Step 1: Media upload */}
      {step === 1 && (
        <Card className="p-6 flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-foreground">
              파손 사진·영상 업로드
            </label>
            <p className="text-xs text-muted-foreground">
              파손 부위가 잘 보이는 사진 또는 영상을 업로드해주세요.
            </p>
          </div>
          <label className="cursor-pointer">
            <UploadZone
              label="파손 사진 / 영상 드래그 또는 클릭"
              sublabel="JPG, PNG, MP4 · 장당 최대 50MB"
            />
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
            <div className="flex gap-2 flex-wrap">
              {uploadedFiles.map((f, i) => (
                <div
                  key={i}
                  className="relative w-20 h-20 rounded-xl bg-secondary border border-border flex items-center justify-center group"
                >
                  <Image className="w-6 h-6 text-muted-foreground" />
                  <p className="text-[10px] text-muted-foreground mt-1 absolute bottom-1 left-0 right-0 text-center truncate px-1">
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
          )}
        </Card>
      )}

      {/* Step 2: Service center */}
      {step === 2 && (
        <Card className="p-6 flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-foreground">
              서비스 센터 선택
            </label>
          </div>

          {loadingShops ? (
            <div className="flex justify-center py-8">
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
                    <p className="text-sm font-semibold text-foreground">
                      {shop.shopName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {shop.address}
                      {shop.phone && ` · ${shop.phone}`}
                    </p>
                  </div>
                </div>
              ))}
              {shops.length === 0 && (
                <p className="text-xs text-muted-foreground py-4 text-center">
                  등록된 수리점이 없습니다.
                </p>
              )}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-muted-foreground">
              방문 날짜
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3.5 py-2.5 text-sm bg-secondary border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-muted-foreground">
              방문 시간 선택
            </label>
            <div className="grid grid-cols-4 gap-2">
              {TIME_SLOTS.map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedSlot(t)}
                  className={`py-2 text-xs font-medium rounded-xl border transition-all ${
                    selectedSlot === t
                      ? "bg-accent text-white border-accent"
                      : "bg-card border-border text-foreground hover:border-accent/40"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </Card>
      )}

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
            <div className="flex justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-accent" />
            </div>
          ) : (
            <>
              {policies.map((p) => {
                const checked = selectedPolicies.includes(p.id);
                const active = p.status === "ACTIVE";
                return (
                  <div
                    key={p.id}
                    onClick={() => active && togglePolicy(p.id)}
                    className={`flex items-start gap-3 p-4 border rounded-xl transition-all ${
                      !active
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
                      {checked && (
                        <CheckCircle2 className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-foreground">
                          {p.productName}
                        </p>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent font-medium">
                          {p.providerName}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {p.providerType === "TELECOM"
                          ? "통신사 보험"
                          : "카드 보험"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 font-mono">
                        {p.policyNumber}
                      </p>
                    </div>
                    {!active && (
                      <Shield className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                    )}
                  </div>
                );
              })}
              {policies.length === 0 && (
                <p className="text-xs text-muted-foreground py-4 text-center">
                  등록된 보험이 없습니다. 보험 관리에서 먼저 보험을 연동하세요.
                </p>
              )}
            </>
          )}

          {submitError && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/50 rounded-xl text-sm text-red-700 dark:text-red-400">
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
            <Button variant="accent" size="md" onClick={next}>
              다음 단계
            </Button>
          ) : (
            <Button
              variant="accent"
              size="md"
              onClick={handleSubmit}
              disabled={submitting || selectedPolicies.length === 0}
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