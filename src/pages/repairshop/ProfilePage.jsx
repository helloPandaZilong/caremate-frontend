import { useState, useEffect } from "react";
import {
  Store,
  Clock,
  Lock,
  CheckCircle2,
  Eye,
  EyeOff,
  ShieldCheck,
  Trophy,
  GraduationCap,
} from "lucide-react";
import { Card, Button, Input } from "../../components/shared";
import {
  getShopProfile,
  updateShopProfile,
  getOperatingHours,
  updateOperatingHours,
} from "../../api/repairshopApi";

function GraduationCapIcon() {
  return (
    <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
      <GraduationCap className="w-4 h-4 text-muted-foreground" />
    </div>
  );
}

const TABS = [
  { id: "shop", label: "매장 정보", icon: Store },
  { id: "hours", label: "운영시간", icon: Clock },
  { id: "security", label: "보안", icon: Lock },
];

const DAYS = ["월", "화", "수", "목", "금", "토", "일"];

const DEFAULT_HOURS = {
  월: { open: "09:00", close: "20:00", closed: false },
  화: { open: "09:00", close: "20:00", closed: false },
  수: { open: "09:00", close: "20:00", closed: false },
  목: { open: "09:00", close: "20:00", closed: false },
  금: { open: "09:00", close: "20:00", closed: false },
  토: { open: "10:00", close: "18:00", closed: false },
  일: { open: "10:00", close: "17:00", closed: true },
};

// 요일 인덱스 매핑 (백엔드: 0=일, 1=월, ... , 6=토)
const DAY_TO_INDEX = { 일: 0, 월: 1, 화: 2, 수: 3, 목: 4, 금: 5, 토: 6 };

