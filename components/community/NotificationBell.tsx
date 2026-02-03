"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { formatRelativeTime } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import { useNotificationStore } from "@/stores/notificationStore";
import { Notification, NotificationType } from "@/types/Notification";
import {
  Bell,
  Bot,
  CheckCheck,
  Loader2,
  Megaphone,
  MessageSquare,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

function getNotificationHref(notification: Notification): string | null {
  switch (notification.type) {
    case "COMMENT":
    case "REPLY":
      return `/community/posts/free/${notification.data.postId}`;
    case "AI_INFERENCE_COMPLETE":
      return `/analysis/quant/${notification.data.inferenceId}`;
    case "SYSTEM_NOTICE":
      return null;
  }
}

function getNotificationMessage(notification: Notification): string {
  switch (notification.type) {
    case "COMMENT":
      return `${notification.actor?.nick ?? "알 수 없는 사용자"}님의 댓글: ${notification.data.preview}`;
    case "REPLY":
      return `${notification.actor?.nick ?? "알 수 없는 사용자"}님의 답글: ${notification.data.preview}`;
    case "AI_INFERENCE_COMPLETE":
      return `${notification.data.stockSymbol} AI 분석 완료`;
    case "SYSTEM_NOTICE":
      return notification.data.title;
  }
}

function getNotificationIcon(type: NotificationType) {
  switch (type) {
    case "COMMENT":
    case "REPLY":
      return <MessageSquare className="h-4 w-4 text-accent" />;
    case "AI_INFERENCE_COMPLETE":
      return <Bot className="h-4 w-4 text-accent" />;
    case "SYSTEM_NOTICE":
      return <Megaphone className="h-4 w-4 text-muted-foreground" />;
  }
}

export function NotificationBell() {
  const router = useRouter();
  const { user, isAuthLoading } = useAuthStore();
  const {
    notifications,
    unreadCount,
    isLoading,
    hasMore,
    fetchNotifications,
    fetchMore,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    setPopoverOpen,
    connectSSE,
    disconnectSSE,
  } = useNotificationStore();

  const [isOpen, setIsOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevScrollHeightRef = useRef(0);

  // 팝오버 열림/닫힘을 store에 동기화
  useEffect(() => {
    setPopoverOpen(isOpen);
  }, [isOpen, setPopoverOpen]);

  // SSE prepend 시 스크롤 위치 보존
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el || el.scrollTop === 0) return;
    const diff = el.scrollHeight - prevScrollHeightRef.current;
    if (diff > 0) {
      el.scrollTop += diff;
    }
  }, [notifications]);

  useEffect(() => {
    if (scrollRef.current) {
      prevScrollHeightRef.current = scrollRef.current.scrollHeight;
    }
  }, [notifications]);

  // 읽지 않은 수 조회(토큰 갱신 보장) → SSE 연결
  useEffect(() => {
    if (isAuthLoading || !user) return;
    let cancelled = false;

    fetchUnreadCount().then(() => {
      if (!cancelled) connectSSE();
    });

    return () => {
      cancelled = true;
      disconnectSSE();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isAuthLoading]);

  // 팝오버 열릴 때 목록 + 읽지 않은 수 동기화
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
      fetchUnreadCount();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // 무한 스크롤
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el || isLoading || !hasMore) return;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 100) {
      fetchMore();
    }
  }, [isLoading, hasMore, fetchMore]);

  // 알림 클릭
  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.readAt) {
      await markAsRead(notification.id);
    }
    const href = getNotificationHref(notification);
    if (href) {
      setIsOpen(false);
      router.push(href);
    }
  };

  if (!user) return null;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="none"
          className="relative group"
          aria-label="알림"
        >
          <Bell className="!h-6 !w-6 text-muted-foreground group-hover:text-foreground transition-colors" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[9px] font-medium text-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="w-80 max-sm:w-[calc(100vw-2rem)] p-0 overflow-hidden"
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="text-sm font-semibold">알림</h3>
          {unreadCount > 0 && (
            <button
              onClick={() => markAllAsRead()}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-accent transition-colors cursor-pointer"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              모두 읽음
            </button>
          )}
        </div>

        {/* 알림 목록 */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="max-h-150 overflow-y-auto p-2"
        >
          {isLoading && notifications.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Bell className="h-8 w-8 mb-2 opacity-40" />
              <span className="text-sm">알림이 없습니다</span>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {notifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-background-2 transition-colors cursor-pointer rounded-md ${notification.readAt
                    ? "text-muted-foreground"
                    : "text-foreground bg-accent/5"
                    }`}
                >
                  {/* 아바타 또는 아이콘 */}
                  <div className="flex-shrink-0 mt-0.5">
                    {notification.actor ? (
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={
                            notification.actor.profileImageUrl ?? undefined
                          }
                          alt={notification.actor.nick}
                        />
                        <AvatarFallback className="text-xs">
                          {notification.actor.nick?.charAt(0).toUpperCase() ||
                            "U"}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                        {getNotificationIcon(notification.type)}
                      </div>
                    )}
                  </div>

                  {/* 내용 */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs leading-snug line-clamp-2 text-ellipsis break-all min-h-[2lh]">
                      {getNotificationMessage(notification)}
                    </p>
                    <span className="text-xs text-muted-foreground mt-1 block">
                      {formatRelativeTime(notification.createdAt)}
                    </span>
                  </div>
                </button>
              ))}

              {/* 추가 로딩 스피너 */}
              {isLoading && notifications.length > 0 && (
                <div className="flex items-center justify-center py-3">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              )}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
