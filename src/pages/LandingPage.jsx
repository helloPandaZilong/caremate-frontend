import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router";
import {
  Shield, Menu, X, CheckCircle2, Phone, Mail, MapPin, Star,
  ArrowRight, Wrench, Clock, ChevronRight, Sun, Moon,
  FileText, Smartphone, BadgeCheck, TrendingUp, Award,
  ChevronLeft, BarChart2, Download, Zap, Users,
} from "lucide-react";
import { useDarkMode } from "../hooks/useDarkMode";
import "../styles/LandingPage.css";

// ── Color tokens ──────────────────────────────────────────────────────────────
const AMBER   = "#D97706";
const AMBER_D = "#B45309";
const AMBER_L = "#F59E0B";
const SLATE   = "#1E293B";
const SLATE_2 = "#263348";
const SLATE_3 = "#1A2236";
const LIGHT   = "#F1F5F9";

function S(dark) {
  return {
    bg:          dark ? SLATE   : LIGHT,
    bgAlt:       dark ? SLATE_3 : "#E8EDF3",
    card:        dark ? SLATE_2 : "#FFFFFF",
    cardSub:     dark ? "#1C2535" : "#F8FAFC",
    text:        dark ? LIGHT   : SLATE,
    sub:         dark ? "#94A3B8" : "#475569",
    muted:       dark ? "#64748B" : "#94A3B8",
    border:      dark ? "rgba(241,245,249,0.09)" : "rgba(30,41,59,0.1)",
    amber:       AMBER,
    amberD:      dark ? AMBER_L : AMBER_D,
    amberBg:     dark ? "rgba(217,119,6,0.16)" : "#FEF9EE",
    amberBorder: dark ? "rgba(217,119,6,0.4)"  : "rgba(217,119,6,0.28)",
    amberText:   dark ? AMBER_L : AMBER_D,
    glow:        "rgba(217,119,6,0.28)",
  };
}

// ── Hooks ──────────────────────────────────────────────────────────────────────

function useScrollReveal(threshold = 0.12) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || visible) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.unobserve(el); } },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold, visible]);
  return [ref, visible];
}

function useHeaderSolid() {
  const [solid, setSolid] = useState(false);
  useEffect(() => {
    const fn = () => setSolid(window.scrollY > 56);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return solid;
}

function useCounter(target, { decimal = 0, duration = 1800, active = false } = {}) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) return;
    let startTs = null;
    const raf = (ts) => {
      if (!startTs) startTs = ts;
      const p = Math.min((ts - startTs) / duration, 1);
      const eased = 1 - (1 - p) ** 3;
      const cur = eased * target;
      setVal(decimal ? parseFloat(cur.toFixed(decimal)) : Math.floor(cur));
      if (p < 1) requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }, [target, duration, active, decimal]);
  return val;
}

// ── DarkModeToggle ─────────────────────────────────────────────────────────────

function DarkModeToggle({ dark, toggle }) {
  return (
    <button onClick={toggle} title={dark ? "라이트 모드" : "다크 모드"}
      className="relative w-12 h-6 rounded-full focus:outline-none shrink-0"
      style={{ background: dark ? AMBER : "#CBD5E1", transition: "background 0.3s ease" }}
    >
      <span className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-sm"
        style={{ transform: dark ? "translateX(24px)" : "translateX(0)", transition: "transform 0.3s ease" }}
      >
        {dark ? <Moon className="w-2.5 h-2.5" style={{ color: AMBER }} /> : <Sun className="w-2.5 h-2.5 text-amber-500" />}
      </span>
    </button>
  );
}

// ── Header ─────────────────────────────────────────────────────────────────────

const NAV = [
  { label: "서비스 소개", href: "#service" },
  { label: "이용 방법",   href: "#how"     },
  { label: "파트너 포털", href: "#portals" },
];

