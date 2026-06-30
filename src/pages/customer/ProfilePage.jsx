import { useState, useEffect } from "react";
import {
  User,
  Lock,
  Bell,
  Shield,
  CheckCircle2,
  Eye,
  EyeOff,
  Trash2,
  Loader2,
} from "lucide-react";
import { Card, Button, Input } from "../../components/shared";
import { getProfile, updateProfile, getInsurancePolicies } from "../../api/customerService";

const TABS = [
  { id: "profile", label: "프로필", icon: User },
  { id: "security", label: "보안", icon: Lock },
  { id: "notifications", label: "알림 설정", icon: Bell },
  { id: "insurance", label: "가입 보험 이력", icon: Shield },
];

const NOTIF_SETTINGS = [
  {
    key: "accepted",
    label: "A/S 접수 수락 알림",
    desc: "수리점에서 접수를 수락하면 알림을 받습니다.",
  },
  {
    key: "payment",
    label: "결제 요청 알림",
    desc: "수리 완료 후 결제 요청 시 알림을 받습니다.",
  },
  {
    key: "claim",
    label: "청구 패키지 생성 알림",
    desc: "보험 청구 패키지 생성 완료 시 알림을 받습니다.",
  },
  {
    key: "marketing",
    label: "마케팅 정보 수신",
    desc: "이벤트, 혜택 등 마케팅 정보를 받습니다.",
  },
];

