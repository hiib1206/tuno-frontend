"use client";

import newsApi, { NewsItem, NewsResponse } from "@/api/newsApi";
import { ErrorState } from "@/components/feedback/error-state";
import { Button } from "@/components/ui/button";
import { ImageWithSkeleton } from "@/components/ui/image-skeleton";
import { useNews } from "@/hooks/useNews";
import { NEWS_TOPICS } from "@/lib/community";
import { cn, formatRelativeTime } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Newspaper } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

interface CommunityNewsShowcaseProps {
  title?: string;
  className?: string;
  /** 좌측(스포트라이트)로 사용할 뉴스 개수 */
  featuredCount?: number;
  /** 우측 리스트에 표시할 최대 개수 */
  maxListCount?: number;
  /** API limit (1~10) */
  limit?: number;
  /** 더보기 링크 */
  moreHref?: string;
  /** 커스텀 fetch 함수 (검색 등) */
  fetchFn?: (cursor?: string) => Promise<NewsResponse>;
  /** 토픽ID (기본: headline) */
  topicId?: string;
  /** 데이터 fetch 여부 (기본: true) */
  autoFetch?: boolean;
  /** 이미지 추출 활성화 */
  enableImageExtraction?: boolean;
}

export function CommunityNewsShowcase({
  title = "주요 뉴스",
  className,
  featuredCount = 5,
  maxListCount = 4,
  limit = 9,
  moreHref = "/community/news",
  fetchFn,
  topicId = NEWS_TOPICS.headline,
  autoFetch = true,
  enableImageExtraction = false,
}: CommunityNewsShowcaseProps) {
  const safeLimit = Math.min(10, Math.max(1, limit));
  const safeFeaturedCount = Math.min(featuredCount, safeLimit);
  const safeListCount = Math.min(
    maxListCount,
    Math.max(0, safeLimit - safeFeaturedCount)
  );

  const resolvedFetchFn = useMemo(() => {
    if (fetchFn) return fetchFn;

    return (cursor?: string) =>
      newsApi.getNewsByTopic({
        topicId,
        cursor,
        limit: safeFeaturedCount + safeListCount,
      });
  }, [fetchFn, topicId, safeFeaturedCount, safeListCount]);

  const {
    news,
    loading,
    error,
    failedImageUrls,
    enableImageExtraction: enableExtractionFromHook,
  } = useNews(resolvedFetchFn, {
    enablePagination: false,
    enableImageExtraction,
    autoFetch,
  });

  const effectiveEnableImageExtraction =
    enableImageExtraction && enableExtractionFromHook;

  const featuredNews = useMemo(
    () => news.slice(0, safeFeaturedCount),
    [news, safeFeaturedCount]
  );
  const listNews = useMemo(
    () => news.slice(safeFeaturedCount, safeFeaturedCount + safeListCount),
    [news, safeFeaturedCount, safeListCount]
  );

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [safeFeaturedCount, featuredNews.length]);

  const activeItem = featuredNews[activeIndex];
  const canNavigate = featuredNews.length > 1 && !loading;

  const handlePrev = () => {
    if (!canNavigate) return;
    setActiveIndex(
      (prev) => (prev - 1 + featuredNews.length) % featuredNews.length
    );
  };

  const handleNext = () => {
    if (!canNavigate) return;
    setActiveIndex((prev) => (prev + 1) % featuredNews.length);
  };

  const renderSpotlightMedia = (item: NewsItem) => {
    const hasThumbnail = !!item.thumbnail && item.thumbnail.trim() !== "";
    const isFailed = failedImageUrls.has(item.link);

    if (!effectiveEnableImageExtraction && !hasThumbnail) {
      return (
        <div className="absolute inset-0 bg-background-2 flex items-center justify-center">
          <Newspaper className="h-10 w-10 text-muted-foreground" />
        </div>
      );
    }

    if (isFailed) {
      return (
        <div className="absolute inset-0 bg-background-2 flex items-center justify-center">
          <Newspaper className="h-10 w-10 text-muted-foreground" />
        </div>
      );
    }

    return (
      <ImageWithSkeleton
        src={item.thumbnail}
        alt={item.title}
        className="absolute inset-0"
        fallback={
          <div className="absolute inset-0 bg-background-2 flex items-center justify-center">
            <Newspaper className="h-10 w-10 text-muted-foreground" />
          </div>
        }
      />
    );
  };

  if (error) {
    return (
      <div
        className={cn(
          "rounded-lg max-w-5xl mx-auto py-4 px-4 md:px-6 bg-background-1",
          className
        )}
      >
        <div className="flex flex-col items-center justify-center min-h-[240px]">
          <ErrorState message={error} />
        </div>
      </div>
    );
  }

  return (
    <section
      className={cn(
        "rounded-lg max-w-5xl mx-auto py-4 px-4 md:px-6 bg-background-1",
        className
      )}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <Newspaper className="h-5 w-5 text-accent-text" />
          <h2 className="px-1 text-lg sm:text-xl font-semibold truncate">
            {title}
          </h2>
        </div>

        <Button variant="accent" size="sm" asChild>
          <Link href={moreHref}>더보기</Link>
        </Button>
      </div>

      {loading ? (
        <div className="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-2">
          <div className="lg:col-span-2 lg:h-full">
            <div className="relative rounded-lg overflow-hidden border border-border/60 bg-background-2 h-[320px] sm:h-[380px] lg:h-full">
              <div className="absolute inset-0 skeleton-gradient-loading" />
            </div>
          </div>
          <div className="lg:col-span-1">
            <div className="rounded overflow-hidden">
              <div className="divide-y divide-border-2">
                {Array.from({ length: safeListCount }).map((_, i) => (
                  <div key={i} className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0 bg-background-1">
                        <div className="w-full h-full skeleton-gradient-loading" />
                      </div>
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="h-3 w-40 skeleton-gradient-loading rounded" />
                        <div className="h-4 w-full skeleton-gradient-loading rounded" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : featuredNews.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          뉴스가 없습니다.
        </div>
      ) : (
        <div className="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-2">
          {/* 좌측 스포트라이트 */}
          <div className="lg:col-span-2 lg:h-full">
            <div className="relative rounded-lg overflow-hidden border border-border/60 bg-background-2 h-full">
              <a
                href={activeItem.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block group h-full"
              >
                <div className="relative h-[320px] sm:h-[380px] lg:h-full">
                  {renderSpotlightMedia(activeItem)}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                  <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
                    <div className="flex items-center gap-2 text-xs text-white/90">
                      <span className="font-semibold">{activeItem.source}</span>
                      <span className="opacity-70">·</span>
                      <span className="opacity-90">
                        {formatRelativeTime(new Date(activeItem.pubDate))}
                      </span>
                    </div>
                    <h3 className="mt-2 text-lg sm:text-2xl font-semibold text-white line-clamp-2 group-hover:underline">
                      {activeItem.title}
                    </h3>
                  </div>
                </div>
              </a>

              {featuredNews.length > 1 && (
                <>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handlePrev}
                    aria-label="이전 뉴스"
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-10 h-20 w-10 px-0 py-0 bg-black/35 hover:bg-black/45 text-white"
                  >
                    <ChevronLeft
                      className="h-5 w-5 scale-y-250 origin-center"
                      strokeWidth={2.5}
                    />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleNext}
                    aria-label="다음 뉴스"
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-10 h-20 w-10 px-0 py-0 bg-black/35 hover:bg-black/45 text-white"
                  >
                    <ChevronRight
                      className="h-5 w-5 scale-y-250 origin-center"
                      strokeWidth={2.5}
                    />
                  </Button>
                </>
              )}

              {featuredNews.length > 1 && (
                <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-1.5 z-10">
                  {featuredNews.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      aria-label={`뉴스 ${idx + 1}로 이동`}
                      onClick={() => setActiveIndex(idx)}
                      className={cn(
                        "h-1.5 rounded-full transition-all",
                        idx === activeIndex
                          ? "w-6 bg-white"
                          : "w-1.5 bg-white/60 hover:bg-white/80"
                      )}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 우측 리스트 */}
          <div className="lg:col-span-1">
            <div className="rounded overflow-hidden">
              <div className="divide-y divide-border-2">
                {listNews.map((item) => {
                  const hasThumbnail =
                    !!item.thumbnail && item.thumbnail.trim() !== "";
                  const isFailed = failedImageUrls.has(item.link);

                  const showThumbnail =
                    (effectiveEnableImageExtraction || hasThumbnail) &&
                    !isFailed;

                  return (
                    <a
                      key={item.id}
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block px-4 py-3 hover:bg-background-2 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {showThumbnail ? (
                          <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0 bg-background-1">
                            <ImageWithSkeleton
                              src={item.thumbnail}
                              alt={item.title}
                              className="w-full h-full"
                            />
                          </div>
                        ) : null}

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1">
                            <div className="text-xs font-medium text-accent-text truncate">
                              {item.source}
                            </div>
                            <span className="text-xs text-muted-foreground">
                              ·
                            </span>
                            <div className="text-xs text-muted-foreground flex-shrink-0">
                              {formatRelativeTime(new Date(item.pubDate))}
                            </div>
                          </div>
                          <div className="mt-1 text-sm font-medium text-foreground line-clamp-2">
                            {item.title}
                          </div>
                        </div>
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
