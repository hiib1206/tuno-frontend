import { NotificationResponse, parseNotification } from "@/types/Notification";

export interface StreamNotificationsCallbacks {
  onMessage: (notification: ReturnType<typeof parseNotification>) => void;
  onError?: (error: unknown) => void;
}

export const NotificationSseEvent = {
  CREATED: "notification.created",
} as const;

export function streamNotifications(
  accessToken: string,
  callbacks: StreamNotificationsCallbacks
): EventSource {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://59.25.224.32:4000";
  const url = `${baseUrl}/api/notification/stream?accessToken=${encodeURIComponent(
    accessToken
  )}`;

  const eventSource = new EventSource(url);

  eventSource.addEventListener(NotificationSseEvent.CREATED, (e) => {
    const raw: NotificationResponse = JSON.parse((e as MessageEvent).data);
    callbacks.onMessage(parseNotification(raw));
  });

  eventSource.onerror = (e) => {
    callbacks.onError?.(e);
    eventSource.close();
  };

  return eventSource;
}
