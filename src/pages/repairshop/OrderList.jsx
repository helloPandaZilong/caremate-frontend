import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router'
import { getOrders, acceptOrder, rejectOrder, startRepair, manualNoShow } from '../../api/repairshopApi.js'
import './OrderList.css'

const STATUS_TABS = [
  { label:'전체',    value:'' },
  { label:'접수 대기', value:'RECEIVED' },
  { label:'확정',    value:'ACCEPTED' },
  { label:'수리 중', value:'IN_REPAIR' },
  { label:'수리 완료', value:'REPAIR_DONE' },
  { label:'반려',    value:'REJECTED' },
]

const STATUS_LABEL = {
  RECEIVED:'접수 대기', ACCEPTED:'확정', REJECTED:'반려',
  NO_SHOW:'노쇼', IN_REPAIR:'수리 중', REPAIR_DONE:'수리 완료',
  PAYMENT_COMPLETED:'결제 완료', CLAIM_REQUESTED:'청구 요청', CLAIM_COMPLETED:'청구 완료',
}
const STATUS_CLASS = {
  RECEIVED:'badge--received', ACCEPTED:'badge--accepted', REJECTED:'badge--rejected',
  NO_SHOW:'badge--no-show', IN_REPAIR:'badge--in-repair', REPAIR_DONE:'badge--repair-done',
  PAYMENT_COMPLETED:'badge--payment-completed', CLAIM_REQUESTED:'badge--claim-requested',
  CLAIM_COMPLETED:'badge--claim-completed',
}

function formatDateTime(str) {
  if (!str) return '-'
  const d = new Date(str)
  return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
}

/* ── MOCK ────────────────────────────────────────────────── */
const MOCK_ORDERS = {
  content: [
    { id:1, orderNo:'CM-20240613-0042', customerName:'김민준', status:'RECEIVED',  reservedVisitAt:'2024-06-13T10:00:00', createdAt:'2024-06-13T09:00:00' },
    { id:2, orderNo:'CM-20240613-0039', customerName:'이수연', status:'ACCEPTED',  reservedVisitAt:'2024-06-13T14:00:00', createdAt:'2024-06-13T08:30:00' },
    { id:3, orderNo:'CM-20240615-0031', customerName:'박도현', status:'RECEIVED',  reservedVisitAt:'2024-06-15T11:00:00', createdAt:'2024-06-14T10:00:00' },
    { id:4, orderNo:'CM-20240617-0024', customerName:'최지아', status:'ACCEPTED',  reservedVisitAt:'2024-06-17T15:00:00', createdAt:'2024-06-16T09:00:00' },
    { id:5, orderNo:'CM-20240620-0018', customerName:'정우성', status:'IN_REPAIR', reservedVisitAt:'2024-06-20T10:00:00', createdAt:'2024-06-19T11:00:00' },
    { id:6, orderNo:'CM-20240612-0011', customerName:'한예슬', status:'REPAIR_DONE',reservedVisitAt:'2024-06-12T09:00:00', createdAt:'2024-06-11T15:00:00' },
  ],
  totalElements: 6, totalPages: 1, number: 0, size: 20,
}

