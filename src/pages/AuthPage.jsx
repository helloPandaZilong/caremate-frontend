import { useState, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { Eye, EyeOff, CheckCircle, Loader2, MapPin, Sun, Moon, Search, X, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { login, signupCustomer, signupShop, checkEmail as apiCheckEmail, getGoogleAuthUrl } from "../api/auth";
import { useAuth } from "../contexts/AuthContext";
import { useDarkMode } from "../hooks/useDarkMode";
import caremateLogo from "../assets/caremate-logo.png";

// ── 주소 검색 (백엔드 프록시 경유 — API 키 서버 보관) ───────────────────────
async function searchKakaoAddress(query) {
  const res = await fetch(`/api/address/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error("API_ERROR");
  const data = await res.json();
  // 백엔드 응답 구조: { data: { data: AddressResult[] } }
  return data?.data ?? [];
}

function AddressSearchModal({ onSelect, onClose }) {
  const [query, setQuery]     = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError]     = useState(null);
  const inputRef = useRef(null);

  const handleSearch = async () => {
    const q = query.trim();
    if (!q) return;
    setLoading(true);
    setError(null);
    setSearched(false);
    try {
      const docs = await searchKakaoAddress(q);
      setResults(docs);
      setSearched(true);
    } catch (e) {
      setError("주소 검색 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (doc) => {
    // 백엔드 AddressResult DTO: { roadAddress, jibunAddress, latitude, longitude }
    const address = doc.roadAddress ?? doc.jibunAddress ?? "";
    onSelect({ address, latitude: doc.latitude, longitude: doc.longitude });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg mx-4 bg-card border border-border rounded-2xl shadow-2xl flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/40">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <MapPin className="w-4 h-4 text-accent" /> 주소 검색
          </h3>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 검색 입력 */}
        <div className="px-5 py-4 border-b border-border/40">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
              <input
                ref={inputRef}
                autoFocus
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="도로명, 지번, 건물명으로 검색 (예: 강남구 테헤란로 123)"
                className="w-full pl-9 pr-3 py-2.5 text-sm bg-secondary border border-border rounded-xl text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={loading || !query.trim()}
              className="px-4 py-2.5 text-sm font-medium rounded-xl bg-accent text-white hover:bg-accent/90 disabled:opacity-50 transition-all whitespace-nowrap flex items-center gap-1.5"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
              검색
            </button>
          </div>
          <p className="text-[11px] text-muted-foreground/60 mt-2 pl-1">
            주소를 입력하고 검색 버튼을 누르거나 Enter를 입력하세요.
          </p>
        </div>

        {/* 결과 목록 */}
        <div className="flex-1 overflow-y-auto">
          {error ? (
            <div className="px-5 py-8 text-center">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-3">
                <X className="w-5 h-5 text-red-500" />
              </div>
              <p className="text-sm text-red-500 whitespace-pre-line">{error}</p>
            </div>
          ) : loading ? (
            <div className="px-5 py-12 text-center text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
              <p className="text-sm">주소를 검색하는 중...</p>
            </div>
          ) : searched && results.length === 0 ? (
            <div className="px-5 py-12 text-center text-muted-foreground">
              <MapPin className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm font-medium">검색 결과가 없습니다</p>
              <p className="text-xs mt-1 opacity-70">다른 검색어로 다시 시도해보세요.</p>
            </div>
          ) : results.length > 0 ? (
            <ul className="divide-y divide-border/30">
              {results.map((doc, idx) => {
                // 백엔드 AddressResult DTO: { roadAddress, jibunAddress, latitude, longitude }
                const primaryAddr   = doc.roadAddress ?? doc.jibunAddress ?? "";
                const secondaryAddr = doc.roadAddress ? doc.jibunAddress : null;
                return (
                  <li key={idx}>
                    <button
                      onClick={() => handleSelect(doc)}
                      className="w-full text-left px-5 py-3.5 hover:bg-secondary/60 transition-colors group flex items-start justify-between gap-3"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{primaryAddr}</p>
                        {secondaryAddr && (
                          <p className="text-xs text-muted-foreground truncate mt-0.5">{secondaryAddr}</p>
                        )}
                        <p className="text-[11px] text-muted-foreground/50 mt-1 font-mono">
                          위도 {doc.latitude} / 경도 {doc.longitude}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors mt-0.5 shrink-0" />
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="px-5 py-12 text-center text-muted-foreground">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">검색어를 입력하고 검색하세요.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

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
  const { dark, toggle } = useDarkMode();

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

  // ── 주소 검색 모달 상태 ───────────────────────────────────────────────────────
  const [addrModalOpen, setAddrModalOpen] = useState(false);

  // 주소 선택 시 form 에 address + 좌표 자동 기입
  const handleAddressSelect = ({ address, latitude, longitude }) => {
    setForm((prev) => ({ ...prev, address, latitude, longitude }));
  };

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

  // ── Google 로그인 처리 ───────────────────────────────────────────────────────
  /**
   * Google Authorization Code Flow 시작.
   *
   * 1. 백엔드에서 Google 인증 URL과 CSRF state를 받는다.
   * 2. state를 sessionStorage에 저장한다 (콜백 페이지에서 CSRF 검증에 사용).
   * 3. Google 동의 화면으로 브라우저를 리다이렉트한다.
   *
   * 이후 처리는 /auth/callback 라우트의 OAuthCallbackPage에서 계속된다.
   */
  const handleGoogleLogin = async () => {
    try {
      // 현재 Origin 기반의 콜백 URL — Google Cloud Console 승인된 리다이렉트 URI와 일치해야 함
      const redirectUri = `${window.location.origin}/auth/callback`
      const res = await getGoogleAuthUrl(redirectUri)
      const { authorizationUrl, state } = res.data.data

      // CSRF 방지용 state를 sessionStorage에 저장 (OAuthCallbackPage에서 비교)
      sessionStorage.setItem('oauth2State', state)

      // Google 동의 화면으로 이동 — React Router가 아닌 전체 페이지 이동
      window.location.href = authorizationUrl
    } catch {
      toast.error('Google 로그인을 시작할 수 없습니다. 잠시 후 다시 시도해주세요.')
    }
  }

  // ── 로그인 처리 ───────────────────────────────────────────────────────────────
  const handleLogin = async () => {
    if (!form.email || !form.password) {
      return toast.error("이메일과 비밀번호를 입력해주세요.");
    }
    setLoading(true);
    try {
      const res = await login({ email: form.email, password: form.password });
      const { accessToken, memberId, role, name, phoneNumber } = res.data.data;

      // 인증 정보 전역 저장 (localStorage + Context)
      // phoneNumber는 소셜 가입자 온보딩 판별용 — 일반 로그인은 항상 값이 있음
      saveAuth(accessToken, { memberId, role, name, email: form.email, phoneNumber });
      toast.success(`${name}님, 환영합니다!`);

      // 역할별 기본 대시보드로 이동
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
        toast.error("차단된 계정입니다! 관리자측으로 문의하세요.");
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
    if (mode === "signin")   return handleLogin();
    if (tab  === "customer") return handleSignupCustomer();
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
      {/* 주소 검색 모달 */}
      {addrModalOpen && (
        <AddressSearchModal
          onSelect={handleAddressSelect}
          onClose={() => setAddrModalOpen(false)}
        />
      )}
      {/* 다크모드 토글 — 우상단 고정 */}
      <button
        onClick={toggle}
        title={dark ? "라이트 모드" : "다크 모드"}
        className="fixed top-4 right-4 z-50 p-2.5 rounded-xl bg-card border border-border shadow-md hover:bg-secondary transition-colors"
      >
        {dark
          ? <Sun className="w-4 h-4 text-amber-500" />
          : <Moon className="w-4 h-4 text-muted-foreground" />
        }
      </button>
      {/* 로고 */}
      <Link to="/" className="flex items-center gap-2.5 mb-8">
        <img src={caremateLogo} alt="CareMate" className="w-8 h-8 object-contain shrink-0" />
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

        <form
          className="p-6 flex flex-col gap-5"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          {/* 회원 유형 선택 (회원가입 모드에서만) */}
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
                    type="button"
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

            {/* 고객 회원가입 추가 필드 */}
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

          {/* 수리점 파트너 추가 정보 */}
          {tab === "shop" && mode === "signup" && (
            <div className="flex flex-col gap-3 pt-2 border-t border-dashed border-border animate-in fade-in slide-in-from-top-2 duration-200">
              <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 text-[10px]">
                  +
                </span>
                수리점 파트너 추가 정보
              </p>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground">담당자 이름</label>
                <input type="text" value={form.name} onChange={set("name")} placeholder="홍길동"
                  className="px-3.5 py-2.5 text-sm bg-secondary border border-border rounded-xl text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground">담당자 연락처</label>
                <input type="tel" value={form.phone} onChange={set("phone")} placeholder="010-1234-5678"
                  className="px-3.5 py-2.5 text-sm bg-secondary border border-border rounded-xl text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground">사업자 번호</label>
                <input type="text" value={form.businessNumber} onChange={set("businessNumber")} placeholder="000-00-00000"
                  className="px-3.5 py-2.5 text-sm bg-secondary border border-border rounded-xl text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground">지점명</label>
                <input type="text" value={form.shopName} onChange={set("shopName")} placeholder="예: 강남 스마트폰 수리센터"
                  className="px-3.5 py-2.5 text-sm bg-secondary border border-border rounded-xl text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground">주소</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={form.address}
                    onChange={set("address")}
                    placeholder="주소 검색 버튼으로 선택하세요"
                    readOnly
                    className="flex-1 min-w-0 px-3.5 py-2.5 text-sm bg-secondary border border-border rounded-xl text-foreground placeholder:text-muted-foreground/40 cursor-default focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setAddrModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium rounded-xl bg-accent text-white hover:bg-accent/90 transition-all whitespace-nowrap shrink-0"
                  >
                    <Search className="w-3.5 h-3.5" />
                    주소 검색
                  </button>
                </div>
                {form.address && (
                  <button
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, address: "", latitude: "", longitude: "" }))}
                    className="self-start flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="w-3 h-3" /> 주소 초기화
                  </button>
                )}
              </div>

              {/* 위치 좌표 — 주소 검색으로 자동 기입, 수동 보정 가능 */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-muted-foreground">
                    위치 좌표
                    {form.latitude && form.longitude && (
                      <span className="ml-1.5 text-[10px] text-green-600 dark:text-green-400 font-normal">
                        ✓ 자동 입력됨
                      </span>
                    )}
                  </label>
                  <button type="button" onClick={handleGeolocate} disabled={geoLoading}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-accent transition-colors disabled:opacity-50">
                    {geoLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <MapPin className="w-3 h-3" />}
                    현재 위치 사용
                  </button>
                </div>
                {/* 위도·경도 2열 — 주소 검색 시 자동 기입, 직접 수정도 가능 */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] text-muted-foreground/70 pl-0.5">위도 (latitude)</span>
                    <input
                      type="number"
                      value={form.latitude}
                      onChange={set("latitude")}
                      placeholder="37.5665"
                      step="0.000001"
                      className={`w-full min-w-0 px-3 py-2.5 text-sm border rounded-xl text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${
                        form.latitude
                          ? "bg-green-50/50 dark:bg-green-900/10 border-green-200 dark:border-green-700/40"
                          : "bg-secondary border-border"
                      }`}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] text-muted-foreground/70 pl-0.5">경도 (longitude)</span>
                    <input
                      type="number"
                      value={form.longitude}
                      onChange={set("longitude")}
                      placeholder="126.9780"
                      step="0.000001"
                      className={`w-full min-w-0 px-3 py-2.5 text-sm border rounded-xl text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${
                        form.longitude
                          ? "bg-green-50/50 dark:bg-green-900/10 border-green-200 dark:border-green-700/40"
                          : "bg-secondary border-border"
                      }`}
                    />
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground/50 pl-0.5">
                  주소 검색 시 자동 입력됩니다. 필요시 직접 수정할 수 있습니다.
                </p>
              </div>
            </div>
          )}

          {/* 제출 버튼 — type="submit"으로 폼의 Enter 키 제출을 받는다 */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent/90 active:scale-[0.99] transition-all shadow-lg shadow-accent/25 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {mode === "signin" ? "로그인" : "회원가입"}
          </button>

          {/*
            Google 로그인 버튼 — Google 브랜드 가이드라인 준수
            https://developers.google.com/identity/branding-guidelines

            규칙:
            - 반드시 Google의 공식 G 로고(4색) 표시
            - 버튼 텍스트: "Sign in with Google" / "Continue with Google" 중 하나
              (한국어: "Google로 계속하기" / "Google 계정으로 로그인")
            - 배경: 흰색(#fff) + 테두리(#dadce0) 또는 Google Blue(#4285F4)
            - 최소 높이: 40px
            - 로그인 모드에서만 표시 (회원가입에는 소셜 가입 불필요)
          */}
          {mode === 'signin' && (
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-4 rounded-lg border bg-white text-[#3c4043] text-sm font-medium transition-all disabled:opacity-60 disabled:cursor-not-allowed hover:bg-[#f8f9fa] hover:shadow-sm active:bg-[#f1f3f4]"
              style={{
                height: '40px',                    // Google 최소 높이 요건
                borderColor: '#dadce0',            // Google 공식 테두리 색상
                fontFamily: "'Roboto', 'Noto Sans KR', sans-serif", // Google 권장 폰트
                letterSpacing: '0.01em',
              }}
            >
              {/* Google 공식 4색 G 로고 SVG */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="18"
                height="18"
                aria-hidden="true"
              >
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              {/* Google 브랜드 가이드라인 허용 텍스트 — 한국어 동일 의미 */}
              Google 로그인
            </button>
          )}
        </form>
      </div>

      <p className="mt-6 text-xs text-muted-foreground">
        {mode === "signin" ? "아직 계정이 없으신가요?" : "이미 계정이 있으신가요?"}{" "}
        <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="text-accent hover:underline font-medium">
          {mode === "signin" ? "회원가입" : "로그인"}
        </button>
      </p>
    </div>
  );
}
