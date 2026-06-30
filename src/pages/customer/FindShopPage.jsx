import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router";
import { Search, Clock, Phone, X, Loader2 } from "lucide-react";
import { getRepairShops, getShopOperatingHours } from "../../api/customerService";

const KAKAO_MAP_KEY = import.meta.env.VITE_KAKAO_MAP_KEY;

const DEMO_SHOPS = [
  { id: 901, shopName: "폰케어 강남점", address: "서울 강남구 테헤란로 152", phone: "02-555-1234", latitude: 37.5000, longitude: 127.0365 },
  { id: 902, shopName: "스마트픽스 홍대점", address: "서울 마포구 양화로 160", phone: "02-332-5678", latitude: 37.5563, longitude: 126.9236 },
  { id: 903, shopName: "닥터폰 건대입구점", address: "서울 광진구 아차산로 272", phone: "02-446-9012", latitude: 37.5407, longitude: 127.0698 },
  { id: 904, shopName: "모바일119 신촌점", address: "서울 서대문구 연세로 11", phone: "02-393-3456", latitude: 37.5598, longitude: 126.9425 },
  { id: 905, shopName: "퀵리페어 잠실점", address: "서울 송파구 올림픽로 300", phone: "02-421-7890", latitude: 37.5133, longitude: 127.1001 },
];

function loadScript(url) {
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.charset = "UTF-8";
    s.src = url;
    s.onload = resolve;
    s.onerror = () => reject(new Error(`스크립트 로드 실패: ${url}`));
    document.head.appendChild(s);
  });
}

function loadKakaoSDK() {
  if (window.kakao?.maps?.Map) return Promise.resolve(window.kakao);

  return loadScript("/kakao-sdk.js")
    .then(() => {
      if (window.kakao?.maps) window.kakao.maps.apikey = KAKAO_MAP_KEY;
      return loadScript("https://t1.daumcdn.net/mapjsapi/js/main/4.5.13/kakao.js");
    })
    .then(() => loadScript("https://t1.daumcdn.net/mapjsapi/js/libs/services/1.1.1/services.js"))
    .then(() => {
      window.kakao.maps.readyState = 2;
      return window.kakao;
    });
}

const DAY_NAMES = ["일", "월", "화", "수", "목", "금", "토"];

function InfoPopup({ shop, hours, onClose, onReserve }) {
  return (
    <div className="absolute top-4 right-4 z-20 bg-card border border-border rounded-2xl shadow-xl p-4 w-72">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <p className="text-sm font-semibold text-foreground">{shop.shopName}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{shop.address}</p>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-0.5">
          <X className="w-4 h-4" />
        </button>
      </div>

      {shop.phone && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
          <Phone className="w-3.5 h-3.5 shrink-0" />
          {shop.phone}
        </div>
      )}

      {hours && hours.length > 0 && (
        <div className="flex flex-col gap-1 mb-3">
          <span className="text-xs font-medium text-foreground flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> 영업 시간
          </span>
          {hours.map((h) => (
            <div key={h.dayOfWeek} className="flex justify-between text-[11px] text-muted-foreground pl-5">
              <span>{DAY_NAMES[h.dayOfWeek] ?? h.dayOfWeek}요일</span>
              {h.closed ? (
                <span className="text-red-400">휴무</span>
              ) : (
                <span>{h.openTime?.slice(0, 5)} – {h.closeTime?.slice(0, 5)}</span>
              )}
            </div>
          ))}
        </div>
      )}

      <button
        onClick={() => onReserve(shop)}
        className="mt-1 w-full py-2 text-xs font-semibold bg-accent text-white rounded-xl hover:bg-accent/90 transition-colors"
      >
        A/S 예약하기
      </button>
    </div>
  );
}

