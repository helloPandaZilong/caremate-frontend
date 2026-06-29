import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router'
import './ShopLayout.css'

const NAV_ITEMS = [
  {
    to: '/shop/dashboard',
    label: '대시보드',
    end: true,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
  },
  {
    to: '/shop/orders',
    label: '주문 접수',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
      </svg>
    ),
  },
  {
    to: '/shop/lms',
    label: 'LMS 교육',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
      </svg>
    ),
  },
  {
    to: '/shop/settlement',
    label: '월말 정산',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
      </svg>
    ),
  },
  {
    to: '/shop/service-centers',
    label: '서비스 센터 찾기',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/>
      </svg>
    ),
  },
]

const FOOTER_ITEMS = [
  {
    to: '/shop/profile',
    label: '마이페이지',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
  {
    to: '/',
    label: '홈으로',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V9l8-6 8 6v10a2 2 0 0 1-2 2h-4"/><polyline points="9,21 9,12 15,12 15,21"/>
      </svg>
    ),
  },
]

export default function ShopLayout({ children, notificationCount = 2 }) {
  const navigate = useNavigate()
  const [isDark, setIsDark] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className={`shop-layout${isDark ? ' shop-layout--dark' : ''}`}>
      {/* ── Sidebar ─────────────────────────── */}
      <aside className={`shop-sidebar${sidebarOpen ? '' : ' shop-sidebar--collapsed'}`}>
        {/* Logo */}
        <div className="shop-sidebar__logo">
          <div className="shop-sidebar__logo-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V7L12 2z"
                fill="#D97706" stroke="none"/>
              <path d="M9 12l2 2 4-4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          {sidebarOpen && <span className="shop-sidebar__logo-text">CareMate</span>}
        </div>

        {/* Partner badge */}
        {sidebarOpen && <div className="shop-sidebar__badge">수리점 파트너</div>}

        {/* Nav */}
        <nav className="shop-sidebar__nav">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `shop-sidebar__nav-item${isActive ? ' shop-sidebar__nav-item--active' : ''}`
              }
            >
              <span className="shop-sidebar__nav-icon">{item.icon}</span>
              {sidebarOpen && <span className="shop-sidebar__nav-label">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="shop-sidebar__footer">
          {FOOTER_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className="shop-sidebar__footer-item"
            >
              <span className="shop-sidebar__nav-icon">{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </NavLink>
          ))}
          <button
            className="shop-sidebar__footer-item shop-sidebar__collapse-btn"
            onClick={() => setSidebarOpen(o => !o)}
          >
            <span className="shop-sidebar__nav-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {sidebarOpen
                  ? <><polyline points="15,18 9,12 15,6"/></>
                  : <><polyline points="9,18 15,12 9,6"/></>
                }
              </svg>
            </span>
            {sidebarOpen && <span>사이드바 접기</span>}
          </button>
        </div>
      </aside>

      {/* ── Main ────────────────────────────── */}
      <div className="shop-main">
        {/* Header */}
        <header className="shop-header">
          {/* Left: empty spacer */}
          <div className="shop-header__left" />

          {/* Right: role tabs + controls */}
          <div className="shop-header__right">
            {/* Role tabs */}
            <div className="shop-header__role-tabs">
              <button className="shop-header__role-tab" onClick={() => navigate('/customer')}>고객</button>
              <button className="shop-header__role-tab shop-header__role-tab--active">수리점</button>
              <button className="shop-header__role-tab" onClick={() => navigate('/admin')}>관리자</button>
            </div>

            {/* Light/Dark toggle */}
            <button
              className="shop-header__icon-btn"
              onClick={() => setIsDark(d => !d)}
              title={isDark ? '라이트 모드' : '다크 모드'}
            >
              {isDark ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/>
                  <line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/>
                  <line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
              )}
            </button>

            {/* Notification bell */}
            <button className="shop-header__icon-btn shop-header__bell" title="알림">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              {notificationCount > 0 && (
                <span className="shop-header__bell-badge">{notificationCount}</span>
              )}
            </button>

            {/* Avatar */}
            <div className="shop-header__avatar">김</div>
          </div>
        </header>

        {/* Page content */}
        <main className="shop-content">{children}</main>
      </div>
    </div>
  )
}
