import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import {
  CheckCircle2,
  XCircle,
  Store,
  RefreshCw,
  AlertCircle,
  X,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { Card, Button, Badge } from '../../components/shared'
import { getPendingShops, approveShop, rejectShop } from '../../api/admin'

// ── 반려 사유 입력 모달 ────────────────────────────────────────────────────────

/**
 * RejectModal
 * - 반려 사유를 입력받고 확인 시 onConfirm(reason) 호출
 * - 사유가 비어 있으면 제출 차단
 */
function RejectModal({ shop, onConfirm, onClose, loading }) {
  const [reason, setReason] = useState('')

  const handleSubmit = () => {
    if (!reason.trim()) {
      toast.error('반려 사유를 입력해 주세요.')
      return
    }
    onConfirm(reason.trim())
  }

  return (
    /* 배경 오버레이 — 클릭 시 모달 닫기 */
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <div>
            <p className="text-base font-semibold text-foreground">가입 신청 반려</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {shop.repairShopName} · {shop.managerName}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1.5 rounded-lg hover:bg-secondary transition-colors disabled:opacity-50"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* 본문 */}
        <div className="px-6 py-5 flex flex-col gap-4">
          {/* 반려 대상 수리점 요약 */}
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <XCircle className="w-4 h-4 text-red-500" />
              <span className="text-sm font-semibold text-red-700 dark:text-red-400">반려 처리 안내</span>
            </div>
            <p className="text-xs text-red-600 dark:text-red-400 leading-relaxed">
              반려 처리 시 해당 계정은 <strong>BLOCKED</strong> 상태로 변경됩니다.
              수리점에 반려 사유가 전달되므로 명확하게 작성해 주세요.
            </p>
          </div>

          {/* 반려 사유 입력 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              반려 사유 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="예: 사업자등록증과 신청 정보 불일치, 영업 지역 외 지점 등"
              rows={4}
              disabled={loading}
              className="w-full px-3.5 py-2.5 text-sm bg-secondary border border-border rounded-xl text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-red-400/30 focus:border-red-400/50 resize-none transition-all disabled:opacity-50"
            />
            <p className="text-[11px] text-muted-foreground text-right">
              {reason.length} 자
            </p>
          </div>
        </div>

        {/* 푸터 */}
        <div className="px-6 py-4 border-t border-border flex gap-3 justify-end">
          <Button variant="secondary" size="md" onClick={onClose} disabled={loading}>
            취소
          </Button>
          <Button
            variant="danger"
            size="md"
            onClick={handleSubmit}
            disabled={loading || !reason.trim()}
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <XCircle className="w-4 h-4" />
            )}
            반려 확인
          </Button>
        </div>
      </div>
    </div>
  )
}

// ── 승인 확인 모달 ────────────────────────────────────────────────────────────

/**
 * ApproveModal
 * - 승인 전 최종 확인 다이얼로그
 */