function Header({ dark, toggle }) {
  const [open, setOpen] = useState(false);
  const solid = useHeaderSolid();
  const s = S(dark);

  const headerBg = solid ? (dark ? `${SLATE}F4` : `${LIGHT}F4`) : "transparent";

  return (
    <header className="fixed top-0 left-0 right-0 z-50"
      style={{ background: headerBg, backdropFilter: solid ? "blur(14px)" : "none", borderBottom: solid ? `1px solid ${s.border}` : "none", transition: "background 0.35s ease, border-color 0.35s ease" }}
    >
      <div className="max-w-6xl mx-auto px-5 md:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 lp-glow-btn" style={{ background: AMBER }}>
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="text-[17px] font-bold tracking-tight" style={{ color: solid ? s.text : "#FFFFFF" }}>
              Care<span style={{ color: AMBER }}>Mate</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {NAV.map((n) => (
              <a key={n.href} href={n.href}
                className="lp-nav-link px-3.5 py-2 text-sm font-medium rounded-lg transition-colors"
                style={{ color: solid ? s.sub : "rgba(255,255,255,0.70)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = solid ? s.text : "#FFFFFF")}
                onMouseLeave={(e) => (e.currentTarget.style.color = solid ? s.sub : "rgba(255,255,255,0.70)")}
              >
                {n.label}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <DarkModeToggle dark={dark} toggle={toggle} />
            <Link to="/auth">
              <button className="lp-btn-outline px-4 py-2 text-sm font-medium rounded-lg border transition-all"
                style={{ color: solid ? s.sub : "rgba(255,255,255,0.75)", borderColor: solid ? s.border : "rgba(255,255,255,0.2)" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = s.amberBg; e.currentTarget.style.color = AMBER; e.currentTarget.style.borderColor = s.amberBorder; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = solid ? s.sub : "rgba(255,255,255,0.75)"; e.currentTarget.style.borderColor = solid ? s.border : "rgba(255,255,255,0.2)"; }}
              >
                로그인
              </button>
            </Link>
          </div>

          <div className="md:hidden flex items-center gap-2">
            <DarkModeToggle dark={dark} toggle={toggle} />
            <button className="p-2 rounded-lg" style={{ color: solid ? s.sub : "#FFFFFF" }} onClick={() => setOpen(!open)}>
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div style={{ background: s.card, borderTop: `1px solid ${s.border}` }}>
          <nav className="max-w-6xl mx-auto px-5 py-4 flex flex-col gap-1">
            {NAV.map((n) => (
              <a key={n.href} href={n.href} onClick={() => setOpen(false)}
                className="px-3 py-2.5 text-sm font-medium rounded-lg" style={{ color: s.sub }}
              >{n.label}</a>
            ))}
            <div className="pt-3 mt-2 flex flex-col gap-2" style={{ borderTop: `1px solid ${s.border}` }}>
              <Link to="/auth">
                <button className="w-full py-2.5 text-sm font-medium rounded-xl border" style={{ color: s.sub, borderColor: s.border }}>로그인</button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

// 메인
function HeroEcosystemVisual() {
  const SIZE = 360;
  const CX = 180, CY = 180, R = 118;
  const rt3o2 = Math.sqrt(3) / 2; // ≈ 0.866

  const nodes = [
    {
      label: "사용자",
      icon: Smartphone,
      color: AMBER,
      bg: `${AMBER}1A`,
      border: `${AMBER}50`,
      x: CX,
      y: CY - R,                  // (180, 62)
      cls: "lp-nfloat-1",
    },
    {
      label: "수리점",
      icon: Wrench,
      color: "#60A5FA",
      bg: "rgba(96,165,250,0.14)",
      border: "rgba(96,165,250,0.45)",
      x: CX + R * rt3o2,          // ≈ (282, 239)
      y: CY + R * 0.5,
      cls: "lp-nfloat-2",
    },
    {
      label: "보험사",
      icon: FileText,
      color: "#34D399",
      bg: "rgba(52,211,153,0.14)",
      border: "rgba(52,211,153,0.45)",
      x: CX - R * rt3o2,          // ≈ (78, 239)
      y: CY + R * 0.5,
      cls: "lp-nfloat-3",
    },
  ];

  const pills = [
    { text: "비대면 접수 완료", x: 204, y: 22,  cls: "lp-status-pill-1" },
    { text: "패키지 생성",       x: 12,  y: 150, cls: "lp-status-pill-2" },
    { text: "수리 완료",     x: 192, y: 283, cls: "lp-status-pill-3" },
  ];

  return (
    <div className="relative" style={{ width: SIZE, height: SIZE, overflow: "visible" }}>
      {/* Outer rotating dashed ring */}
      <div className="lp-ring-orbit-1 absolute rounded-full pointer-events-none"
        style={{ inset: 14, border: "1px dashed rgba(217,119,6,0.20)" }}
      />
      {/* Inner counter-rotating ring */}
      <div className="lp-ring-orbit-2 absolute rounded-full pointer-events-none"
        style={{ inset: 60, border: "1px solid rgba(217,119,6,0.10)" }}
      />

      {/* SVG connection lines */}
      <svg className="absolute inset-0 pointer-events-none" width={SIZE} height={SIZE} style={{ overflow: "visible" }}>
        {nodes.map((node, i) => (
          <line key={i}
            x1={CX} y1={CY}
            x2={Math.round(node.x)} y2={Math.round(node.y)}
            stroke={node.color} strokeWidth="1.5" strokeOpacity="0.38"
            strokeDasharray="5 4"
            className="lp-dash-line"
            style={{ animationDelay: `${i * 0.45}s` }}
          />
        ))}
      </svg>

      {/* Nodes */}
      {nodes.map((node, i) => {
        const NodeIcon = node.icon;
        return (
          <div key={i} className="absolute pointer-events-none"
            style={{ left: node.x, top: node.y, transform: "translate(-50%, -50%)" }}
          >
            <div className={`flex flex-col items-center gap-1.5 ${node.cls}`}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center border"
                style={{
                  background: node.bg,
                  borderColor: node.border,
                  boxShadow: `0 0 22px ${node.color}22, 0 4px 16px rgba(0,0,0,0.25)`,
                  backdropFilter: "blur(6px)",
                }}
              >
                <NodeIcon className="w-5 h-5" style={{ color: node.color }} />
              </div>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  color: "rgba(255,255,255,0.82)",
                  border: "1px solid rgba(255,255,255,0.14)",
                  backdropFilter: "blur(6px)",
                }}
              >{node.label}</span>
            </div>
          </div>
        );
      })}

      {/* Center hub */}
      <div className="absolute" style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}>
        <div className="lp-pulse-ring absolute rounded-full pointer-events-none"
          style={{ inset: -28, border: "1px solid rgba(217,119,6,0.26)" }}
        />
        <div className="lp-pulse-ring absolute rounded-full pointer-events-none"
          style={{ inset: -18, border: "1px solid rgba(217,119,6,0.36)", animationDelay: "1s" }}
        />
        <div className="lp-hub-glow-anim w-20 h-20 rounded-2xl flex flex-col items-center justify-center gap-0.5 shadow-2xl"
          style={{ background: `linear-gradient(135deg, ${AMBER}, ${AMBER_D})` }}
        >
          <Shield className="w-8 h-8 text-white" />
          <span className="text-white text-[8px] font-black tracking-[0.18em]">CARE</span>
        </div>
      </div>

      {/* Status pills */}
      {pills.map((pill, i) => (
        <div key={i}
          className={`absolute text-[10px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap pointer-events-none ${pill.cls}`}
          style={{
            left: pill.x, top: pill.y,
            background: "rgba(255,255,255,0.10)",
            color: "rgba(255,255,255,0.90)",
            border: "1px solid rgba(255,255,255,0.18)",
            backdropFilter: "blur(10px)",
          }}
        >✓ {pill.text}</div>
      ))}
    </div>
  );
}

// Hero section
function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden" style={{ background: SLATE }}>
      <div className="lp-orb-1 absolute pointer-events-none" style={{ top: "-5%", right: "8%", width: 520, height: 520, borderRadius: "50%", background: `radial-gradient(circle,${AMBER}28 0%,transparent 68%)`, filter: "blur(60px)" }} />
      <div className="lp-orb-2 absolute pointer-events-none" style={{ bottom: "5%", left: "-5%", width: 400, height: 400, borderRadius: "50%", background: `radial-gradient(circle,${AMBER}14 0%,transparent 70%)`, filter: "blur(80px)" }} />
      <div className="lp-orb-3 absolute pointer-events-none" style={{ top: "55%", left: "45%", width: 240, height: 240, borderRadius: "50%", background: `radial-gradient(circle,rgba(217,119,6,0.07) 0%,transparent 70%)`, filter: "blur(40px)" }} />
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: `radial-gradient(circle,${AMBER}1E 1px,transparent 1px)`, backgroundSize: "36px 36px", opacity: 0.45 }} />

      <div className="relative max-w-6xl mx-auto px-5 md:px-8 pt-28 pb-14 w-full">
        <div className="grid md:grid-cols-2 gap-14 items-center">
          <div className="flex flex-col gap-6">
            <div className="lp-hero-badge">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full"
                style={{ background: `${AMBER}22`, color: AMBER_L, border: `1px solid ${AMBER}45` }}
              >
                <BadgeCheck className="w-3.5 h-3.5" />
                공식 인증 보험 플랫폼
              </span>
            </div>
            <h1 className="lp-hero-title text-4xl md:text-5xl lg:text-[3.2rem] font-black leading-[1.17] tracking-tight text-white">
              스마트폰 A/S 보험,<br />
              <span style={{ color: AMBER_L }}>한 번에 해결</span>하세요
            </h1>
            <p className="lp-hero-desc text-base md:text-[17px] leading-relaxed" style={{ color: "rgba(241,245,249,0.60)", maxWidth: 440 }}>
              비대면 수리 접수부터 보험 청구 패키지 자동 생성까지,<br />CareMate가 모든 과정을 처리합니다.
            </p>
            <div className="lp-hero-cta flex flex-wrap gap-3">
              <Link to="/auth">
                <button className="lp-btn-primary inline-flex items-center gap-2 px-7 py-3.5 text-[15px] font-black text-white rounded-xl"
                  style={{ background: AMBER, boxShadow: `0 0 32px ${AMBER}50` }}
                >
                  지금 무료로 시작하기 <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
              <a href="#service">
                <button className="lp-btn-outline inline-flex items-center gap-2 px-7 py-3.5 text-[15px] font-semibold text-white rounded-xl"
                  style={{ border: "1px solid rgba(255,255,255,0.18)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${AMBER}60`; e.currentTarget.style.color = AMBER_L; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.18)"; e.currentTarget.style.color = "#FFFFFF"; }}
                >
                  서비스 둘러보기 <ChevronRight className="w-4 h-4" />
                </button>
              </a>
            </div>
            <p className="lp-hero-trust text-xs" style={{ color: "rgba(255,255,255,0.28)" }}>
              별도 가입비 없음 · 언제든지 탈퇴 · 개인정보 보호 인증
            </p>
          </div>
          <div className="lp-hero-visual hidden md:flex justify-center items-center">
            <HeroEcosystemVisual />
          </div>
        </div>

        <div className="lp-hero-stats mt-14 grid grid-cols-2 md:grid-cols-4 gap-px rounded-2xl overflow-hidden"
          style={{ border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}
        >
          {[
            { v: "48만+",  l: "누적 가입자" },
            { v: "3,200+", l: "제휴 수리점" },
            { v: "99.2%",  l: "청구 승인율" },
            { v: "4.8★",   l: "사용자 만족도" },
          ].map((st) => (
            <div key={st.l} className="flex flex-col items-center py-7 px-4 gap-1" style={{ background: "rgba(255,255,255,0.025)" }}>
              <span className="text-2xl md:text-3xl font-black text-white">{st.v}</span>
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.38)" }}>{st.l}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Stats section

function StatsSection({ dark }) {
  const s = S(dark);
  const [ref, visible] = useScrollReveal(0.1);
  const v1 = useCounter(48,   { active: visible });
  const v2 = useCounter(3200, { active: visible });
  const v3 = useCounter(99.2, { active: visible, decimal: 1 });
  const v4 = useCounter(4.8,  { active: visible, decimal: 1 });

  const stats = [
    { num: v1, suffix: "만+", label: "누적 가입자",   icon: Users,       bar: 85 },
    { num: v2, suffix: "+",   label: "제휴 수리점",   icon: Wrench,      bar: 78 },
    { num: v3, suffix: "%",   label: "청구 승인율",   icon: CheckCircle2,bar: 99 },
    { num: v4, suffix: "★",   label: "사용자 만족도", icon: Star,        bar: 96 },
  ];

  return (
    <section style={{ background: s.bg }}>
      <div className="max-w-6xl mx-auto px-5 md:px-8 py-16 md:py-20">
        <div ref={ref} className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((st, i) => {
            const Icon = st.icon;
            return (
              <div key={st.label}
                className={`lp-reveal lp-card ${visible ? "visible" : ""} rounded-2xl p-6 flex flex-col gap-3 border`}
                style={{ background: s.card, borderColor: s.border, transitionDelay: `${i * 100}ms` }}
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: s.amberBg }}>
                    <Icon className="w-4 h-4" style={{ color: AMBER }} />
                  </div>
                  <span className="text-xs font-bold" style={{ color: AMBER }}>{st.num.toLocaleString()}{st.suffix}</span>
                </div>
                <p className="text-2xl font-black" style={{ color: s.text }}>{st.num.toLocaleString()}{st.suffix}</p>
                <p className="text-xs font-medium" style={{ color: s.sub }}>{st.label}</p>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: s.border }}>
                  {visible && (
                    <div className="h-full rounded-full lp-stat-bar"
                      style={{ ["--lp-bar-w"]: `${st.bar}%`, background: `linear-gradient(90deg,${AMBER},${AMBER_L})` }}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ── Feature visuals (mini-mockups) ────────────────────────────────────────────

function FeatureVisual1({ dark }) {
  const s = S(dark);
  return (
    <div className="rounded-2xl p-5 flex flex-col gap-3 border w-full max-w-xs" style={{ background: s.card, borderColor: s.border }}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold" style={{ color: s.text }}>내 보험 현황</p>
        <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ background: s.amberBg, color: AMBER }}>보장중</span>
      </div>
      <div className="rounded-xl p-3 flex items-center gap-3" style={{ background: s.cardSub }}>
        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: s.amberBg }}><Smartphone className="w-4 h-4" style={{ color: AMBER }} /></div>
        <div><p className="text-sm font-semibold" style={{ color: s.text }}>iPhone 15 Pro</p><p className="text-[11px]" style={{ color: s.muted }}>보장 만료 2025.09</p></div>
      </div>
      <div>
        <div className="flex justify-between mb-1.5"><p className="text-[11px]" style={{ color: s.sub }}>연간 한도 잔여</p><p className="text-[11px] font-bold" style={{ color: AMBER }}>62%</p></div>
        <div className="h-2 rounded-full" style={{ background: s.cardSub }}><div className="h-full rounded-full" style={{ width: "62%", background: `linear-gradient(90deg,${AMBER},${AMBER_L})` }} /></div>
      </div>
      {[{ l: "삼성화재 스마트폰 보험", v: "월 4,500원" }, { l: "청구 가능 잔여 횟수", v: "2회" }].map((r) => (
        <div key={r.l} className="flex justify-between py-1.5" style={{ borderTop: `1px solid ${s.border}` }}>
          <span className="text-xs" style={{ color: s.sub }}>{r.l}</span>
          <span className="text-xs font-bold" style={{ color: s.text }}>{r.v}</span>
        </div>
      ))}
    </div>
  );
}

function FeatureVisual2({ dark }) {
  const s = S(dark);
  const shops = [{ name: "강남 스마트케어", dist: "0.3km", rating: 4.9 }, { name: "서초 아이폰 전문점", dist: "0.8km", rating: 4.8 }, { name: "역삼 갤럭시 수리", dist: "1.2km", rating: 4.7 }];
  return (
    <div className="rounded-2xl p-5 flex flex-col gap-3 border w-full max-w-xs" style={{ background: s.card, borderColor: s.border }}>
      <div className="flex items-center gap-2"><MapPin className="w-4 h-4" style={{ color: AMBER }} /><p className="text-sm font-bold" style={{ color: s.text }}>주변 제휴 수리점</p></div>
      <div className="rounded-xl overflow-hidden relative" style={{ background: s.amberBg, height: 72 }}>
        {[{ t: "28%", l: "22%" }, { t: "52%", l: "58%" }, { t: "68%", l: "38%" }].map((p, i) => (
          <div key={i} className="absolute" style={{ top: p.t, left: p.l }}>
            <div className="relative"><div className="absolute inset-0 lp-pulse-ring rounded-full" style={{ background: `${AMBER}50` }} /><div className="w-3 h-3 rounded-full relative z-10" style={{ background: AMBER }} /></div>
          </div>
        ))}
        <p className="absolute bottom-1.5 right-2.5 text-[9px] font-semibold" style={{ color: AMBER }}>지도 보기</p>
      </div>
      {shops.map((sh) => (
        <div key={sh.name} className="flex items-center justify-between py-2 px-3 rounded-xl" style={{ background: s.cardSub }}>
          <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{ background: AMBER }} /><span className="text-xs font-medium" style={{ color: s.text }}>{sh.name}</span></div>
          <div className="flex items-center gap-2"><span className="text-[10px]" style={{ color: s.muted }}>{sh.dist}</span><span className="text-[10px] font-bold" style={{ color: AMBER }}>★ {sh.rating}</span></div>
        </div>
      ))}
    </div>
  );
}

function FeatureVisual3({ dark }) {
  const s = S(dark);
  return (
    <div className="rounded-2xl p-5 flex flex-col gap-3 border w-full max-w-xs" style={{ background: s.card, borderColor: s.border }}>
      <div className="flex items-center gap-2"><FileText className="w-4 h-4" style={{ color: AMBER }} /><p className="text-sm font-bold" style={{ color: s.text }}>청구 패키지 자동 생성</p></div>
      {["수리 영수증", "기기 진단서", "수리 내역서", "사진 자료"].map((d) => (
        <div key={d} className="flex items-center gap-3 py-2.5 px-3 rounded-xl" style={{ background: s.cardSub }}>
          <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: `${AMBER}22` }}><CheckCircle2 className="w-3 h-3" style={{ color: AMBER }} /></div>
          <span className="text-xs font-medium" style={{ color: s.text }}>{d}</span>
          <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: s.amberBg, color: AMBER }}>완료</span>
        </div>
      ))}
      <button className="lp-btn-primary flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-bold text-white" style={{ background: AMBER }}>
        <Download className="w-4 h-4" />패키지 다운로드
      </button>
    </div>
  );
}

