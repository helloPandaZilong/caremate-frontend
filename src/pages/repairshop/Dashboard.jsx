import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import ShopLayout from '../../components/repairshop/ShopLayout.jsx'
import { getDashboard } from '../../api/repairshopApi.js'
import './css/Dashboard.css'

/* ── helpers ─────────────────────────────────────────────── */
const DAYS = ['일', '월', '화', '수', '목', '금', '토']

function formatTime(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
}

function isSameDay(dateStr, year, month, day) {
  const d = new Date(dateStr)
  return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day
}

const STATUS_LABEL = {
  RECEIVED:'검토 대기', ACCEPTED:'확정 예약', REJECTED:'반려',
  NO_SHOW:'노쇼', IN_REPAIR:'수리 중', REPAIR_DONE:'수리 완료',
  PAYMENT_COMPLETED:'결제 완료', CLAIM_REQUESTED:'청구 요청', CLAIM_COMPLETED:'청구 완료',
}
const STATUS_CLASS = {
  RECEIVED:'badge--received', ACCEPTED:'badge--accepted', REJECTED:'badge--rejected',
  NO_SHOW:'badge--no-show', IN_REPAIR:'badge--in-repair', REPAIR_DONE:'badge--repair-done',
  PAYMENT_COMPLETED:'badge--payment-completed', CLAIM_REQUESTED:'badge--claim-requested',
  CLAIM_COMPLETED:'badge--claim-completed',
}

/* ── MOCK DATA ───────────────────────────────────────────── */
const MOCK = {
  receivedCount: 3, inRepairCount: 2, repairDoneCountToday: 1,
  recentOrders: [
    { id:1, orderNo:'CM-20240613-0042', customerName:'김민준', status:'RECEIVED',  reservedVisitAt:'2024-06-13T10:00:00' },
    { id:2, orderNo:'CM-20240613-0039', customerName:'이수연', status:'ACCEPTED',  reservedVisitAt:'2024-06-13T14:00:00' },
    { id:3, orderNo:'CM-20240615-0031', customerName:'박도현', status:'RECEIVED',  reservedVisitAt:'2024-06-15T11:00:00' },
    { id:4, orderNo:'CM-20240617-0024', customerName:'최지아', status:'ACCEPTED',  reservedVisitAt:'2024-06-17T15:00:00' },
    { id:5, orderNo:'CM-20240620-0018', customerName:'정우성', status:'RECEIVED',  reservedVisitAt:'2024-06-20T10:00:00' },
    { id:6, orderNo:'CM-20240621-0015', customerName:'한예슬', status:'ACCEPTED',  reservedVisitAt:'2024-06-21T13:00:00' },
  ],
}
// demo: "오늘"을 2024-06-13으로 고정
const DEMO_TODAY = { year: 2024, month: 5, day: 13 }

/* ── Stat card icons ─────────────────────────────────────── */
const IconInbox = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22,12 16,12 14,15 10,15 8,12 2,12"/>
    <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>
  </svg>
)
const IconWrench = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
  </svg>
)
const IconCheck = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20,6 9,17 4,12"/>
  </svg>
)