/* ── Reject modal ────────────────────────────────────────── */
function RejectModal({ onConfirm, onCancel }) {
  const [reason, setReason] = useState('')
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <h3 className="modal-title">반려 사유 입력</h3>
        <p className="modal-desc">고객에게 반려 사유가 전달됩니다.</p>
        <textarea
          className="modal-textarea"
          placeholder="반려 사유를 입력해주세요..."
          value={reason}
          onChange={e => setReason(e.target.value)}
          rows={4}
        />
        <div className="modal-actions">
          <button className="btn btn--ghost" onClick={onCancel}>취소</button>
          <button
            className="btn btn--danger"
            disabled={!reason.trim()}
            onClick={() => onConfirm(reason)}
          >
            반려 처리
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Main ─────────────────────────────────────────────────── */
export default function OrderList() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [page, setPage] = useState(0)
  const [data, setData] = useState(MOCK_ORDERS)
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(null)
  const [rejectTarget, setRejectTarget] = useState(null) // orderId

  const fetchOrders = useCallback(() => {
    setLoading(true)
    const params = { page, size: 20 }
    if (activeTab) params.status = activeTab
    if (dateFilter) params.date = dateFilter
    getOrders(params)
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [activeTab, dateFilter, page])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  async function handleAccept(e, id) {
    e.stopPropagation()
    setActionLoading(id + '_accept')
    try {
      await acceptOrder(id)
      fetchOrders()
    } catch {
      alert('처리 중 오류가 발생했습니다.')
    } finally {
      setActionLoading(null)
    }
  }

  async function handleReject(id, reason) {
    setRejectTarget(null)
    setActionLoading(id + '_reject')
    try {
      await rejectOrder(id, reason)
      fetchOrders()
    } catch {
      alert('처리 중 오류가 발생했습니다.')
    } finally {
      setActionLoading(null)
    }
  }

  async function handleStartRepair(e, id) {
    e.stopPropagation()
    if (!window.confirm('수리를 시작하시겠습니까?')) return
    setActionLoading(id + '_repair')
    try {
      await startRepair(id)
      fetchOrders()
    } catch {
      alert('처리 중 오류가 발생했습니다.')
    } finally {
      setActionLoading(null)
    }
  }

  async function handleNoShow(e, id) {
    e.stopPropagation()
    if (!window.confirm('노쇼 처리하시겠습니까?')) return
    setActionLoading(id + '_noshow')
    try {
      await manualNoShow(id)
      fetchOrders()
    } catch {
      alert('처리 중 오류가 발생했습니다.')
    } finally {
      setActionLoading(null)
    }
  }

  const orders = data?.content ?? []
  const totalPages = data?.totalPages ?? 1

  return (
    <div>
      <h1 className="page-title">접수 관리</h1>
      <p className="page-subtitle">접수된 A/S 요청을 수락·반려하고 수리 상태를 관리합니다.</p>

      {/* Filters */}
      <div className="ol-filters">
        {/* Status tabs */}
        <div className="ol-tabs">
          {STATUS_TABS.map(tab => (
            <button
              key={tab.value}
              className={`ol-tab${activeTab === tab.value ? ' ol-tab--active' : ''}`}
              onClick={() => { setActiveTab(tab.value); setPage(0) }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Date filter */}
        <input
          type="date"
          className="ol-date-input"
          value={dateFilter}
          onChange={e => { setDateFilter(e.target.value); setPage(0) }}
        />
      </div>

      {/* Order list */}
      <div className="card ol-table-card">
        {loading ? (
          <div className="ol-loading">로딩 중...</div>
        ) : orders.length === 0 ? (
          <div className="ol-empty">조건에 맞는 접수 건이 없습니다.</div>
        ) : (
          <>
            <table className="ol-table">
              <thead>
                <tr>
                  <th>접수번호</th>
                  <th>고객명</th>
                  <th>방문 예약 일시</th>
                  <th>접수 일시</th>
                  <th>상태</th>
                  <th>처리</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr
                    key={order.id}
                    className="ol-row"
                    onClick={() => navigate(`/shop/orders/${order.id}`)}
                  >
                    <td className="ol-order-no">{order.orderNo}</td>
                    <td className="ol-customer">{order.customerName}</td>
                    <td>{formatDateTime(order.reservedVisitAt)}</td>
                    <td>{formatDateTime(order.createdAt)}</td>
                    <td>
                      <span className={`badge ${STATUS_CLASS[order.status]}`}>
                        {STATUS_LABEL[order.status]}
                      </span>
                    </td>
                    <td onClick={e => e.stopPropagation()}>
                      <div className="ol-actions">
                        {order.status === 'RECEIVED' && (
                          <>
                            <button
                              className="btn btn--primary btn--sm"
                              disabled={!!actionLoading}
                              onClick={e => handleAccept(e, order.id)}
                            >
                              {actionLoading === order.id+'_accept' ? '처리 중...' : '수락'}
                            </button>
                            <button
                              className="btn btn--danger btn--sm"
                              disabled={!!actionLoading}
                              onClick={e => { e.stopPropagation(); setRejectTarget(order.id) }}
                            >
                              반려
                            </button>
                          </>
                        )}
                        {order.status === 'ACCEPTED' && (
                          <>
                            <button
                              className="btn btn--success btn--sm"
                              disabled={!!actionLoading}
                              onClick={e => handleStartRepair(e, order.id)}
                            >
                              {actionLoading === order.id+'_repair' ? '처리 중...' : '수리 시작'}
                            </button>
                            <button
                              className="btn btn--ghost btn--sm"
                              disabled={!!actionLoading}
                              onClick={e => handleNoShow(e, order.id)}
                            >
                              노쇼
                            </button>
                          </>
                        )}
                        {!['RECEIVED','ACCEPTED'].includes(order.status) && (
                          <span className="ol-no-action">-</span>
                        )}
                      </div>
                    </td>
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

      {/* Reject modal */}
      {rejectTarget && (
        <RejectModal
          onConfirm={reason => handleReject(rejectTarget, reason)}
          onCancel={() => setRejectTarget(null)}
        />
      )}
    </div>
  )
}
