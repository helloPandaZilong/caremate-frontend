import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Shield, Eye, EyeOff, Upload, CheckCircle } from "lucide-react";

export default function AuthPage() {
  const nav = useNavigate();
  const [tab, setTab] = useState("customer");
  const [mode, setMode] = useState("signin");
  const [showPw, setShowPw] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [verified, setVerified] = useState(false);

  const handleSubmit = () => {
    if (tab === "shop") nav("/shop/dashboard");
    else nav("/customer/dashboard");
  };

  return (
    <div
      className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-16"
      style={{ fontFamily: "'Noto Sans KR', 'DM Sans', sans-serif" }}
    >
      {/* Logo */}
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
        {/* Mode toggle */}
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
          {/* Role tab toggle */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">
              회원 유형 선택
            </p>
            <div className="flex gap-1 p-1 bg-secondary rounded-xl">
              {[
                { id: "customer", label: "일반 고객" },
                { id: "shop", label: "수리점 파트너" },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
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

          {/* Common fields */}
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                이메일
              </label>
              <input
                type="email"
                placeholder="example@caremate.kr"
                className="px-3.5 py-2.5 text-sm bg-secondary border border-border rounded-xl text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                비밀번호
              </label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  placeholder="8자 이상 입력하세요"
                  className="w-full px-3.5 py-2.5 pr-10 text-sm bg-secondary border border-border rounded-xl text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all"
                />

                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPw ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
            {mode === "signin" && (
              <div className="text-right">
                <a href="#" className="text-xs text-accent hover:underline">
                  비밀번호를 잊으셨나요?
                </a>
              </div>
            )}
          </div>

          {/* Repair shop additional fields */}
          {tab === "shop" && (
            <div className="flex flex-col gap-3 pt-2 border-t border-dashed border-border animate-in fade-in slide-in-from-top-2 duration-200">
              <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 text-[10px]">
                  +
                </span>
                수리점 파트너 추가 정보
              </p>

              {/* Business number */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  사업자번호
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="000-00-00000"
                    className="flex-1 px-3.5 py-2.5 text-sm bg-secondary border border-border rounded-xl text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all"
                  />

                  <button
                    onClick={() => setVerified(true)}
                    className={`px-4 py-2.5 text-sm font-medium rounded-xl whitespace-nowrap transition-all ${
                      verified
                        ? "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-700/50"
                        : "bg-accent text-white hover:bg-accent/90"
                    }`}
                  >
                    {verified ? (
                      <span className="flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5" />
                        인증완료
                      </span>
                    ) : (
                      "인증"
                    )}
                  </button>
                </div>
              </div>

              {/* Shop name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  지점명
                </label>
                <input
                  type="text"
                  placeholder="예: 강남 스마트폰 수리센터"
                  className="px-3.5 py-2.5 text-sm bg-secondary border border-border rounded-xl text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all"
                />
              </div>

              {/* Business license upload */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  사업자 등록증 업로드
                </label>
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragging(true);
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragging(false);
                  }}
                  className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center gap-2 text-center cursor-pointer transition-all ${
                    dragging
                      ? "border-accent bg-accent/5"
                      : "border-border hover:border-accent/40 hover:bg-accent/5"
                  }`}
                >
                  <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center">
                    <Upload className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-foreground">
                      사업자 등록증을 드래그하거나 클릭하여 업로드
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      PDF, JPG, PNG · 최대 5MB
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            className="w-full py-3 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent/90 active:scale-[0.99] transition-all shadow-lg shadow-accent/25"
          >
            {mode === "signin" ? "로그인" : "회원가입"}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border/40" />
            <span className="text-xs text-muted-foreground">또는</span>
            <div className="flex-1 h-px bg-border/40" />
          </div>

          {/* Social */}
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
        {mode === "signin"
          ? "아직 계정이 없으신가요?"
          : "이미 계정이 있으신가요?"}{" "}
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