/* ── Component ───────────────────────────────────────────── */
export default function Dashboard() {
  const navigate = useNavigate()
  const [data, setData] = useState(MOCK)
  const [curYear, setCurYear] = useState(DEMO_TODAY.year)
  const [curMonth, setCurMonth] = useState(DEMO_TODAY.month)

  useEffect(() => {
    getDashboard().then(setData).catch(() => {})
  }, [])

  /* calendar grid */
  const firstDay = new Date(curYear, curMonth, 1).getDay()
  const daysInMonth = new Date(curYear, curMonth + 1, 0).getDate()
  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7
  const cells = Array.from({ length: totalCells }, (_, i) => {
    const day = i - firstDay + 1
    return day >= 1 && day <= daysInMonth ? day : null
  })

  const ordersOnDay = (day) => {
    if (!day || !data?.recentOrders) return []
    return data.recentOrders.filter(o => isSameDay(o.reservedVisitAt, curYear, curMonth, day))
  }

  const todayOrders = (data?.recentOrders ?? [])
    .filter(o => isSameDay(o.reservedVisitAt, DEMO_TODAY.year, DEMO_TODAY.month, DEMO_TODAY.day))
    .sort((a, b) => new Date(a.reservedVisitAt) - new Date(b.reservedVisitAt))

  const prevMonth = () => {
    if (curMonth === 0) { setCurYear(y => y - 1); setCurMonth(11) }
    else setCurMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (curMonth === 11) { setCurYear(y => y + 1); setCurMonth(0) }
    else setCurMonth(m => m + 1)
  }

  return (
    <ShopLayout>
      {/* ── Page header ──────────────────────── */}
      <div className="db-page-header">
        <div>
          <h1 className="page-title">예약 스케줄 관리</h1>
          <p className="page-subtitle">강남 스마트케어 · 오늘 예약 {todayOrders.length}건</p>
        </div>
        <div className="db-legend">
          <span className="db-legend-dot db-legend-dot--blue" />
          <span className="db-legend-text">검토 대기</span>
          <span className="db-legend-dot db-legend-dot--yellow" />
          <span className="db-legend-text">확정 예약</span>
        </div>
      </div>

      {/* ── Summary cards ────────────────────── */}
      <div className="db-summary-cards">
        <div className="db-stat-card">
          <div className="db-stat-icon db-stat-icon--blue"><IconInbox /></div>
          <div className="db-stat-body">
            <span className="db-stat-label">신규 접수</span>
            <span className="db-stat-value">{data?.receivedCount ?? 0}<em>건</em></span>
          </div>
        </div>
        <div className="db-stat-card">
          <div className="db-stat-icon db-stat-icon--orange"><IconWrench /></div>
          <div className="db-stat-body">
            <span className="db-stat-label">수리 중</span>
            <span className="db-stat-value">{data?.inRepairCount ?? 0}<em>건</em></span>
          </div>
        </div>
        <div className="db-stat-card">
          <div className="db-stat-icon db-stat-icon--teal"><IconCheck /></div>
          <div className="db-stat-body">
            <span className="db-stat-label">금일 수리 완료</span>
            <span className="db-stat-value">{data?.repairDoneCountToday ?? 0}<em>건</em></span>
          </div>
        </div>
      </div>

      {/* ── Main grid: calendar + today list ── */}
      <div className="db-main-grid">

        {/* Calendar */}
        <div className="card db-calendar-card">
          {/* Nav */}
          <div className="db-cal-header">
            <button className="db-cal-nav-btn" onClick={prevMonth}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15,18 9,12 15,6"/>
              </svg>
            </button>
            <span className="db-cal-title">{curYear}년 {curMonth + 1}월</span>
            <button className="db-cal-nav-btn" onClick={nextMonth}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9,18 15,12 9,6"/>
              </svg>
            </button>
          </div>

          {/* Day headers */}
          <div className="db-cal-grid db-cal-grid--header">
            {DAYS.map((d, i) => (
              <div key={d} className={`db-cal-day-header${i===0?' db-cal-day-header--sun':i===6?' db-cal-day-header--sat':''}`}>
                {d}
              </div>
            ))}
          </div>

          {/* Body */}
          <div className="db-cal-grid db-cal-grid--body">
            {cells.map((day, idx) => {
              const dayOrders = ordersOnDay(day)
              const isDemo = day && curYear===DEMO_TODAY.year && curMonth===DEMO_TODAY.month && day===DEMO_TODAY.day
              const colIdx = idx % 7
              return (
                <div
                  key={idx}
                  className={[
                    'db-cal-cell',
                    !day && 'db-cal-cell--empty',
                    isDemo && 'db-cal-cell--today',
                  ].filter(Boolean).join(' ')}
                >
                  {day && (
                    <>
                      <span
                        className={[
                          'db-cal-date',
                          colIdx===0 && 'db-cal-date--sun',
                          colIdx===6 && 'db-cal-date--sat',
                          isDemo && 'db-cal-date--today',
                        ].filter(Boolean).join(' ')}
                      >
                        {day}
                      </span>
                      <div className="db-cal-events">
                        {dayOrders.slice(0, 2).map(o => (
                          <button
                            key={o.id}
                            className={`db-cal-event${o.status==='ACCEPTED'?' db-cal-event--yellow':' db-cal-event--blue'}`}
                            onClick={() => navigate(`/repairshop/orders/${o.id}`)}
                          >
                            {formatTime(o.reservedVisitAt)} {o.customerName}
                          </button>
                        ))}
                        {dayOrders.length > 2 && (
                          <span className="db-cal-more">+{dayOrders.length - 2}건 더</span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Today's appointments */}
        <div className="db-today-panel">
          <div className="db-today-header">
            <h2 className="db-today-title">오늘 예약</h2>
            <span className="db-today-count">{todayOrders.length}건</span>
          </div>

          {todayOrders.length === 0
            ? (
              <div className="db-today-empty">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                <p>오늘 예약이 없습니다</p>
              </div>
            )
            : (
              <div className="db-today-list">
                {todayOrders.map(o => (
                  <div
                    key={o.id}
                    className="db-today-item"
                    onClick={() => navigate(`/repairshop/orders/${o.id}`)}
                  >
                    <div className="db-today-time-block">
                      <span className="db-today-time">{formatTime(o.reservedVisitAt)}</span>
                    </div>
                    <div className="db-today-info">
                      <span className="db-today-name">{o.customerName}</span>
                      <span className="db-today-order-no">{o.orderNo}</span>
                    </div>
                    <span className={`badge ${STATUS_CLASS[o.status]}`}>
                      {STATUS_LABEL[o.status]}
                    </span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}>
                      <polyline points="9,18 15,12 9,6"/>
                    </svg>
                  </div>
                ))}
              </div>
            )
          }
        </div>
      </div>
    </ShopLayout>
  )
}
