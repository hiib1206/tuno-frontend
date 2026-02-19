import { refreshAccessToken } from "@/api/apiClient";
import notificationApi from "@/api/notification";
import { streamNotifications } from "@/api/notificationSse";
import { useAuthStore } from "@/stores/authStore";
import { Notification } from "@/types/Notification";
import { create } from "zustand";

/**
 * 알림 스토어 인터페이스
 *
 * @remarks
 * 알림 목록 관리, 읽음 처리, SSE 연결을 처리한다.
 */
interface NotificationStore {
  /** 알림 목록 */
  notifications: Notification[];
  /** 읽지 않은 알림 수 */
  unreadCount: number;
  /** 로딩 중 여부 */
  isLoading: boolean;
  /** 추가 로드 가능 여부 */
  hasMore: boolean;
  /** 다음 페이지 커서 */
  nextCursor: string | null;
  /** 팝오버 열림 상태 */
  isPopoverOpen: boolean;
  /** SSE 연결 해제 함수 (내부용) */
  _sseCleanup: (() => void) | null;
  /** 알림 목록을 조회한다. */
  fetchNotifications: () => Promise<void>;
  /** 추가 알림을 로드한다. */
  fetchMore: () => Promise<void>;
  /** 읽지 않은 알림 수를 조회한다. */
  fetchUnreadCount: () => Promise<void>;
  /** 알림을 읽음 처리한다. */
  markAsRead: (id: string) => Promise<void>;
  /** 모든 알림을 읽음 처리한다. */
  markAllAsRead: () => Promise<void>;
  /** 팝오버 열림 상태를 설정한다. */
  setPopoverOpen: (open: boolean) => void;
  /** SSE 연결을 시작한다. */
  connectSSE: () => void;
  /** SSE 연결을 해제한다. */
  disconnectSSE: () => void;
  /** 스토어를 초기화한다. */
  reset: () => void;
}

/** 초기 상태 */
const INITIAL_STATE = {
  notifications: [] as Notification[],
  unreadCount: 0,
  isLoading: false,
  hasMore: false,
  nextCursor: null as string | null,
  isPopoverOpen: false,
  _sseCleanup: null as (() => void) | null,
};

/** 알림 스토어 */
export const useNotificationStore = create<NotificationStore>()((set, get) => ({
  ...INITIAL_STATE,

  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      const response = await notificationApi.getNotifications({ limit: 20 });
      if (response.success) {
        set({
          notifications: response.data.list,
          nextCursor: response.data.nextCursor,
          hasMore: response.data.hasNext,
        });
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchMore: async () => {
    const { nextCursor, hasMore, isLoading } = get();
    if (!hasMore || isLoading || !nextCursor) return;

    set({ isLoading: true });
    try {
      const response = await notificationApi.getNotifications({
        cursor: nextCursor,
        limit: 20,
      });
      if (response.success) {
        set((state) => ({
          notifications: [...state.notifications, ...response.data.list],
          nextCursor: response.data.nextCursor,
          hasMore: response.data.hasNext,
        }));
      }
    } catch (error) {
      console.error("Failed to fetch more notifications:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchUnreadCount: async () => {
    try {
      const response = await notificationApi.getUnreadCount();
      if (response.success) {
        set({ unreadCount: response.data.count });
      }
    } catch (error) {
      console.error("Failed to fetch unread count:", error);
    }
  },

  markAsRead: async (id: string) => {
    const notification = get().notifications.find((n) => n.id === id);
    if (!notification || notification.readAt) return;

    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? ({ ...n, readAt: new Date() } as Notification) : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));

    try {
      await notificationApi.readNotification(id);
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      get().fetchUnreadCount();
    }
  },

  markAllAsRead: async () => {
    const prev = {
      notifications: get().notifications,
      unreadCount: get().unreadCount,
    };

    set((state) => ({
      notifications: state.notifications.map(
        (n) => ({ ...n, readAt: n.readAt ?? new Date() }) as Notification
      ),
      unreadCount: 0,
    }));

    try {
      await notificationApi.readAllNotifications();
    } catch (error) {
      console.error("Failed to mark all as read:", error);
      set(prev);
    }
  },

  setPopoverOpen: (open: boolean) => {
    set({ isPopoverOpen: open });
  },

  connectSSE: () => {
    if (get()._sseCleanup) return;

    const cleanup = streamNotifications(
      () => useAuthStore.getState().accessToken,
      {
        onMessage: (notification) => {
          set((state) => ({
            unreadCount: state.unreadCount + 1,
            notifications: state.isPopoverOpen
              ? [notification, ...state.notifications]
              : state.notifications,
          }));
        },
        onError: async (error) => {
          if (error instanceof Error && error.message === "Unauthorized") {
            get().disconnectSSE();
            const newToken = await refreshAccessToken();
            if (newToken) {
              get().connectSSE();
            }
          }
        },
      }
    );

    set({ _sseCleanup: cleanup });
  },

  disconnectSSE: () => {
    const cleanup = get()._sseCleanup;
    if (cleanup) {
      cleanup();
      set({ _sseCleanup: null });
    }
  },

  reset: () => {
    get().disconnectSSE();
    set(INITIAL_STATE);
  },
}));

// 로그아웃 시 자동 리셋
useAuthStore.subscribe((state, prevState) => {
  if (prevState.user && !state.user) {
    useNotificationStore.getState().reset();
  }
});
