import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router'
import {
  getOrderDetail, getStatusHistories,
  acceptOrder, rejectOrder, startRepair, manualNoShow,
} from '../../api/repairshopApi.js'
import './css/OrderDetail.css'

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

function fmt(str) {
  if (!str) return '-'
  const d = new Date(str)
  return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
}

/* ── MOCK ─────────────────────────────────────────────────── */
const MOCK_DETAIL = {
  id:1, orderNo:'CM-20240613-0042', customerName:'김민준', memberId:101,
  damageDescription:'계단에서 넘어지면서 폰을 떨어뜨렸습니다. 전면 유리가 여러 군데 깨졌고 터치가 우측 하단에서 미인식되고 있습니다.',
  reservedVisitAt:'2024-06-13T10:00:00', status:'RECEIVED', rejectedReason:null,
  beforeRepairImageUrls:[], afterRepairImageUrls:[],
  createdAt:'2024-06-13T09:00:00', updatedAt:'2024-06-13T09:00:00',
}
const MOCK_HISTORIES = [
  { id:1, previousStatus:null, changedStatus:'RECEIVED', changedBy:null, note:'고객 접수', changedAt:'2024-06-13T09:00:00' },
]

/* ── Reject Modal ─────────────────────────────────────────── */
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
          >반려 처리</button>
        </div>
      </div>
    </div>
  )
}

