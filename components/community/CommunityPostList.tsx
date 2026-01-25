"use client";

import postApi from "@/api/postApi";
import { ErrorState } from "@/components/feedback/error-state";
import { Button } from "@/components/ui/button";
import { PostListItem, toCommunityPost } from "@/lib/community";
import { cn, formatRelativeTime } from "@/lib/utils";
import {
  categoryToUrlPath,
  PostCategory,
  PostCategoryLabels,
} from "@/types/Common";
import { ChevronRight, Eye, Heart, MessageSquare } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface CommunityPostListProps {
  className?: string;
}

type FilterType = "latest" | PostCategory;

// 필터 옵션: 최신글 + 모든 카테고리 자동 생성
const filterOptions: { value: FilterType; label: string }[] = [
  { value: "latest", label: "최신 글" },
  ...Object.values(PostCategory).map((category) => ({
    value: category,
    label: PostCategoryLabels[category],
  })),
];

export function CommunityPostList({ className }: CommunityPostListProps) {
  const [selectedFilter, setSelectedFilter] = useState<FilterType>("latest");
  const [posts, setPosts] = useState<ReturnType<typeof toCommunityPost>[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // API 호출
  useEffect(() => {
    const fetchPosts = async () => {
      setError(null);

      try {
        const params =
          selectedFilter === "latest"
            ? { limit: 20, sort: "created_at" as const, order: "desc" as const }
            : {
                limit: 20,
                sort: "created_at" as const,
                order: "desc" as const,
                category: selectedFilter,
              };

        const response = await postApi.getPosts(params);

        if (response.success) {
          setPosts(response.data.list.map(toCommunityPost));
        } else {
          setError("게시글을 불러오는데 실패했습니다.");
        }
      } catch (err) {
        setError("게시글을 불러오는데 실패했습니다.");
      } finally {
        setInitialLoading(false);
      }
    };

    fetchPosts();
  }, [selectedFilter]);

  // 더보기 버튼 링크
  const getMoreHref = () => {
    if (selectedFilter === "latest") {
      return "/community/posts";
    }
    return `/community/posts/${categoryToUrlPath(selectedFilter)}`;
  };

  return (
    <div
      className={cn(
        "rounded-lg max-w-4xl mx-auto py-4 px-4 md:px-6 bg-background-1",
        className
      )}
    >
      {/* 상단 헤더 */}
      <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between">
        {/* 왼쪽: 필터 탭 */}
        <div className="flex items-center overflow-x-auto w-full sm:w-auto gap-1">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setSelectedFilter(option.value)}
              className={cn(
                "px-4 py-2 text-sm font-medium whitespace-nowrap rounded transition-all",
                selectedFilter === option.value
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-background-2"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* 오른쪽: 더보기 버튼 */}
        <Link href={getMoreHref()}>
          <Button
            variant="accent"
            size="sm"
            className="flex items-center gap-1 "
          >
            <span>더보기</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      {/* 게시글 목록 */}
      {initialLoading ? (
        <div className="space-y-0">
          <div className="h-px border-t border-border/60" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-0">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className={cn(
                  "py-4 px-3",
                  index % 2 === 0 && "sm:border-r sm:border-border/60"
                )}
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <div className="h-3 w-8 skeleton-gradient-loading rounded" />
                    <div className="h-3 w-12 skeleton-gradient-loading rounded" />
                  </div>
                  <div className="h-5 w-3/4 skeleton-gradient-loading rounded" />
                  <div className="h-3 w-full skeleton-gradient-loading rounded" />
                  <div className="h-3 w-2/3 skeleton-gradient-loading rounded" />
                </div>
                <div className="h-px border-t border-border/60 mt-4" />
              </div>
            ))}
          </div>
        </div>
      ) : error ? (
        <div className="">
          <div className="h-px border-t border-border/60" />
          <ErrorState message={error} className="py-20" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center space-y-4">
          <div className="h-px border-t border-border/60" />
          <div className="flex flex-col items-center">
            <p className="text-muted-foreground py-20">게시글이 없습니다.</p>
          </div>
        </div>
      ) : (
        <div className="">
          <div className="h-px border-t border-border/60" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-0">
            {posts.map((post: PostListItem, index: number) => (
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
    </div>
  );
}
