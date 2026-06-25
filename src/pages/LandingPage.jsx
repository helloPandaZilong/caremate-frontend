import { useState } from "react";
import { Link } from "react-router";
import {
  Shield,
  Menu,
  X,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  Star,
  ArrowRight,
  Wrench,
  Clock,
  ChevronRight,
  Sun,
  Moon,
} from "lucide-react";
import { useDarkMode } from "../hooks/useDarkMode";

function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  onClick,
}) {
  const base =
    "inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 cursor-pointer select-none";
  const variants = {
    primary:
      "bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98]",
    secondary:
      "bg-card text-foreground border border-border hover:bg-secondary active:scale-[0.98]",
    ghost: "text-foreground hover:bg-secondary active:scale-[0.98]",
    accent:
      "bg-accent text-accent-foreground hover:bg-accent/90 active:scale-[0.98] shadow-lg shadow-accent/25",
  };
  const sizes = {
    sm: "px-4 py-2 text-sm rounded-lg",
    md: "px-5 py-2.5 text-sm rounded-xl",
    lg: "px-7 py-3.5 text-base rounded-xl",
  };
  return (
    <button
      onClick={onClick}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
}

function LandingBadge({ children }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full bg-accent/10 text-accent border border-accent/20">
      {children}
    </span>
  );
}

const NAV_LINKS = [
  { label: "서비스 소개", href: "#service" },
  { label: "이용 방법", href: "#how" },
  { label: "수리점 파트너", href: "#partners" },
  { label: "요금제", href: "#pricing" },
];

function DarkModeToggle({ dark, toggle }) {
  return (
    <button
      onClick={toggle}
      title={dark ? "라이트 모드" : "다크 모드"}
      className="relative w-12 h-6 rounded-full border transition-all duration-300 focus:outline-none shrink-0"
      style={{
        background: dark ? "#3B82F6" : "#EEF1F8",
        borderColor: dark ? "#3B82F6" : "rgba(26,29,46,0.15)",
      }}
    >
      <span
        className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-sm transition-all duration-300"
        style={{ transform: dark ? "translateX(24px)" : "translateX(0px)" }}
      >
        {dark
          ? <Moon className="w-2.5 h-2.5 text-blue-600" />
          : <Sun className="w-2.5 h-2.5 text-amber-500" />
        }
      </span>
    </button>
  );
}

function Header() {
  const [open, setOpen] = useState(false);
  const { dark, toggle } = useDarkMode();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-6xl mx-auto px-5 md:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shrink-0">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span
              className="text-lg font-semibold text-foreground tracking-tight"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Care<span className="text-accent">Mate</span>
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-3.5 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="hidden md:flex items-center gap-3">
            <DarkModeToggle dark={dark} toggle={toggle} />
            <Link to="/auth">
              <Button variant="accent" size="sm">
                로그인
              </Button>
            </Link>
          </div>
          <div className="md:hidden flex items-center gap-2">
            <DarkModeToggle dark={dark} toggle={toggle} />
            <button
              className="p-2 rounded-lg hover:bg-secondary transition-colors"
              onClick={() => setOpen(!open)}
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
      {open && (
        <div className="md:hidden border-t border-border bg-background">
          <nav className="max-w-6xl mx-auto px-5 py-4 flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="px-3 py-2.5 text-sm text-foreground hover:bg-secondary rounded-lg transition-colors"
              >
                {link.label}
              </a>
            ))}
            <div className="pt-3 mt-2 border-t border-border flex flex-col gap-2">
              <Link to="/auth">
                <Button variant="secondary" size="md" className="w-full">
                  로그인
                </Button>
              </Link>
              <Link to="/auth">
                <Button variant="accent" size="md" className="w-full">
                  무료로 시작하기
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

const STATS = [
  { value: "48만+", label: "누적 가입자" },
  { value: "3,200+", label: "제휴 수리점" },
  { value: "99.2%", label: "청구 승인율" },
  { value: "4.8★", label: "사용자 만족도" },
];

