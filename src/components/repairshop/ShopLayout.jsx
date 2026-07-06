import { useState, useEffect, useRef, useCallback } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router'
import apiClient from '../../api/client.js'
import { getOperatingHours } from '../../api/repairshopApi.js'
import caremateLogo from '../../assets/caremate-logo.png'
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
    label: '접수 현황',
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

export default function ShopLayout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [isDark, setIsDark] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // ── 운영시간 미설정 감지 ────────────────────────────────────
  const [hoursNotSet, setHoursNotSet] = useState(false)
  const redirectedRef = useRef(false)

  const checkOperatingHours = useCallback(() => {
    getOperatingHours()
      .then((data) => {
        console.log('[ShopLayout] operating hours data:', data)
        const list = data?.hours ?? data ?? []
        if (!list.length) {
          setHoursNotSet(true)
          const lmsDone = localStorage.getItem('caremate-shop-lms') === 'done'
          if (!redirectedRef.current && lmsDone && location.pathname !== '/shop/profile') {
            redirectedRef.current = true
            navigate('/shop/profile', { replace: true })
          }
        }
      })
      .catch((err) => console.warn('[ShopLayout] 운영시간 조회 실패:', err))
  }, [location.pathname, navigate])

  useEffect(() => { checkOperatingHours() }, [checkOperatingHours])

  useEffect(() => {
    const onHoursSaved = () => setHoursNotSet(false)
    const onLMSDone = () => checkOperatingHours()
    window.addEventListener('hours-saved', onHoursSaved)
    window.addEventListener('lms-completed', onLMSDone)
    return () => {
      window.removeEventListener('hours-saved', onHoursSaved)
      window.removeEventListener('lms-completed', onLMSDone)
    }
  }, [checkOperatingHours])

  // ── 알림 state ─────────────────────────────────────────────
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifications, setNotifications] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef(null)
  const sseRef = useRef(null)

  // 미읽음 수 초기 로드
  useEffect(() => {
    apiClient.get('/notifications/unread-count')
      .then(r => setUnreadCount(r.data.data.unreadCount ?? 0))
      .catch(() => {})
  }, [])

  // SSE 구독
  useEffect(() => {
    const token = localStorage.getItem('caremate_access_token')
    if (!token) return
    const es = new EventSource(`/api/notifications/subscribe?token=${token}`)
    sseRef.current = es
    es.addEventListener('notification', (e) => {
      const payload = JSON.parse(e.data)
      setUnreadCount(prev => prev + 1)
      setNotifications(prev => [{ ...payload, isRead: false }, ...prev])
    })
    es.onerror = () => es.close()
    return () => es.close()
  }, [])

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleBellClick = () => {
    if (!showDropdown) {
      apiClient.get('/notifications?size=20')
        .then(r => setNotifications(r.data.data.content ?? []))
        .catch(() => {})
    }
    setShowDropdown(d => !d)
  }

  const handleMarkRead = (id, isRead) => {
    if (isRead) return
    apiClient.patch(`/notifications/${id}/read`)
      .then(() => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
        setUnreadCount(prev => Math.max(0, prev - 1))
      })
      .catch(() => {})
  }

  const formatTime = (createdAt) => {
    if (!createdAt) return ''
    const diff = Math.floor((Date.now() - new Date(createdAt)) / 1000)
    if (diff < 60) return '방금'
    if (diff < 3600) return `${Math.floor(diff / 60)}분 전`
    if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`
    return `${Math.floor(diff / 86400)}일 전`
  }

  return (
    <div className={`shop-layout${isDark ? ' shop-layout--dark' : ''}`}>
      {/* ── Sidebar ─────────────────────────── */}
      <aside className={`shop-sidebar${sidebarOpen ? '' : ' shop-sidebar--collapsed'}`}>
        {/* Logo */}
        <div className="shop-sidebar__logo">
          <div className="shop-sidebar__logo-icon">
            <img src={caremateLogo} alt="CareMate" width="22" height="22" style={{ objectFit: 'contain' }} />
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
            <div style={{ position: 'relative' }} ref={dropdownRef}>
              <button className="shop-header__icon-btn shop-header__bell" title="알림" onClick={handleBellClick}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
                {unreadCount > 0 && (
                  <span className="shop-header__bell-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
                )}
              </button>

              {/* 알림 드롭다운 */}
              {showDropdown && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                  width: '320px', maxHeight: '400px', overflowY: 'auto',
                  background: 'var(--color-surface, #fff)',
                  border: '1px solid var(--color-border, #e5e7eb)',
                  borderRadius: '10px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  zIndex: 1000,
                }}>
                  <div style={{ padding: '12px 16px', fontWeight: 600, fontSize: '14px', borderBottom: '1px solid var(--color-border, #e5e7eb)' }}>
                    알림 {unreadCount > 0 && <span style={{ color: '#ef4444', fontSize: '12px' }}>({unreadCount})</span>}
                  </div>
                  {notifications.length === 0 ? (
                    <div style={{ padding: '32px 16px', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>
                      새 알림이 없습니다
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        onClick={() => handleMarkRead(n.id, n.isRead)}
                        style={{
                          padding: '12px 16px', borderBottom: '1px solid var(--color-border, #f3f4f6)',
                          cursor: n.isRead ? 'default' : 'pointer',
                          background: n.isRead ? 'transparent' : 'var(--color-primary-50, #fffbeb)',
                          display: 'flex', gap: '10px', alignItems: 'flex-start',
                        }}
                      >
                        <span style={{ marginTop: '3px', flexShrink: 0, width: '8px', height: '8px', borderRadius: '50%', background: n.isRead ? 'transparent' : '#f59e0b' }} />
                        <div style={{ flex: 1 }}>
                          <p style={{ margin: 0, fontSize: '13px', lineHeight: '1.5', color: 'var(--color-text, #111)' }}>{n.message}</p>
                          <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#9ca3af' }}>{formatTime(n.createdAt)}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Avatar */}
            <div className="shop-header__avatar">김</div>
          </div>
        </header>

        {/* 운영시간 미설정 경고 배너 */}
        {hoursNotSet && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '10px 20px',
            background: '#fef3c7', borderBottom: '1px solid #fcd34d',
            color: '#92400e', fontSize: '13px',
          }}>
            <span>⚠️</span>
            <span>운영시간이 설정되지 않아 <strong>고객 예약이 불가능</strong>합니다.</span>
            <button
              onClick={() => navigate('/shop/profile')}
              style={{
                marginLeft: '4px', fontWeight: 600, textDecoration: 'underline',
                background: 'none', border: 'none', color: '#92400e', cursor: 'pointer', fontSize: '13px',
              }}
            >
              지금 설정하기 →
            </button>
          </div>
        )}

        {/* Page content */}
        <main className="shop-content">{children}</main>
      </div>
    </div>
  )
}
