"use client";

import { NewsItem } from "@/api/newsApi";
import { ImageWithSkeleton } from "@/components/ui/image-skeleton";
import { cn, formatRelativeTime } from "@/lib/utils";
import { Newspaper } from "lucide-react";

interface CommunityNewsProps {
  title?: string;
  news?: NewsItem[];
  emptyMessage?: string;
  className?: string;
  failedImageUrls?: Set<string>;
  loading?: boolean;
  loadingMore?: boolean;
  enableImageExtraction?: boolean;
}

export function CommunityNews({
  title = "주요 뉴스",
  news = [],
  emptyMessage = "뉴스가 없습니다.",
  className,
  failedImageUrls = new Set(),
  loading = false,
  loadingMore = false,
  enableImageExtraction = true,
}: CommunityNewsProps) {
  return (
    <div
      className={cn(
        "rounded-lg max-w-4xl mx-auto py-4 px-4 md:px-6 bg-background-1",
        className
      )}
    >
      {/* 제목 섹션 */}
      <div className="mb-6 flex items-center gap-2">
        <Newspaper className="h-5 w-5 text-accent-text" />
        <h2 className="px-1 text-lg sm:text-xl font-semibold">{title}</h2>
      </div>

      {/* 뉴스 리스트 */}
      {news.length === 0 && !loading ? (
        <div className="text-center">
          <div className="h-px border-t border-border-2" />
          <p className="py-8 text-muted-foreground">{emptyMessage}</p>
        </div>
      ) : (
        <div>
          <div className="h-px border-t border-border-2" />
          <div className="flex flex-col">
            {(loading
              ? (Array(10).fill(null) as (NewsItem | null)[])
              : [
                  ...news,
                  ...(loadingMore
                    ? (Array(10).fill(null) as (NewsItem | null)[])
                    : []),
                ]
            ).map((item, index) => {
              const isSkeleton = loading || !item;
              const key = isSkeleton ? `skeleton-${index}` : item!.id;

              const content = (
                <article className="py-2 px-1 min-h-24 sm:min-h-40">
                  <div className="px-2 flex items-stretch justify-between gap-4">
                    {/* 뉴스 내용 */}
                    <div className="flex-1 flex flex-col min-w-0">
                      <div>
                        {/* 언론사 */}
                        {isSkeleton ? (
                          <div className="h-3 w-16 skeleton-gradient-loading rounded" />
                        ) : (
                          <span className="text-xs font-medium text-accent-text">
                            {item!.source}
                          </span>
                        )}
                        {/* 뉴스 제목 */}
                        {isSkeleton ? (
                          <div className="mt-1.5 space-y-1.5">
                            <div className="h-4 w-full skeleton-gradient-loading rounded" />
                            <div className="h-4 w-3/4 skeleton-gradient-loading rounded" />
                          </div>
                        ) : (
                          <h3 className="mt-1.5 text-sm sm:text-base font-medium text-foreground line-clamp-2 group-hover:text-accent-text transition-colors duration-300">
                            {item!.title}
                          </h3>
                        )}
                      </div>

                      {/* 발행 시간 */}
                      {isSkeleton ? (
                        <div className="mt-auto h-3 w-20 skeleton-gradient-loading rounded" />
                      ) : (
                        <span className="mt-auto block text-xs text-muted-foreground">
                          {formatRelativeTime(new Date(item!.pubDate))}
                        </span>
                      )}
                    </div>

                    {/* 썸네일 이미지 */}
                    {isSkeleton ? (
                      <div className="flex-shrink-0 w-24 h-24 sm:w-64 sm:h-36">
                        <div className="w-full h-full skeleton-gradient-loading rounded-lg" />
                      </div>
                    ) : (
                      <div className="flex-shrink-0 w-24 h-24 sm:w-64 sm:h-36">
                        {(() => {
                          const hasThumbnail =
                            item!.thumbnail && item!.thumbnail.trim() !== "";
                          const isFailed = failedImageUrls.has(item!.link);

                          // enableImageExtraction이 false이고 thumbnail이 없으면 스켈레톤 숨김
                          if (!enableImageExtraction && !hasThumbnail) {
                            return <div className="w-full h-full" />;
                          }

                          // 이미지 추출 실패한 경우 스켈레톤 숨김
                          if (isFailed) {
                            return <div className="w-full h-full" />;
                          }

                          // thumbnail이 있으면 이미지 표시, 없으면 스켈레톤 표시 (이미지 추출 중)
                          return (
                            <ImageWithSkeleton
                              src={item!.thumbnail}
                              alt={item!.title}
                              className="w-full h-full rounded-lg"
                            />
                          );
                        })()}
                      </div>
                    )}
                  </div>
                </article>
              );

              return isSkeleton ? (
                <div key={key} className="block group">
                  {content}
                  <div className="h-px border-t border-border-2" />
                </div>
              ) : (
                <a
                  key={key}
                  href={item!.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block group hover:bg-background-2 transition-colors duration-200"
                >
                  {content}
                  <div className="h-px border-t border-border-2" />
                </a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