function DashboardMockup() {
  return (
    <div className="relative">
      <div className="bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <span className="text-xs text-muted-foreground font-medium">
            CareMate 대시보드
          </span>
          <div className="w-16" />
        </div>
        <div className="p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">
                안녕하세요, 김민준 님
              </p>
              <p className="text-sm font-medium text-foreground mt-0.5">
                내 보험 현황
              </p>
            </div>
            <span className="text-xs px-2.5 py-1 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full font-medium border border-green-200 dark:border-green-700/50">
              보장중
            </span>
          </div>
          <div className="bg-secondary rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
              <Phone className="w-5 h-5 text-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">
                iPhone 15 Pro
              </p>
              <p className="text-xs text-muted-foreground">실버 · 256GB</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">보장 만료</p>
              <p className="text-xs font-medium text-foreground">2025.09.12</p>
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">
              최근 청구 내역
            </p>
            <div className="flex flex-col gap-2">
              {[
                {
                  label: "액정 파손 수리",
                  date: "06.02",
                  status: "완료",
                  color:
                    "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700/50",
                },
                {
                  label: "배터리 교체",
                  date: "04.18",
                  status: "완료",
                  color:
                    "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700/50",
                },
                {
                  label: "침수 수리",
                  date: "02.07",
                  status: "승인대기",
                  color:
                    "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-700/50",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between py-2 border-b border-border last:border-0"
                >
                  <div>
                    <p className="text-xs font-medium text-foreground">
                      {item.label}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {item.date}
                    </p>
                  </div>
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full font-medium border ${item.color}`}
                  >
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="absolute -bottom-6 -left-8 bg-card border border-border rounded-xl shadow-lg p-3.5 flex items-center gap-3 w-56">
        <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-xs font-semibold text-foreground">
            청구 승인 완료
          </p>
          <p className="text-[11px] text-muted-foreground">
            보험금 124,000원 지급
          </p>
        </div>
      </div>
      <div className="absolute -top-4 -right-4 bg-card border border-border rounded-xl shadow-lg p-3 flex items-center gap-2">
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
          ))}
        </div>
        <span className="text-xs font-medium text-foreground">4.9</span>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(37,99,235,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(37,99,235,0.04) 1px,transparent 1px)`,
          backgroundSize: "48px 48px",
        }}
      />
      <div
        className="absolute top-20 right-1/4 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle,rgba(37,99,235,0.08) 0%,transparent 70%)",
        }}
      />
      <div className="relative max-w-6xl mx-auto px-5 md:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col gap-6">
            <LandingBadge>
              <CheckCircle2 className="w-3 h-3" />
              공식 인증 보험 플랫폼
            </LandingBadge>
            <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-semibold text-foreground leading-[1.15] tracking-tight">
              스마트폰 파손·분실,
              <br />
              <span className="text-accent">한 곳에서</span> 해결하세요
            </h1>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-md">
              CareMate는 보험 가입부터 수리 접수, 보험금 청구까지 모든 과정을
              하나의 플랫폼에서 관리합니다.
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <Link to="/auth">
                <Button variant="accent" size="lg">
                  지금 무료로 시작하기 <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/customer/find-shop">
                <Button variant="secondary" size="lg">
                  서비스 센터 찾기
                </Button>
              </Link>
            </div>
            <p className="text-xs text-muted-foreground">
              신용카드 없이 30일 무료 체험 · 언제든지 해지 가능
            </p>
          </div>
          <div className="relative hidden md:block">
            <DashboardMockup />
          </div>
        </div>

        {/* Demo portal links */}
        <div className="mt-16 p-6 bg-card border border-border rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-muted-foreground">
              데모 포털 바로가기
            </p>
            <Link
              to="/design"
              className="text-xs text-accent hover:underline font-medium flex items-center gap-1"
            >
              🎨 전체 화면 디자인 오버뷰
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                label: "고객 포털",
                sub: "대시보드, 보험, A/S 접수",
                href: "/customer/dashboard",
                color:
                  "text-accent bg-accent/5 hover:bg-accent/10 border-accent/20",
              },
              {
                label: "수리점 포털",
                sub: "예약 관리, 수리 리포트",
                href: "/shop/dashboard",
                color:
                  "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/30 border-amber-200 dark:border-amber-700/50",
              },
              {
                label: "관리자 백오피스",
                sub: "KPI, 정산, 감사 로그",
                href: "/admin/dashboard",
                color:
                  "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 border-red-200 dark:border-red-700/50",
              },
            ].map((p) => (
              <Link
                key={p.href}
                to={p.href}
                className={`flex flex-col gap-1 p-4 rounded-xl border transition-all ${p.color}`}
              >
                <span className="text-sm font-semibold">{p.label}</span>
                <span className="text-xs opacity-70">{p.sub}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-px bg-border rounded-2xl overflow-hidden border border-border">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="bg-card flex flex-col items-center justify-center py-6 px-4 gap-1"
            >
              <span className="text-2xl md:text-3xl font-semibold text-foreground tracking-tight">
                {stat.value}
              </span>
              <span className="text-xs text-muted-foreground">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const FEATURES = [
  {
    icon: Shield,
    title: "통합 보험 관리",
    desc: "여러 보험사의 스마트폰 보험을 한 곳에서 비교하고 가입·갱신하세요. 복잡한 서류 작업 없이 5분 안에 가입 완료.",
    tag: "사용자",
  },
  {
    icon: Wrench,
    title: "수리점 네트워크",
    desc: "전국 3,200개 공인 수리점과 연결됩니다. 위치 기반으로 가장 가까운 제휴 수리점을 즉시 예약하세요.",
    tag: "사용자",
  },
  {
    icon: Clock,
    title: "빠른 청구 처리",
    desc: "사진 한 장으로 보험금 청구를 시작하세요. 평균 2영업일 이내 심사 완료, 신속한 보험금 지급을 보장합니다.",
    tag: "사용자·수리점",
  },
  {
    icon: CheckCircle2,
    title: "수리점 운영 솔루션",
    desc: "예약 관리, 수리 이력 기록, 보험 청구 대행까지. 수리점 운영에 필요한 모든 도구를 제공합니다.",
    tag: "수리점",
  },
];

function Features() {
  return (
    <section id="service" className="py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-5 md:px-8">
        <div className="flex flex-col items-center text-center gap-4 mb-14">
          <LandingBadge>핵심 기능</LandingBadge>
          <h2 className="text-3xl md:text-4xl font-semibold text-foreground tracking-tight max-w-2xl">
            사용자와 수리점 모두를 위한
            <br />
            완전한 A/S 생태계
          </h2>
          <p className="text-base text-muted-foreground max-w-xl leading-relaxed">
            CareMate는 단순한 보험 앱이 아닙니다. 사용자, 수리점, 보험사를
            하나로 연결하는 통합 플랫폼입니다.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="group bg-card border border-border rounded-2xl p-6 flex flex-col gap-4 hover:border-accent/30 hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-start justify-between">
                  <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/15 transition-colors">
                    <Icon className="w-5 h-5 text-accent" />
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground font-medium border border-border">
                    {f.tag}
                  </span>
                </div>
                <div className="flex flex-col gap-1.5">
                  <h3 className="text-base font-semibold text-foreground">
                    {f.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {f.desc}
                  </p>
                </div>
                <button className="flex items-center gap-1 text-xs font-medium text-accent hover:gap-2 transition-all mt-auto">
                  자세히 보기
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

const STEPS = [
  {
    step: "01",
    title: "보험 가입",
    desc: "기기 정보와 이용 패턴을 입력하면 최적 보험 플랜을 추천해 드립니다.",
  },
  {
    step: "02",
    title: "파손·분실 신고",
    desc: "앱에서 사진을 찍고 상황을 입력하세요. AI가 자동으로 손상 정도를 분석합니다.",
  },
  {
    step: "03",
    title: "수리점 예약",
    desc: "주변 제휴 수리점을 지도에서 확인하고 바로 예약하세요.",
  },
  {
    step: "04",
    title: "보험금 수령",
    desc: "수리가 완료되면 보험금이 자동 청구됩니다. 지정 계좌로 빠르게 지급됩니다.",
  },
];

const TESTIMONIALS = [
  {
    name: "이수연",
    role: "일반 사용자 · 서울",
    content:
      "액정이 산산조각 났는데 CareMate 앱에서 사진 찍고 신청하니 이틀 만에 수리비가 들어왔어요.",
    rating: 5,
  },
  {
    name: "박도현",
    role: "수리점 사장 · 부산",
    content:
      "예약 관리부터 보험 청구 대행까지 한 번에 처리되니 행정 시간이 절반으로 줄었어요.",
    rating: 5,
  },
  {
    name: "김지아",
    role: "일반 사용자 · 대전",
    content: "분실폰 신고가 5분 만에 완료되고, 새 폰 구입 지원금까지 받았어요.",
    rating: 5,
  },
];

const FOOTER_LINKS = {
  서비스: ["서비스 소개", "요금제 안내", "수리점 파트너", "기업 솔루션"],
  지원: ["고객센터", "FAQ", "공지사항", "서비스 상태"],
  법적고지: ["이용약관", "개인정보처리방침", "보험약관 안내"],
};

export default function LandingPage() {
  return (
    <div
      className="min-h-screen bg-background text-foreground"
      style={{ fontFamily: "'Noto Sans KR', 'DM Sans', sans-serif" }}
    >
      <Header />
      <main>
        <Hero />
        <Features />
        {/* How it works */}
        <section id="how" className="py-20 md:py-28 bg-primary">
          <div className="max-w-6xl mx-auto px-5 md:px-8">
            <div className="flex flex-col items-center text-center gap-4 mb-14">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full bg-white/10 text-white border border-white/20">
                이용 방법
              </span>
              <h2 className="text-3xl md:text-4xl font-semibold text-white tracking-tight">
                4단계로 끝나는 스마트 보험
              </h2>
            </div>
            <div className="grid md:grid-cols-4 gap-6">
              {STEPS.map((s, i) => (
                <div key={s.step} className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <span
                      className="text-4xl font-bold text-white/15 leading-none"
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                    >
                      {s.step}
                    </span>
                    {i < STEPS.length - 1 && (
                      <div className="flex-1 h-px bg-white/10 hidden md:block" />
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <h3 className="text-base font-semibold text-white">
                      {s.title}
                    </h3>
                    <p className="text-sm text-white/60 leading-relaxed">
                      {s.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        {/* Testimonials */}
        <section className="py-20 md:py-28">
          <div className="max-w-6xl mx-auto px-5 md:px-8">
            <div className="flex flex-col items-center text-center gap-4 mb-14">
              <LandingBadge>고객 후기</LandingBadge>
              <h2 className="text-3xl md:text-4xl font-semibold text-foreground tracking-tight">
                실제 사용자들의 이야기
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-5">
              {TESTIMONIALS.map((t) => (
                <div
                  key={t.name}
                  className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-4"
                >
                  <div className="flex gap-0.5">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>
                  <p className="text-sm text-foreground leading-relaxed flex-1">
                    "{t.content}"
                  </p>
                  <div className="flex items-center gap-3 pt-2 border-t border-border">
                    <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent text-sm font-semibold">
                      {t.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {t.name}
                      </p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        {/* CTA */}
        <section className="py-16 md:py-20">
          <div className="max-w-6xl mx-auto px-5 md:px-8">
            <div className="bg-accent rounded-3xl px-8 md:px-16 py-12 md:py-16 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex flex-col gap-3 text-center md:text-left">
                <h2 className="text-2xl md:text-3xl font-semibold text-white tracking-tight">
                  지금 바로 무료로 시작하세요
                </h2>
                <p className="text-base text-white/70">
                  30일 무료 체험 · 카드 없이 가입 · 언제든 해지
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                <Link to="/auth">
                  <button className="px-7 py-3.5 rounded-xl bg-white text-accent font-semibold text-sm hover:bg-white/90 transition-colors whitespace-nowrap">
                    사용자로 가입하기
                  </button>
                </Link>
                <Link to="/auth">
                  <button className="px-7 py-3.5 rounded-xl bg-white/15 text-white font-semibold text-sm hover:bg-white/25 transition-colors border border-white/30 whitespace-nowrap">
                    수리점 파트너 신청
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="bg-primary text-white/80">
        <div className="max-w-6xl mx-auto px-5 md:px-8 pt-14 pb-8">
          <div className="grid md:grid-cols-[2fr_1fr_1fr_1fr] gap-10 pb-12 border-b border-white/10">
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shrink-0">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <span
                  className="text-lg font-semibold text-white tracking-tight"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  Care<span className="text-accent">Mate</span>
                </span>
              </div>
              <p className="text-sm text-white/50 leading-relaxed max-w-xs">
                스마트폰 A/S 보험 통합 관리 플랫폼.
              </p>
              <div className="flex flex-col gap-2.5 text-xs text-white/40">
                <span className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  서울특별시 강남구 테헤란로 152
                </span>
                <span className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 shrink-0" />
                  1588-0000 (평일 09:00–18:00)
                </span>
                <span className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 shrink-0" />
                  hello@caremate.kr
                </span>
              </div>
            </div>
            {Object.entries(FOOTER_LINKS).map(([cat, links]) => (
              <div key={cat} className="flex flex-col gap-4">
                <h4 className="text-sm font-semibold text-white">{cat}</h4>
                <ul className="flex flex-col gap-2.5">
                  {links.map((l) => (
                    <li key={l}>
                      <a
                        href="#"
                        className="text-sm text-white/50 hover:text-white/80 transition-colors"
                      >
                        {l}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/30">
            <p>© 2025 CareMate Inc. All rights reserved.</p>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span>모든 시스템 정상 운영 중</span>
            </div>
            <p>금융위원회 허가 보험 플랫폼 · 사업자등록번호 123-45-67890</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
