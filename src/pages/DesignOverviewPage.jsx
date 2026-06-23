import { Link } from "react-router";
import { ExternalLink, Grid } from "lucide-react";

// ── Canvas constants ──────────────────────────────────────────────────────────
const W = 1280;
const H = 820;
const SC = 0.23;
const DW = Math.round(W * SC); // 294
const DH = Math.round(H * SC); // 189

// Design tokens (light mode — forced in frames)
const C = {
  bg: "#F4F6FA",
  card: "#FFFFFF",
  sidebar: "#1A1D2E",
  fg: "#1A1D2E",
  muted: "#6B7280",
  border: "rgba(26,29,46,0.1)",
  accent: "#2563EB",
  accentLight: "rgba(37,99,235,0.1)",
  secondary: "#EEF1F8",
  green: "#16A34A",
  amber: "#D97706",
  red: "#DC2626",
};

// ── Frame wrapper ─────────────────────────────────────────────────────────────
function Frame({ title, route, children, tag }) {
  return (
    <div style={{ width: DW, flexShrink: 0 }}>
      {/* Artboard */}
      <div
        style={{
          width: DW,
          height: DH,
          position: "relative",
          overflow: "hidden",
          borderRadius: 6,
          border: "1px solid rgba(255,255,255,0.12)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
        }}
      >
        {/* Scaled content */}
        <div
          style={{
            width: W,
            height: H,
            transform: `scale(${SC})`,
            transformOrigin: "top left",
            pointerEvents: "none",
            fontFamily: "'Noto Sans KR', 'DM Sans', sans-serif",
            background: C.bg,
          }}
        >
          {children}
        </div>
      </div>
      {/* Label row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: 8,
          paddingInline: 2,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {tag && (
            <span
              style={{
                fontSize: 9,
                padding: "1px 6px",
                borderRadius: 9999,
                background: "rgba(255,255,255,0.08)",
                color: "rgba(255,255,255,0.45)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              {tag}
            </span>
          )}
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "rgba(255,255,255,0.75)",
            }}
          >
            {title}
          </span>
        </div>
        {route && (
          <Link
            to={route}
            style={{
              fontSize: 10,
              color: "rgba(255,255,255,0.3)",
              display: "flex",
              alignItems: "center",
              gap: 3,
              textDecoration: "none",
            }}
            className="hover:!text-white/60 transition-colors"
          >
            <ExternalLink size={10} />
            열기
          </Link>
        )}
      </div>
    </div>
  );
}

// ── Section wrapper ───────────────────────────────────────────────────────────
function Section({ title, color, children }) {
  return (
    <div style={{ marginBottom: 56 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 20,
        }}
      >
        <div
          style={{ width: 3, height: 18, background: color, borderRadius: 2 }}
        />
        <span
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: "rgba(255,255,255,0.85)",
            letterSpacing: "0.02em",
          }}
        >
          {title}
        </span>
        <div
          style={{
            flex: 1,
            height: 1,
            background: "rgba(255,255,255,0.06)",
            marginLeft: 4,
          }}
        />
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
        {children}
      </div>
    </div>
  );
}

// ── Shared frame elements ─────────────────────────────────────────────────────
function AppSidebar({ items, active }) {
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: 240,
        height: "100%",
        background: C.sidebar,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: "20px 16px",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: C.accent,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 16,
              height: 16,
              borderRadius: 3,
              background: "white",
            }}
          />
        </div>
        <span style={{ color: "white", fontWeight: 700, fontSize: 16 }}>
          Care<span style={{ color: "#60A5FA" }}>Mate</span>
        </span>
      </div>
      {/* Nav items */}
      <div style={{ padding: "12px 8px", flex: 1 }}>
        {items.map((item) => (
          <div
            key={item}
            style={{
              padding: "10px 12px",
              borderRadius: 12,
              marginBottom: 2,
              background:
                item === active ? "rgba(255,255,255,0.15)" : "transparent",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <div
              style={{
                width: 16,
                height: 16,
                borderRadius: 4,
                background:
                  item === active
                    ? "rgba(255,255,255,0.7)"
                    : "rgba(255,255,255,0.2)",
              }}
            />
            <span
              style={{
                color: item === active ? "white" : "rgba(255,255,255,0.5)",
                fontSize: 14,
              }}
            >
              {item}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AppTopBar({ left = 240, title }) {
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left,
        right: 0,
        height: 64,
        background: "rgba(244,246,250,0.9)",
        borderBottom: `1px solid ${C.border}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        padding: "0 24px",
        gap: 12,
      }}
    >
      {title && (
        <span
          style={{
            fontSize: 13,
            color: C.muted,
            marginRight: "auto",
            marginLeft: 24,
          }}
        >
          {title}
        </span>
      )}
      <div style={{ display: "flex", gap: 6 }}>
        {["고객", "수리점", "관리자"].map((r) => (
          <div
            key={r}
            style={{
              padding: "4px 12px",
              borderRadius: 8,
              background: r === "고객" ? "white" : "transparent",
              fontSize: 12,
              color: r === "고객" ? C.fg : C.muted,
            }}
          >
            {r}
          </div>
        ))}
      </div>
      <div
        style={{
          width: 32,
          height: 20,
          borderRadius: 10,
          background: "#EEF1F8",
          border: `1px solid ${C.border}`,
          position: "relative",
        }}
      >
        <div
          style={{
            width: 16,
            height: 16,
            borderRadius: "50%",
            background: "white",
            position: "absolute",
            top: 1,
            left: 1,
            boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
          }}
        />
      </div>
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          background: C.accentLight,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 13,
          fontWeight: 700,
          color: C.accent,
        }}
      >
        김
      </div>
    </div>
  );
}

function AppContent({ left = 240 }) {
  return { paddingLeft: left, paddingTop: 64 };
}

function KCard({ label, value, color }) {
  return (
    <div
      style={{
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: 16,
        padding: "16px 20px",
        flex: 1,
      }}
    >
      <div style={{ fontSize: 11, color: C.muted, marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, color: color || C.fg }}>
        {value}
      </div>
    </div>
  );
}

function TableRow({ cols, header }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 0,
        borderBottom: `1px solid ${C.border}`,
        background: header ? C.secondary : "transparent",
      }}
    >
      {cols.map((c, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            padding: "10px 12px",
            fontSize: header ? 11 : 12,
            color: header ? C.muted : C.fg,
            fontWeight: header ? 600 : 400,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {c}
        </div>
      ))}
    </div>
  );
}

function ChipBadge({ text, color = C.accent, bg }) {
  return (
    <span
      style={{
        padding: "2px 8px",
        borderRadius: 9999,
        fontSize: 11,
        fontWeight: 600,
        color,
        background: bg || `${color}18`,
        border: `1px solid ${color}30`,
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </span>
  );
}

function Bar({ pct, color = C.accent }) {
  return (
    <div
      style={{
        height: 6,
        background: C.secondary,
        borderRadius: 4,
        overflow: "hidden",
        width: "100%",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${pct}%`,
          background: color,
          borderRadius: 4,
        }}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// SCREEN CONTENT COMPONENTS
// ═══════════════════════════════════════════════════════════

// 1. Landing Page
function LandingScreen() {
  return (
    <div
      style={{
        width: W,
        height: H,
        background: C.bg,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Nav */}
      <div
        style={{
          height: 64,
          background: "rgba(244,246,250,0.85)",
          borderBottom: `1px solid ${C.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 40px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: C.accent,
            }}
          />
          <span style={{ fontWeight: 700, fontSize: 18, color: C.fg }}>
            Care<span style={{ color: C.accent }}>Mate</span>
          </span>
        </div>
        <div style={{ display: "flex", gap: 24 }}>
          {["서비스 소개", "이용 방법", "수리점 파트너"].map((l) => (
            <span key={l} style={{ fontSize: 13, color: C.muted }}>
              {l}
            </span>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <div
            style={{
              padding: "8px 16px",
              borderRadius: 10,
              border: `1px solid ${C.border}`,
              fontSize: 13,
              color: C.fg,
            }}
          >
            로그인
          </div>
          <div
            style={{
              padding: "8px 16px",
              borderRadius: 10,
              background: C.accent,
              fontSize: 13,
              color: "white",
              fontWeight: 600,
            }}
          >
            무료로 시작하기
          </div>
        </div>
      </div>
      {/* Grid background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(37,99,235,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(37,99,235,0.04) 1px,transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      {/* Hero */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "60px 80px",
          gap: 60,
          position: "relative",
        }}
      >
        <div style={{ flex: 1 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "5px 12px",
              borderRadius: 9999,
              background: C.accentLight,
              border: `1px solid ${C.accent}30`,
              marginBottom: 20,
              fontSize: 12,
              color: C.accent,
            }}
          >
            ✓ 공식 인증 보험 플랫폼
          </div>
          <div
            style={{
              fontSize: 52,
              fontWeight: 700,
              color: C.fg,
              lineHeight: 1.15,
              marginBottom: 20,
            }}
          >
            스마트폰 파손·분실,
            <br />
            <span style={{ color: C.accent }}>한 곳에서</span> 해결하세요
          </div>
          <div
            style={{
              fontSize: 16,
              color: C.muted,
              lineHeight: 1.7,
              marginBottom: 32,
              maxWidth: 440,
            }}
          >
            CareMate는 보험 가입부터 수리 접수, 보험금 청구까지 모든 과정을
            하나의 플랫폼에서 관리합니다.
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <div
              style={{
                padding: "14px 28px",
                borderRadius: 12,
                background: C.accent,
                color: "white",
                fontSize: 15,
                fontWeight: 700,
                boxShadow: "0 8px 24px rgba(37,99,235,0.3)",
              }}
            >
              지금 무료로 시작하기 →
            </div>
            <div
              style={{
                padding: "14px 28px",
                borderRadius: 12,
                background: C.card,
                border: `1px solid ${C.border}`,
                color: C.fg,
                fontSize: 15,
              }}
            >
              서비스 센터 찾기
            </div>
          </div>
        </div>
        {/* Dashboard mockup */}
        <div
          style={{
            width: 360,
            background: C.card,
            borderRadius: 20,
            boxShadow: "0 20px 60px rgba(0,0,0,0.12)",
            overflow: "hidden",
            border: `1px solid ${C.border}`,
          }}
        >
          <div
            style={{
              background: C.secondary,
              padding: "12px 16px",
              display: "flex",
              gap: 6,
            }}
          >
            {["#FC5F57", "#FDBC2C", "#33C748"].map((c) => (
              <div
                key={c}
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  background: c,
                }}
              />
            ))}
          </div>
          <div
            style={{
              padding: "16px",
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ fontSize: 11, color: C.muted }}>
                  안녕하세요, 김민준 님
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.fg }}>
                  내 보험 현황
                </div>
              </div>
              <ChipBadge text="보장중" color="#16A34A" />
            </div>
            <div
              style={{
                background: C.secondary,
                borderRadius: 12,
                padding: 12,
                display: "flex",
                gap: 10,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: C.accentLight,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                📱
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.fg }}>
                  iPhone 15 Pro · 실버 256GB
                </div>
                <div style={{ fontSize: 11, color: C.muted }}>
                  접수번호: #AS-2024-0612
                </div>
              </div>
            </div>
            {[
              { l: "액정 파손 수리", d: "06.02", s: "완료", c: "#16A34A" },
              { l: "배터리 교체", d: "04.18", s: "완료", c: "#16A34A" },
            ].map((r) => (
              <div
                key={r.l}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingBlock: 6,
                  borderBottom: `1px solid ${C.border}`,
                }}
              >
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.fg }}>
                    {r.l}
                  </div>
                  <div style={{ fontSize: 11, color: C.muted }}>{r.d}</div>
                </div>
                <ChipBadge text={r.s} color={r.c} />
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Stats bar */}
      <div
        style={{
          display: "flex",
          margin: "0 80px",
          borderRadius: 16,
          overflow: "hidden",
          border: `1px solid ${C.border}`,
        }}
      >
        {[
          ["48만+", "누적 가입자"],
          ["3,200+", "제휴 수리점"],
          ["99.2%", "청구 승인율"],
          ["4.8★", "사용자 만족도"],
        ].map(([v, l]) => (
          <div
            key={l}
            style={{
              flex: 1,
              textAlign: "center",
              padding: "20px",
              background: C.card,
              borderRight: `1px solid ${C.border}`,
            }}
          >
            <div style={{ fontSize: 28, fontWeight: 700, color: C.fg }}>
              {v}
            </div>
            <div style={{ fontSize: 12, color: C.muted }}>{l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 2. Auth Page
function AuthScreen() {
  return (
    <div
      style={{
        width: W,
        height: H,
        background: C.bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 32,
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: C.accent,
          }}
        />
        <span style={{ fontWeight: 700, fontSize: 18, color: C.fg }}>
          Care<span style={{ color: C.accent }}>Mate</span>
        </span>
      </div>
      <div
        style={{
          width: 440,
          background: C.card,
          borderRadius: 20,
          boxShadow: "0 8px 40px rgba(0,0,0,0.1)",
          border: `1px solid ${C.border}`,
          overflow: "hidden",
        }}
      >
        {/* Mode tabs */}
        <div style={{ display: "flex", borderBottom: `1px solid ${C.border}` }}>
          {["로그인", "회원가입"].map((m, i) => (
            <div
              key={m}
              style={{
                flex: 1,
                textAlign: "center",
                padding: "14px",
                fontSize: 14,
                fontWeight: 600,
                color: i === 0 ? C.accent : C.muted,
                borderBottom: i === 0 ? `2px solid ${C.accent}` : "none",
              }}
            >
              {m}
            </div>
          ))}
        </div>
        <div style={{ padding: "24px" }}>
          {/* Role toggle */}
          <div style={{ fontSize: 11, color: C.muted, marginBottom: 8 }}>
            회원 유형 선택
          </div>
          <div
            style={{
              display: "flex",
              background: C.secondary,
              borderRadius: 12,
              padding: 3,
              marginBottom: 20,
            }}
          >
            {["일반 고객", "수리점 파트너"].map((t, i) => (
              <div
                key={t}
                style={{
                  flex: 1,
                  textAlign: "center",
                  padding: "9px",
                  borderRadius: 10,
                  background: i === 0 ? C.card : "transparent",
                  fontSize: 13,
                  fontWeight: i === 0 ? 600 : 400,
                  color: i === 0 ? C.fg : C.muted,
                }}
              >
                {t}
              </div>
            ))}
          </div>
          {/* Fields */}
          {["이메일", "비밀번호"].map((f) => (
            <div key={f} style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 5 }}>
                {f}
              </div>
              <div
                style={{
                  background: C.secondary,
                  border: `1px solid ${C.border}`,
                  borderRadius: 12,
                  padding: "10px 14px",
                  fontSize: 13,
                  color: C.muted,
                }}
              >
                {f === "이메일" ? "example@caremate.kr" : "••••••••"}
              </div>
            </div>
          ))}
          <div
            style={{
              textAlign: "right",
              fontSize: 11,
              color: C.accent,
              marginBottom: 20,
            }}
          >
            비밀번호를 잊으셨나요?
          </div>
          <div
            style={{
              background: C.accent,
              borderRadius: 12,
              padding: "12px",
              textAlign: "center",
              fontSize: 14,
              fontWeight: 700,
              color: "white",
              boxShadow: "0 6px 20px rgba(37,99,235,0.25)",
            }}
          >
            로그인
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            {["카카오", "네이버", "Google"].map((s) => (
              <div
                key={s}
                style={{
                  flex: 1,
                  textAlign: "center",
                  padding: "9px",
                  border: `1px solid ${C.border}`,
                  borderRadius: 12,
                  fontSize: 12,
                  color: C.muted,
                }}
              >
                {s}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// 3. Find Shop Page
function FindShopScreen() {
  return (
    <div style={{ width: W, height: H, display: "flex", position: "relative" }}>
      {/* Left sidebar */}
      <div
        style={{
          width: 400,
          background: C.bg,
          borderRight: `1px solid ${C.border}`,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            padding: "16px",
            background: C.card,
            borderBottom: `1px solid ${C.border}`,
          }}
        >
          <div
            style={{
              background: C.secondary,
              border: `1px solid ${C.border}`,
              borderRadius: 12,
              padding: "10px 14px",
              fontSize: 13,
              color: C.muted,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            🔍 수리점 검색...
          </div>
          <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
            {["전체", "Apple", "Samsung", "Google"].map((b, i) => (
              <div
                key={b}
                style={{
                  padding: "5px 12px",
                  borderRadius: 9999,
                  fontSize: 12,
                  background: i === 0 ? C.accent : C.card,
                  color: i === 0 ? "white" : C.muted,
                  border: `1px solid ${i === 0 ? C.accent : C.border}`,
                }}
              >
                {b}
              </div>
            ))}
          </div>
        </div>
        <div style={{ flex: 1, padding: "12px", overflow: "hidden" }}>
          {[
            "강남 스마트케어",
            "서초 아이폰 전문점",
            "역삼 갤럭시 수리",
            "선릉 올폰 서비스",
          ].map((name, i) => (
            <div
              key={name}
              style={{
                background: i === 0 ? C.card : C.card,
                border: `1px solid ${i === 0 ? C.accent : C.border}`,
                borderRadius: 16,
                padding: "14px",
                marginBottom: 8,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.fg }}>
                    {name}
                  </div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>
                    ⭐ 4.{9 - i} · {i === 0 ? "0.4" : i * 0.8}km
                  </div>
                </div>
                <ChipBadge
                  text={i % 2 === 1 ? "혼잡" : "예약 가능"}
                  color={i % 2 === 1 ? C.amber : C.green}
                />
              </div>
              <div
                style={{
                  marginTop: 10,
                  background: C.accentLight,
                  borderRadius: 10,
                  padding: "7px 12px",
                  textAlign: "center",
                  fontSize: 12,
                  color: C.accent,
                  fontWeight: 600,
                }}
              >
                A/S 예약
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Right map */}
      <div
        style={{
          flex: 1,
          background: "#EEF2F7",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Grid pattern */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(148,163,184,0.3) 1px,transparent 1px),linear-gradient(90deg,rgba(148,163,184,0.3) 1px,transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />
        {/* Road blocks */}
        {[
          [200, 100, 280, 180],
          [540, 60, 220, 200],
          [180, 320, 200, 160],
          [460, 300, 300, 200],
          [200, 530, 320, 160],
        ].map(([x, y, w, h], i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: w,
              height: h,
              background: "#D1D8E0",
              borderRadius: 8,
              opacity: 0.6,
            }}
          />
        ))}
        {/* Map pins */}
        {[
          [350, 250, true],
          [260, 400, false],
          [550, 200, true],
          [680, 370, false],
          [500, 500, true],
        ].map(([x, y, avail], i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              transform: "translate(-50%,-100%)",
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: avail ? C.accent : C.amber,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: 11,
                fontWeight: 700,
                border: "2px solid white",
                boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
              }}
            >
              {i + 1}
            </div>
          </div>
        ))}
        {/* Info popup */}
        <div
          style={{
            position: "absolute",
            top: 20,
            right: 20,
            background: C.card,
            border: `1px solid ${C.border}`,
            borderRadius: 16,
            padding: "16px",
            width: 240,
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 700, color: C.fg }}>
            강남 스마트케어
          </div>
          <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>
            ⭐ 4.9 (312)
          </div>
          <div style={{ fontSize: 11, color: C.muted, marginTop: 8 }}>
            🕐 09:00 – 20:00
          </div>
          <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>
            📞 02-1234-5678
          </div>
          <div
            style={{
              marginTop: 12,
              background: C.accent,
              borderRadius: 10,
              padding: "8px",
              textAlign: "center",
              fontSize: 12,
              color: "white",
              fontWeight: 700,
            }}
          >
            A/S 예약하기
          </div>
        </div>
        {/* Legend */}
        <div
          style={{
            position: "absolute",
            bottom: 20,
            left: 20,
            background: "rgba(255,255,255,0.8)",
            borderRadius: 12,
            padding: "8px 12px",
            display: "flex",
            gap: 12,
            fontSize: 11,
            color: C.muted,
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: C.accent,
                display: "inline-block",
              }}
            />
            예약 가능
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: C.amber,
                display: "inline-block",
              }}
            />
            혼잡
          </span>
        </div>
      </div>
    </div>
  );
}

// 4. Customer Dashboard
function CustomerDashboardScreen() {
  const NAV = ["대시보드", "A/S 접수", "보험 관리", "결제·청구", "서비스 센터"];
  return (
    <div style={{ width: W, height: H, position: "relative" }}>
      <AppSidebar items={NAV} active="대시보드" />
      <AppTopBar />
      <div
        style={{
          ...AppContent(),
          padding: "32px 40px 32px 272px",
          display: "flex",
          flexDirection: "column",
          gap: 24,
        }}
      >
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: C.fg }}>
            대시보드
          </div>
          <div style={{ fontSize: 13, color: C.muted }}>
            안녕하세요, 김민준 님. 현재 진행 중인 A/S가 있습니다.
          </div>
        </div>
        {/* Stepper */}
        <div
          style={{
            background: C.card,
            border: `1px solid ${C.border}`,
            borderRadius: 16,
            padding: "20px 24px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 20,
                left: 20,
                right: 20,
                height: 2,
                background: C.secondary,
              }}
            />
            <div
              style={{
                position: "absolute",
                top: 20,
                left: 20,
                width: "25%",
                height: 2,
                background: "#0D9488",
              }}
            />
            {["접수", "수리중", "수리완료", "결제대기", "인도완료"].map(
              (s, i) => (
                <div
                  key={s}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 8,
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      background:
                        i < 2 ? "#0D9488" : i === 2 ? C.card : C.secondary,
                      border: i === 2 ? "2px solid #0D9488" : "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {i < 2 ? (
                      <span style={{ color: "white", fontSize: 14 }}>✓</span>
                    ) : (
                      <div
                        style={{
                          width: 14,
                          height: 14,
                          borderRadius: 3,
                          background: i === 2 ? "#0D9488" : C.border,
                        }}
                      />
                    )}
                  </div>
                  <span
                    style={{
                      fontSize: 12,
                      color: i === 2 ? "#0D9488" : i < 2 ? C.fg : C.muted,
                      fontWeight: i <= 2 ? 600 : 400,
                    }}
                  >
                    {s}
                  </span>
                </div>
              ),
            )}
          </div>
        </div>
        {/* 2-col grid */}
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}
        >
          {/* AS summary */}
          <div
            style={{
              background: C.card,
              border: `1px solid ${C.border}`,
              borderRadius: 16,
              padding: "20px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <span style={{ fontSize: 14, fontWeight: 700, color: C.fg }}>
                진행 중인 A/S 요청
              </span>
              <ChipBadge text="수리중" color="#0D9488" />
            </div>
            <div
              style={{
                background: C.secondary,
                borderRadius: 12,
                padding: 12,
                display: "flex",
                gap: 10,
                marginBottom: 14,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: C.accentLight,
                }}
              />
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.fg }}>
                  iPhone 15 Pro · 실버 256GB
                </div>
                <div style={{ fontSize: 11, color: C.muted }}>
                  #AS-2024-0612
                </div>
              </div>
            </div>
            {[
              ["담당 수리점", "강남 스마트케어"],
              ["예약 일시", "2024.06.13 14:00"],
              ["적용 보험", "Carrier Care"],
            ].map(([k, v]) => (
              <div
                key={k}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  paddingBlock: 6,
                  borderBottom: `1px solid ${C.border}`,
                  fontSize: 13,
                }}
              >
                <span style={{ color: C.muted }}>{k}</span>
                <span style={{ color: C.fg, fontWeight: 600 }}>{v}</span>
              </div>
            ))}
          </div>
          {/* Notification feed */}
          <div
            style={{
              background: C.card,
              border: `1px solid ${C.border}`,
              borderRadius: 16,
              padding: "20px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 16,
              }}
            >
              <span style={{ fontSize: 14, fontWeight: 700, color: C.fg }}>
                실시간 알림
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: C.accent,
                  }}
                />
                <span style={{ fontSize: 11, color: C.muted }}>
                  실시간 연결됨
                </span>
              </div>
            </div>
            {[
              [
                "수리 리포트가 도착했습니다. 견적을 확인해 주세요.",
                "방금 전",
                false,
              ],
              ["담당 기사님이 배정되었습니다.", "1시간 전", false],
              ["A/S 접수가 완료되었습니다.", "3시간 전", true],
            ].map(([msg, t, read], i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: 10,
                  paddingBlock: 10,
                  borderBottom: `1px solid ${C.border}`,
                  opacity: read ? 0.5 : 1,
                }}
              >
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background:
                      i === 0 ? C.accent : i === 1 ? "#0D9488" : C.muted,
                    marginTop: 6,
                    flexShrink: 0,
                  }}
                />
                <div>
                  <div style={{ fontSize: 12, color: C.fg, lineHeight: 1.5 }}>
                    {msg}
                  </div>
                  <div style={{ fontSize: 10, color: C.muted, marginTop: 3 }}>
                    {t}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// 5. A/S Request
function RequestScreen() {
  const NAV = ["대시보드", "A/S 접수", "보험 관리", "결제·청구", "서비스 센터"];
  return (
    <div style={{ width: W, height: H, position: "relative" }}>
      <AppSidebar items={NAV} active="A/S 접수" />
      <AppTopBar />
      <div style={{ ...AppContent(), padding: "32px 60px 32px 280px" }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: C.fg }}>
            비대면 A/S 접수
          </div>
          <div style={{ fontSize: 13, color: C.muted }}>
            단계별로 정보를 입력하면 빠르게 접수됩니다.
          </div>
        </div>
        {/* Step indicator */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 24,
          }}
        >
          {[
            "파손 설명",
            "사진·영상 업로드",
            "서비스 센터 선택",
            "보험 선택",
          ].map((s, i) => (
            <div
              key={s}
              style={{ display: "flex", alignItems: "center", gap: 8 }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: i === 0 ? C.fg : C.secondary,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  fontWeight: 700,
                  color: i === 0 ? "white" : C.muted,
                }}
              >
                {i + 1}
              </div>
              <span
                style={{
                  fontSize: 12,
                  color: i === 0 ? C.fg : C.muted,
                  fontWeight: i === 0 ? 600 : 400,
                }}
              >
                {s}
              </span>
              {i < 3 && <span style={{ color: C.muted }}>›</span>}
            </div>
          ))}
        </div>
        {/* Form card */}
        <div
          style={{
            background: C.card,
            border: `1px solid ${C.border}`,
            borderRadius: 16,
            padding: "24px",
            maxWidth: 680,
          }}
        >
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: C.fg,
              marginBottom: 6,
            }}
          >
            파손 상황 설명
          </div>
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 16 }}>
            어떤 상황에서, 어떤 부분이 파손되었는지 자세히 기술해주세요.
          </div>
          <div
            style={{
              background: C.secondary,
              border: `1px solid ${C.border}`,
              borderRadius: 12,
              padding: "14px",
              minHeight: 120,
              fontSize: 13,
              color: C.muted,
            }}
          >
            예: 핸드폰을 떨어뜨려 전면 유리가 깨졌습니다...
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
            {["액정 파손", "침수", "배터리 불량", "카메라 파손"].map((t) => (
              <div
                key={t}
                style={{
                  padding: "5px 12px",
                  borderRadius: 9999,
                  border: `1px solid ${C.border}`,
                  fontSize: 12,
                  color: C.muted,
                  background: C.card,
                }}
              >
                + {t}
              </div>
            ))}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 12,
            marginTop: 24,
          }}
        >
          <div
            style={{
              padding: "10px 24px",
              borderRadius: 12,
              border: `1px solid ${C.border}`,
              fontSize: 14,
              color: C.fg,
            }}
          >
            취소
          </div>
          <div
            style={{
              padding: "10px 24px",
              borderRadius: 12,
              background: C.accent,
              fontSize: 14,
              fontWeight: 700,
              color: "white",
              boxShadow: "0 4px 16px rgba(37,99,235,0.25)",
            }}
          >
            다음 단계
          </div>
        </div>
      </div>
    </div>
  );
}

// 6. Insurance Management
function InsuranceScreen() {
  const NAV = ["대시보드", "A/S 접수", "보험 관리", "결제·청구", "서비스 센터"];
  return (
    <div style={{ width: W, height: H, position: "relative" }}>
      <AppSidebar items={NAV} active="보험 관리" />
      <AppTopBar />
      <div style={{ ...AppContent(), padding: "32px 40px 32px 272px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: C.fg }}>
              내 보험 관리
            </div>
            <div style={{ fontSize: 13, color: C.muted }}>
              연동된 보험 정책을 한 곳에서 관리하세요.
            </div>
          </div>
          <div
            style={{
              padding: "9px 18px",
              borderRadius: 10,
              background: C.accent,
              fontSize: 13,
              fontWeight: 700,
              color: "white",
            }}
          >
            + 보험 연동하기
          </div>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 16,
          }}
        >
          {[
            { name: "Carrier Care", carrier: "SKT", pct: 80, active: true },
            {
              name: "프리미엄 카드 폰케어",
              carrier: "신한카드",
              pct: 60,
              active: true,
            },
            {
              name: "디지털 안심보험",
              carrier: "삼성화재",
              pct: 90,
              active: false,
            },
          ].map((p) => (
            <div
              key={p.name}
              style={{
                background: C.card,
                border: `1px solid ${p.active ? C.border : C.secondary}`,
                borderRadius: 16,
                padding: "20px",
                opacity: p.active ? 1 : 0.7,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    background: C.accentLight,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 18,
                  }}
                >
                  🛡
                </div>
                <div
                  style={{
                    width: 36,
                    height: 20,
                    borderRadius: 10,
                    background: p.active ? C.accent : C.secondary,
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: "50%",
                      background: "white",
                      position: "absolute",
                      top: 2,
                      right: p.active ? 2 : "auto",
                      left: p.active ? "auto" : 2,
                    }}
                  />
                </div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.fg }}>
                {p.name}
              </div>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 12 }}>
                {p.carrier}
              </div>
              <div style={{ marginBottom: 8 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 5,
                    fontSize: 11,
                  }}
                >
                  <span style={{ color: C.muted }}>보장 비율</span>
                  <span style={{ color: C.fg, fontWeight: 700 }}>{p.pct}%</span>
                </div>
                <Bar pct={p.pct} />
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  paddingTop: 12,
                  borderTop: `1px solid ${C.border}`,
                }}
              >
                <ChipBadge
                  text={p.active ? "활성화" : "비활성화"}
                  color={p.active ? C.green : C.muted}
                />
                <span style={{ fontSize: 11, color: C.muted }}>
                  약관 보기 ›
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 7. Payment Page
function PaymentScreen() {
  const NAV = ["대시보드", "A/S 접수", "보험 관리", "결제·청구", "서비스 센터"];
  return (
    <div style={{ width: W, height: H, position: "relative" }}>
      <AppSidebar items={NAV} active="결제·청구" />
      <AppTopBar />
      <div style={{ ...AppContent(), padding: "32px 40px 32px 272px" }}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: C.fg }}>
            결제 센터
          </div>
          <div style={{ fontSize: 13, color: C.muted }}>
            수리 대금을 결제하면 보험 청구 패키지가 자동 생성됩니다.
          </div>
        </div>
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}
        >
          {/* Invoice */}
          <div
            style={{
              background: C.card,
              border: `1px solid ${C.border}`,
              borderRadius: 16,
              padding: "20px",
            }}
          >
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: C.fg,
                marginBottom: 16,
              }}
            >
              수리 청구 명세서
            </div>
            {[
              ["전면 유리 교체 (파트비)", "180,000원"],
              ["액정 모듈 교체 (파트비)", "120,000원"],
              ["공임비", "50,000원"],
              ["출장 방문비", "20,000원"],
            ].map(([l, v]) => (
              <div
                key={l}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  paddingBlock: 9,
                  borderBottom: `1px solid ${C.border}`,
                  fontSize: 13,
                }}
              >
                <span style={{ color: C.muted }}>{l}</span>
                <span style={{ color: C.fg, fontWeight: 600 }}>{v}</span>
              </div>
            ))}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                paddingTop: 12,
                fontSize: 16,
                fontWeight: 700,
              }}
            >
              <span>합계</span>
              <span>370,000원</span>
            </div>
          </div>
          {/* Calculator */}
          <div
            style={{
              background: "linear-gradient(135deg,#F0FDF4,#ECFDF5)",
              border: "1px solid #BBF7D0",
              borderRadius: 16,
              padding: "20px",
            }}
          >
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: "#14532D",
                marginBottom: 14,
              }}
            >
              💡 보험 환급 예상액
            </div>
            <div
              style={{
                fontSize: 11,
                color: "#166534",
                marginBottom: 16,
                lineHeight: 1.6,
              }}
            >
              결제 완료 후 보험사별 청구 패키지가 생성됩니다.
            </div>
            {[
              ["Carrier Care (SKT)", "≈ ₩272,000", "80%"],
              ["프리미엄 카드 폰케어", "≈ ₩192,000", "60%"],
            ].map(([n, v, p]) => (
              <div
                key={n}
                style={{
                  background: "rgba(255,255,255,0.7)",
                  borderRadius: 12,
                  padding: "12px 14px",
                  marginBottom: 8,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.fg }}>
                    {n}
                  </div>
                  <div style={{ fontSize: 10, color: C.muted }}>{p} 보장</div>
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.accent }}>
                  {v}
                </div>
              </div>
            ))}
            <div
              style={{
                background: "white",
                borderRadius: 12,
                padding: "12px 14px",
                marginTop: 12,
                border: "1px solid #BBF7D0",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontWeight: 700, color: "#14532D" }}>
                  총 예상 환급액
                </span>
                <span
                  style={{ fontSize: 18, fontWeight: 800, color: "#15803D" }}
                >
                  ≈ ₩464,000
                </span>
              </div>
            </div>
          </div>
        </div>
        <div
          style={{
            marginTop: 20,
            background: C.card,
            border: `1px solid ${C.border}`,
            borderRadius: 16,
            padding: "20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.fg }}>
              결제 즉시 청구 패키지가 생성됩니다
            </div>
            <div style={{ fontSize: 12, color: C.muted }}>
              결제 금액은 수리점에 바로 지급됩니다.
            </div>
          </div>
          <div
            style={{
              padding: "13px 32px",
              borderRadius: 12,
              background: C.accent,
              fontSize: 15,
              fontWeight: 700,
              color: "white",
              boxShadow: "0 6px 20px rgba(37,99,235,0.3)",
            }}
          >
            370,000원 결제하기
          </div>
        </div>
      </div>
    </div>
  );
}

// 8. LMS Gate
function LMSGateScreen() {
  const NAV = ["대시보드", "수리 리포트", "LMS 교육", "월말 정산"];
  return (
    <div style={{ width: W, height: H, position: "relative" }}>
      <AppSidebar items={NAV} active="LMS 교육" />
      <AppTopBar />
      <div
        style={{
          ...AppContent(),
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: H - 64,
          gap: 28,
        }}
      >
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: 24,
            background: "#FEF3C7",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 36,
          }}
        >
          🎓
        </div>
        <div style={{ textAlign: "center", maxWidth: 420 }}>
          <div
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: C.fg,
              marginBottom: 10,
            }}
          >
            LMS 필수 교육 이수 필요
          </div>
          <div style={{ fontSize: 14, color: C.muted, lineHeight: 1.7 }}>
            CareMate 수리점 파트너 활동을 시작하기 전에
            <br />
            <strong style={{ color: C.fg }}>필수 교육 2종</strong>을 이수해야
            합니다.
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
            width: 440,
          }}
        >
          {["수리 리포트 작성 기준", "플랫폼 A/S 처리 절차 및 준수 안내"].map(
            (g) => (
              <div
                key={g}
                style={{
                  background: C.card,
                  border: `1px solid ${C.border}`,
                  borderRadius: 14,
                  padding: "14px 16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: "#FEF3C7",
                    }}
                  />
                  <span style={{ fontSize: 13, fontWeight: 600, color: C.fg }}>
                    {g}
                  </span>
                </div>
                <ChipBadge text="미수료" color={C.muted} />
              </div>
            ),
          )}
        </div>
        <div
          style={{
            width: 440,
            padding: "14px",
            borderRadius: 14,
            background: "#F59E0B",
            textAlign: "center",
            fontSize: 15,
            fontWeight: 700,
            color: "white",
            boxShadow: "0 8px 24px rgba(245,158,11,0.3)",
          }}
        >
          🎓 지금 LMS 교육 시작하기
        </div>
      </div>
    </div>
  );
}

// 9. LMS Education
function LMSScreen() {
  const NAV = ["대시보드", "수리 리포트", "LMS 교육", "월말 정산"];
  return (
    <div style={{ width: W, height: H, position: "relative" }}>
      <AppSidebar items={NAV} active="LMS 교육" />
      <AppTopBar />
      <div style={{ ...AppContent(), padding: "32px 60px 32px 280px" }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: C.fg }}>
            LMS 교육
          </div>
          <div style={{ fontSize: 13, color: C.muted }}>
            필수 교육 가이드를 학습하고 퀴즈를 통해 수료하세요.
          </div>
        </div>
        {/* Guides */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 14,
            maxWidth: 700,
          }}
        >
          {[
            { title: "수리 리포트 작성 기준", done: true, score: "5/5" },
            { title: "플랫폼 A/S 처리 절차 및 준수 안내", done: false },
          ].map((g) => (
            <div
              key={g.title}
              style={{
                background: C.card,
                border: `1px solid ${C.border}`,
                borderRadius: 16,
                padding: "20px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 14,
                }}
              >
                <div style={{ display: "flex", gap: 14 }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: g.done ? "#DCFCE7" : C.accentLight,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 20,
                    }}
                  >
                    {g.done ? "🏅" : "📖"}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.fg }}>
                      {g.title}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        gap: 12,
                        marginTop: 6,
                        fontSize: 11,
                        color: C.muted,
                      }}
                    >
                      <span>🕐 약 10분</span>
                      <span>📝 퀴즈 5문항</span>
                      {g.done && (
                        <span style={{ color: C.green }}>✓ {g.score}점</span>
                      )}
                    </div>
                  </div>
                </div>
                <ChipBadge
                  text={g.done ? "수료 완료" : "미수료"}
                  color={g.done ? C.green : C.muted}
                />
              </div>
              <div
                style={{
                  background: g.done ? C.secondary : C.accent,
                  color: g.done ? C.fg : "white",
                  borderRadius: 10,
                  padding: "10px 18px",
                  display: "inline-block",
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                {g.done ? "다시 보기" : "학습 시작 →"}
              </div>
            </div>
          ))}
        </div>
        <div
          style={{
            marginTop: 20,
            background: C.secondary,
            borderRadius: 14,
            padding: "16px 20px",
            maxWidth: 700,
            fontSize: 13,
            color: C.muted,
          }}
        >
          📌 각 가이드별 퀴즈에서{" "}
          <strong style={{ color: C.fg }}>정답률 80% 이상</strong> 달성 시 수료
          처리됩니다.
        </div>
      </div>
    </div>
  );
}

// 10. Shop Dashboard
function ShopDashboardScreen() {
  const NAV = ["대시보드", "수리 리포트", "LMS 교육", "월말 정산"];
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  return (
    <div style={{ width: W, height: H, position: "relative" }}>
      <AppSidebar items={NAV} active="대시보드" />
      <AppTopBar />
      <div style={{ ...AppContent(), padding: "28px 36px 28px 272px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: C.fg }}>
              예약 스케줄 관리
            </div>
            <div style={{ fontSize: 13, color: C.muted }}>
              강남 스마트케어 · 오늘 예약 2건
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <div
              style={{
                display: "flex",
                gap: 4,
                background: C.secondary,
                borderRadius: 10,
                padding: 3,
              }}
            >
              {["월간", "주간"].map((v, i) => (
                <div
                  key={v}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 8,
                    background: i === 0 ? C.card : "transparent",
                    fontSize: 12,
                    color: i === 0 ? C.fg : C.muted,
                    fontWeight: i === 0 ? 600 : 400,
                  }}
                >
                  {v}
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Calendar */}
        <div
          style={{
            background: C.card,
            border: `1px solid ${C.border}`,
            borderRadius: 16,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 20px",
              borderBottom: `1px solid ${C.border}`,
            }}
          >
            <div style={{ color: C.muted, fontSize: 16 }}>‹</div>
            <span style={{ fontSize: 14, fontWeight: 700, color: C.fg }}>
              2024년 6월
            </span>
            <div style={{ color: C.muted, fontSize: 16 }}>›</div>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7,1fr)",
              borderBottom: `1px solid ${C.border}`,
            }}
          >
            {days.map((d, i) => (
              <div
                key={d}
                style={{
                  textAlign: "center",
                  padding: "8px 4px",
                  fontSize: 11,
                  color: i === 0 ? "#EF4444" : i === 6 ? C.accent : C.muted,
                  fontWeight: 600,
                }}
              >
                {d}
              </div>
            ))}
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7,1fr)",
              gap: 1,
              padding: "8px",
              height: 220,
            }}
          >
            {Array.from({ length: 35 }, (_, i) => {
              const day = i - 3;
              const isValid = day >= 1 && day <= 30;
              const isToday = day === 13;
              const hasPending = [13, 15, 20].includes(day);
              const hasScheduled = [13, 17].includes(day);
              return (
                <div
                  key={i}
                  style={{
                    borderRadius: 6,
                    padding: "4px",
                    border: isToday
                      ? `1px solid ${C.accent}40`
                      : "1px solid transparent",
                    background: isToday ? `${C.accent}08` : "transparent",
                  }}
                >
                  {isValid && (
                    <>
                      <div
                        style={{
                          fontSize: 11,
                          color: isToday ? C.accent : C.muted,
                          fontWeight: isToday ? 700 : 400,
                        }}
                      >
                        {day}
                      </div>
                      {hasPending && (
                        <div
                          style={{
                            fontSize: 9,
                            background: `${C.accent}20`,
                            color: C.accent,
                            borderRadius: 3,
                            padding: "1px 4px",
                            marginTop: 2,
                            overflow: "hidden",
                          }}
                        >
                          예약
                        </div>
                      )}
                      {hasScheduled && (
                        <div
                          style={{
                            fontSize: 9,
                            background: "#FEF3C7",
                            color: C.amber,
                            borderRadius: 3,
                            padding: "1px 4px",
                            marginTop: 2,
                            overflow: "hidden",
                          }}
                        >
                          확정
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// 11. Shop Report List
function ShopReportScreen() {
  const NAV = ["대시보드", "수리 리포트", "LMS 교육", "월말 정산"];
  const items = [
    {
      id: "CM-20240613-0042",
      customer: "김민준",
      device: "iPhone 15 Pro",
      status: "수리 중",
      color: C.accent,
    },
    {
      id: "CM-20240613-0039",
      customer: "이수연",
      device: "Galaxy S24 Ultra",
      status: "작성 필요",
      color: C.amber,
    },
    {
      id: "CM-20240612-0031",
      customer: "박도현",
      device: "iPhone 14",
      status: "작성 필요",
      color: C.amber,
    },
    {
      id: "CM-20240611-0024",
      customer: "최지아",
      device: "Pixel 8 Pro",
      status: "완료",
      color: C.green,
    },
  ];
  return (
    <div style={{ width: W, height: H, position: "relative" }}>
      <AppSidebar items={NAV} active="수리 리포트" />
      <AppTopBar />
      <div style={{ ...AppContent(), padding: "32px 60px 32px 280px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: C.fg }}>
              수리 리포트
            </div>
            <div style={{ fontSize: 13, color: C.muted }}>
              리포트 작성이 필요한 건수:{" "}
              <span style={{ color: C.accent, fontWeight: 700 }}>3건</span>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
          {["전체", "작성 필요", "수리 중", "완료"].map((f, i) => (
            <div
              key={f}
              style={{
                padding: "6px 14px",
                borderRadius: 10,
                background: i === 0 ? C.card : "transparent",
                fontSize: 12,
                color: i === 0 ? C.fg : C.muted,
                fontWeight: i === 0 ? 600 : 400,
              }}
            >
              {f}
            </div>
          ))}
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
            maxWidth: 700,
          }}
        >
          {items.map((item) => (
            <div
              key={item.id}
              style={{
                background: C.card,
                border: `1px solid ${C.border}`,
                borderRadius: 14,
                padding: "16px 20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 6,
                  }}
                >
                  <span
                    style={{
                      fontSize: 10,
                      color: C.muted,
                      fontFamily: "monospace",
                    }}
                  >
                    {item.id}
                  </span>
                  <ChipBadge text={item.status} color={item.color} />
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.fg }}>
                  {item.customer}
                </div>
                <div style={{ fontSize: 12, color: C.muted }}>
                  {item.device}
                </div>
              </div>
              <span style={{ fontSize: 18, color: C.muted }}>›</span>
            </div>
          ))}
        </div>
        <div
          style={{
            display: "flex",
            gap: 8,
            marginTop: 20,
            justifyContent: "center",
          }}
        >
          {["이전", "1", "2", "다음"].map((p) => (
            <div
              key={p}
              style={{
                padding: "6px 14px",
                borderRadius: 8,
                border: `1px solid ${C.border}`,
                fontSize: 12,
                color: p === "1" ? "white" : C.fg,
                background: p === "1" ? C.accent : C.card,
              }}
            >
              {p}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 12. Shop Settlement
function ShopSettlementScreen() {
  const NAV = ["대시보드", "수리 리포트", "LMS 교육", "월말 정산"];
  return (
    <div style={{ width: W, height: H, position: "relative" }}>
      <AppSidebar items={NAV} active="월말 정산" />
      <AppTopBar />
      <div style={{ ...AppContent(), padding: "28px 36px 28px 272px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: C.fg }}>
              월말 정산 리포트
            </div>
            <div style={{ fontSize: 13, color: C.muted }}>강남 스마트케어</div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <div
              style={{
                padding: "8px 16px",
                border: `1px solid ${C.border}`,
                borderRadius: 10,
                fontSize: 13,
              }}
            >
              🖨 인쇄
            </div>
            <div
              style={{
                padding: "8px 16px",
                background: C.accent,
                color: "white",
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              PDF 다운로드
            </div>
          </div>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gap: 12,
            marginBottom: 20,
          }}
        >
          {[
            ["총 수리 매출", "₩12,400,000", C.fg],
            ["플랫폼 수수료", "-₩1,240,000", C.red],
            ["순 수취 금액", "₩11,160,000", C.green],
            ["수수료 납부", "대기", C.amber],
          ].map(([l, v, c]) => (
            <KCard key={l} label={l} value={v} color={c} />
          ))}
        </div>
        <div
          style={{
            background: C.card,
            border: `1px solid ${C.border}`,
            borderRadius: 14,
            overflow: "hidden",
            marginBottom: 16,
          }}
        >
          <div
            style={{
              padding: "14px 18px",
              borderBottom: `1px solid ${C.border}`,
              fontSize: 13,
              fontWeight: 700,
              color: C.fg,
            }}
          >
            2024년 6월 수리 내역 (8건)
          </div>
          <TableRow
            cols={[
              "주문번호",
              "고객명",
              "기기",
              "결제액",
              "수수료(10%)",
              "순수입",
            ]}
            header
          />
          {[
            [
              "CM-20240613-0042",
              "김민준",
              "iPhone 15 Pro",
              "370,000원",
              "37,000원",
              "333,000원",
            ],
            [
              "CM-20240612-0031",
              "박도현",
              "iPhone 14",
              "150,000원",
              "15,000원",
              "135,000원",
            ],
          ].map((r) => (
            <TableRow key={r[0]} cols={r} />
          ))}
          <div
            style={{
              textAlign: "center",
              padding: 10,
              fontSize: 11,
              color: C.muted,
            }}
          >
            외 6건...
          </div>
        </div>
        {/* Bar chart */}
        <div
          style={{
            background: C.card,
            border: `1px solid ${C.border}`,
            borderRadius: 14,
            padding: "16px 20px",
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: C.fg,
              marginBottom: 14,
            }}
          >
            월별 매출 추이
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: 10,
              height: 80,
            }}
          >
            {[65, 72, 58, 80, 92, 100].map((h, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <div
                  style={{
                    width: "100%",
                    height: `${h * 0.7}px`,
                    background: i === 5 ? C.accent : C.secondary,
                    borderRadius: "4px 4px 0 0",
                    transition: "all 0.3s",
                  }}
                />
                <span
                  style={{ fontSize: 10, color: i === 5 ? C.accent : C.muted }}
                >
                  {i + 1}월
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// 13. Shop Profile
function ShopProfileScreen() {
  const NAV = ["대시보드", "수리 리포트", "LMS 교육", "월말 정산"];
  return (
    <div style={{ width: W, height: H, position: "relative" }}>
      <AppSidebar items={NAV} />
      <AppTopBar />
      <div
        style={{
          ...AppContent(),
          padding: "32px 60px 32px 280px",
          maxWidth: 760,
        }}
      >
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: C.fg }}>
            마이페이지
          </div>
        </div>
        <div
          style={{
            background: C.card,
            border: `1px solid ${C.border}`,
            borderRadius: 16,
            padding: "24px",
            display: "flex",
            gap: 20,
            marginBottom: 16,
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: "#FEF3C7",
              border: "2px solid #FDE68A",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
            }}
          >
            🏪
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.fg }}>
              강남 스마트케어
            </div>
            <div style={{ fontSize: 13, color: C.muted }}>shop@caremate.kr</div>
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <ChipBadge text="수리점 파트너" color={C.amber} bg="#FEF3C7" />
              <ChipBadge text="승인됨" color={C.green} />
            </div>
          </div>
        </div>
        {/* LMS Badge */}
        <div
          style={{
            borderRadius: 14,
            border: "2px solid #FCD34D",
            background: "linear-gradient(135deg,#FFFBEB,#FEF9C3)",
            padding: "16px 20px",
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginBottom: 16,
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: "#FEF3C7",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 24,
            }}
          >
            🏆
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 14, fontWeight: 800, color: "#78350F" }}>
                CareMate 필수 교육 수료 인증
              </span>
              <span
                style={{
                  padding: "2px 8px",
                  borderRadius: 9999,
                  background: "#DCFCE7",
                  color: "#15803D",
                  fontSize: 11,
                  fontWeight: 700,
                  border: "1px solid #BBF7D0",
                }}
              >
                ✓ 인증 완료
              </span>
            </div>
            <div style={{ fontSize: 11, color: "#92400E", marginTop: 4 }}>
              수리 리포트 작성 기준 · 플랫폼 A/S 처리 절차 — 2종 모두 수료 완료
            </div>
          </div>
          <div
            style={{
              textAlign: "right",
              fontSize: 10,
              color: "#B45309",
              fontFamily: "monospace",
            }}
          >
            <div style={{ fontWeight: 700 }}>LMS-CERT</div>
            <div style={{ opacity: 0.6 }}>2024.06.13</div>
          </div>
        </div>
        <div
          style={{
            background: C.card,
            border: `1px solid ${C.border}`,
            borderRadius: 14,
            padding: "16px 20px",
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: C.fg,
              marginBottom: 14,
            }}
          >
            매장 프로필
          </div>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            {[
              ["지점명", "강남 스마트케어"],
              ["대표자명", "박기술"],
              ["연락처", "02-1234-5678"],
              ["사업자번호", "123-45-67890"],
            ].map(([l, v]) => (
              <div key={l}>
                <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>
                  {l}
                </div>
                <div
                  style={{
                    background: C.secondary,
                    borderRadius: 10,
                    padding: "8px 12px",
                    fontSize: 13,
                    color: C.fg,
                  }}
                >
                  {v}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// 14. Admin Dashboard
function AdminDashboardScreen() {
  const NAV = [
    "통합 대시보드",
    "보험 약관 관리",
    "수수료 청구 관리",
    "LMS 관리",
    "감사·DLQ",
  ];
  return (
    <div style={{ width: W, height: H, position: "relative" }}>
      <AppSidebar items={NAV} active="통합 대시보드" />
      <AppTopBar />
      <div style={{ ...AppContent(), padding: "28px 36px 28px 272px" }}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: C.fg }}>
            통합 관제 대시보드
          </div>
          <div style={{ fontSize: 13, color: C.muted }}>
            플랫폼 전체 현황 · 2024년 6월
          </div>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gap: 14,
            marginBottom: 20,
          }}
        >
          {[
            ["총 플랫폼 수익", "₩97.2M", "+18.3%", "#2563EB"],
            ["정산 지급 금액", "₩352M", "+12.7%", "#0D9488"],
            ["청구 성공률", "96.9%", "-0.4%p", "#16A34A"],
            ["DLQ 오류율", "0.8%", "+0.3%p", "#DC2626"],
          ].map(([l, v, c, col]) => (
            <div
              key={l}
              style={{
                background: C.card,
                border: `1px solid ${C.border}`,
                borderRadius: 14,
                padding: "16px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 10,
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    background: `${col}18`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 2,
                      background: col,
                    }}
                  />
                </div>
                <span style={{ fontSize: 11, color: C.muted }}>{l}</span>
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: C.fg }}>
                {v}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: c.startsWith("+") ? C.green : C.red,
                  marginTop: 4,
                }}
              >
                {c}
              </div>
            </div>
          ))}
        </div>
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
        >
          {["수익 비교 (플랫폼 vs 수리점)", "보험 청구 패킷 현황"].map(
            (title) => (
              <div
                key={title}
                style={{
                  background: C.card,
                  border: `1px solid ${C.border}`,
                  borderRadius: 14,
                  padding: "18px",
                }}
              >
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: C.fg,
                    marginBottom: 14,
                  }}
                >
                  {title}
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-end",
                    gap: 6,
                    height: 100,
                  }}
                >
                  {[40, 55, 38, 68, 88, 72].map((h, i) => (
                    <div
                      key={i}
                      style={{
                        flex: 1,
                        display: "flex",
                        gap: 3,
                        alignItems: "flex-end",
                      }}
                    >
                      <div
                        style={{
                          flex: 1,
                          height: `${h * 0.9}px`,
                          background: C.accent,
                          borderRadius: "3px 3px 0 0",
                        }}
                      />
                      <div
                        style={{
                          flex: 1,
                          height: `${h * 0.6}px`,
                          background: "#0D9488",
                          borderRadius: "3px 3px 0 0",
                        }}
                      />
                    </div>
                  ))}
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 16,
                    marginTop: 10,
                    fontSize: 10,
                    color: C.muted,
                  }}
                >
                  <span
                    style={{ display: "flex", alignItems: "center", gap: 4 }}
                  >
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 2,
                        background: C.accent,
                        display: "inline-block",
                      }}
                    />
                    플랫폼
                  </span>
                  <span
                    style={{ display: "flex", alignItems: "center", gap: 4 }}
                  >
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 2,
                        background: "#0D9488",
                        display: "inline-block",
                      }}
                    />
                    수리점
                  </span>
                </div>
              </div>
            ),
          )}
        </div>
      </div>
    </div>
  );
}

// 15. Admin Policies
function AdminPoliciesScreen() {
  const NAV = [
    "통합 대시보드",
    "보험 약관 관리",
    "수수료 청구 관리",
    "LMS 관리",
    "감사·DLQ",
  ];
  return (
    <div style={{ width: W, height: H, position: "relative" }}>
      <AppSidebar items={NAV} active="보험 약관 관리" />
      <AppTopBar />
      <div style={{ ...AppContent(), padding: "28px 36px 28px 272px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: C.fg }}>
              보험 마스터 약관 관리
            </div>
          </div>
          <div
            style={{
              padding: "9px 18px",
              borderRadius: 10,
              background: C.accent,
              fontSize: 13,
              fontWeight: 700,
              color: "white",
            }}
          >
            + 새 약관 템플릿
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
          <div
            style={{
              background: C.secondary,
              border: `1px solid ${C.border}`,
              borderRadius: 10,
              padding: "8px 14px",
              fontSize: 13,
              color: C.muted,
              flex: "0 0 200px",
            }}
          >
            🔍 약관 검색...
          </div>
          <div
            style={{
              background: C.card,
              border: `1px solid ${C.border}`,
              borderRadius: 10,
              padding: "8px 14px",
              fontSize: 13,
              color: C.muted,
            }}
          >
            보험사 ▾
          </div>
        </div>
        <div
          style={{
            background: C.card,
            border: `1px solid ${C.border}`,
            borderRadius: 14,
            overflow: "hidden",
          }}
        >
          <TableRow
            cols={[
              "상품 ID",
              "보험사",
              "약관명",
              "카테고리",
              "보상율",
              "최대 한도",
              "수정일",
              "Actions",
            ]}
            header
          />
          {[
            [
              "POL-001",
              "KB손해보험",
              "KB스마트폰케어 Standard",
              "파손",
              "80%",
              "800,000원",
              "2024.05.20",
            ],
            [
              "POL-002",
              "삼성화재",
              "삼성 디지털 안심보험 Pro",
              "파손·침수",
              "90%",
              "1,200,000원",
              "2024.04.15",
            ],
            [
              "POL-003",
              "메리츠화재",
              "메리츠 폰클럽 기본형",
              "파손",
              "70%",
              "600,000원",
              "2024.06.01",
            ],
            [
              "POL-004",
              "현대해상",
              "하이카 모바일 프로텍트",
              "분실",
              "60%",
              "500,000원",
              "2024.03.30",
            ],
          ].map((r) => (
            <div
              key={r[0]}
              style={{ display: "flex", borderBottom: `1px solid ${C.border}` }}
            >
              {r.map((c, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    padding: "10px 12px",
                    fontSize: i === 0 ? 11 : 12,
                    color: i === 0 ? C.muted : C.fg,
                    fontFamily: i === 0 ? "monospace" : "inherit",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {c}
                </div>
              ))}
              <div
                style={{
                  flex: 0.5,
                  padding: "10px 12px",
                  display: "flex",
                  gap: 8,
                }}
              >
                <span
                  style={{ fontSize: 11, color: C.accent, cursor: "pointer" }}
                >
                  ✏
                </span>
                <span style={{ fontSize: 11, color: C.red, cursor: "pointer" }}>
                  🗑
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 16. Admin Settlements
function AdminSettlementsScreen() {
  const NAV = [
    "통합 대시보드",
    "보험 약관 관리",
    "수수료 청구 관리",
    "LMS 관리",
    "감사·DLQ",
  ];
  return (
    <div style={{ width: W, height: H, position: "relative" }}>
      <AppSidebar items={NAV} active="수수료 청구 관리" />
      <AppTopBar />
      <div style={{ ...AppContent(), padding: "28px 36px 28px 272px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: C.fg }}>
              수수료 청구 요청 관리
            </div>
            <div style={{ fontSize: 13, color: C.muted }}>
              수리점별 월말 플랫폼 수수료 청구 현황
            </div>
          </div>
          <div
            style={{
              padding: "9px 24px",
              borderRadius: 10,
              background: C.accent,
              fontSize: 13,
              fontWeight: 700,
              color: "white",
            }}
          >
            📨 월말 수수료 청구 요청 일괄 발송
          </div>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gap: 12,
            marginBottom: 18,
          }}
        >
          {[
            ["총 청구 수수료", "₩6,210,000"],
            ["수납 완료", "₩4,100,000"],
            ["미수납", "₩2,110,000"],
            ["수납률", "66%"],
          ].map(([l, v]) => (
            <KCard key={l} label={l} value={v} />
          ))}
        </div>
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 16 }}
        >
          <div
            style={{
              background: C.card,
              border: `1px solid ${C.border}`,
              borderRadius: 14,
              overflow: "hidden",
            }}
          >
            <TableRow
              cols={[
                "수리점 ID",
                "수리점명",
                "총 매출",
                "수수료",
                "납부기한",
                "상태",
                "개별 발송",
              ]}
              header
            />
            {[
              [
                "SH-001",
                "강남 스마트케어",
                "₩12.4M",
                "₩1.24M",
                "07.05",
                "청구 전",
              ],
              [
                "SH-002",
                "서초 아이폰 전문점",
                "₩8.7M",
                "₩870K",
                "07.05",
                "청구 발송됨",
              ],
              [
                "SH-003",
                "역삼 갤럭시 수리",
                "₩6.2M",
                "₩620K",
                "07.05",
                "납부 완료",
              ],
              ["SH-004", "선릉 올폰 서비스", "₩3.8M", "₩380K", "06.05", "연체"],
            ].map((r) => (
              <div
                key={r[0]}
                style={{
                  display: "flex",
                  borderBottom: `1px solid ${C.border}`,
                }}
              >
                {r.slice(0, 5).map((c, i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      padding: "9px 12px",
                      fontSize: 11,
                      color: i === 0 ? C.muted : C.fg,
                      fontFamily: i === 0 ? "monospace" : "inherit",
                    }}
                  >
                    {c}
                  </div>
                ))}
                <div style={{ flex: 1, padding: "9px 12px" }}>
                  <ChipBadge
                    text={r[5]}
                    color={
                      r[5] === "납부 완료"
                        ? C.green
                        : r[5] === "연체"
                          ? C.red
                          : r[5] === "청구 발송됨"
                            ? C.amber
                            : C.muted
                    }
                  />
                </div>
                <div style={{ flex: 0.8, padding: "9px 8px" }}>
                  {r[5] !== "납부 완료" && (
                    <div
                      style={{
                        padding: "4px 8px",
                        borderRadius: 8,
                        background: C.accentLight,
                        fontSize: 10,
                        color: C.accent,
                        textAlign: "center",
                      }}
                    >
                      청구 발송
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div
            style={{
              background: C.card,
              border: `1px solid ${C.border}`,
              borderRadius: 14,
              padding: "16px",
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: C.fg,
                marginBottom: 12,
              }}
            >
              정산 프로세스
            </div>
            {["결제 수령", "수수료 청구 발송", "수리점 납부", "납부 확인"].map(
              (s, i) => (
                <div
                  key={s}
                  style={{ display: "flex", gap: 10, marginBottom: 10 }}
                >
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      background: C.accent,
                      color: "white",
                      fontSize: 10,
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {i + 1}
                  </div>
                  <span style={{ fontSize: 12, color: C.fg }}>{s}</span>
                </div>
              ),
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// 17. Admin Audit
function AdminAuditScreen() {
  const NAV = [
    "통합 대시보드",
    "보험 약관 관리",
    "수수료 청구 관리",
    "LMS 관리",
    "감사·DLQ",
  ];
  return (
    <div style={{ width: W, height: H, position: "relative" }}>
      <AppSidebar items={NAV} active="감사·DLQ" />
      <AppTopBar />
      <div style={{ ...AppContent(), padding: "28px 36px 28px 272px" }}>
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: C.fg }}>
            청구 예외 및 데이터 무결성 감사
          </div>
        </div>
        <div
          style={{
            display: "flex",
            borderBottom: `1px solid ${C.border}`,
            marginBottom: 18,
          }}
        >
          {["청구 패킷 실패 (DLQ) 4", "데이터 무결성 감사 로그 2⚠"].map(
            (t, i) => (
              <div
                key={t}
                style={{
                  padding: "10px 20px",
                  fontSize: 13,
                  fontWeight: 600,
                  color: i === 0 ? C.accent : C.muted,
                  borderBottom: i === 0 ? `2px solid ${C.accent}` : "none",
                  marginBottom: -1,
                }}
              >
                {t}
              </div>
            ),
          )}
        </div>
        <div
          style={{
            background: C.card,
            border: `1px solid ${C.border}`,
            borderRadius: 14,
            overflow: "hidden",
            marginBottom: 14,
          }}
        >
          <TableRow
            cols={[
              "DLQ ID",
              "보험사",
              "에러 코드",
              "재시도",
              "발생 시각",
              "Action",
            ]}
            header
          />
          {[
            [
              "DLQ-0891",
              "KB손해보험",
              "CONNECTION_TIMEOUT",
              "3회",
              "2024.06.13 14:32",
            ],
            [
              "DLQ-0890",
              "메리츠화재",
              "INVALID_SIGNATURE",
              "5회",
              "2024.06.13 11:15",
            ],
            [
              "DLQ-0887",
              "현대해상",
              "RATE_LIMIT_EXCEEDED",
              "2회",
              "2024.06.12 22:44",
            ],
          ].map((r) => (
            <div
              key={r[0]}
              style={{ display: "flex", borderBottom: `1px solid ${C.border}` }}
            >
              {r.map((c, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    padding: "9px 12px",
                    fontSize: i === 0 ? 10 : 11,
                    color: i === 0 ? C.red : C.fg,
                    fontFamily: i <= 1 ? "monospace" : "inherit",
                  }}
                >
                  {c}
                </div>
              ))}
              <div style={{ flex: 0.6, padding: "8px 12px" }}>
                <div
                  style={{
                    padding: "4px 8px",
                    borderRadius: 8,
                    background: C.accentLight,
                    fontSize: 10,
                    color: C.accent,
                    textAlign: "center",
                  }}
                >
                  Retry
                </div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <div
            style={{
              padding: "9px 18px",
              borderRadius: 10,
              background: C.fg,
              color: "white",
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            전체 일괄 재전송
          </div>
        </div>
      </div>
    </div>
  );
}

// 18. Admin LMS Manage
function AdminLMSScreen() {
  const NAV = [
    "통합 대시보드",
    "보험 약관 관리",
    "수수료 청구 관리",
    "LMS 관리",
    "감사·DLQ",
  ];
  return (
    <div style={{ width: W, height: H, position: "relative" }}>
      <AppSidebar items={NAV} active="LMS 관리" />
      <AppTopBar />
      <div style={{ ...AppContent(), padding: "28px 36px 28px 272px" }}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: C.fg }}>
            LMS 수료 관리
          </div>
          <div style={{ fontSize: 13, color: C.muted }}>
            수리점별 직원 교육 이수 현황을 확인하세요.
          </div>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gap: 12,
            marginBottom: 18,
          }}
        >
          {[
            ["전체 수리점", "3"],
            ["전원 수료", "0/3"],
            ["전체 직원", "7명"],
            ["수료 직원", "2/7명"],
          ].map(([l, v]) => (
            <KCard key={l} label={l} value={v} />
          ))}
        </div>
        <div
          style={{
            background: C.card,
            border: `1px solid ${C.border}`,
            borderRadius: 14,
            padding: "16px 20px",
            marginBottom: 16,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 10,
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 700, color: C.fg }}>
              전체 수료율
            </span>
            <span style={{ fontSize: 13, fontWeight: 700, color: C.accent }}>
              29%
            </span>
          </div>
          <Bar pct={29} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            { shop: "강남 스마트케어", done: false, count: "1/3" },
            { shop: "서초 아이폰 전문점", done: true, count: "1/2" },
            { shop: "역삼 갤럭시 수리", done: false, count: "0/2" },
          ].map((s) => (
            <div
              key={s.shop}
              style={{
                background: C.card,
                border: `1px solid ${C.border}`,
                borderRadius: 12,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "14px 18px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      background: s.done ? "#DCFCE7" : "#FEF3C7",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 14,
                    }}
                  >
                    {s.done ? "🏅" : s.shop[0]}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.fg }}>
                      {s.shop}
                    </div>
                    <div style={{ fontSize: 11, color: C.muted }}>
                      수료: {s.count}명
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <ChipBadge
                    text={s.done ? "전원 수료" : `${s.count} 수료`}
                    color={s.done ? C.green : C.amber}
                  />
                  <span style={{ color: C.muted }}>∨</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// MAIN OVERVIEW PAGE
// ═══════════════════════════════════════════════════════════

export default function DesignOverviewPage() {
  const sections = [
    {
      title: "공통 및 인증 (ALL)",
      color: "#60A5FA",
      frames: [
        {
          title: "랜딩 페이지",
          route: "/",
          tag: "ALL",
          content: <LandingScreen />,
        },
        {
          title: "로그인 / 회원가입",
          route: "/auth",
          tag: "ALL",
          content: <AuthScreen />,
        },
        {
          title: "서비스 센터 찾기",
          route: "/find-shop",
          tag: "ALL",
          content: <FindShopScreen />,
        },
      ],
    },
    {
      title: "수리 고객 포털 (CUSTOMER)",
      color: "#34D399",
      frames: [
        {
          title: "고객 대시보드",
          route: "/customer/dashboard",
          tag: "CUSTOMER",
          content: <CustomerDashboardScreen />,
        },
        {
          title: "비대면 A/S 접수",
          route: "/customer/request",
          tag: "CUSTOMER",
          content: <RequestScreen />,
        },
        {
          title: "나의 보험 관리",
          route: "/customer/insurance",
          tag: "CUSTOMER",
          content: <InsuranceScreen />,
        },
        {
          title: "결제 및 청구 센터",
          route: "/customer/payment",
          tag: "CUSTOMER",
          content: <PaymentScreen />,
        },
      ],
    },
    {
      title: "수리점 파트너 포털 (SHOP)",
      color: "#FBBF24",
      frames: [
        {
          title: "LMS 필수 교육 게이트",
          route: "/shop/lms",
          tag: "SHOP",
          content: <LMSGateScreen />,
        },
        {
          title: "LMS 교육 목록",
          route: "/shop/lms",
          tag: "SHOP",
          content: <LMSScreen />,
        },
        {
          title: "예약 스케줄 대시보드",
          route: "/shop/dashboard",
          tag: "SHOP",
          content: <ShopDashboardScreen />,
        },
        {
          title: "수리 리포트 목록",
          route: "/shop/report",
          tag: "SHOP",
          content: <ShopReportScreen />,
        },
        {
          title: "월말 정산 리포트",
          route: "/shop/settlement",
          tag: "SHOP",
          content: <ShopSettlementScreen />,
        },
        {
          title: "수리점 마이페이지 (LMS 인증)",
          route: "/shop/profile",
          tag: "SHOP",
          content: <ShopProfileScreen />,
        },
      ],
    },
    {
      title: "전체 관리자 백오피스 (ADMIN)",
      color: "#F87171",
      frames: [
        {
          title: "통합 관제 대시보드",
          route: "/admin/dashboard",
          tag: "ADMIN",
          content: <AdminDashboardScreen />,
        },
        {
          title: "보험 약관 관리",
          route: "/admin/policies",
          tag: "ADMIN",
          content: <AdminPoliciesScreen />,
        },
        {
          title: "수수료 청구 관리",
          route: "/admin/settlements",
          tag: "ADMIN",
          content: <AdminSettlementsScreen />,
        },
        {
          title: "LMS 수료 관리",
          route: "/admin/lms",
          tag: "ADMIN",
          content: <AdminLMSScreen />,
        },
        {
          title: "청구 예외 및 감사",
          route: "/admin/audit",
          tag: "ADMIN",
          content: <AdminAuditScreen />,
        },
      ],
    },
  ];

  const totalScreens = sections.reduce((a, s) => a + s.frames.length, 0);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#1C1C1E",
        padding: "40px 48px 80px",
        fontFamily: "'Noto Sans KR', 'DM Sans', sans-serif",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 48 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginBottom: 12,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "#2563EB",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Grid size={18} color="white" />
          </div>
          <div>
            <div
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: "white",
                letterSpacing: "-0.02em",
              }}
            >
              CareMate — Design Overview
            </div>
            <div
              style={{
                fontSize: 12,
                color: "rgba(255,255,255,0.4)",
                marginTop: 2,
              }}
            >
              스마트폰 A/S 보험 통합 관리 플랫폼 · 전체 화면 설계
            </div>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 20 }}>
            {[
              ["총 화면", `${totalScreens}개`],
              ["포털", "3종"],
              ["섹션", `${sections.length}개`],
            ].map(([l, v]) => (
              <div key={l} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: "white" }}>
                  {v}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: "rgba(255,255,255,0.35)",
                    marginTop: 2,
                  }}
                >
                  {l}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ height: 1, background: "rgba(255,255,255,0.08)" }} />
      </div>

      {/* Sections */}
      {sections.map((section) => (
        <Section
          key={section.title}
          title={section.title}
          color={section.color}
        >
          {section.frames.map((frame) => (
            <Frame
              key={frame.title}
              title={frame.title}
              route={frame.route}
              tag={frame.tag}
            >
              {frame.content}
            </Frame>
          ))}
        </Section>
      ))}

      {/* Footer */}
      <div style={{ textAlign: "center", marginTop: 16 }}>
        <div
          style={{
            height: 1,
            background: "rgba(255,255,255,0.06)",
            marginBottom: 24,
          }}
        />
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.25)" }}>
          CareMate v1.0 · Figma Make Design Overview · {totalScreens} screens
          across {sections.length} portals
        </div>
        <Link
          to="/"
          style={{
            fontSize: 11,
            color: "rgba(255,255,255,0.35)",
            marginTop: 8,
            display: "inline-block",
            textDecoration: "none",
          }}
        >
          ← 랜딩 페이지로 돌아가기
        </Link>
      </div>
    </div>
  );
}