export default function FindShopPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [activeShop, setActiveShop] = useState(null);
  const [activeHours, setActiveHours] = useState(null);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mapError, setMapError] = useState(null);

  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const geocoderRef = useRef(null);
  const shopCoordsRef = useRef(new Map());

  useEffect(() => {
    getRepairShops()
      .then(({ data }) => {
        const list = data.data ?? [];
        setShops(list.length > 0 ? list : DEMO_SHOPS);
      })
      .catch(() => setShops(DEMO_SHOPS))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (loading) return;

    let cancelled = false;

    loadKakaoSDK()
      .then((kakao) => {
        if (cancelled || !mapContainerRef.current) return;

        const defaultCenter = new kakao.maps.LatLng(37.5665, 126.978);
        const map = new kakao.maps.Map(mapContainerRef.current, {
          center: defaultCenter,
          level: 5,
        });
        mapRef.current = map;

        const zoomControl = new kakao.maps.ZoomControl();
        map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);

        geocoderRef.current = new kakao.maps.services.Geocoder();

        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              if (cancelled) return;
              const myPos = new kakao.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
              map.setCenter(myPos);

              new kakao.maps.CustomOverlay({
                map,
                position: myPos,
                content: '<div style="width:16px;height:16px;background:#3B82F6;border:3px solid #fff;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,.3);"></div>',
                yAnchor: 0.5,
                xAnchor: 0.5,
              });
            },
            () => {},
            { enableHighAccuracy: true, timeout: 5000 },
          );
        }

        if (shops.length > 0) placeMarkers(kakao, map, shops);
      })
      .catch((err) => {
        console.error("카카오맵 초기화 실패:", err);
        if (!cancelled) setMapError("카카오맵을 불러올 수 없습니다.");
      });

    return () => { cancelled = true; };
  }, [loading, shops]);

  const placeMarkers = useCallback((kakao, map, shopList) => {
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];
    shopCoordsRef.current.clear();

    const bounds = new kakao.maps.LatLngBounds();
    let resolved = 0;

    shopList.forEach((shop) => {
      if (shop.latitude && shop.longitude) {
        addMarker(kakao, map, shop, shop.latitude, shop.longitude, bounds);
        resolved++;
        if (resolved === shopList.length) fitBounds(map, bounds, shopList.length);
        return;
      }

      if (!shop.address) {
        resolved++;
        if (resolved === shopList.length) fitBounds(map, bounds, shopList.length);
        return;
      }

      geocoderRef.current.addressSearch(shop.address, (result, status) => {
        if (status === kakao.maps.services.Status.OK && result.length > 0) {
          const lat = parseFloat(result[0].y);
          const lng = parseFloat(result[0].x);
          addMarker(kakao, map, shop, lat, lng, bounds);
        }
        resolved++;
        if (resolved === shopList.length) fitBounds(map, bounds, shopList.length);
      });
    });
  }, []);

  const addMarker = (kakao, map, shop, lat, lng, bounds) => {
    const position = new kakao.maps.LatLng(lat, lng);
    bounds.extend(position);
    shopCoordsRef.current.set(shop.id, position);

    const marker = new kakao.maps.Marker({ map, position, title: shop.shopName });
    marker._shopId = shop.id;

    kakao.maps.event.addListener(marker, "click", () => handleShopClick(shop));

    markersRef.current.push(marker);
  };

  const fitBounds = (map, bounds, count) => {
    if (count > 0) map.setBounds(bounds);
  };

  const handleShopClick = async (shop) => {
    if (activeShop?.id === shop.id) {
      setActiveShop(null);
      setActiveHours(null);
      return;
    }
    setActiveShop(shop);

    const pos = shopCoordsRef.current.get(shop.id);
    if (pos && mapRef.current) {
      mapRef.current.panTo(pos);
    }

    try {
      const { data } = await getShopOperatingHours(shop.id);
      setActiveHours(data.data?.hours ?? []);
    } catch {
      setActiveHours([]);
    }
  };

  const handleReserve = (shop) => {
    navigate("/customer/request", { state: { selectedShop: shop } });
  };

  const filtered = shops.filter((s) =>
    (s.shopName || "").toLowerCase().includes(query.toLowerCase()),
  );

  useEffect(() => {
    if (!mapRef.current || !window.kakao) return;
    const kakao = window.kakao;

    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    const bounds = new kakao.maps.LatLngBounds();
    let count = 0;

    filtered.forEach((shop) => {
      const pos = shopCoordsRef.current.get(shop.id);
      if (!pos) return;

      const marker = new kakao.maps.Marker({
        map: mapRef.current,
        position: pos,
        title: shop.shopName,
      });
      marker._shopId = shop.id;
      kakao.maps.event.addListener(marker, "click", () => handleShopClick(shop));
      markersRef.current.push(marker);
      bounds.extend(pos);
      count++;
    });

    if (count > 0) mapRef.current.setBounds(bounds);
  }, [query]);

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
              <p className="text-xs text-muted-foreground mb-1">{shop.address}</p>
              {shop.phone && (
                <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1">
                  <Phone className="w-3 h-3" /> {shop.phone}
                </p>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleReserve(shop);
                }}
                className="w-full py-2 text-xs font-semibold bg-accent/10 text-accent rounded-xl hover:bg-accent/15 transition-colors border border-accent/20"
              >
                A/S 예약
              </button>
            </div>
          ))}
        </div>
      </aside>

      <div className="flex-1 relative overflow-hidden">
        {mapError ? (
          <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
            {mapError}
          </div>
        ) : (
          <div ref={mapContainerRef} className="w-full h-full" />
        )}
        {activeShop && (
          <InfoPopup
            shop={activeShop}
            hours={activeHours}
            onClose={() => {
              setActiveShop(null);
              setActiveHours(null);
            }}
            onReserve={handleReserve}
          />
        )}
      </div>
    </div>
  );
}