/* ── Main ─────────────────────────────────────────────────── */
export default function OrderDetail() {
  const { id: orderId } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(MOCK_DETAIL)
  const [histories, setHistories] = useState(MOCK_HISTORIES)
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      getOrderDetail(orderId),
      getStatusHistories(orderId),
    ])
      .then(([detail, hist]) => { setOrder(detail); setHistories(hist) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [orderId])

  async function doAction(fn, ...args) {
    setActionLoading(true)
    try {
      await fn(...args)
      // refresh
      const [detail, hist] = await Promise.all([
        getOrderDetail(orderId),
        getStatusHistories(orderId),
      ])
      setOrder(detail); setHistories(hist)
    } catch {
      alert('처리 중 오류가 발생했습니다.')
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) return <div><div className="od-loading">로딩 중...</div></div>
  if (!order) return <div><div className="od-loading">접수 건을 찾을 수 없습니다.</div></div>

  return (
    <div>
      {/* Back */}
      <button className="od-back" onClick={() => navigate('/shop/orders')}>
        ← 접수 목록으로
      </button>

      {/* Header */}
      <div className="od-header">
        <div>
          <span className="od-order-no">{order.orderNo}</span>
          <h1 className="od-title">{order.customerName} 님의 A/S 접수</h1>
        </div>
        <span className={`badge ${STATUS_CLASS[order.status]}`}>
          {STATUS_LABEL[order.status]}
        </span>
      </div>

      <div className="od-grid">
        {/* Left column */}
        <div className="od-left">
          {/* Basic info */}
          <div className="card od-card">
            <h2 className="od-card-title">접수 정보</h2>
            <div className="od-info-rows">
              <div className="od-info-row">
                <span className="od-info-label">고객명</span>
                <span className="od-info-value">{order.customerName}</span>
              </div>
              <div className="od-info-row">
                <span className="od-info-label">방문 예약</span>
                <span className="od-info-value">{fmt(order.reservedVisitAt)}</span>
              </div>
              <div className="od-info-row">
                <span className="od-info-label">접수 일시</span>
                <span className="od-info-value">{fmt(order.createdAt)}</span>
              </div>
              <div className="od-info-row">
                <span className="od-info-label">마지막 수정</span>
                <span className="od-info-value">{fmt(order.updatedAt)}</span>
              </div>
            </div>
          </div>

          {/* Damage description */}
          <div className="card od-card">
            <h2 className="od-card-title">파손 상황 설명</h2>
            <p className="od-description">{order.damageDescription}</p>
          </div>

          {/* Before repair images */}
          {order.beforeRepairImageUrls?.length > 0 && (
            <div className="card od-card">
              <h2 className="od-card-title">접수 사진</h2>
              <div className="od-images">
                {order.beforeRepairImageUrls.map((url, i) => (
                  <a key={i} href={url} target="_blank" rel="noreferrer">
                    <img src={url} alt={`접수사진 ${i+1}`} className="od-image" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* After repair images */}
          {order.afterRepairImageUrls?.length > 0 && (
            <div className="card od-card">
              <h2 className="od-card-title">완료 사진</h2>
              <div className="od-images">
                {order.afterRepairImageUrls.map((url, i) => (
                  <a key={i} href={url} target="_blank" rel="noreferrer">
                    <img src={url} alt={`완료사진 ${i+1}`} className="od-image" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Rejection reason */}
          {order.rejectedReason && (
            <div className="card od-card od-card--danger">
              <h2 className="od-card-title">반려 사유</h2>
              <p className="od-description">{order.rejectedReason}</p>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="od-right">
          {/* Action panel */}
          <div className="card od-card od-action-card">
            <h2 className="od-card-title">처리 액션</h2>
            {order.status === 'RECEIVED' && (
              <div className="od-action-buttons">
                <p className="od-action-hint">접수를 확인하고 수락 또는 반려 처리하세요.</p>
                <button
                  className="btn btn--primary"
                  disabled={actionLoading}
                  onClick={() => doAction(acceptOrder, order.id)}
                >
                  {actionLoading ? '처리 중...' : '✓ 수락'}
                </button>
                <button
                  className="btn btn--danger"
                  disabled={actionLoading}
                  onClick={() => setShowRejectModal(true)}
                >
                  ✕ 반려
                </button>
              </div>
            )}
            {order.status === 'ACCEPTED' && (
              <div className="od-action-buttons">
                <p className="od-action-hint">고객이 방문하면 수리를 시작하세요.</p>
                <button
                  className="btn btn--success"
                  disabled={actionLoading}
                  onClick={() => doAction(startRepair, order.id)}
                >
                  {actionLoading ? '처리 중...' : '🔧 수리 시작'}
                </button>
                <button
                  className="btn btn--ghost"
                  disabled={actionLoading}
                  onClick={() => {
                    if (window.confirm('노쇼 처리하시겠습니까?')) doAction(manualNoShow, order.id)
                  }}
                >
                  노쇼 처리
                </button>
              </div>
            )}
            {order.status === 'IN_REPAIR' && (
              <div className="od-action-hint od-action-hint--info">
                🔧 수리가 진행 중입니다.<br />수리 완료 후 수리 리포트를 작성해주세요.
              </div>
            )}
            {['REPAIR_DONE','PAYMENT_COMPLETED','CLAIM_REQUESTED','CLAIM_COMPLETED'].includes(order.status) && (
              <div className="od-action-hint od-action-hint--success">
                ✓ 이 접수 건의 처리가 완료되었습니다.
              </div>
            )}
            {['REJECTED','NO_SHOW'].includes(order.status) && (
              <div className="od-action-hint od-action-hint--danger">
                이 접수 건은 {STATUS_LABEL[order.status]} 처리되었습니다.
              </div>
            )}
          </div>

          {/* Status history */}
          <div className="card od-card">
            <h2 className="od-card-title">상태 변경 이력</h2>
            <div className="od-timeline">
              {histories.length === 0
                ? <p className="od-timeline-empty">이력이 없습니다.</p>
                : histories.map((h, i) => (
                    <div key={h.id} className={`od-timeline-item${i === histories.length - 1 ? ' od-timeline-item--current' : ''}`}>
                      <div className="od-timeline-dot" />
                      <div className="od-timeline-content">
                        <div className="od-timeline-status">
                          {h.previousStatus && (
                            <>
                              <span className={`badge ${STATUS_CLASS[h.previousStatus]}`} style={{fontSize:'11px'}}>
                                {STATUS_LABEL[h.previousStatus]}
                              </span>
                              <span className="od-timeline-arrow">→</span>
                            </>
                          )}
                          <span className={`badge ${STATUS_CLASS[h.changedStatus]}`} style={{fontSize:'11px'}}>
                            {STATUS_LABEL[h.changedStatus]}
                          </span>
                        </div>
                        <div className="od-timeline-meta">
                          <span>{fmt(h.changedAt)}</span>
                          {h.note && <span className="od-timeline-note">{h.note}</span>}
                        </div>
                      </div>
                    </div>
                  ))
              }
            </div>
          </div>
        </div>
      </div>

      {showRejectModal && (
        <RejectModal
          onConfirm={reason => { setShowRejectModal(false); doAction(rejectOrder, order.id, reason) }}
          onCancel={() => setShowRejectModal(false)}
        />
      )}
    </div>
  )
}
