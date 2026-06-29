import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import {
  User,
  Lock,
  Settings2,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  Shield,
  Monitor,
  Smartphone,
  Globe,
} from "lucide-react";
import {
  getAdminProfile,
  updateAdminProfile,
  changeAdminPassword,
  getAdminLoginHistory,
} from "../../api/admin";
import { useAuth } from "../../contexts/AuthContext";
import { logout as logoutApi } from "../../api/auth";

// ── 유틸: User-Agent 문자열에서 브라우저·기기 간단 파싱 ──────────────────────

/**
 * User-Agent 문자열을 사람이 읽기 좋은 형태로 변환한다.
 * 서버에서 수집된 원본 User-Agent를 표시하기 위한 최소한의 파싱이다.
 *
 * @param {string} ua - User-Agent 헤더 값
 * @returns {{ browser: string, os: string, icon: string }}
 */
function parseUserAgent(ua) {
  if (!ua || ua === "unknown") return { browser: "알 수 없음", os: "", icon: "globe" };

  // 브라우저 판별 (순서 중요: Edge는 Chrome 포함하므로 먼저 체크)
  let browser = "기타";
  if (ua.includes("Edg/"))        browser = "Edge";
  else if (ua.includes("Chrome")) browser = "Chrome";
  else if (ua.includes("Safari")) browser = "Safari";
  else if (ua.includes("Firefox")) browser = "Firefox";
  else if (ua.includes("OPR") || ua.includes("Opera")) browser = "Opera";

  // OS 판별
  let os = "";
  if (ua.includes("Windows NT")) os = "Windows";
  else if (ua.includes("Mac OS X")) os = "macOS";
  else if (ua.includes("Android")) os = "Android";
  else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";
  else if (ua.includes("Linux")) os = "Linux";

  // 기기 유형에 따른 아이콘 키
  const isMobile = ua.includes("Mobile") || ua.includes("Android") || ua.includes("iPhone");
  const icon = isMobile ? "mobile" : "monitor";

  return { browser, os, icon };
}

/**
 * 접속 이력 날짜를 "YYYY.MM.DD HH:MM" 형식으로 변환한다.
 *
 * @param {string} isoString - ISO 8601 날짜 문자열 (LocalDateTime 직렬화)
 * @returns {string}
 */
function formatLoginAt(isoString) {
  if (!isoString) return "—";
  const d = new Date(isoString);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// ── 탭 설정 ────────────────────────────────────────────────────────────────────

const TABS = [
  { id: "profile",  label: "관리자 정보", icon: User     },
  { id: "security", label: "보안",        icon: Lock     },
  { id: "system",   label: "시스템 설정", icon: Settings2 },
];

// ── 입력 필드 공통 컴포넌트 ────────────────────────────────────────────────────

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}

function TextInput({ value, onChange, disabled, placeholder, type = "text" }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      disabled={disabled}
      placeholder={placeholder}
      className={`w-full px-3.5 py-2.5 text-sm border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all ${
        disabled
          ? "bg-secondary text-muted-foreground cursor-not-allowed border-border"
          : "bg-background border-border hover:border-accent/40"
      }`}
    />
  );
}

// ── 프로필 탭 ──────────────────────────────────────────────────────────────────

