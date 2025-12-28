const AUTH_CHANNEL = "auth-sync";

export type AuthSyncEvent =
  | { type: "LOGIN"; accessToken: string; user: any }
  | { type: "LOGOUT" }
  | { type: "TOKEN_INVALID" };

let channel: BroadcastChannel | null = null;

/**
 * BroadcastChannel을 초기화합니다.
 * 브라우저 환경에서만 동작합니다.
 */
export function initAuthSync(): BroadcastChannel | null {
  if (typeof window === "undefined") return null;

  if (!channel) {
    channel = new BroadcastChannel(AUTH_CHANNEL);
  }
  return channel;
}

/**
 * 인증 상태 변경 이벤트를 다른 탭에 브로드캐스트합니다.
 */
export function broadcastAuthEvent(event: AuthSyncEvent): void {
  if (channel) {
    channel.postMessage(event);
  }
}

/**
 * BroadcastChannel을 닫고 리소스를 정리합니다.
 */
export function closeAuthSync(): void {
  if (channel) {
    channel.close();
    channel = null;
  }
}

/**
 * BroadcastChannel 인스턴스를 반환합니다.
 */
export function getAuthChannel(): BroadcastChannel | null {
  return channel;
}
