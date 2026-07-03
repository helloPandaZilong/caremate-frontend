import { Star } from "lucide-react";

export function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  onClick,
  type = "button",
  disabled = false,
}) {
  const base =
    "inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary:
      "bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98]",
    secondary:
      "bg-card text-foreground border border-border hover:bg-secondary active:scale-[0.98]",
    ghost: "text-foreground hover:bg-secondary active:scale-[0.98]",
    accent:
      "bg-accent text-accent-foreground hover:bg-accent/90 active:scale-[0.98] shadow-lg shadow-accent/20",
    danger: "bg-red-600 text-white hover:bg-red-700 active:scale-[0.98]",
    outline:
      "border border-accent text-accent hover:bg-accent/5 active:scale-[0.98]",
  };
  const sizes = {
    xs: "px-2.5 py-1 text-xs rounded-lg",
    sm: "px-4 py-2 text-sm rounded-lg",
    md: "px-5 py-2.5 text-sm rounded-xl",
    lg: "px-7 py-3.5 text-base rounded-xl",
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
}

// ── Badge ─────────────────────────────────────────────────────────────────────
export function Badge({ children, variant = "accent", className = "" }) {
  const variants = {
    accent: "bg-accent/10 text-accent border-accent/20",
    green: "bg-green-50 text-green-700 border-green-200",
    yellow: "bg-amber-50 text-amber-700 border-amber-200",
    red: "bg-red-50 text-red-700 border-red-200",
    muted: "bg-secondary text-muted-foreground border-border",
    teal: "bg-teal-50 text-teal-700 border-teal-200",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium rounded-full border ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

// ── Card ──────────────────────────────────────────────────────────────────────
export function Card({ children, className = "", onClick }) {
  return (
    <div
      onClick={onClick}
      className={`bg-card border border-border rounded-2xl ${onClick ? "cursor-pointer hover:border-accent/30 hover:shadow-md transition-all" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

// ── Input ─────────────────────────────────────────────────────────────────────
export function Input({
  label,
  placeholder,
  type = "text",
  value,
  onChange,
  className = "",
  suffix,
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-xs font-medium text-muted-foreground">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className="w-full px-3.5 py-2.5 text-sm bg-secondary border border-border rounded-xl text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all"
        />

        {suffix && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {suffix}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Select ────────────────────────────────────────────────────────────────────
export function Select({ label, options, value, onChange, className = "" }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-xs font-medium text-muted-foreground">
          {label}
        </label>
      )}
      <select
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="px-3.5 py-2.5 text-sm bg-secondary border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// ── SectionTitle ──────────────────────────────────────────────────────────────
export function SectionTitle({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-foreground">{title}</h1>
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

// ── StarRating (표시용) ──────────────────────────────────────────────────────
export function StarRating({ rating, reviewCount, size = "sm", className = "" }) {
  const sizeClass = size === "sm" ? "w-3 h-3" : "w-4 h-4";
  const textClass = size === "sm" ? "text-xs" : "text-sm";

  if (!rating || !reviewCount) {
    return (
      <span className={`${textClass} text-muted-foreground/60 ${className}`}>
        아직 리뷰가 없어요
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      <Star className={`${sizeClass} fill-amber-400 text-amber-400 shrink-0`} />
      <span className={`${textClass} font-semibold text-foreground`}>
        {Number(rating).toFixed(1)}
      </span>
      <span className={`${textClass} text-muted-foreground`}>
        ({reviewCount})
      </span>
    </span>
  );
}

// ── StarRatingInput (입력용) ─────────────────────────────────────────────────
export function StarRatingInput({ value = 0, onChange, size = "md" }) {
  const sizeClass = size === "sm" ? "w-5 h-5" : "w-7 h-7";

  return (
    <div className="inline-flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange?.(n)}
          className="p-0.5 transition-transform hover:scale-110"
        >
          <Star
            className={`${sizeClass} ${n <= value ? "fill-amber-400 text-amber-400" : "text-border"}`}
          />
        </button>
      ))}
    </div>
  );
}

// ── UploadZone ────────────────────────────────────────────────────────────────
export function UploadZone({
  label = "파일을 드래그하거나 클릭하여 업로드",
  sublabel = "PNG, JPG, PDF 최대 10MB",
  className = "",
}) {
  return (
    <div
      className={`border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center gap-3 text-center hover:border-accent/40 hover:bg-accent/3 transition-all cursor-pointer ${className}`}
    >
      <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
        <svg
          className="w-5 h-5 text-muted-foreground"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
          />
        </svg>
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{sublabel}</p>
      </div>
    </div>
  );
}
