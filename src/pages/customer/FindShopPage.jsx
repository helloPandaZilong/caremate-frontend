import { useState, useEffect } from "react";
import { Search, Star, Clock, Phone, Navigation, X, Loader2 } from "lucide-react";
import { Badge } from "../../components/shared.jsx";
import { getRepairShops, getShopOperatingHours } from "../../api/customerService";

function MapBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <svg
        className="absolute inset-0 w-full h-full opacity-20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="grid"
            width="80"
            height="80"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 80 0 L 0 0 0 80"
              fill="none"
              stroke="#94A3B8"
              strokeWidth="0.5"
            />
          </pattern>
          <pattern
            id="roads"
            width="240"
            height="240"
            patternUnits="userSpaceOnUse"
          >
            <rect width="240" height="240" fill="url(#grid)" />
            <line
              x1="120"
              y1="0"
              x2="120"
              y2="240"
              stroke="#94A3B8"
              strokeWidth="2"
            />
            <line
              x1="0"
              y1="120"
              x2="240"
              y2="120"
              stroke="#94A3B8"
              strokeWidth="2"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#roads)" />
      </svg>
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded bg-border opacity-60"
          style={{
            left: `${(i % 4) * 26 + 2}%`,
            top: `${Math.floor(i / 4) * 34 + 5}%`,
            width: `${18 + (i % 3) * 4}%`,
            height: `${20 + (i % 2) * 8}%`,
          }}
        />
      ))}
    </div>
  );
}

function MapPin({ shop, index, active, onClick }) {
  const positions = [
    { left: "38%", top: "42%" },
    { left: "28%", top: "60%" },
    { left: "55%", top: "32%" },
    { left: "68%", top: "55%" },
    { left: "50%", top: "70%" },
    { left: "42%", top: "25%" },
    { left: "62%", top: "40%" },
    { left: "35%", top: "75%" },
  ];
  const pos = positions[index % positions.length];
  return (
    <button
      onClick={onClick}
      style={{ left: pos.left, top: pos.top }}
      className={`absolute -translate-x-1/2 -translate-y-full transition-all z-10 ${active ? "scale-125" : "hover:scale-110"}`}
    >
      <div className="w-8 h-8 rounded-full flex items-center justify-center shadow-md border-2 border-card bg-accent">
        <span className="text-white text-[10px] font-bold">{index + 1}</span>
      </div>
      <div
        className="w-2 h-2 mx-auto -mt-1"
        style={{
          borderTop: "6px solid var(--accent)",
          borderLeft: "5px solid transparent",
          borderRight: "5px solid transparent",
          width: 0,
          height: 0,
        }}
      />
    </button>
  );
}

const DAY_NAMES = ["일", "월", "화", "수", "목", "금", "토"];

function InfoPopup({ shop, hours, onClose }) {
  const today = new Date().getDay();
  const todayHours = hours?.find((h) => h.dayOfWeek === today);
  const hoursText = todayHours
    ? todayHours.isClosed
      ? "오늘 휴무"
      : `${todayHours.openTime} - ${todayHours.closeTime}`
    : null;

  return (
    <div className="absolute top-4 right-4 z-20 bg-card border border-border rounded-2xl shadow-xl p-4 w-64">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <p className="text-sm font-semibold text-foreground">
            {shop.shopName}
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground p-0.5"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="flex flex-col gap-2 text-xs text-muted-foreground">
        {hoursText && (
          <span className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 shrink-0" />
            {hoursText}
          </span>
        )}
        {shop.phone && (
          <span className="flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 shrink-0" />
            {shop.phone}
          </span>
        )}
        {hours && hours.length > 0 && (
          <div className="mt-2 pt-2 border-t border-border/40 flex flex-col gap-1">
            {hours.map((h) => (
              <div key={h.dayOfWeek} className="flex justify-between text-[11px]">
                <span className={h.dayOfWeek === today ? "font-semibold text-foreground" : ""}>
                  {DAY_NAMES[h.dayOfWeek]}
                </span>
                <span>
                  {h.isClosed ? "휴무" : `${h.openTime} - ${h.closeTime}`}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
      <button
        onClick={() => (window.location.href = "/customer/request")}
        className="mt-3 w-full py-2 text-xs font-semibold bg-accent text-white rounded-xl hover:bg-accent/90 transition-colors"
      >
        A/S 예약하기
      </button>
    </div>
  );
}

export default function FindShopPage() {
  const [query, setQuery] = useState("");
  const [activeShop, setActiveShop] = useState(null);
  const [activeHours, setActiveHours] = useState(null);

  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRepairShops()
      .then(({ data }) => setShops(data.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleShopClick = async (shop) => {
    if (activeShop?.id === shop.id) {
      setActiveShop(null);
      setActiveHours(null);
      return;
    }
    setActiveShop(shop);
    try {
      const { data } = await getShopOperatingHours(shop.id);
      setActiveHours(data.data ?? []);
    } catch {
      setActiveHours([]);
    }
  };

  const filtered = shops.filter((s) =>
    (s.shopName || "").toLowerCase().includes(query.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div
      className="flex h-[calc(100vh-4rem)] -m-8 overflow-hidden"
      style={{ fontFamily: "'Noto Sans KR', 'DM Sans', sans-serif" }}
    >
      {/* Left sidebar */}
      <aside className="w-[400px] flex-shrink-0 border-r border-border flex flex-col bg-background overflow-hidden">
        <div className="p-4 border-b border-border bg-card">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="수리점 검색..."
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-secondary border border-border rounded-xl text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
          <p className="text-xs text-muted-foreground px-1 mb-1">
            검색 결과 {filtered.length}개
          </p>
          {filtered.map((shop) => (
            <div
              key={shop.id}
              onClick={() => handleShopClick(shop)}
              className={`bg-card border rounded-2xl p-4 cursor-pointer transition-all ${
                activeShop?.id === shop.id
                  ? "border-accent shadow-md"
                  : "border-border hover:border-border/70 hover:shadow-sm"
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <span className="text-sm font-semibold text-foreground">
                    {shop.shopName}
                  </span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mb-1">
                {shop.address}
              </p>
              {shop.phone && (
                <p className="text-xs text-muted-foreground mb-3">
                  {shop.phone}
                </p>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  window.location.href = "/customer/request";
                }}
                className="w-full py-2 text-xs font-semibold bg-accent/10 text-accent rounded-xl hover:bg-accent/15 transition-colors border border-accent/20"
              >
                A/S 예약
              </button>
            </div>
          ))}
        </div>
      </aside>

      {/* Right map */}
      <div className="flex-1 relative bg-secondary overflow-hidden">
        <MapBackground />
        {filtered.map((shop, i) => (
          <MapPin
            key={shop.id}
            shop={shop}
            index={i}
            active={activeShop?.id === shop.id}
            onClick={() => handleShopClick(shop)}
          />
        ))}
        {activeShop && (
          <InfoPopup
            shop={activeShop}
            hours={activeHours}
            onClose={() => {
              setActiveShop(null);
              setActiveHours(null);
            }}
          />
        )}
        <div className="absolute bottom-4 left-4 flex items-center gap-3 text-xs text-muted-foreground bg-card/80 backdrop-blur-sm px-3 py-2 rounded-xl border border-border">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-accent" />
            수리점
          </span>
        </div>
      </div>
    </div>
  );
}