function FeatureVisual4({ dark }) {
  const s = S(dark);
  return (
    <div className="rounded-2xl p-5 flex flex-col gap-3 border w-full max-w-xs" style={{ background: s.card, borderColor: s.border }}>
      <div className="flex items-center justify-between"><div className="flex items-center gap-2"><BarChart2 className="w-4 h-4" style={{ color: AMBER }} /><p className="text-sm font-bold" style={{ color: s.text }}>이번 달 현황</p></div><span className="text-[11px] font-bold" style={{ color: AMBER }}>+12%</span></div>
      {[{ label: "접수", v: 32, max: 40 }, { label: "수리 완료", v: 28, max: 40 }, { label: "보험 청구 패키지 생성 요청", v: 25, max: 40 }].map((b) => (
        <div key={b.label}>
          <div className="flex justify-between mb-1"><span className="text-xs" style={{ color: s.sub }}>{b.label}</span><span className="text-xs font-bold" style={{ color: s.text }}>{b.v}건</span></div>
          <div className="h-2 rounded-full" style={{ background: s.cardSub }}><div className="h-full rounded-full" style={{ width: `${(b.v / b.max) * 100}%`, background: `linear-gradient(90deg,${AMBER},${AMBER_L})` }} /></div>
        </div>
      ))}
      <div className="rounded-xl p-3 flex items-center justify-between" style={{ background: s.amberBg }}>
        <span className="text-xs font-medium" style={{ color: AMBER }}>이번 달 매출</span>
        <span className="text-sm font-black" style={{ color: AMBER }}>6,400,000원</span>
      </div>
    </div>
  );
}