function ApproveModal({ shop, onConfirm, onClose, loading }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <div>
            <p className="text-base font-semibold text-foreground">가입 신청 승인</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {shop.repairShopName} · {shop.managerName}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1.5 rounded-lg hover:bg-secondary transition-colors disabled:opacity-50"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* 본문 */}
        <div className="px-6 py-5 flex flex-col gap-4">
          {/* 승인 대상 정보 */}
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/40 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span className="text-sm font-semibold text-green-700 dark:text-green-400">승인 처리 안내</span>
            </div>
            <p className="text-xs text-green-600 dark:text-green-400 leading-relaxed">
              승인 시 해당 수리점 계정이 <strong>ACTIVE</strong> 상태로 전환되어
              즉시 플랫폼 이용이 가능해집니다. 수리점에 승인 알림이 발송됩니다.
            </p>
          </div>

          {/* 수리점 상세 정보 */}
          <div className="flex flex-col gap-2 text-sm">
            {[
              { label: '수리점명', value: shop.repairShopName },
              { label: '담당자', value: shop.managerName },
              { label: '이메일', value: shop.email },
              { label: '사업자번호', value: shop.businessNumber },
              { label: '주소', value: shop.address },
            ].map(({ label, value }) => (
              <div key={label} className="flex gap-3">
                <span className="text-xs text-muted-foreground w-20 shrink-0 pt-0.5">{label}</span>
                <span className="text-xs font-medium text-foreground flex-1">{value || '-'}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 푸터 */}
        <div className="px-6 py-4 border-t border-border flex gap-3 justify-end">
          <Button variant="secondary" size="md" onClick={onClose} disabled={loading}>
            취소
          </Button>
          <Button
            variant="accent"
            size="md"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            승인 확인
          </Button>
        </div>
      </div>
    </div>
  )
}

// ── 로딩 스켈레톤 ─────────────────────────────────────────────────────────────

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 3 }).map((_, i) => (
        <tr key={i} className="border-b border-border/20">
          {Array.from({ length: 6 }).map((__, j) => (
            <td key={j} className="py-4 px-4">
              <div className="h-3 bg-secondary rounded-full animate-pulse" style={{ width: `${60 + (j * 10) % 30}%` }} />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}

// ── 수리점 상세 행 (모바일용 펼침 패널) ──────────────────────────────────────

/**
 * ShopRow
 * - 테이블 한 행 + 펼침 시 상세 정보 표시
 * - 승인/반려 버튼은 항상 표시
 */
function ShopRow({ shop, onApprove, onReject }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <>
      <tr className="border-b border-border/20 hover:bg-secondary/40 transition-colors">
        {/* 수리점명 */}
        <td className="py-3.5 px-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
              <Store className="w-3.5 h-3.5 text-accent" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground leading-tight">
                {shop.repairShopName}
              </p>
              {/* 모바일에서만 이메일 표시 */}
              <p className="text-xs text-muted-foreground md:hidden mt-0.5">
                {shop.email}
              </p>
            </div>
          </div>
        </td>

        {/* 담당자 — 중간 크기 이상에서만 표시 */}
        <td className="py-3.5 px-4 hidden md:table-cell">
          <span className="text-sm text-foreground">{shop.managerName}</span>
        </td>

        {/* 이메일 — 중간 크기 이상에서만 표시 */}
        <td className="py-3.5 px-4 hidden md:table-cell">
          <span className="text-xs text-muted-foreground font-mono">{shop.email}</span>
        </td>

        {/* 사업자번호 — 넓은 화면에서만 표시 */}
        <td className="py-3.5 px-4 hidden lg:table-cell">
          <span className="text-xs font-mono text-foreground">{shop.businessNumber}</span>
        </td>

        {/* 주소 — 넓은 화면에서만 표시 */}
        <td className="py-3.5 px-4 hidden xl:table-cell">
          <span className="text-xs text-muted-foreground max-w-48 block truncate" title={shop.address}>
            {shop.address}
          </span>
        </td>

        {/* 상태 배지 */}
        <td className="py-3.5 px-4 hidden sm:table-cell">
          <Badge variant="yellow">승인 대기</Badge>
        </td>

        {/* 액션 버튼 */}
        <td className="py-3.5 px-4">
          <div className="flex items-center gap-2">
            {/* 승인 버튼 */}
            <button
              onClick={() => onApprove(shop)}
              title="가입 승인"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40 text-xs font-medium transition-colors border border-green-200 dark:border-green-800/40"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">승인</span>
            </button>
            {/* 반려 버튼 */}
            <button
              onClick={() => onReject(shop)}
              title="가입 반려"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 text-xs font-medium transition-colors border border-red-200 dark:border-red-800/40"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">반려</span>
            </button>
            {/* 상세 펼침 버튼 (xl 미만에서만 표시) */}
            <button
              onClick={() => setExpanded((v) => !v)}
              title="상세 보기"
              className="xl:hidden p-1.5 rounded-lg hover:bg-secondary text-muted-foreground transition-colors"
            >
              {expanded
                ? <ChevronUp className="w-3.5 h-3.5" />
                : <ChevronDown className="w-3.5 h-3.5" />
              }
            </button>
          </div>
        </td>
      </tr>

      {/* 펼침 상세 패널 — xl 미만에서 숨겨진 정보 표시 */}
      {expanded && (
        <tr className="xl:hidden border-b border-border/20 bg-secondary/20">
          <td colSpan={7} className="px-4 py-3">
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-xs">
              <div className="md:hidden">
                <span className="text-muted-foreground">담당자</span>
                <span className="ml-2 font-medium text-foreground">{shop.managerName}</span>
              </div>
              <div className="lg:hidden">
                <span className="text-muted-foreground">사업자번호</span>
                <span className="ml-2 font-mono text-foreground">{shop.businessNumber}</span>
              </div>
              <div className="col-span-2">
                <span className="text-muted-foreground">주소</span>
                <span className="ml-2 text-foreground">{shop.address}</span>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

// ── 빈 상태 컴포넌트 ──────────────────────────────────────────────────────────

function EmptyState({ onRefresh }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
        <CheckCircle2 className="w-8 h-8 text-green-500" />
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground">대기 중인 신청이 없습니다</p>
        <p className="text-xs text-muted-foreground mt-1">
          모든 수리점 가입 신청이 처리되었습니다.
        </p>
      </div>
      <button
        onClick={onRefresh}
        className="flex items-center gap-2 text-xs text-accent hover:underline"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        새로고침
      </button>
    </div>
  )
}

// ── 오류 상태 컴포넌트 ────────────────────────────────────────────────────────

function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
        <AlertCircle className="w-8 h-8 text-red-500" />
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground">데이터를 불러올 수 없습니다</p>
        <p className="text-xs text-muted-foreground mt-1">{message}</p>
      </div>
      <Button variant="secondary" size="sm" onClick={onRetry}>
        <RefreshCw className="w-3.5 h-3.5" />
        다시 시도
      </Button>
    </div>
  )
}

// ── 메인 페이지 ───────────────────────────────────────────────────────────────

export default function ShopApprovalsPage() {
  /* 목록 데이터 및 로딩/오류 상태 */
  const [shops, setShops] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  /* 승인/반려 모달 상태 — null이면 닫힘, 수리점 객체이면 열림 */
  const [approvingShop, setApprovingShop] = useState(null)
  const [rejectingShop, setRejectingShop] = useState(null)

  /* 승인/반려 API 처리 중 버튼 비활성화용 */
  const [actionLoading, setActionLoading] = useState(false)

  /* 대기 목록 불러오기 */
  const fetchPending = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getPendingShops()
      /* ApiResponse<List<PendingShop>> → data 필드 추출 */
      setShops(res.data?.data ?? [])
    } catch (err) {
      const msg = err.response?.data?.error?.message ?? '네트워크 오류가 발생했습니다.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPending()
  }, [fetchPending])

  /* 승인 처리 */
  const handleApproveConfirm = async () => {
    if (!approvingShop) return
    setActionLoading(true)
    try {
      await approveShop(approvingShop.memberId)
      /* 목록에서 해당 수리점 제거 (낙관적 업데이트) */
      setShops((prev) => prev.filter((s) => s.memberId !== approvingShop.memberId))
      toast.success(`${approvingShop.repairShopName} 가입이 승인되었습니다.`)
      setApprovingShop(null)
    } catch (err) {
      const msg = err.response?.data?.error?.message ?? '승인 처리 중 오류가 발생했습니다.'
      toast.error(msg)
    } finally {
      setActionLoading(false)
    }
  }

  /* 반려 처리 */
  const handleRejectConfirm = async (reason) => {
    if (!rejectingShop) return
    setActionLoading(true)
    try {
      await rejectShop(rejectingShop.memberId, reason)
      /* 목록에서 해당 수리점 제거 (낙관적 업데이트) */
      setShops((prev) => prev.filter((s) => s.memberId !== rejectingShop.memberId))
      toast.success(`${rejectingShop.repairShopName} 가입이 반려되었습니다.`)
      setRejectingShop(null)
    } catch (err) {
      const msg = err.response?.data?.error?.message ?? '반려 처리 중 오류가 발생했습니다.'
      toast.error(msg)
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-6xl">
      {/* 페이지 헤더 */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground">수리점 가입 승인 관리</h1>
          <p className="text-sm text-muted-foreground mt-1">
            신규 수리점 회원가입 신청을 검토하고 승인 또는 반려 처리합니다.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* 대기 건수 배지 */}
          {!loading && !error && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40">
              <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                대기 {shops.length}건
              </span>
            </div>
          )}
          {/* 새로고침 버튼 */}
          <button
            onClick={fetchPending}
            disabled={loading}
            title="목록 새로고침"
            className="p-2 rounded-xl border border-border hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 안내 배너 — 처음 로딩 완료 후, 데이터가 있을 때만 표시 */}
      {!loading && !error && shops.length > 0 && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/40">
          <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
          <p className="text-xs text-blue-700 dark:text-blue-400 leading-relaxed">
            승인 전 사업자등록증 번호, 수리점 주소 등 신청 정보를 반드시 확인하세요.
            승인 처리 후에는 즉시 수리점에 알림이 발송됩니다.
          </p>
        </div>
      )}

      {/* 메인 테이블 카드 */}
      <Card className="overflow-hidden">
        {error ? (
          /* 오류 상태 */
          <ErrorState message={error} onRetry={fetchPending} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border/40 bg-secondary/50">
                  <th className="text-left py-3 px-4 text-muted-foreground font-semibold">수리점명</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-semibold hidden md:table-cell">담당자</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-semibold hidden md:table-cell">이메일</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-semibold hidden lg:table-cell">사업자번호</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-semibold hidden xl:table-cell">주소</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-semibold hidden sm:table-cell">상태</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-semibold">처리</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <TableSkeleton />
                ) : shops.length === 0 ? (
                  <tr>
                    <td colSpan={7}>
                      <EmptyState onRefresh={fetchPending} />
                    </td>
                  </tr>
                ) : (
                  shops.map((shop) => (
                    <ShopRow
                      key={shop.memberId}
                      shop={shop}
                      onApprove={setApprovingShop}
                      onReject={setRejectingShop}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* 승인 확인 모달 */}
      {approvingShop && (
        <ApproveModal
          shop={approvingShop}
          onConfirm={handleApproveConfirm}
          onClose={() => !actionLoading && setApprovingShop(null)}
          loading={actionLoading}
        />
      )}

      {/* 반려 사유 입력 모달 */}
      {rejectingShop && (
        <RejectModal
          shop={rejectingShop}
          onConfirm={handleRejectConfirm}
          onClose={() => !actionLoading && setRejectingShop(null)}
          loading={actionLoading}
        />
      )}
    </div>
  )
}
