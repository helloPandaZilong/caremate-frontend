import { useState } from "react";
import { Search, Star, Clock, Phone, Navigation, X } from "lucide-react";
import { Badge } from "../components/shared";

const BRANDS = ["전체", "Apple", "Samsung", "Google", "LG"];

const SHOPS = [
  {
    id: 1,
    name: "강남 스마트케어",
    rating: 4.9,
    reviews: 312,
    distance: "0.4km",
    queue: "available",
    address: "강남구 테헤란로 152",
    phone: "02-1234-5678",
    hours: "09:00–20:00",
    lat: 37.498,
    lng: 127.028,
  },
  {
    id: 2,
    name: "서초 아이폰 전문점",
    rating: 4.7,
    reviews: 218,
    distance: "1.2km",
    queue: "busy",
    address: "서초구 서초대로 301",
    phone: "02-2345-6789",
    hours: "10:00–19:00",
    lat: 37.495,
    lng: 127.025,
  },
  {
    id: 3,
    name: "역삼 갤럭시 수리",
    rating: 4.6,
    reviews: 154,
    distance: "1.8km",
    queue: "available",
    address: "강남구 역삼로 168",
    phone: "02-3456-7890",
    hours: "09:00–21:00",
    lat: 37.501,
    lng: 127.034,
  },
  {
    id: 4,
    name: "선릉 올폰 서비스",
    rating: 4.5,
    reviews: 98,
    distance: "2.3km",
    queue: "available",
    address: "강남구 선릉로 433",
    phone: "02-4567-8901",
    hours: "10:00–18:00",
    lat: 37.504,
    lng: 127.049,
  },
  {
    id: 5,
    name: "삼성 공식 서비스센터",
    rating: 4.8,
    reviews: 521,
    distance: "2.9km",
    queue: "busy",
    address: "강남구 봉은사로 114",
    phone: "1588-3366",
    hours: "09:00–18:00",
    lat: 37.51,
    lng: 127.038,
  },
];

// Simple CSS map grid
function MapBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Road grid */}
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
      {/* Blocks */}
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

function MapPin({ shop, active, onClick }) {
  const positions = [
    { left: "38%", top: "42%" },
    { left: "28%", top: "60%" },
    { left: "55%", top: "32%" },
    { left: "68%", top: "55%" },
    { left: "50%", top: "70%" },
  ];
  const pos = positions[shop.id - 1];
  return (
    <button
      onClick={onClick}
      style={{ left: pos.left, top: pos.top }}
      className={`absolute -translate-x-1/2 -translate-y-full transition-all z-10 ${active ? "scale-125" : "hover:scale-110"}`}
    >
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md border-2 border-card ${
          shop.queue === "available" ? "bg-accent" : "bg-amber-500"
        }`}
      >
        <span className="text-white text-[10px] font-bold">{shop.id}</span>
      </div>
      <div
        className="w-2 h-2 mx-auto -mt-1 border-4 border-transparent"
        style={{
          borderTopColor:
            shop.queue === "available" ? "var(--accent)" : "#f59e0b",
          borderTop: `6px solid ${shop.queue === "available" ? "var(--accent)" : "#f59e0b"}`,
          borderLeft: "5px solid transparent",
          borderRight: "5px solid transparent",
          width: 0,
          height: 0,
        }}
      />
    </button>
  );
}

function InfoPopup({ shop, onClose }) {
  return (
    <div className="absolute top-4 right-4 z-20 bg-card border border-border rounded-2xl shadow-xl p-4 w-64">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <p className="text-sm font-semibold text-foreground">{shop.name}</p>
          <div className="flex items-center gap-1 mt-0.5">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span className="text-xs font-medium text-foreground">
              {shop.rating}
            </span>
            <span className="text-xs text-muted-foreground">
              ({shop.reviews})
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground p-0.5"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="flex flex-col gap-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 shrink-0" />
          {shop.hours}
        </span>
        <span className="flex items-center gap-2">
          <Phone className="w-3.5 h-3.5 shrink-0" />
          {shop.phone}
        </span>
      </div>
      <button className="mt-3 w-full py-2 text-xs font-semibold bg-accent text-white rounded-xl hover:bg-accent/90 transition-colors">
        A/S 예약하기
      </button>
    </div>
  );
}

export default function FindShopPage() {
  const [query, setQuery] = useState("");
  const [brand, setBrand] = useState("전체");
  const [activeShop, setActiveShop] = useState(null);

  const filtered = SHOPS.filter((s) =>
    s.name.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div
      className="flex h-[calc(100vh-4rem)] -m-8 overflow-hidden"
      style={{ fontFamily: "'Noto Sans KR', 'DM Sans', sans-serif" }}
    >
      {/* Left sidebar */}
      <aside className="w-[400px] flex-shrink-0 border-r border-border flex flex-col bg-background overflow-hidden">
        {/* Search */}
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
          {/* Brand filter chips */}
          <div className="flex gap-2 mt-3 flex-wrap">
            {BRANDS.map((b) => (
              <button
                key={b}
                onClick={() => setBrand(b)}
                className={`px-3 py-1 text-xs font-medium rounded-full border transition-all ${
                  brand === b
                    ? "bg-accent text-white border-accent"
                    : "bg-card text-muted-foreground border-border hover:border-accent/40"
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>

        {/* Shop list */}
        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
          <p className="text-xs text-muted-foreground px-1 mb-1">
            검색 결과 {filtered.length}개
          </p>
          {filtered.map((shop) => (
            <div
              key={shop.id}
              onClick={() =>
                setActiveShop(activeShop?.id === shop.id ? null : shop)
              }
              className={`bg-card border rounded-2xl p-4 cursor-pointer transition-all ${
                activeShop?.id === shop.id
                  ? "border-accent shadow-md"
                  : "border-border hover:border-border/70 hover:shadow-sm"
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">
                      {shop.name}
                    </span>
                    <Badge
                      variant={shop.queue === "available" ? "green" : "yellow"}
                    >
                      {shop.queue === "available" ? "예약 가능" : "혼잡"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-medium text-foreground">
                      {shop.rating}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({shop.reviews})
                    </span>
                    <span className="text-muted-foreground">·</span>
                    <Navigation className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {shop.distance}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                {shop.address}
              </p>
              <button className="w-full py-2 text-xs font-semibold bg-accent/10 text-accent rounded-xl hover:bg-accent/15 transition-colors border border-accent/20">
                A/S 예약
              </button>
            </div>
          ))}
        </div>
      </aside>

      {/* Right map */}
      <div className="flex-1 relative bg-secondary overflow-hidden">
        <MapBackground />
        {SHOPS.map((shop) => (
          <MapPin
            key={shop.id}
            shop={shop}
            active={activeShop?.id === shop.id}
            onClick={() =>
              setActiveShop(activeShop?.id === shop.id ? null : shop)
            }
          />
        ))}
        {activeShop && (
          <InfoPopup shop={activeShop} onClose={() => setActiveShop(null)} />
        )}
        {/* Map label */}
        <div className="absolute bottom-4 left-4 flex items-center gap-3 text-xs text-muted-foreground bg-card/80 backdrop-blur-sm px-3 py-2 rounded-xl border border-border">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-accent" />
            예약 가능
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            혼잡
          </span>
        </div>
      </div>
    </div>
  );
}