// ── Features (alternating layout) ─────────────────────────────────────────────

const FEATURES = [
  { tag: "사용자",        icon: Shield,    title: "통합 보험 관리",          reverse: false, Visual: FeatureVisual1,
    points: ["여러 보험사 스마트폰 보험을 한 곳에서 비교·관리", "실시간 보험 환급금 계산 및 안내", "청구 이력 자동 기록 및 한눈에 통계"] },
  { tag: "사용자",        icon: MapPin,    title: "위치 기반 수리점 연결",    reverse: true,  Visual: FeatureVisual2,
    points: ["전국 3,200개 공인 수리점 실시간 검색", "거리·평점 기준 수리점별 정렬 및 즉시 예약", "수리 완료 후 기기 상태 자동 업데이트"] },
  { tag: "사용자·수리점", icon: FileText,  title: "자동 청구 패키지 생성",    reverse: false, Visual: FeatureVisual3,
    points: ["수리 완료 즉시 보험사 제출 서류 자동 생성", "영수증·진단서·내역서 원클릭 패키지화", "AI를 통해 정형화된 리포트로 자동 변환"] },
  { tag: "수리점",        icon: BarChart2, title: "수리점 통합 운영 솔루션",  reverse: true,  Visual: FeatureVisual4,
    points: ["예약·수리·정산 프로세스 원스톱 관리", "월간 매출 및 수리 통계 대시보드", "LMS 교육 이수 및 파트너 자격 관리"] },
];

