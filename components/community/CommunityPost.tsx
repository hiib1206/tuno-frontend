"use client";

import { LoginRequestModal } from "@/components/modals/LoginRequestModal";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PostListItem, PostSortOption } from "@/lib/community";
import { cn, formatRelativeTime } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import { PostCategoryLabels } from "@/types/Common";
import { ArrowUpDown, Eye, Heart, MessageSquare, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface CommunityPostProps {
  title?: string;
  posts?: PostListItem[];
  className?: string;
  showWriteButton?: boolean;
  showSort?: boolean;
  sortOptions?: PostSortOption[];
  currentSort?: string;
  onSortChange?: (sortOption: PostSortOption) => void;
  loading?: boolean;
}

export function CommunityPost({
  title = "글 목록",
  posts = [],
  className,
  showWriteButton = true,
  showSort = false,
  sortOptions = [],
  currentSort = "latest",
  onSortChange,
  loading = false,
}: CommunityPostProps) {
  const { user } = useAuthStore();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const handleWriteClick = () => {
    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }
    window.open("/community/posts/write", "_blank");
  };

  return (
    <div
      className={cn(
        "rounded-lg max-w-4xl mx-auto py-4 px-4 md:px-6 bg-background-1",
        className
      )}
    >
      {/* 제목 섹션 */}
      <div className="mb-3 flex flex-row items-center justify-between gap-2">
        <h2 className="px-1 text-lg sm:text-xl font-semibold whitespace-nowrap">{title}</h2>
        {showWriteButton && (
          <Button
            variant="accent"
            size="sm"
            className="shrink-0"
            onClick={handleWriteClick}
          >
            <Plus className="h-4 w-4" />
            <span>글쓰기</span>
          </Button>
        )}
        {showSort && sortOptions.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="default"
                size="xxs"
                className="flex items-center gap-1"
              >
                <ArrowUpDown className="h-2.5 w-2.5" />
                <span>
                  {sortOptions.find((opt) => opt.value === currentSort)?.label}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              sideOffset={0}
              onCloseAutoFocus={(e) => e.preventDefault()}
              className="w-auto min-w-[6rem]"
            >
              {sortOptions.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => onSortChange?.(option)}
                  className={cn(
                    "cursor-pointer text-xs hover:text-accent-text",
                    currentSort === option.value && "text-accent-text"
                  )}
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* 포스트 리스트 */}
      {loading ? (
        <div className="">
          <div className="h-px border-t border-border/60" />
          {/* 블록형 스켈레톤 - 2열 그리드 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3">
            {Array(10)
              .fill(null)
              .map((_, index) => (
                <div
                  key={index}
                  className="h-32 sm:h-36 w-full skeleton-gradient-loading rounded"
                />
              ))}
          </div>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center space-y-4">
          <div className="h-px border-t border-border/60" />

          <div className="flex flex-col items-center gap-2 pt-6">
            {showWriteButton ? (
              <>
                <p className="text-muted-foreground">이 공간은 아직 비어 있어요.</p>
                <p className="text-muted-foreground">
                  지금 첫 이야기를 시작해보세요!
                </p>
                <Button
                  variant="accent-outline"
                  size="default"
                  className="mt-4 group relative overflow-hidden hover:shadow-xl transition-all duration-300 font-semibold"
                  onClick={handleWriteClick}
                >
                  <div className="flex items-center gap-2.5">
                    <Plus className="h-8 w-8 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-90" />
                    <span className="text-base">글 쓰러 가기</span>
                  </div>
                </Button>
              </>
            ) : (
              <p className="text-muted-foreground py-4">검색 결과가 없습니다.</p>
            )}
          </div>
        </div>
      ) : (
        <div className="">
          <div className="h-px border-t border-border/60" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-0">
            {posts.map((post, index) => (
              <Link
                key={post.id}
                href={post.href}
                className={cn(
                  "block group h-full flex flex-col hover:bg-background-2 transition-colors duration-200",
                  index % 2 === 0 && "sm:border-r sm:border-border/60"
                )}
              >
                <article className="py-4 px-1 flex-1 flex flex-col">
                  <div className="px-2 flex-1 flex flex-col">
                    <div className="mb-1 flex items-center gap-1.5">
                      <span className="text-xs font-medium text-accent-text">
                        {PostCategoryLabels[post.category]}
                      </span>
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="text-xs text-foreground">
                        {post.author?.nick}
                      </span>
                      <span className="text-xs text-muted-foreground">·</span>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Eye className="h-3.5 w-3.5" />
                        <span>{post.viewCount}</span>
                      </div>
                    </div>
                    <h3 className="text-sm sm:text-base font-medium text-foreground mb-4 sm:mb-8 line-clamp-1 group-hover:text-accent-text transition-colors duration-300">
                      {post.title}
                    </h3>
                    <div className="flex-1 mb-3">
                      {post.content && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {post.content}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto">
                      <div className="flex items-center gap-2 md:gap-4">
                        <div className="flex items-center gap-1">
                          <Heart
                            className={cn(
                              post.isLiked
                                ? "fill-current text-rose-500"
                                : "text-muted-foreground",
                              "h-3.5 w-3.5"
                            )}
                          />
                          <span>{post.likeCount}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-3.5 w-3.5" />
                          <span>{post.commentCount}</span>
                        </div>
                      </div>
                      {/* 작성 날짜 */}
                      <span className="">
                        {formatRelativeTime(post.createdAt)}
                      </span>
                    </div>
                  </div>
                </article>
                <div className="h-px border-t border-border/60" />
              </Link>
            ))}
          </div>
        </div>
      )}
      <LoginRequestModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </div>
  );
}
