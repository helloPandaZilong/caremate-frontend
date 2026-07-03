import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router'
import { getPaymentHistory } from '../../api/repairshopApi.js'
import './css/OrderList.css'
import './css/PaymentHistory.css'

function formatDateTime(str) {
  if (!str) return '-'
  const d = new Date(str)
  return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
}

function formatAmount(n) {
  return '₩' + Number(n ?? 0).toLocaleString('ko-KR')
}

const EMPTY_PAGE = { content: [], totalElements: 0, totalPages: 1, page: 0, size: 20 }

export default function PaymentHistoryPage() {
  const navigate = useNavigate()
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [keyword, setKeyword] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('')
  const [page, setPage] = useState(0)
  const [data, setData] = useState(EMPTY_PAGE)
  const [loading, setLoading] = useState(false)

  const hasFilter = dateFrom || dateTo || keyword || paymentMethod

  function clearFilters() {
    setDateFrom(''); setDateTo(''); setKeyword(''); setPaymentMethod(''); setPage(0)
  }

  const fetchHistory = useCallback(() => {
    setLoading(true)
    const params = { page, size: 20 }
    if (dateFrom) params.dateFrom = dateFrom
    if (dateTo) params.dateTo = dateTo
    if (keyword.trim()) params.keyword = keyword.trim()
    if (paymentMethod) params.paymentMethod = paymentMethod
    getPaymentHistory(params)
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [dateFrom, dateTo, keyword, paymentMethod, page])

  useEffect(() => { fetchHistory() }, [fetchHistory])

  const payments = data?.content ?? []
  const totalPages = data?.totalPages ?? 1
  const totalElements = data?.totalElements ?? 0

  return (
    <div>
      <h1 className="ph-page-title">결제 내역</h1>
      <p className="ph-page-subtitle">우리 매장에서 발생한 전체 결제 이력을 조회합니다. (총 {totalElements}건)</p>

      {/* Filters */}
      <div className="ol-filters">
        {/* 결제수단 필터 */}
        <div className="ph-select-wrap">
          <select
            className="ph-select"
            value={paymentMethod}
            onChange={e => { setPaymentMethod(e.target.value); setPage(0) }}
          >
            <option value="">전체 결제수단</option>
            <option value="카드">카드</option>
            <option value="휴대폰">휴대폰</option>
            <option value="계좌이체">계좌이체</option>
            <option value="간편결제">간편결제</option>
          </select>
          <svg className="ph-select-caret" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>

        {/* Search controls */}
        <div className="ol-search-controls">
          {/* 주문번호/고객명 통합 검색 */}
          <div className="ol-search-input-wrap">
            <svg className="ol-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              className="ol-text-input"
              placeholder="주문번호·고객명 검색"
              value={keyword}
              onChange={e => { setKeyword(e.target.value); setPage(0) }}
            />
          </div>

          {/* 기간 검색 */}
          <input
            type="date"
            className="ol-date-input"
            value={dateFrom}
            max={dateTo || undefined}
            onChange={e => { setDateFrom(e.target.value); setPage(0) }}
          />
          <span className="ol-range-sep">~</span>
          <input
            type="date"
            className="ol-date-input"
            value={dateTo}
            min={dateFrom || undefined}
            onChange={e => { setDateTo(e.target.value); setPage(0) }}
          />

          {/* 초기화 */}
          {hasFilter && (
            <button className="ol-clear-btn" onClick={clearFilters}>초기화</button>
          )}
        </div>
      </div>

      {/* Payment list */}
      <div className="ph-card ol-table-card">
        {loading ? (
          <div className="ol-loading">로딩 중...</div>
        ) : payments.length === 0 ? (
          <div className="ol-empty">조건에 맞는 결제 내역이 없습니다.</div>
        ) : (
          <>
            <table className="ol-table">
              <thead>
                <tr>
                  <th>주문번호</th>
                  <th>고객명</th>
                  <th>결제 금액</th>
                  <th>예상 환급액</th>
                  <th>결제수단</th>
                  <th>결제 일시</th>
                </tr>
              </thead>
              <tbody>
                {payments.map(p => (
                  <tr
                    key={p.orderId}
                    className="ol-row"
                    onClick={() => navigate(`/shop/orders/${p.orderId}`, { state: { from: '/shop/payments' } })}
                  >
                    <td className="ol-order-no">{p.orderNo}</td>
                    <td className="ol-customer">{p.customerName}</td>
                    <td className="ph-amount">{formatAmount(p.totalPaidAmount)}</td>
                    <td className="ph-refund">{formatAmount(p.expectedRefundAmount)}</td>
                    <td>
                      <span className="ph-method-badge">{p.paymentMethod || '-'}</span>
                    </td>
                    <td>{formatDateTime(p.paidAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="ol-pagination">
                <button
                  className="ol-page-btn"
                  disabled={page === 0}
                  onClick={() => setPage(p => p - 1)}
                >
                  이전
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    className={`ol-page-btn${page === i ? ' ol-page-btn--active' : ''}`}
                    onClick={() => setPage(i)}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  className="ol-page-btn"
                  disabled={page === totalPages - 1}
                  onClick={() => setPage(p => p + 1)}
                >
                  다음
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
