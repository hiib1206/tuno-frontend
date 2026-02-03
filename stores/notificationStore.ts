import notificationApi from "@/api/notification";
import { streamNotifications } from "@/api/notificationSse";
import { useAuthStore } from "@/stores/authStore";
import { Notification } from "@/types/Notification";
import { create } from "zustand";

interface NotificationStore {
  // 상태
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  hasMore: boolean;
  nextCursor: string | null;
  isPopoverOpen: boolean;
  _sseCleanup: (() => void) | null;

  // 액션
  fetchNotifications: () => Promise<void>;
  fetchMore: () => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  setPopoverOpen: (open: boolean) => void;
  connectSSE: () => void;
  disconnectSSE: () => void;
  reset: () => void;
}

const INITIAL_STATE = {
  notifications: [] as Notification[],
  unreadCount: 0,
  isLoading: false,
  hasMore: false,
  nextCursor: null as string | null,
  isPopoverOpen: false,
  _sseCleanup: null as (() => void) | null,
};

export const useNotificationStore = create<NotificationStore>()((set, get) => ({
  ...INITIAL_STATE,

  // ── 목록 조회 (팝오버 열 때) ──────────────────────────
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

  // ── 추가 로드 (무한 스크롤) ──────────────────────────
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

  // ── 읽지 않은 수 조회 (페이지 진입 시) ───────────────
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

  // ── 단건 읽음 처리 (optimistic) ──────────────────────
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

  // ── 전체 읽음 처리 (optimistic + revert) ─────────────
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

  // ── 팝오버 열림/닫힘 상태 ───────────────────────────
  setPopoverOpen: (open: boolean) => {
    set({ isPopoverOpen: open });
  },

  // ── SSE 연결 ───────────────────────────────────────
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
      }
    );

    set({ _sseCleanup: cleanup });
  },

  // ── SSE 해제 ─────────────────────────────────────────
  disconnectSSE: () => {
    const cleanup = get()._sseCleanup;
    if (cleanup) {
      cleanup();
      set({ _sseCleanup: null });
    }
  },

  // ── 초기화 (로그아웃) ─────────────────────────────────
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
