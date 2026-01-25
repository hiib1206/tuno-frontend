"use client";

import newsApi, { NewsItem } from "@/api/newsApi";
import { EmptyState, ErrorState } from "@/components/feedback";
import { ThemeNewsListSkeleton } from "@/components/market/ThemeNewsListSkeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNews } from "@/hooks/useNews";
import { formatRelativeTime } from "@/lib/utils";
import { FileText } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface ThemeNewsListProps {
  tmname: string;
}

export function ThemeNewsList({ tmname }: ThemeNewsListProps) {
  // 테마 이름에서 괄호 앞 부분만 추출 + "테마" 추가
  const keyword = tmname.split("(")[0].trim() + " 테마";

  const { news, loading, error } = useNews(
    () => newsApi.searchNews({ q: keyword, limit: 30 }),
    {
      enablePagination: false,
      enableImageExtraction: false,
      autoFetch: true,
      key: tmname,
    }
  );

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showGradient, setShowGradient] = useState(false);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const checkScroll = () => {
      const { scrollHeight, clientHeight, scrollTop } = container;
      const hasScroll = scrollHeight > clientHeight;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;
      setShowGradient(hasScroll && !isAtBottom);
    };

    checkScroll();
    container.addEventListener("scroll", checkScroll);

    const resizeObserver = new ResizeObserver(checkScroll);
    resizeObserver.observe(container);

    return () => {
      container.removeEventListener("scroll", checkScroll);
      resizeObserver.disconnect();
    };
  }, [news, loading, error]);

  if (loading) {
    return <ThemeNewsListSkeleton />;
  }

  return (
    <Card variant="workspace" className="h-full min-h-0 relative">
      <CardHeader>
        <div className="text-lg flex items-center mb-4">
          <CardTitle>{keyword}</CardTitle>
        </div>
      </CardHeader>
      <CardContent
        ref={scrollContainerRef}
        className="relative overflow-y-auto h-full"
      >
        {error ? (
          <div className="h-full flex items-center justify-center">
            <ErrorState message={error} />
          </div>
        ) : news.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <EmptyState icon={FileText} message="관련 뉴스가 없습니다." />
          </div>
        ) : (
          <div className="h-full">
            {news.map((item: NewsItem, index: number) => (
              <a
                key={item.id}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block group transition-colors duration-200"
              >
                <article className="py-2">
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-medium text-accent-text">
                      {item.source}
                    </span>
                    <h3 className="mt-1.5 text-sm font-medium text-foreground line-clamp-2 group-hover:text-accent-text transition-colors duration-300">
                      {item.title}
                    </h3>
                    <span className="mt-1.5 block text-xs text-muted-foreground">
                      {formatRelativeTime(new Date(item.pubDate))}
                    </span>
                  </div>
                </article>
                {index < news.length - 1 && (
                  <div className="h-px border-t border-border-2" />
                )}
              </a>
            ))}
          </div>
        )}
      </CardContent>
      {showGradient && (
        <div className="absolute bottom-0 left-0 right-0 h-25 rounded-b-md pointer-events-none bg-gradient-to-t from-background-1 to-transparent" />
      )}
    </Card>
  );
}
