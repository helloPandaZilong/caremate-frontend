import { useCallback, useEffect, useRef, useState } from "react";
import { getAccessToken } from "../utils/authToken";

function normalizeNotificationEvent(event) {
  try {
    const parsed = JSON.parse(event.data || "{}");
    return {
      ...parsed,
      id: parsed.id ?? Number(event.lastEventId),
      isRead: parsed.isRead ?? false,
    };
  } catch {
    return null;
  }
}

export function useNotificationSse({ enabled = true, onNotification } = {}) {
  const eventSourceRef = useRef(null);
  const [connectionState, setConnectionState] = useState("idle");
  const [lastNotification, setLastNotification] = useState(null);
  const [error, setError] = useState(null);

  const close = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      setConnectionState("closed");
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      close();
      return undefined;
    }

    const token = getAccessToken();
    if (!token) {
      setConnectionState("no-token");
      return undefined;
    }

    const url = `/api/notifications/subscribe?token=${encodeURIComponent(token)}`;
    const eventSource = new EventSource(url, { withCredentials: true });
    eventSourceRef.current = eventSource;
    setConnectionState("connecting");
    setError(null);

    eventSource.onopen = () => {
      setConnectionState("connected");
      setError(null);
    };

    eventSource.addEventListener("notification", (event) => {
      const notification = normalizeNotificationEvent(event);
      if (!notification) return;
      setLastNotification(notification);
      onNotification?.(notification);
    });

    eventSource.addEventListener("heartbeat", () => {
      setConnectionState("connected");
    });

    eventSource.addEventListener("connected", () => {
      setConnectionState("connected");
    });

    eventSource.onerror = () => {
      setConnectionState("reconnecting");
      setError("SSE 연결이 일시적으로 끊겼습니다. 브라우저가 자동 재연결합니다.");
    };

    return () => {
      eventSource.close();
      if (eventSourceRef.current === eventSource) {
        eventSourceRef.current = null;
      }
    };
  }, [close, enabled, onNotification]);

  return {
    connectionState,
    connected: connectionState === "connected",
    lastNotification,
    error,
    close,
  };
}
