import { NotificationResponse, parseNotification } from "@/types/Notification";
import { fetchEventSource } from "@microsoft/fetch-event-source";

/** 알림 SSE 스트림 콜백 */
export interface StreamNotificationsCallbacks {
  /** 새 알림 수신 시 호출 */
  onMessage: (notification: ReturnType<typeof parseNotification>) => void;
  /** 에러 발생 시 호출 */
  onError?: (error: unknown) => void;
  /** 연결 성공 시 호출 */
  onConnected?: () => void;
  /** 연결 해제 시 호출 */
  onDisconnected?: () => void;
}

/** 알림 SSE 이벤트 타입 */
export const NotificationSseEvent = {
  CREATED: "notification.created",
} as const;

/**
 * 알림 SSE 스트림을 연결한다.
 *
 * @remarks
 * @microsoft/fetch-event-source 기반으로 Authorization 헤더로 인증하며,
 * 재연결은 라이브러리 내장 기능을 사용한다.
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
    process.env.NEXT_PUBLIC_API_URL;
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
