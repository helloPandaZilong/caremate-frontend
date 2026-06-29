import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button, Card, SectionTitle } from "../components/shared";
import {
  getNotifications,
  markNotificationRead,
} from "../api/notificationApi";
import { NotificationList } from "../components/notification/NotificationBell";
import { useAuth } from "../contexts/AuthContext";

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
            subtitle="SSE로 수신된 알림을 확인하고 읽음 처리합니다."
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
