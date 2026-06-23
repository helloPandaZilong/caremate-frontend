import { useState } from "react";
import {
  CheckCircle2,
  ChevronRight,
  Image,
  Video,
  MapPin,
  Shield,
  X,
} from "lucide-react";
import { Button, Card, UploadZone } from "../../components/shared";

const STEPS = [
  "파손 설명",
  "사진·영상 업로드",
  "서비스 센터 선택",
  "보험 선택",
];

const INSURANCE_POLICIES = [
  {
    id: 1,
    name: "Carrier Care",
    provider: "통신사 보험",
    coverage: "80%",
    deductible: "30,000원",
    active: true,
  },
  {
    id: 2,
    name: "프리미엄 카드 폰케어",
    provider: "신한카드 부가서비스",
    coverage: "60%",
    deductible: "50,000원",
    active: true,
  },
  {
    id: 3,
    name: "디지털 안심보험",
    provider: "삼성화재",
    coverage: "90%",
    deductible: "20,000원",
    active: false,
  },
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
  const [selectedSlot, setSelectedSlot] = useState("");
  const [selectedDate, setSelectedDate] = useState("2024-06-15");
  const [selectedPolicies, setSelectedPolicies] = useState([1]);

  const togglePolicy = (id) => {
    setSelectedPolicies((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  };

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const prev = () => setStep((s) => Math.max(s - 1, 0));

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
              파손 부위가 잘 보이는 사진 또는 영상을 업로드해주세요. (최소 1장
              이상)
            </p>
          </div>
          <UploadZone
            label="파손 사진 / 영상 드래그 또는 클릭"
            sublabel="JPG, PNG, MP4 · 장당 최대 50MB · S3 링크도 입력 가능"
          />

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
          {/* Mock uploaded images */}
          <div className="flex gap-2">
            {["파손1.jpg", "파손2.jpg"].map((f) => (
              <div
                key={f}
                className="relative w-20 h-20 rounded-xl bg-secondary border border-border flex items-center justify-center group"
              >
                <Image className="w-6 h-6 text-muted-foreground" />
                <p className="text-[10px] text-muted-foreground mt-1 absolute bottom-1 left-0 right-0 text-center">
                  {f}
                </p>
                <button className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <X className="w-2.5 h-2.5" />
                </button>
              </div>
            ))}
          </div>
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
          <div className="flex items-center gap-3 bg-secondary rounded-xl p-3.5 border border-border">
            <MapPin className="w-4 h-4 text-accent shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">
                강남 스마트케어
              </p>
              <p className="text-xs text-muted-foreground">
                서울 강남구 테헤란로 152 · 0.4km · ⭐ 4.9
              </p>
            </div>
            <button className="text-xs text-accent font-medium hover:underline">
              변경
            </button>
          </div>

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
          {INSURANCE_POLICIES.map((p) => {
            const checked = selectedPolicies.includes(p.id);
            return (
              <div
                key={p.id}
                onClick={() => p.active && togglePolicy(p.id)}
                className={`flex items-start gap-3 p-4 border rounded-xl transition-all ${
                  !p.active
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
                      {p.name}
                    </p>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent font-medium">
                      {p.coverage} 보장
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {p.provider}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    자기부담금: {p.deductible}
                  </p>
                </div>
                {!p.active && (
                  <Shield className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                )}
              </div>
            );
          })}
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
            <Button variant="accent" size="md">
              <CheckCircle2 className="w-4 h-4" />
              접수 제출 (RECEIVED)
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
