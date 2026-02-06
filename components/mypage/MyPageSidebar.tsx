"use client";

import { ProfileAvatar } from "@/components/ProfileAvatar";
import { SettingsModal } from "@/components/SettingsModal";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import { useCommunityStatsStore } from "@/stores/communityStatsStore";
import { FileText, Heart, MessageSquare, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const menuItems = [
  {
    id: "posts",
    label: "나의 게시글",
    shortLabel: "게시글",
    href: "/community/mypage/posts",
    icon: FileText,
  },
  {
    id: "comments",
    label: "나의 댓글",
    shortLabel: "댓글",
    href: "/community/mypage/comments",
    icon: MessageSquare,
  },
  {
    id: "likes",
    label: "내가 보낸 좋아요",
    shortLabel: "좋아요",
    href: "/community/mypage/likes",
    icon: Heart,
  },
];

export function MyPageSidebar() {
  const { user } = useAuthStore();
  const pathname = usePathname();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { stats, fetchStats, clearStats } = useCommunityStatsStore();

  useEffect(() => {
    if (user) {
      fetchStats();
    } else {
      clearStats();
    }
  }, [user, fetchStats, clearStats]);

  return (
    <>
      {/* 모바일 레이아웃 (lg 미만) */}
      <div className="lg:hidden w-full">
        <div className="rounded-lg bg-background-1 p-4">
          {/* 가로 프로필 카드 */}
          <div className="flex items-center gap-4">
            {/* 아바타 */}
            <div className="relative flex-shrink-0">
              <ProfileAvatar size="lg" />
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="group absolute bottom-0 right-0 h-5 w-5 rounded-full bg-muted-4 text-background flex items-center justify-center hover:bg-accent hover:text-white transition-colors border-2 border-background-1"
                aria-label="프로필 편집"
              >
                <Settings className="h-3 w-3 text-muted-foreground group-hover:text-white" />
              </button>
            </div>

            {/* 유저 정보 */}
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-foreground truncate">
                {user?.nick}
              </h3>
              <p className="text-sm text-muted-foreground truncate">
                {user?.email}
              </p>
              {user?.createdAt && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  가입일: {new Date(user.createdAt).toLocaleDateString("ko-KR")}
                </p>
              )}
            </div>

            {/* 통계 (가로 배치) */}
            {stats && (
              <div className="flex gap-4 text-center flex-shrink-0">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {stats.postCount}
                  </p>
                  <p className="text-xs text-muted-foreground">게시글</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {stats.commentCount}
                  </p>
                  <p className="text-xs text-muted-foreground">댓글</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {stats.likeCount}
                  </p>
                  <p className="text-xs text-muted-foreground">좋아요</p>
                </div>
              </div>
            )}
          </div>

          {/* 가로 탭 메뉴 */}
          <nav className="flex gap-2 mt-4 pt-4 border-t border-border/60">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium rounded transition-colors",
                    isActive
                      ? "bg-background-2 text-accent-text"
                      : "text-muted-foreground hover:bg-background-2 hover:text-accent"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.shortLabel}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* 데스크탑 레이아웃 (lg 이상) */}
      <div className="hidden lg:block w-48 flex-shrink-0">
        <div className="rounded-lg bg-background-1 p-4 pt-6 min-h-[500px]">
          {/* 프로필 섹션 */}
          <div className="flex flex-col items-center mb-2">
            {/* 프로필 아바타와 편집 배지를 감싸는 컨테이너 */}
            <div className="relative mb-4">
              <ProfileAvatar size="xl" />
              {/* 편집 배지 - 우측 하단 */}
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="group absolute bottom-0.5 right-0.5 h-6 w-6 rounded-full bg-muted-4 text-background flex items-center justify-center hover:bg-accent hover:text-white transition-colors border-2 border-background-1"
                aria-label="프로필 편집"
              >
                <Settings className="h-3.5 w-3.5 text-muted-foreground group-hover:text-white" />
              </button>
            </div>
            <div className="text-center w-full max-w-full">
              <h3 className="text-lg font-semibold text-foreground mb-1 truncate">
                {user?.nick}
              </h3>
              <p className="text-sm text-muted-foreground truncate">
                {user?.email}
              </p>
            </div>
            {/* 커뮤니티 통계 */}
            {stats && (
              <div className="w-full text-left mt-1 space-y-1">
                {user?.createdAt && (
                  <p className="text-xs text-muted-foreground mt-1">
                    가입일:{" "}
                    {new Date(user.createdAt).toLocaleDateString("ko-KR")}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  게시글: {stats.postCount}
                </p>
                <p className="text-xs text-muted-foreground">
                  댓글: {stats.commentCount}
                </p>
                <p className="text-xs text-muted-foreground">
                  좋아요: {stats.likeCount}
                </p>
              </div>
            )}
          </div>

          {/* 구분선 */}
          <div className="h-px border-t border-border/60 mb-4" />

          {/* 메뉴 항목 */}
          <nav>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded transition-colors",
                    isActive
                      ? "bg-background-2 text-accent-text"
                      : "text-muted-foreground hover:bg-background-2 hover:text-accent"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* 설정 모달 */}
      <SettingsModal open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
    </>
  );
}
