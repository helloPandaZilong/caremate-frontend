import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button, Card, SectionTitle } from "../components/shared";
import {
  getNotifications,
  markNotificationRead,
} from "../api/notificationApi";
import { NotificationList } from "../components/notification/NotificationBell";
import { useAuth } from "../contexts/AuthContext";
import { useNotificationSse } from "../hooks/useNotificationSse";

function getContent(pageData) {
  if (Array.isArray(pageData)) return pageData;
  return pageData?.content ?? [];
}

export default function NotificationPage() {
  const { user } = useAuth();
  const [page, setPage] = useState(0);
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getNotifications({ page, size: 20 });
      setPageData(data);
    } catch (e) {
      setError(e.message || "알림 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    load();
  }, [load]);

  // ──────────────────────────────────────────────────────────────────────
  // SSE 실시간 수신
  // - 1페이지(최신)만 보고 있을 때만 prepend 한다.
  //   2페이지 이상이면 사용자가 과거 목록을 보고 있는 상태이므로
  //   화면을 임의로 비집고 들어가면 안 된다 (스크롤·페이지 인덱스 깨짐).
  //   대신 totalElements 만 +1 해서 다음 새로고침 시 일관성 유지.
  // - id 기준 중복 제거: SSE 수신 직전에 load() 가 끝나 같은 row 가 이미
  //   pageData 에 들어와 있는 경쟁 상태 방어.
  // ──────────────────────────────────────────────────────────────────────
  const handleSseNotification = useCallback((notification) => {
    if (!notification?.id) return;
    setPageData((prev) => {
      if (!prev) return prev;
      const existing = getContent(prev);
      if (page !== 0) {
        return { ...prev, totalElements: (prev.totalElements ?? existing.length) + 1 };
      }
      const deduped = existing.filter((item) => item.id !== notification.id);
      const next = [notification, ...deduped].slice(0, 20);
      return {
        ...prev,
        content: next,
        totalElements: (prev.totalElements ?? next.length) + (existing.some((i) => i.id === notification.id) ? 0 : 1),
      };
    });
  }, [page]);

  const { connectionState } = useNotificationSse({
    enabled: true,
    onNotification: handleSseNotification,
  });

  const handleRead = async (notification) => {
    if (!notification?.id || notification.isRead || notification.read) return;
    setPageData((prev) => ({
      ...prev,
      content: getContent(prev).map((item) =>
          item.id === notification.id ? { ...item, isRead: true, read: true } : item,
      ),
    }));
    try {
      await markNotificationRead(notification.id);
    } catch {
      await load();
    }
  };

  const content = getContent(pageData);
  const first = pageData?.first ?? page <= 0;
  const last = pageData?.last ?? content.length < 20;

  return (
      <div className="max-w-4xl flex flex-col gap-6">
        <SectionTitle
            title="알림"
            subtitle={
              connectionState === "connected"
                  ? "SSE 실시간 연결됨 — 새 알림은 자동으로 상단에 표시됩니다."
                  : "SSE 연결 대기/재연결 중 — 새로고침으로 최신 상태를 가져오세요."
            }
            action={
              <Button variant="secondary" size="sm" onClick={load} disabled={loading}>
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                새로고침
              </Button>
            }
        />

        {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
        )}

        <Card className="overflow-hidden">
          <NotificationList items={content} onRead={handleRead} role={user?.role} />
        </Card>

        <div className="flex items-center justify-between">
          <Button variant="secondary" size="sm" disabled={first || loading} onClick={() => setPage((value) => Math.max(value - 1, 0))}>
            이전
          </Button>
          <span className="text-xs text-muted-foreground">
          page {pageData?.page ?? page} / {Math.max((pageData?.totalPages ?? 1) - 1, 0)} · 총 {pageData?.totalElements ?? content.length}건
        </span>
          <Button variant="secondary" size="sm" disabled={last || loading} onClick={() => setPage((value) => value + 1)}>
            다음
          </Button>
        </div>
      </div>
  );
}