export default function ShopProfilePage() {
  const [tab, setTab] = useState("shop");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [hours, setHours] = useState(DEFAULT_HOURS);
  const [hoursNotSaved, setHoursNotSaved] = useState(false);
  const [profile, setProfile] = useState({
    shopName: "강남 스마트케어",
    ownerName: "박기술",
    phone: "02-1234-5678",
    businessNo: "123-45-67890",
    address: "서울특별시 강남구 테헤란로 152",
  });
  const lmsDone = localStorage.getItem("caremate-shop-lms") === "done";

  // 프로필 & 운영시간 로드
  useEffect(() => {
    getShopProfile()
      .then((d) => {
        if (d) setProfile((p) => ({
          ...p,
          shopName: d.shopName ?? p.shopName,
          phone: d.phone ?? p.phone,
          businessNo: d.businessNumber ?? p.businessNo,
          address: d.address ?? p.address,
          latitude: d.latitude ?? p.latitude,
          longitude: d.longitude ?? p.longitude,
          joinedAt: d.joinedAt ?? p.joinedAt,
        }));
      })
      .catch(() => {});

    getOperatingHours()
      .then((data) => {
        const list = data?.hours ?? data ?? [];
        if (!list.length) { setHoursNotSaved(true); return; }
        const next = { ...DEFAULT_HOURS };
        list.forEach((row) => {
          const dayName = DAYS[row.dayOfWeek === 0 ? 6 : row.dayOfWeek - 1]; // 월=1→index0
          if (dayName) {
            next[dayName] = {
              open: row.openTime ?? "09:00",
              close: row.closeTime ?? "18:00",
              closed: row.isClosed ?? false,
            };
          }
        });
        setHours(next);
      })
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (tab === "shop") {
        await updateShopProfile({
          shopName: profile.shopName,
          address: profile.address,
          phone: profile.phone,
          latitude: profile.latitude ?? null,
          longitude: profile.longitude ?? null,
        });
      } else if (tab === "hours") {
        const hoursPayload = {
          hours: DAYS.map((day) => ({
            dayOfWeek: DAY_TO_INDEX[day],
            openTime: hours[day].closed ? null : hours[day].open,
            closeTime: hours[day].closed ? null : hours[day].close,
            isClosed: hours[day].closed,
          })),
        };
        await updateOperatingHours(hoursPayload);
        setHoursNotSaved(false);
        window.dispatchEvent(new Event('hours-saved'));
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      alert("저장 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const updateHour = (day, field, value) => {
    setHours((prev) => ({ ...prev, [day]: { ...prev[day], [field]: value } }));
  };

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div>
        <h1 className="text-xl font-semibold text-foreground">매장 프로필</h1>
        <p className="text-sm text-muted-foreground mt-1">
          매장 정보 및 계정을 관리하세요.
        </p>
      </div>

      {/* Shop header card */}
      <Card className="p-6 flex items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-900/30 border-2 border-amber-200 dark:border-amber-700/50 flex items-center justify-center shrink-0">
          <Store className="w-8 h-8 text-amber-600 dark:text-amber-400" />
        </div>
        <div className="flex-1">
          <p className="text-base font-semibold text-foreground">
            {profile.shopName}
          </p>
          <p className="text-sm text-muted-foreground">shop@caremate.kr</p>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-700/50 font-medium">
              수리점 파트너
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-700/50 font-medium">
              승인됨
            </span>
          </div>
        </div>
        <div className="text-right text-xs text-muted-foreground">
          <p>사업자번호: {profile.businessNo ?? '-'}</p>
          <p className="mt-0.5">가입일: {profile.joinedAt ?? '-'}</p>
        </div>
      </Card>

      {/* LMS 수료 인증마크 */}
      {lmsDone ? (
        <div className="flex items-center gap-4 p-5 rounded-2xl border-2 border-amber-300 dark:border-amber-600 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/15">
          <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shrink-0">
            <Trophy className="w-6 h-6 text-amber-500" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-bold text-amber-900 dark:text-amber-300">
                CareMate 필수 교육 수료 인증
              </p>
              <span className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-700/50">
                <ShieldCheck className="w-3 h-3" />
                인증 완료
              </span>
            </div>
            <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
              수리 리포트 작성 기준 · 플랫폼 A/S 처리 절차 — 2종 모두 수료 완료
            </p>
          </div>
          <div className="shrink-0 text-right text-xs text-amber-700 dark:text-amber-400">
            <p className="font-mono font-semibold">LMS-CERT</p>
            <p className="opacity-60 mt-0.5">2024.06.13</p>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 p-4 rounded-2xl border border-dashed border-border bg-secondary/50">
          <GraduationCapIcon />
          <div>
            <p className="text-sm font-medium text-foreground">
              LMS 필수 교육 미수료
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              교육 수료 후 이 자리에 인증마크가 표시됩니다.
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-all -mb-px ${tab === t.id ? "border-accent text-accent" : "border-transparent text-muted-foreground hover:text-foreground"}`}
            >
              <Icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Shop info */}
      {tab === "shop" && (
        <Card className="p-6 flex flex-col gap-5">
          <h3 className="text-sm font-semibold text-foreground">매장 프로필</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <Input label="지점명" value={profile.shopName} onChange={(val) => setProfile((p) => ({ ...p, shopName: val }))} />
            <Input label="대표자명" value={profile.ownerName} onChange={(val) => setProfile((p) => ({ ...p, ownerName: val }))} />
            <Input label="연락처" value={profile.phone} onChange={(val) => setProfile((p) => ({ ...p, phone: val }))} />
            <Input label="사업자번호" value={profile.businessNo} onChange={(val) => setProfile((p) => ({ ...p, businessNo: val }))} />
            <div className="col-span-2">
              <Input label="주소" value={profile.address} onChange={(val) => setProfile((p) => ({ ...p, address: val }))} />
            </div>
            <div className="col-span-2 flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                취급 브랜드
              </label>
              <div className="flex flex-wrap gap-2">
                {["Apple", "Samsung", "Google", "LG", "기타"].map((b) => (
                  <label
                    key={b}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-lg text-xs cursor-pointer hover:border-accent/40 has-[:checked]:border-accent has-[:checked]:bg-accent/5 has-[:checked]:text-accent transition-all"
                  >
                    <input
                      type="checkbox"
                      defaultChecked={["Apple", "Samsung"].includes(b)}
                      className="accent-accent w-3 h-3"
                    />
                    {b}
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-border">
            {saved ? (
              <span className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                저장 완료
              </span>
            ) : (
              <div />
            )}
            <Button variant="accent" size="sm" onClick={handleSave} disabled={saving}>
              {saving ? "저장 중..." : "변경사항 저장"}
            </Button>
          </div>
        </Card>
      )}

      {/* Operating hours */}
      {tab === "hours" && hoursNotSaved && (
        <div className="flex items-start gap-2 px-4 py-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm">
          <span className="mt-0.5">⚠️</span>
          <span>운영시간이 아직 저장되어 있지 않습니다. 아래 시간을 확인하고 <strong>저장</strong>을 눌러주세요. 저장 전에는 고객이 예약할 수 없습니다.</span>
        </div>
      )}
      {tab === "hours" && (
        <Card className="p-6 flex flex-col gap-4">
          <h3 className="text-sm font-semibold text-foreground">
            요일별 운영시간
          </h3>
          <div className="flex flex-col gap-3">
            {DAYS.map((day) => {
              const s = hours[day];
              return (
                <div
                  key={day}
                  className={`flex items-center gap-4 py-2.5 border-b border-border last:border-0 ${s.closed ? "opacity-50" : ""}`}
                >
                  <span className="text-sm font-semibold text-foreground w-4 shrink-0">
                    {day}
                  </span>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={s.closed}
                      onChange={(e) =>
                        updateHour(day, "closed", e.target.checked)
                      }
                      className="accent-accent w-3.5 h-3.5"
                    />
                    <span className="text-xs text-muted-foreground">휴무</span>
                  </label>
                  {!s.closed && (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="time"
                        value={s.open}
                        onChange={(e) =>
                          updateHour(day, "open", e.target.value)
                        }
                        className="px-3 py-1.5 text-sm bg-secondary border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all"
                      />
                      <span className="text-muted-foreground text-sm">~</span>
                      <input
                        type="time"
                        value={s.close}
                        onChange={(e) =>
                          updateHour(day, "close", e.target.value)
                        }
                        className="px-3 py-1.5 text-sm bg-secondary border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all"
                      />
                    </div>
                  )}
                  {s.closed && (
                    <span className="text-xs text-muted-foreground ml-2">
                      휴무일
                    </span>
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-border">
            {saved ? (
              <span className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                저장 완료
              </span>
            ) : (
              <div />
            )}
            <Button variant="accent" size="sm" onClick={handleSave}>
              운영시간 저장
            </Button>
          </div>
        </Card>
      )}

      {/* Security */}
      {tab === "security" && (
        <Card className="p-6 flex flex-col gap-5">
          <h3 className="text-sm font-semibold text-foreground">
            비밀번호 변경
          </h3>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                현재 비밀번호
              </label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  placeholder="현재 비밀번호"
                  className="w-full px-3.5 py-2.5 pr-10 text-sm bg-secondary border border-border rounded-xl text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all"
                />
                <button
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPw ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
            <Input label="새 비밀번호" type="password" />
            <Input label="새 비밀번호 확인" type="password" />
          </div>
          <Button
            variant="accent"
            size="sm"
            className="self-end"
            onClick={handleSave}
          >
            비밀번호 변경
          </Button>
        </Card>
      )}
    </div>
  );
}