export default function CustomerProfilePage() {
  const [tab, setTab] = useState("profile");
  const [saved, setSaved] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [notifs, setNotifs] = useState({
    accepted: true,
    payment: true,
    claim: true,
    marketing: false,
  });

  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState(null);

  const [policies, setPolicies] = useState([]);
  const [loadingPolicies, setLoadingPolicies] = useState(true);

  useEffect(() => {
    getProfile()
      .then(({ data }) => {
        setProfile(data.data);
        setName(data.data.name ?? "");
        setPhoneNumber(data.data.phoneNumber ?? "");
      })
      .catch(() => setProfileError("프로필 정보를 불러올 수 없습니다."))
      .finally(() => setLoadingProfile(false));

    getInsurancePolicies()
      .then(({ data }) => setPolicies(data.data ?? []))
      .catch(() => setPolicies([]))
      .finally(() => setLoadingPolicies(false));
  }, []);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    setProfileError(null);
    try {
      const { data } = await updateProfile({ name, phoneNumber });
      setProfile(data.data);
      handleSave();
    } catch (e) {
      setProfileError(
        e.response?.data?.error?.message || "저장에 실패했습니다.",
      );
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div>
        <h1 className="text-xl font-semibold text-foreground">마이페이지</h1>
        <p className="text-sm text-muted-foreground mt-1">
          계정 정보 및 설정을 관리하세요.
        </p>
      </div>

      {/* Profile header card */}
      <Card className="p-6 flex items-center gap-5">
        <div className="w-16 h-16 rounded-full bg-accent/10 border-2 border-accent/20 flex items-center justify-center text-2xl font-bold text-accent shrink-0">
          {(profile?.name || "?").slice(0, 1)}
        </div>
        <div className="flex-1">
          <p className="text-base font-semibold text-foreground">
            {loadingProfile ? "불러오는 중..." : (profile?.name ?? "-")}
          </p>
          <p className="text-sm text-muted-foreground">
            {profile?.email ?? "-"}
          </p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20 font-medium">
              일반 고객
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-700/50 font-medium">
              활성
            </span>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-all -mb-px ${
                tab === t.id
                  ? "border-accent text-accent"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Profile tab */}
      {tab === "profile" && (
        <Card className="p-6 flex flex-col gap-5">
          <h3 className="text-sm font-semibold text-foreground">기본 정보</h3>
          {loadingProfile ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-5 h-5 animate-spin text-accent" />
            </div>
          ) : (
            <>
              {profileError && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/50 rounded-xl text-xs text-red-700 dark:text-red-400">
                  {profileError}
                </div>
              )}
              <div className="grid md:grid-cols-2 gap-4">
                <Input label="이름" value={name} onChange={setName} />
                <Input label="이메일" value={profile?.email ?? ""} type="email" />
                <Input label="연락처" value={phoneNumber} onChange={setPhoneNumber} />
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-border">
                {saved && (
                  <span className="flex items-center gap-1.5 text-xs text-green-600 font-medium animate-in fade-in">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    저장 완료
                  </span>
                )}
                {!saved && <div />}
                <Button
                  variant="accent"
                  size="sm"
                  onClick={handleSaveProfile}
                  disabled={savingProfile}
                >
                  {savingProfile ? "저장 중..." : "변경사항 저장"}
                </Button>
              </div>
            </>
          )}
        </Card>
      )}

      {/* Security tab */}
      {tab === "security" && (
        <div className="flex flex-col gap-4">
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
                    placeholder="현재 비밀번호 입력"
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
              <Input
                label="새 비밀번호"
                placeholder="8자 이상, 영문+숫자+특수문자"
                type="password"
              />
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
          <Card className="p-6 flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-foreground">계정 보안</h3>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <div>
                <p className="text-sm font-medium text-foreground">
                  마지막 로그인
                </p>
                <p className="text-xs text-muted-foreground">
                  2024.06.13 14:22 · Chrome / macOS
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-red-600">계정 탈퇴</p>
                <p className="text-xs text-muted-foreground">
                  탈퇴 시 모든 데이터가 삭제됩니다.
                </p>
              </div>
              <Button variant="danger" size="xs">
                <Trash2 className="w-3 h-3" />
                탈퇴 신청
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Notifications tab */}
      {tab === "notifications" && (
        <Card className="p-6 flex flex-col gap-4">
          <h3 className="text-sm font-semibold text-foreground">알림 설정</h3>
          <div className="flex flex-col divide-y divide-border">
            {NOTIF_SETTINGS.map((n) => (
              <div
                key={n.key}
                className="flex items-center justify-between py-3.5"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {n.label}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {n.desc}
                  </p>
                </div>
                <button
                  onClick={() =>
                    setNotifs((prev) => ({ ...prev, [n.key]: !prev[n.key] }))
                  }
                  className={`relative w-10 h-5.5 rounded-full transition-colors shrink-0 ${notifs[n.key] ? "bg-accent" : "bg-border"}`}
                  style={{ width: 40, height: 22 }}
                >
                  <span
                    className="absolute top-0.5 left-0.5 w-4.5 h-4.5 bg-white rounded-full shadow-sm transition-all"
                    style={{
                      width: 18,
                      height: 18,
                      transform: notifs[n.key]
                        ? "translateX(18px)"
                        : "translateX(0)",
                    }}
                  />
                </button>
              </div>
            ))}
          </div>
          <Button
            variant="accent"
            size="sm"
            className="self-end"
            onClick={handleSave}
          >
            설정 저장
          </Button>
        </Card>
      )}

      {/* Insurance history tab */}
      {tab === "insurance" && (
        <Card className="p-6 flex flex-col gap-4">
          <h3 className="text-sm font-semibold text-foreground">
            가입 보험 이력
          </h3>
          {loadingPolicies ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-5 h-5 animate-spin text-accent" />
            </div>
          ) : policies.length === 0 ? (
            <p className="text-sm text-muted-foreground py-3">
              가입된 보험이 없습니다.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {policies.map((ins) => (
                <div
                  key={ins.id}
                  className={`flex items-center justify-between p-4 rounded-xl border ${ins.status !== "ACTIVE" ? "opacity-50 bg-muted" : "bg-secondary"} border-border`}
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {ins.productName} ({ins.providerName})
                    </p>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">
                      {ins.policyNumber}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {ins.startDate} ~ {ins.endDate}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium border ${
                      ins.status === "ACTIVE"
                        ? "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-700/50"
                        : "bg-muted text-muted-foreground border-border"
                    }`}
                  >
                    {ins.status === "ACTIVE" ? "활성" : ins.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