function FeaturesSection({ dark }) {
  const s = S(dark);
  const [r1, v1] = useScrollReveal(0.1);
  const [r2, v2] = useScrollReveal(0.1);
  const [r3, v3] = useScrollReveal(0.1);
  const [r4, v4] = useScrollReveal(0.1);
  const featureRefs    = [r1, r2, r3, r4];
  const featureVisibles = [v1, v2, v3, v4];

  return (
    <section id="service" style={{ background: s.bg }}>
      <div className="max-w-6xl mx-auto px-5 md:px-8 py-20 md:py-28">
        <div ref={r1} className={`lp-reveal ${v1 ? "visible" : ""} flex flex-col items-center text-center gap-4 mb-20`}>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-full"
            style={{ background: s.amberBg, color: AMBER, border: `1px solid ${s.amberBorder}` }}
          >
            <Zap className="w-3.5 h-3.5" />핵심 기능
          </span>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight" style={{ color: s.text }}>
            사용자와 수리점 모두를 위한<br />
            <span style={{ color: AMBER }}>완전한 A/S 생태계</span>
          </h2>
          <p className="text-base max-w-xl leading-relaxed" style={{ color: s.sub }}>
            단순한 중계 앱이 아닙니다. 사용자·수리점·보험사를 하나로 연결하는 통합 플랫폼입니다.
          </p>
        </div>

        <div className="flex flex-col gap-24">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            const visible = featureVisibles[i];
            const ref = featureRefs[i];
            const textCls   = f.reverse ? "lp-reveal-right" : "lp-reveal-left";
            const visualCls = f.reverse ? "lp-reveal-left"  : "lp-reveal-right";

            return (
              <div key={f.title}
                ref={i > 0 ? ref : undefined}
                className={`grid md:grid-cols-2 gap-12 items-center ${f.reverse ? "md:[&>*:first-child]:order-2" : ""}`}
              >
                <div className={`${textCls} ${visible ? "visible" : ""} flex flex-col gap-5`}>
                  <span className="inline-flex items-center gap-1.5 w-fit px-2.5 py-1 text-[11px] font-bold rounded-full"
                    style={{ background: s.amberBg, color: AMBER, border: `1px solid ${s.amberBorder}` }}
                  >{f.tag}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                      style={{ background: s.amberBg, border: `1px solid ${s.amberBorder}` }}
                    >
                      <Icon className="w-5 h-5" style={{ color: AMBER }} />
                    </div>
                    <h3 className="text-2xl md:text-3xl font-black" style={{ color: s.text }}>{f.title}</h3>
                  </div>
                  <ul className="flex flex-col gap-3">
                    {f.points.map((p) => (
                      <li key={p} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: `${AMBER}22` }}>
                          <CheckCircle2 className="w-3 h-3" style={{ color: AMBER }} />
                        </div>
                        <span className="text-sm leading-relaxed" style={{ color: s.sub }}>{p}</span>
                      </li>
                    ))}
                  </ul>
                  <a href="#portals">
                    <button className="lp-btn-outline inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-xl border"
                      style={{ color: AMBER, borderColor: s.amberBorder }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = s.amberBg)}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      데모 체험하기 <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </a>
                </div>
                <div className={`${visualCls} ${visible ? "visible" : ""} flex justify-center`} style={{ transitionDelay: "0.1s" }}>
                  <f.Visual dark={dark} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ── How It Works ───────────────────────────────────────────────────────────────

