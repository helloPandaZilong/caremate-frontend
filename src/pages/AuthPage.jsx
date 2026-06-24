import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { Shield, Eye, EyeOff, CheckCircle, Loader2, MapPin } from "lucide-react";
import { toast } from "sonner";
import { login, signupCustomer, signupShop, checkEmail as apiCheckEmail } from "../api/auth";
import { useAuth } from "../contexts/AuthContext";

// 로그인 성공 후 역할별 기본 이동 경로
const ROLE_REDIRECT = {
  CUSTOMER:    "/customer/dashboard",
  REPAIR_SHOP: "/shop/dashboard",
  ADMIN:       "/admin/dashboard",
};

export default function AuthPage() {
  const nav      = useNavigate();
  const location = useLocation();
  const { saveAuth } = useAuth();

  // ── 탭/모드 상태 ──────────────────────────────────────────────────────────────
  const [tab,    setTab]    = useState("customer"); // "customer" | "shop"
  const [mode,   setMode]   = useState("signin");   // "signin"   | "signup"
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  // ── 통합 폼 상태 ──────────────────────────────────────────────────────────────
  const [form, setForm] = useState({
    email:          "",
    password:       "",
    // 고객 회원가입 전용
    name:           "",
    phoneNumber:    "",
    // 수리점 회원가입 전용
    phone:          "",
    businessNumber: "",
    shopName:       "",
    address:        "",
    latitude:       "",
    longitude:      "",
  });

  // ── 이메일 중복 확인 상태 ─────────────────────────────────────────────────────
  const [emailChecked,      setEmailChecked]      = useState(false);
  const [emailDuplicated,   setEmailDuplicated]   = useState(false);
  const [emailCheckLoading, setEmailCheckLoading] = useState(false);
  const [geoLoading,        setGeoLoading]        = useState(false);

  // 필드 값 변경 핸들러 — 이메일 변경 시 중복 확인 결과 초기화
  const set = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (field === "email") {
      setEmailChecked(false);
      setEmailDuplicated(false);
    }
  };

  // 탭 변경 시 이메일 중복 확인 결과 초기화
  const handleTabChange = (newTab) => {
    setTab(newTab);
    setEmailChecked(false);
    setEmailDuplicated(false);
  };

  // ── 이메일 중복 확인 ──────────────────────────────────────────────────────────
  const handleCheckEmail = async () => {
    if (!form.email) return toast.error("이메일을 입력해주세요.");
    setEmailCheckLoading(true);
    try {
      const res         = await apiCheckEmail(form.email);
      const isDuplicated = res.data.data.isDuplicated;
      setEmailChecked(true);
      setEmailDuplicated(isDuplicated);
      isDuplicated
        ? toast.error("이미 사용 중인 이메일입니다.")
        : toast.success("사용 가능한 이메일입니다.");
    } catch {
      toast.error("이메일 확인 중 오류가 발생했습니다.");
    } finally {
      setEmailCheckLoading(false);
    }
  };

  // ── 브라우저 Geolocation으로 수리점 위치 자동 입력 ────────────────────────────
  const handleGeolocate = () => {
    if (!navigator.geolocation) {
      return toast.error("이 브라우저는 위치 정보를 지원하지 않습니다.");
    }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((prev) => ({
          ...prev,
          latitude:  String(pos.coords.latitude.toFixed(6)),
          longitude: String(pos.coords.longitude.toFixed(6)),
        }));
        setGeoLoading(false);
        toast.success("현재 위치가 입력되었습니다.");
      },
      () => {
        setGeoLoading(false);
        toast.error("위치 정보를 가져올 수 없습니다. 직접 입력해주세요.");
      }
    );
  };

  // ── 로그인 처리 ───────────────────────────────────────────────────────────────
  const handleLogin = async () => {
    if (!form.email || !form.password) {
      return toast.error("이메일과 비밀번호를 입력해주세요.");
    }
    setLoading(true);
    try {
      const res = await login({ email: form.email, password: form.password });
      const { accessToken, memberId, role, name } = res.data.data;

      // 인증 정보 전역 저장 (localStorage + Context)
      saveAuth(accessToken, { memberId, role, name, email: form.email });
      toast.success(`${name}님, 환영합니다!`);

      // 역할별 기본 대시보드로 고정 이동.
      // ProtectedRoute가 저장한 이전 경로(from)는 동일 역할 경로인 경우에만 복귀에 사용한다.
      // (예: ADMIN이 /customer 페이지를 방문했다가 로그인 시 /customer로 가는 경우를 방지)
      const ROLE_PREFIX = { CUSTOMER: '/customer', REPAIR_SHOP: '/shop', ADMIN: '/admin' };
      const prevPath = location.state?.from?.pathname;
      const prefix   = ROLE_PREFIX[role];
      const target   = (prevPath && prefix && prevPath.startsWith(prefix))
        ? prevPath
        : ROLE_REDIRECT[role] ?? '/customer/dashboard';
      nav(target, { replace: true });
    } catch (err) {
      const code = err.response?.data?.error?.code;
      if (code === "SHOP_NOT_APPROVED") {
        toast.error("수리점 가입 승인 대기 중입니다. 관리자 승인 후 이용 가능합니다.");
      } else if (code === "MEMBER_BLOCKED") {
        toast.error("이용이 제한된 계정입니다. 고객센터에 문의해주세요.");
      } else {
        toast.error("이메일 또는 비밀번호를 확인해주세요.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ── 고객 회원가입 처리 ────────────────────────────────────────────────────────
  const handleSignupCustomer = async () => {
    if (!form.email || !form.password || !form.name || !form.phoneNumber) {
      return toast.error("모든 필드를 입력해주세요.");
    }
    if (!emailChecked)    return toast.error("이메일 중복 확인을 완료해주세요.");
    if (emailDuplicated)  return toast.error("이미 사용 중인 이메일입니다.");

    setLoading(true);
    try {
      await signupCustomer({
        email:       form.email,
        password:    form.password,
        name:        form.name,
        phoneNumber: form.phoneNumber,
      });
      toast.success("회원가입이 완료되었습니다. 로그인해주세요.");
      setMode("signin");
    } catch (err) {
      const msg = err.response?.data?.error?.message || "회원가입 중 오류가 발생했습니다.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // ── 수리점 회원가입 처리 ──────────────────────────────────────────────────────
  const handleSignupShop = async () => {
    const requiredFields = [
      form.email, form.password, form.name, form.phone,
      form.businessNumber, form.shopName, form.address,
      form.latitude, form.longitude,
    ];
    if (requiredFields.some((v) => !v)) {
      return toast.error("모든 필드를 입력해주세요.");
    }
    if (!emailChecked)   return toast.error("이메일 중복 확인을 완료해주세요.");
    if (emailDuplicated) return toast.error("이미 사용 중인 이메일입니다.");

    setLoading(true);
    try {
      await signupShop({
        email:          form.email,
        password:       form.password,
        name:           form.name,
        phone:          form.phone,
        businessNumber: form.businessNumber,
        shopName:       form.shopName,
        address:        form.address,
        latitude:       Number(form.latitude),
        longitude:      Number(form.longitude),
      });
      toast.success("수리점 가입 신청이 완료되었습니다. 관리자 승인 후 로그인 가능합니다.");
      setMode("signin");
    } catch (err) {
      const msg = err.response?.data?.error?.message || "수리점 가입 중 오류가 발생했습니다.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // 제출 버튼 클릭 시 모드/탭에 따라 분기
  const handleSubmit = () => {
    if (mode === "signin")      return handleLogin();
    if (tab  === "customer")    return handleSignupCustomer();
    return handleSignupShop();
  };

  // ── 이메일 중복 확인 버튼 (회원가입 모드에서만 렌더링) ───────────────────────
  const emailCheckBtn = mode === "signup" && (
    <button
      type="button"
      onClick={handleCheckEmail}
      disabled={emailCheckLoading || !form.email}
      className={`px-3 py-2.5 text-xs font-medium rounded-xl whitespace-nowrap transition-all disabled:opacity-50 ${
        emailChecked && !emailDuplicated
          ? "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-700/50"
          : "bg-accent text-white hover:bg-accent/90"
      }`}
    >
      {emailCheckLoading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : emailChecked && !emailDuplicated ? (
        <span className="flex items-center gap-1">
          <CheckCircle className="w-3.5 h-3.5" />
          확인완료
        </span>
      ) : (
        "중복확인"
      )}
    </button>
  );

  return (
    <div
      className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-16"
      style={{ fontFamily: "'Noto Sans KR', 'DM Sans', sans-serif" }}
    >
      {/* 로고 */}
      <Link to="/" className="flex items-center gap-2.5 mb-8">
        <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
          <Shield className="w-4 h-4 text-white" />
        </div>
        <span
          className="text-lg font-semibold text-foreground tracking-tight"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          Care<span className="text-accent">Mate</span>
        </span>
      </Link>

      <div className="w-full max-w-md bg-card rounded-2xl shadow-lg border border-border overflow-hidden">
        {/* 로그인 / 회원가입 탭 토글 */}
        <div className="flex border-b border-border">
          {["signin", "signup"].map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 py-3.5 text-sm font-medium transition-all ${
                mode === m
                  ? "text-accent border-b-2 border-accent bg-accent/5"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {m === "signin" ? "로그인" : "회원가입"}
            </button>
          ))}
        </div>

        <div className="p-6 flex flex-col gap-5">
          {/* 회원 유형 선택 */}
          {mode === "signup" && (
              <div className="animate-in fade-in duration-200">
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  회원 유형 선택
                </p>
                <div className="flex gap-1 p-1 bg-secondary rounded-xl">
                  {[
                    { id: "customer", label: "일반 고객" },
                    { id: "shop",     label: "수리점 파트너" },
                  ].map((t) => (
                      <button
                          key={t.id}
                          onClick={() => handleTabChange(t.id)}
                          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                              tab === t.id
                                  ? "bg-card text-foreground shadow-sm"
                                  : "text-muted-foreground hover:text-foreground"
                          }`}
                      >
                        {t.label}
                      </button>
                  ))}
                </div>
              </div>
          )}

          {/* 공통 입력 필드: 이메일, 비밀번호 */}
          <div className="flex flex-col gap-3">
            {/* 이메일 */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">이메일</label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={form.email}
                  onChange={set("email")}
                  placeholder="example@caremate.kr"
                  className="flex-1 px-3.5 py-2.5 text-sm bg-secondary border border-border rounded-xl text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all"
                />
                {emailCheckBtn}
              </div>
            </div>

            {/* 비밀번호 */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">비밀번호</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={form.password}
                  onChange={set("password")}
                  placeholder="8자 이상 입력하세요"
                  className="w-full px-3.5 py-2.5 pr-10 text-sm bg-secondary border border-border rounded-xl text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* 로그인 모드: 비밀번호 찾기 링크 */}
            {mode === "signin" && (
              <div className="text-right">
                <a href="#" className="text-xs text-accent hover:underline">
                  비밀번호를 잊으셨나요?
                </a>
              </div>
            )}

            {/* 고객 회원가입 추가 필드: 이름, 휴대폰 번호 */}
            {mode === "signup" && tab === "customer" && (
              <>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-muted-foreground">이름</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={set("name")}
                    placeholder="홍길동"
                    className="px-3.5 py-2.5 text-sm bg-secondary border border-border rounded-xl text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-muted-foreground">휴대폰 번호</label>
                  <input
                    type="tel"
                    value={form.phoneNumber}
                    onChange={set("phoneNumber")}
                    placeholder="010-1234-5678"
                    className="px-3.5 py-2.5 text-sm bg-secondary border border-border rounded-xl text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all"
                  />
                </div>
              </>
            )}
          </div>

          {/* 수리점 파트너 추가 정보 (회원가입 모드에서만 표시) */}
          {tab === "shop" && mode === "signup" && (
            <div className="flex flex-col gap-3 pt-2 border-t border-dashed border-border animate-in fade-in slide-in-from-top-2 duration-200">
              <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 text-[10px]">
                  +
                </span>
                수리점 파트너 추가 정보
              </p>

              {/* 담당자 이름 */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground">담당자 이름</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={set("name")}
                  placeholder="홍길동"
                  className="px-3.5 py-2.5 text-sm bg-secondary border border-border rounded-xl text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all"
                />
              </div>

              {/* 담당자 연락처 */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground">담당자 연락처</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={set("phone")}
                  placeholder="010-1234-5678"
                  className="px-3.5 py-2.5 text-sm bg-secondary border border-border rounded-xl text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all"
                />
              </div>

              {/* 사업자 번호 */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground">사업자 번호</label>
                <input
                  type="text"
                  value={form.businessNumber}
                  onChange={set("businessNumber")}
                  placeholder="000-00-00000"
                  className="px-3.5 py-2.5 text-sm bg-secondary border border-border rounded-xl text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all"
                />
              </div>

              {/* 지점명 */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground">지점명</label>
                <input
                  type="text"
                  value={form.shopName}
                  onChange={set("shopName")}
                  placeholder="예: 강남 스마트폰 수리센터"
                  className="px-3.5 py-2.5 text-sm bg-secondary border border-border rounded-xl text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all"
                />
              </div>

              {/* 주소 */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground">주소</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={set("address")}
                  placeholder="서울시 강남구 테헤란로 123"
                  className="px-3.5 py-2.5 text-sm bg-secondary border border-border rounded-xl text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all"
                />
              </div>

              {/* 위치 좌표 — 현재 위치 버튼으로 자동 입력 또는 직접 입력 */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-muted-foreground">위치 좌표</label>
                  <button
                    type="button"
                    onClick={handleGeolocate}
                    disabled={geoLoading}
                    className="flex items-center gap-1 text-xs text-accent hover:underline disabled:opacity-50 transition-opacity"
                  >
                    {geoLoading
                      ? <Loader2 className="w-3 h-3 animate-spin" />
                      : <MapPin className="w-3 h-3" />
                    }
                    현재 위치 사용
                  </button>
                </div>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={form.latitude}
                    onChange={set("latitude")}
                    placeholder="위도 (37.5665)"
                    step="0.000001"
                    className="flex-1 px-3.5 py-2.5 text-sm bg-secondary border border-border rounded-xl text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all"
                  />
                  <input
                    type="number"
                    value={form.longitude}
                    onChange={set("longitude")}
                    placeholder="경도 (126.978)"
                    step="0.000001"
                    className="flex-1 px-3.5 py-2.5 text-sm bg-secondary border border-border rounded-xl text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 제출 버튼 */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent/90 active:scale-[0.99] transition-all shadow-lg shadow-accent/25 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {mode === "signin" ? "로그인" : "회원가입"}
          </button>

          {/* 구분선 */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border/40" />
            <span className="text-xs text-muted-foreground">또는</span>
            <div className="flex-1 h-px bg-border/40" />
          </div>

          {/* 소셜 로그인 버튼 (추후 연동 예정) */}
          <div className="flex gap-2">
            {["카카오", "네이버", "Google"].map((s) => (
              <button
                key={s}
                className="flex-1 py-2.5 text-xs font-medium border border-border rounded-xl hover:bg-secondary transition-colors text-muted-foreground"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      <p className="mt-6 text-xs text-muted-foreground">
        {mode === "signin" ? "아직 계정이 없으신가요?" : "이미 계정이 있으신가요?"}{" "}
        <button
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="text-accent hover:underline font-medium"
        >
          {mode === "signin" ? "회원가입" : "로그인"}
        </button>
      </p>
    </div>
  );
}