function ProfileTab() {
  const [profile, setProfile] = useState(null); // 서버에서 조회한 관리자 정보
  const [form, setForm]       = useState({ name: "", phoneNumber: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);

  // 컴포넌트 마운트 시 관리자 프로필 조회
  useEffect(() => {
    getAdminProfile()
      .then((res) => {
        const data = res.data.data;
        setProfile(data);
        // 폼 초기값을 서버 데이터로 세팅
        setForm({ name: data.name, phoneNumber: data.phoneNumber });
      })
      .catch(() => toast.error("프로필 정보를 불러오는 데 실패했습니다."))
      .finally(() => setLoading(false));
  }, []);

  // 폼 값 변경 핸들러
  const handleChange = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  // 저장 핸들러 — PATCH /api/admin/profile
  const handleSave = async () => {
    if (!form.name.trim()) { toast.error("이름을 입력해주세요."); return; }
    if (!form.phoneNumber.trim()) { toast.error("전화번호를 입력해주세요."); return; }

    setSaving(true);
    try {
      const res = await updateAdminProfile(form);
      const updated = res.data.data;
      setProfile(updated);
      setForm({ name: updated.name, phoneNumber: updated.phoneNumber });
      toast.success("프로필이 저장되었습니다.");
    } catch (err) {
      const msg = err.response?.data?.error?.message;
      toast.error(msg || "저장 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 gap-2 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm">불러오는 중...</span>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-5">
      <h3 className="text-sm font-semibold text-foreground">관리자 기본 정보</h3>
      <div className="grid md:grid-cols-2 gap-4">

        {/* 이름 — 수정 가능 */}
        <Field label="관리자 이름">
          <TextInput
            value={form.name}
            onChange={handleChange("name")}
            placeholder="관리자 이름"
          />
        </Field>

        {/* 이메일 — 로그인 식별자이므로 수정 불가 */}
        <Field label="이메일 (변경 불가)">
          <TextInput value={profile?.email ?? ""} disabled />
        </Field>

        {/* 전화번호 — 수정 가능 */}
        <Field label="전화번호">
          <TextInput
            value={form.phoneNumber}
            onChange={handleChange("phoneNumber")}
            placeholder="010-0000-0000"
          />
        </Field>

        {/* 계정 상태 — 표시 전용 */}
        <Field label="계정 상태">
          <div className="flex items-center gap-2 px-3.5 py-2.5 bg-secondary border border-border rounded-xl">
            <span className="text-xs px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-700/50 font-medium">
              ROLE_ADMIN
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-700/50 font-medium">
              {profile?.status === "ACTIVE" ? "활성" : profile?.status}
            </span>
          </div>
        </Field>
      </div>

      {/* 가입일 */}
      {profile?.createdAt && (
        <p className="text-xs text-muted-foreground">
          가입일: {new Date(profile.createdAt).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })}
        </p>
      )}

      <div className="flex items-center justify-end pt-2 border-t border-border">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-accent text-white hover:bg-accent/90 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
        >
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
          {saving ? "저장 중..." : "저장"}
        </button>
      </div>
    </div>
  );
}

// ── 비밀번호 변경 카드 ─────────────────────────────────────────────────────────

function PasswordCard({ onPasswordChanged }) {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    newPasswordConfirm: "",
  });
  const [show, setShow]     = useState({ current: false, new: false, confirm: false });
  const [saving, setSaving] = useState(false);

  // 입력 필드 변경
  const handleChange = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  // 비밀번호 표시 토글
  const toggleShow = (field) =>
    setShow((prev) => ({ ...prev, [field]: !prev[field] }));

  // 비밀번호 변경 제출 — 성공 시 로그아웃 처리
  const handleSubmit = async () => {
    // 클라이언트 사이드 기본 검증
    if (!form.currentPassword) { toast.error("현재 비밀번호를 입력해주세요."); return; }
    if (form.newPassword.length < 8) { toast.error("새 비밀번호는 8자 이상이어야 합니다."); return; }
    if (form.newPassword !== form.newPasswordConfirm) {
      toast.error("새 비밀번호와 확인 비밀번호가 일치하지 않습니다.");
      return;
    }

    setSaving(true);
    try {
      // PATCH /api/admin/profile/password — 204 No Content 응답
      await changeAdminPassword(form);
      toast.success("비밀번호가 변경되었습니다. 다시 로그인해주세요.");
      // 서버에서 기존 토큰을 무효화했으므로 클라이언트도 로그아웃 처리
      onPasswordChanged();
    } catch (err) {
      const code = err.response?.data?.error?.code;
      const msg  = err.response?.data?.error?.message;
      if (code === "WRONG_PASSWORD") {
        toast.error("현재 비밀번호가 올바르지 않습니다.");
      } else if (code === "PASSWORD_CONFIRM_MISMATCH") {
        toast.error("새 비밀번호와 확인 비밀번호가 일치하지 않습니다.");
      } else {
        toast.error(msg || "비밀번호 변경 중 오류가 발생했습니다.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-5">
      <div className="flex items-center gap-2">
        <Shield className="w-4 h-4 text-accent" />
        <h3 className="text-sm font-semibold text-foreground">비밀번호 변경</h3>
      </div>

      {/* 변경 후 강제 로그아웃 안내 */}
      <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/40 rounded-xl">
        <span className="text-[11px] text-amber-700 dark:text-amber-400 leading-relaxed">
          비밀번호 변경 후 보안을 위해 현재 세션이 즉시 종료되며 다시 로그인해야 합니다.
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {/* 현재 비밀번호 */}
        <Field label="현재 비밀번호">
          <div className="relative">
            <input
              type={show.current ? "text" : "password"}
              value={form.currentPassword}
              onChange={handleChange("currentPassword")}
              placeholder="현재 비밀번호 입력"
              className="w-full px-3.5 py-2.5 pr-10 text-sm bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all"
            />
            <button
              type="button"
              onClick={() => toggleShow("current")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {show.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </Field>

        {/* 새 비밀번호 */}
        <Field label="새 비밀번호 (8자 이상)">
          <div className="relative">
            <input
              type={show.new ? "text" : "password"}
              value={form.newPassword}
              onChange={handleChange("newPassword")}
              placeholder="새 비밀번호 입력"
              className="w-full px-3.5 py-2.5 pr-10 text-sm bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all"
            />
            <button
              type="button"
              onClick={() => toggleShow("new")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {show.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {/* 강도 힌트 */}
          {form.newPassword.length > 0 && (
            <p className={`text-[11px] mt-0.5 ${form.newPassword.length >= 8 ? "text-green-600 dark:text-green-400" : "text-red-500"}`}>
              {form.newPassword.length >= 8 ? "✓ 길이 충족" : `${8 - form.newPassword.length}자 더 필요`}
            </p>
          )}
        </Field>

        {/* 새 비밀번호 확인 */}
        <Field label="새 비밀번호 확인">
          <div className="relative">
            <input
              type={show.confirm ? "text" : "password"}
              value={form.newPasswordConfirm}
              onChange={handleChange("newPasswordConfirm")}
              placeholder="새 비밀번호 재입력"
              className="w-full px-3.5 py-2.5 pr-10 text-sm bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all"
            />
            <button
              type="button"
              onClick={() => toggleShow("confirm")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {show.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {/* 일치 여부 힌트 */}
          {form.newPasswordConfirm.length > 0 && (
            <p className={`text-[11px] mt-0.5 ${form.newPassword === form.newPasswordConfirm ? "text-green-600 dark:text-green-400" : "text-red-500"}`}>
              {form.newPassword === form.newPasswordConfirm ? "✓ 일치" : "불일치"}
            </p>
          )}
        </Field>
      </div>

      <button
        onClick={handleSubmit}
        disabled={saving}
        className="self-end flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-accent text-white hover:bg-accent/90 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
      >
        {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Lock className="w-3.5 h-3.5" />}
        {saving ? "변경 중..." : "비밀번호 변경"}
      </button>
    </div>
  );
}

// ── 접속 이력 카드 ─────────────────────────────────────────────────────────────

function LoginHistoryCard() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // 마운트 시 최근 접속 이력 조회 (최대 20건)
  useEffect(() => {
    getAdminLoginHistory()
      .then((res) => setHistory(res.data.data))
      .catch(() => toast.error("접속 이력을 불러오는 데 실패했습니다."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">최근 접속 이력</h3>
        <span className="text-xs text-muted-foreground">최근 20건</span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8 gap-2 text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-xs">불러오는 중...</span>
        </div>
      ) : history.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-8">
          접속 이력이 없습니다.
        </p>
      ) : (
        <div className="flex flex-col divide-y divide-border">
          {history.map((item, idx) => {
            const { browser, os, icon } = parseUserAgent(item.userAgent);
            const DeviceIcon = icon === "mobile" ? Smartphone : Monitor;

            return (
              <div key={idx} className="py-3 flex items-start gap-3">
                {/* 기기 아이콘 */}
                <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center shrink-0 mt-0.5">
                  <DeviceIcon className="w-3.5 h-3.5 text-muted-foreground" />
                </div>

                {/* 계정·환경 정보 */}
                <div className="flex-1 min-w-0">
                  {/* 이름 + 이메일 */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-foreground">
                      {item.name}
                    </span>
                    <span className="text-[11px] text-muted-foreground truncate">
                      {item.email}
                    </span>
                  </div>
                  {/* 브라우저·OS·IP */}
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {browser}{os ? ` / ${os}` : ""}&nbsp;&middot;&nbsp;<span className="font-mono">{item.ipAddress}</span>
                  </p>
                </div>

                {/* 성공/실패 배지 + 접속 일시 */}
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                      item.success
                        ? "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-700/50"
                        : "bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-700/50"
                    }`}
                  >
                    {item.success ? "성공" : "실패"}
                  </span>
                  <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                    {formatLoginAt(item.loginAt)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── 시스템 설정 탭 (UI 전용, 추후 API 연동 예정) ───────────────────────────────

function SystemTab() {
  return (
    <div className="flex flex-col gap-4">
      {/* 배치 설정 — 현재 읽기 전용 표시 */}
      <div className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">배치 설정</h3>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border">
            읽기 전용
          </span>
        </div>
        <div className="flex flex-col gap-0 text-sm">
          {[
            { label: "월말 정산 배치 실행 시각", value: "매월 말일 자정 (00:00 KST)" },
            { label: "플랫폼 수수료율",           value: "10%"                        },
            { label: "수수료 납부 기한",           value: "익월 5일"                   },
            { label: "배치 실패 시 알림 대상",     value: "admin@caremate.kr"          },
          ].map((s) => (
            <div key={s.label} className="flex justify-between items-center py-2.5 border-b border-border last:border-0">
              <span className="text-muted-foreground">{s.label}</span>
              <span className="font-medium text-foreground">{s.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 운영 파라미터 — 현재 읽기 전용 표시 */}
      <div className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">운영 파라미터</h3>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border">
            읽기 전용
          </span>
        </div>
        <div className="grid md:grid-cols-2 gap-3 text-sm">
          {[
            { label: "Access Token TTL", value: "30분"   },
            { label: "Refresh Token TTL", value: "7일"  },
            { label: "DLQ 재시도 횟수",  value: "3회"   },
            { label: "노쇼 판정 유예",    value: "2시간" },
          ].map((p) => (
            <div key={p.label} className="flex justify-between items-center py-2 px-3 bg-secondary rounded-xl">
              <span className="text-xs text-muted-foreground">{p.label}</span>
              <span className="text-xs font-semibold text-foreground">{p.value}</span>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-muted-foreground">
          운영 파라미터 변경은 application.yml 및 환경변수 수정 후 서버 재시작이 필요합니다.
        </p>
      </div>
    </div>
  );
}

// ── 메인 페이지 ──────────────────────────────────────────────────────────────

export default function AdminProfilePage() {
  const [tab, setTab]       = useState("profile");
  const [profile, setProfile] = useState(null); // 헤더 카드용 프로필 (최초 1회 로드)
  const { clearAuth }       = useAuth();
  const nav                 = useNavigate();

  // 헤더 카드에 이름·이메일 표시를 위한 초기 프로필 조회
  useEffect(() => {
    getAdminProfile()
      .then((res) => setProfile(res.data.data))
      .catch(() => {/* 헤더는 없어도 동작에 지장 없음 */});
  }, []);

  /**
   * 비밀번호 변경 성공 후 호출.
   * 서버가 기존 토큰을 무효화했으므로 클라이언트도 인증 정보를 초기화하고
   * 로그인 페이지로 이동한다.
   */
  const handlePasswordChanged = useCallback(async () => {
    try {
      await logoutApi(); // 서버에 로그아웃 알림 (이미 토큰이 무효화됐지만 명시적 호출)
    } catch {
      // 토큰이 무효화된 후라 401이 올 수 있음 — 무시하고 클라이언트 상태 정리
    } finally {
      clearAuth();
      nav("/", { replace: true });
    }
  }, [clearAuth, nav]);

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      {/* 페이지 제목 */}
      <div>
        <h1 className="text-xl font-semibold text-foreground">마이페이지</h1>
        <p className="text-sm text-muted-foreground mt-1">
          관리자 계정 정보 및 보안 설정을 관리합니다.
        </p>
      </div>

      {/* 프로필 요약 카드 — API에서 불러온 실제 정보 표시 */}
      <div className="bg-card border border-border rounded-2xl p-6 flex items-center gap-5">
        {/* 이니셜 아바타 */}
        <div className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-900/30 border-2 border-red-200 dark:border-red-700/50 flex items-center justify-center text-xl font-bold text-red-600 dark:text-red-400 shrink-0">
          {profile?.name ? profile.name.charAt(0) : "관"}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-base font-semibold text-foreground">
            {profile?.name ?? "로딩 중..."}
          </p>
          <p className="text-sm text-muted-foreground">{profile?.email ?? ""}</p>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className="text-xs px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-700/50 font-medium">
              ROLE_ADMIN
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-700/50 font-medium">
              활성
            </span>
          </div>
        </div>
      </div>

      {/* 탭 바 */}
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

      {/* 탭 콘텐츠 */}
      {tab === "profile"  && <ProfileTab />}
      {tab === "security" && (
        <div className="flex flex-col gap-4">
          <PasswordCard onPasswordChanged={handlePasswordChanged} />
          <LoginHistoryCard />
        </div>
      )}
      {tab === "system"   && <SystemTab />}
    </div>
  );
}