const STEPS = [
  { n: "01", icon: Smartphone, title: "비대면 A/S 접수",  desc: "앱에서 파손 정보 입력 후 가까운 수리점을 선택해 예약하세요." },
  { n: "02", icon: Clock,       title: "실시간 진행 확인", desc: "접수부터 수리 완료까지 단계별 상태를 실시간으로 확인하세요." },
  { n: "03", icon: TrendingUp,  title: "보험 환급금 확인", desc: "결제 후 보험 적용 환급 예상액이 즉시 계산되어 표시됩니다." },
  { n: "04", icon: Download,    title: "청구 패키지 제출", desc: "자동 생성된 서류를 한 번의 클릭으로 보험사에 제출하세요." },
];

function HowItWorksSection() {
  const [headRef, headVis]   = useScrollReveal(0.1);
  const [stepsRef, stepsVis] = useScrollReveal(0.08);

  return (
    <section id="how" className="relative overflow-hidden" style={{ background: SLATE_3 }}>
      <div className="lp-orb-2 absolute pointer-events-none" style={{ bottom: "-15%", right: "-5%", width: 480, height: 480, borderRadius: "50%", background: `radial-gradient(circle,${AMBER}10 0%,transparent 70%)`, filter: "blur(70px)" }} />
      <div className="relative max-w-6xl mx-auto px-5 md:px-8 py-20 md:py-28">
        <div ref={headRef} className={`lp-reveal ${headVis ? "visible" : ""} flex flex-col items-center text-center gap-4 mb-16`}>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-full"
            style={{ background: `${AMBER}20`, color: AMBER_L, border: `1px solid ${AMBER}40` }}
          >이용 방법</span>
          <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">4단계로 끝나는 스마트 A/S</h2>
          <p className="text-base max-w-md leading-relaxed" style={{ color: "rgba(241,245,249,0.50)" }}>복잡한 보험 청구, 이제 CareMate가 대신합니다.</p>
        </div>

        {/* Single ref wrapper — ensures IntersectionObserver fires on both desktop and mobile */}
        <div ref={stepsRef}>
          {/* Desktop steps */}
          <div className="hidden md:grid grid-cols-4 gap-6 relative">
            <div className="absolute top-7 pointer-events-none" style={{ left: "12.5%", right: "12.5%", height: 2, background: "rgba(255,255,255,0.06)" }}>
              <div className={`h-full lp-step-vline ${stepsVis ? "visible" : ""}`}
                style={{ background: `linear-gradient(90deg,${AMBER}80,${AMBER}30)`, transformOrigin: "left center" }} />
            </div>
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={step.n} className={`lp-reveal ${stepsVis ? "visible" : ""} flex flex-col gap-4`} style={{ transitionDelay: `${i * 140}ms` }}>
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 relative z-10 border"
                      style={{ background: `linear-gradient(135deg,${AMBER}28,${AMBER}10)`, borderColor: `${AMBER}55` }}
                    ><Icon className="w-6 h-6" style={{ color: AMBER_L }} /></div>
                    <span className="text-5xl font-black leading-none select-none" style={{ color: "rgba(255,255,255,0.06)" }}>{step.n}</span>
                  </div>
                  <h3 className="text-base font-black text-white">{step.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "rgba(241,245,249,0.50)" }}>{step.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Mobile steps */}
          <div className="md:hidden flex flex-col gap-0">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={step.n} className={`lp-reveal ${stepsVis ? "visible" : ""} flex gap-4`} style={{ transitionDelay: `${i * 140}ms` }}>
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border" style={{ background: `${AMBER}20`, borderColor: `${AMBER}45` }}>
                      <Icon className="w-5 h-5" style={{ color: AMBER_L }} />
                    </div>
                    {i < STEPS.length - 1 && <div className="flex-1 w-px my-2" style={{ background: `${AMBER}30` }} />}
                  </div>
                  <div className="pb-8 pt-1.5">
                    <span className="text-[10px] font-black" style={{ color: AMBER }}>{step.n}</span>
                    <h3 className="text-base font-black text-white mt-0.5">{step.title}</h3>
                    <p className="text-sm leading-relaxed mt-1" style={{ color: "rgba(241,245,249,0.50)" }}>{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Portals ────────────────────────────────────────────────────────────────────

const PORTALS = [
  { label: "고객 포털",      sub: "대시보드 · 보험 조회 · A/S 접수",  href: "/customer/dashboard", icon: Smartphone, accent: AMBER,     accentBg: `${AMBER}16`,             accentBorder: `${AMBER}35` },
  { label: "수리점 포털",    sub: "예약 관리 · 수리 리포트 · 정산",    href: "/shop/dashboard",     icon: Wrench,     accent: "#3B82F6", accentBg: "rgba(59,130,246,0.12)",  accentBorder: "rgba(59,130,246,0.3)" },
  { label: "관리자 백오피스", sub: "KPI · 계정 관리 · 감사 로그",       href: "/admin/dashboard",    icon: Shield,     accent: "#EF4444", accentBg: "rgba(239,68,68,0.12)",   accentBorder: "rgba(239,68,68,0.3)" },
];

function PortalsSection({ dark }) {
  const s = S(dark);
  const [ref, visible] = useScrollReveal(0.1);
  return (
    <section id="portals" style={{ background: s.bg }}>
      <div className="max-w-6xl mx-auto px-5 md:px-8 py-20 md:py-24">
        <div ref={ref} className={`lp-reveal ${visible ? "visible" : ""}`}>
          <div className="flex flex-col items-center text-center gap-4 mb-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-full"
              style={{ background: s.amberBg, color: AMBER, border: `1px solid ${s.amberBorder}` }}
            >데모 체험</span>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight" style={{ color: s.text }}>직접 체험해보세요</h2>
            <p className="text-base max-w-md" style={{ color: s.sub }}>각 역할별 포털에서 CareMate의 주요 기능을 미리 경험해보세요.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {PORTALS.map((p, i) => {
              const Icon = p.icon;
              return (
                <Link key={p.href} to={p.href}>
                  <div className={`lp-reveal lp-card ${visible ? "visible" : ""} rounded-2xl p-6 flex flex-col gap-4 h-full border cursor-pointer`}
                    style={{ background: s.card, borderColor: s.border, transitionDelay: `${i * 100}ms` }}
                  >
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: p.accentBg, border: `1px solid ${p.accentBorder}` }}>
                      <Icon className="w-5 h-5" style={{ color: p.accent }} />
                    </div>
                    <div>
                      <p className="text-base font-black" style={{ color: s.text }}>{p.label}</p>
                      <p className="text-sm mt-1" style={{ color: s.sub }}>{p.sub}</p>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-bold mt-auto" style={{ color: p.accent }}>
                      포털 열기 <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Testimonials (auto-carousel) ───────────────────────────────────────────────

const TESTIMONIALS = [
  { name: "이수연", role: "일반 사용자 · 서울", rating: 5, content: "액정이 산산조각 났는데 CareMate 앱에서 사진 찍고 신청하니 이틀 만에 수리 완료. 보험 청구도 앱에서 바로 됐어요. 정말 편해요." },
  { name: "박도현", role: "수리점 사장 · 부산", rating: 5, content: "예약 관리부터 청구 서류 작성·정산까지 한 번에 처리되니 행정 시간이 절반으로 줄었습니다. 수리점 운영에 혁신이에요." },
  { name: "김지아", role: "일반 사용자 · 대전", rating: 5, content: "파손 보험 청구 서류 준비가 항상 복잡했는데, CareMate가 패키지를 자동으로 만들어줘서 보험금 돌려받는 게 이렇게 쉬울 줄 몰랐어요." },
  { name: "최현우", role: "수리점 직원 · 인천", rating: 5, content: "LMS 교육도 앱에서 편하게 이수하고, 고객 수리 이력도 AI 리포트를 통해 자동으로 정리돼요. 예전에 수기로 하던 게 너무 힘들었거든요." },
];

function TestimonialsSection({ dark }) {
  const s = S(dark);
  const [ref, visible] = useScrollReveal(0.08);
  const [idx, setIdx] = useState(0);
  const [show, setShow] = useState(true);

  const changeTo = useCallback((next) => {
    setShow(false);
    setTimeout(() => { setIdx(next); setShow(true); }, 260);
  }, []);

  useEffect(() => {
    const t = setInterval(() => changeTo((idx + 1) % TESTIMONIALS.length), 4800);
    return () => clearInterval(t);
  }, [idx, changeTo]);

  const t = TESTIMONIALS[idx];

  return (
    <section style={{ background: s.bgAlt }}>
      <div className="max-w-6xl mx-auto px-5 md:px-8 py-20 md:py-28">
        <div ref={ref} className={`lp-reveal ${visible ? "visible" : ""} flex flex-col items-center text-center gap-4 mb-12`}>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-full"
            style={{ background: s.amberBg, color: AMBER, border: `1px solid ${s.amberBorder}` }}
          >고객 후기</span>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight" style={{ color: s.text }}>실제 사용자들의 이야기</h2>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="rounded-3xl p-8 md:p-10 border"
            style={{ background: s.card, borderColor: s.border, minHeight: 220, opacity: show ? 1 : 0, transform: show ? "translateY(0)" : "translateY(10px)", transition: "opacity 0.26s ease, transform 0.26s ease" }}
          >
            <div className="flex gap-0.5 mb-5">
              {Array.from({ length: t.rating }).map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
            </div>
            <p className="text-base leading-relaxed mb-6" style={{ color: s.sub }}>&ldquo;{t.content}&rdquo;</p>
            <div className="flex items-center gap-3 pt-5" style={{ borderTop: `1px solid ${s.border}` }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black shrink-0" style={{ background: s.amberBg, color: AMBER }}>{t.name[0]}</div>
              <div><p className="text-sm font-black" style={{ color: s.text }}>{t.name}</p><p className="text-xs" style={{ color: s.muted }}>{t.role}</p></div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <button onClick={() => changeTo((idx - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)}
              className="w-9 h-9 rounded-full flex items-center justify-center border lp-btn-outline"
              style={{ borderColor: s.border, color: s.sub }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = AMBER; e.currentTarget.style.color = AMBER; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = s.border; e.currentTarget.style.color = s.sub; }}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex gap-2">
              {TESTIMONIALS.map((_, i) => (
                <button key={i} onClick={() => changeTo(i)}
                  style={{ height: 8, borderRadius: 9999, background: i === idx ? AMBER : s.border, width: i === idx ? 24 : 8, transition: "width 0.3s ease, background 0.3s ease" }}
                />
              ))}
            </div>
            <button onClick={() => changeTo((idx + 1) % TESTIMONIALS.length)}
              className="w-9 h-9 rounded-full flex items-center justify-center border lp-btn-outline"
              style={{ borderColor: s.border, color: s.sub }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = AMBER; e.currentTarget.style.color = AMBER; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = s.border; e.currentTarget.style.color = s.sub; }}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Thumbnail grid */}
          <div className={`lp-reveal ${visible ? "visible" : ""} hidden md:grid grid-cols-4 gap-3 mt-8`}>
            {TESTIMONIALS.map((tst, i) => (
              <button key={tst.name} onClick={() => changeTo(i)}
                className="rounded-xl p-3 text-left border"
                style={{ background: i === idx ? s.amberBg : s.card, borderColor: i === idx ? s.amberBorder : s.border, transition: "background 0.25s ease, border-color 0.25s ease" }}
              >
                <div className="flex gap-0.5 mb-1">{Array.from({ length: 5 }).map((_, j) => <Star key={j} className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />)}</div>
                <p className="text-[11px] font-black" style={{ color: i === idx ? AMBER : s.text }}>{tst.name}</p>
                <p className="text-[10px]" style={{ color: s.muted }}>{tst.role.split(" · ")[1]}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── CTA ────────────────────────────────────────────────────────────────────────

function CtaSection({ dark }) {
  const s = S(dark);
  const [ref, visible] = useScrollReveal(0.15);
  return (
    <section style={{ background: s.bg }}>
      <div className="max-w-6xl mx-auto px-5 md:px-8 py-16 md:py-20">
        <div ref={ref} className={`lp-reveal ${visible ? "visible" : ""} lp-cta-bg rounded-3xl px-8 md:px-16 py-14 md:py-16 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden`}>
          <div className="absolute pointer-events-none" style={{ top: "-40%", right: "-8%", width: 420, height: 420, borderRadius: "50%", background: "rgba(255,255,255,0.06)", filter: "blur(40px)" }} />
          <div className="relative flex flex-col gap-3 text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">지금 바로 무료로 시작하세요</h2>
            <p className="text-base" style={{ color: "rgba(255,255,255,0.70)" }}>가입비 없이 모든 기능 무료 · 언제든지 탈퇴 가능</p>
          </div>
          <div className="relative flex flex-col sm:flex-row gap-3 shrink-0">
            <Link to="/auth">
              <button className="lp-btn-primary px-7 py-3.5 rounded-xl bg-white font-black text-sm whitespace-nowrap" style={{ color: AMBER_D }}>사용자로 가입하기</button>
            </Link>
            <Link to="/auth">
              <button className="lp-btn-outline px-7 py-3.5 rounded-xl font-black text-sm text-white whitespace-nowrap border" style={{ borderColor: "rgba(255,255,255,0.30)" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.12)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >수리점 파트너 신청</button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Footer ─────────────────────────────────────────────────────────────────────

const FOOTER_LINKS = {
  서비스:   ["서비스 소개", "수리점 파트너", "기업 솔루션"],
  지원:     ["고객센터", "FAQ", "공지사항"],
  법적고지: ["이용약관", "개인정보처리방침", "보험약관 안내"],
};

function Footer() {
  return (
    <footer style={{ background: SLATE_3, color: "rgba(241,245,249,0.45)" }}>
      <div className="max-w-6xl mx-auto px-5 md:px-8 pt-14 pb-8">
        <div className="grid md:grid-cols-[2fr_1fr_1fr_1fr] gap-10 pb-12" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: AMBER }}><Shield className="w-4 h-4 text-white" /></div>
              <span className="text-[17px] font-black text-white">Care<span style={{ color: AMBER }}>Mate</span></span>
            </div>
            <p className="text-sm leading-relaxed max-w-xs" style={{ color: "rgba(241,245,249,0.40)" }}>스마트폰 A/S 보험 통합 관리 플랫폼.</p>
            <div className="flex flex-col gap-2 text-xs" style={{ color: "rgba(241,245,249,0.30)" }}>
              <span className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 shrink-0" />서울특별시 강남구 테헤란로 152</span>
              <span className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 shrink-0" />1588-0000 (평일 09–18시)</span>
              <span className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 shrink-0" />hello@caremate.kr</span>
            </div>
          </div>
          {Object.entries(FOOTER_LINKS).map(([cat, links]) => (
            <div key={cat} className="flex flex-col gap-4">
              <h4 className="text-sm font-black text-white">{cat}</h4>
              <ul className="flex flex-col gap-2.5">
                {links.map((l) => (
                  <li key={l}>
                    <a href="#" className="text-sm" style={{ color: "rgba(241,245,249,0.40)", transition: "color 0.2s ease" }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = AMBER_L)}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(241,245,249,0.40)")}
                    >{l}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs" style={{ color: "rgba(241,245,249,0.25)" }}>
          <p>© 2025 CareMate Inc. All rights reserved.</p>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full lp-dot-live" style={{ background: AMBER }} />
            <span>모든 시스템 정상 운영 중</span>
          </div>
          <p>금융위원회 허가 보험 플랫폼 · 사업자등록번호 123-45-67890</p>
        </div>
      </div>
    </footer>
  );
}

// ── Page root ──────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const { dark, toggle } = useDarkMode();
  return (
    <div style={{ fontFamily: "'Noto Sans KR','Inter',sans-serif", background: S(dark).bg, transition: "background 0.3s ease" }}>
      <Header dark={dark} toggle={toggle} />
      <main>
        <HeroSection dark={dark} />
        <StatsSection dark={dark} />
        <FeaturesSection dark={dark} />
        <HowItWorksSection dark={dark} />
        <PortalsSection dark={dark} />
        <TestimonialsSection dark={dark} />
        <CtaSection dark={dark} />
      </main>
      <Footer />
    </div>
  );
}
