import { fetchEventSource } from "@microsoft/fetch-event-source";
import { NotificationResponse, parseNotification } from "@/types/Notification";

export interface StreamNotificationsCallbacks {
  onMessage: (notification: ReturnType<typeof parseNotification>) => void;
  onError?: (error: unknown) => void;
  onConnected?: () => void;
  onDisconnected?: () => void;
}

export const NotificationSseEvent = {
  CREATED: "notification.created",
} as const;

/**
 * @microsoft/fetch-event-source 기반 SSE 스트림.
 * Authorization 헤더로 인증하며, 재연결은 라이브러리 내장 기능 사용.
 *
 * @param getAccessToken - 연결 시 최신 토큰을 가져오는 함수
 * @param callbacks - 메시지/에러/연결 상태 콜백
 * @returns cleanup 함수 (연결 종료)
 */
export function streamNotifications(
  getAccessToken: () => string | null,
  callbacks: StreamNotificationsCallbacks,
): () => void {
  const ctrl = new AbortController();

  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL || "http://59.25.224.32:4000";
  const url = `${baseUrl}/api/notification/stream`;

  fetchEventSource(url, {
    signal: ctrl.signal,
    openWhenHidden: true,

    headers: {
      Authorization: `Bearer ${getAccessToken()}`,
    },

    async onopen(response) {
      if (response.ok) {
        callbacks.onConnected?.();
        return;
      }
      if (response.status === 401) {
        ctrl.abort();
        callbacks.onError?.(new Error("Unauthorized"));
        return;
      }
    },

    onmessage(msg) {
      if (msg.event === NotificationSseEvent.CREATED) {
        const raw: NotificationResponse = JSON.parse(msg.data);
        callbacks.onMessage(parseNotification(raw));
      }
    },

    onerror(err) {
      callbacks.onDisconnected?.();
      callbacks.onError?.(err);
      // return하면 자동 재연결, throw하면 중단
    },

    onclose() {
      callbacks.onDisconnected?.();
    },
  });

  return () => ctrl.abort();
}
