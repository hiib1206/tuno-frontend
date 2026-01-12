"use client";

import { NewsItem } from "@/api/newsApi";
import { EmptyState, ErrorState } from "@/components/feedback";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageWithSkeleton } from "@/components/ui/image-skeleton";
import { formatRelativeTime } from "@/lib/utils";
import { FileText, Newspaper } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface StockNewsProps {
  news: NewsItem[];
  failedImageUrls?: Set<string>;
  loading?: boolean;
  error?: string | null;
  enableImageExtraction?: boolean;
}

export function StockNews({
  news,
  failedImageUrls = new Set(),
  loading = false,
  error = null,
  enableImageExtraction = true,
}: StockNewsProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showGradient, setShowGradient] = useState(false);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const checkScroll = () => {
      const { scrollHeight, clientHeight, scrollTop } = container;
      const hasScroll = scrollHeight > clientHeight;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1; // 1px 여유
      setShowGradient(hasScroll && !isAtBottom);
    };

    checkScroll();
    container.addEventListener("scroll", checkScroll);

    // ResizeObserver로 크기 변경 감지
    const resizeObserver = new ResizeObserver(checkScroll);
    resizeObserver.observe(container);

    return () => {
      container.removeEventListener("scroll", checkScroll);
      resizeObserver.disconnect();
    };
  }, [news, loading, error]);

  return (
    <Card variant="workspace" className="h-full min-h-0 relative">
      <CardHeader>
        <div className="flex items-center gap-2 mb-6">
          <Newspaper className="h-5 w-5 text-accent-text" />
          <CardTitle>관련 뉴스</CardTitle>
        </div>
      </CardHeader>
      <CardContent
        ref={scrollContainerRef}
        className="relative overflow-y-auto h-full"
      >
        {loading ? (
          <div className=" h-full skeleton-gradient-loading rounded-lg" />
        ) : error ? (
          <div className="h-full flex items-center justify-center">
            <ErrorState message={error} />
          </div>
        ) : news.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <EmptyState icon={FileText} message="관련 뉴스가 없습니다." />
          </div>
        ) : (
          <div className="h-full">
            {news.map((item, index) => (
              <a
                key={item.id}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block group transition-colors duration-200"
              >
                <article className="py-2">
                  <div className="flex items-stretch justify-between gap-4">
                    <div className="flex-1 flex flex-col min-w-0 justify-between">
                      <span className="text-xs font-medium text-accent-text">
                        {item.source}
                      </span>
                      <h3 className="mt-1.5 text-sm sm:text-lg lg:text-sm font-medium text-foreground line-clamp-2 group-hover:text-accent-text transition-colors duration-300">
                        {item.title}
                      </h3>
                      <span className="mt-auto block text-xs text-muted-foreground">
                        {formatRelativeTime(new Date(item.pubDate))}
                      </span>
                    </div>
                    <div className="flex-shrink-0 w-24 h-24 sm:w-64 sm:h-36 lg:w-24 lg:h-24">
                      {(() => {
                        const hasThumbnail =
                          item.thumbnail && item.thumbnail.trim() !== "";
                        const isFailed = failedImageUrls.has(item.link);

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
                            src={item.thumbnail}
                            alt={item.title}
                            className="w-full h-full rounded-lg object-cover"
                          />
                        );
                      })()}
                    </div>
                  </div>
                </article>
                {index < news.length - 1 && (
                  <div className="h-px border-t border-border" />
                )}
              </a>
            ))}
          </div>
        )}
      </CardContent>
      {/* 하단 페이드아웃 그라데이션 오버레이 - CardContent 밖으로 이동 */}
      {showGradient && (
        <div className="absolute bottom-0 left-0 right-0 h-25 rounded-b-md pointer-events-none bg-gradient-to-t from-background-1 to-transparent" />
      )}
    </Card>
  );
}
