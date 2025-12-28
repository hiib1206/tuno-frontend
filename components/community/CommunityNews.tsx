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
}

export function CommunityNews({
  title = "주요 뉴스",
  news = [],
  emptyMessage = "뉴스가 없습니다.",
  className,
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
      {news.length === 0 ? (
        <div className="text-center">
          <div className="h-px border-t border-border-2" />
          <p className="py-8 text-muted-foreground">{emptyMessage}</p>
        </div>
      ) : (
        <div>
          <div className="h-px border-t border-border-2" />
          <div className="flex flex-col">
            {news.map((item) => (
              <a
                key={item.id}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block group hover:bg-background-2 transition-colors duration-200"
              >
                <article className="py-2 px-1">
                  <div className="px-2 flex items-stretch justify-between gap-4">
                    {/* 뉴스 내용 */}
                    <div className="flex-1 flex flex-col min-w-0">
                      <div>
                        {/* 언론사 */}
                        <span className="text-xs font-medium text-accent-text">
                          {item.source}
                        </span>
                        {/* 뉴스 제목 */}
                        <h3 className="mt-1.5 text-sm sm:text-base font-medium text-foreground line-clamp-2 group-hover:text-accent-text transition-colors duration-300">
                          {item.title}
                        </h3>
                      </div>

                      {/* 발행 시간 */}
                      <span className="mt-auto block text-xs text-muted-foreground">
                        {formatRelativeTime(new Date(item.pubDate))}
                      </span>
                    </div>

                    {/* 썸네일 이미지 */}
                    <div className="flex-shrink-0 w-24 h-24 sm:w-64 sm:h-36">
                      <ImageWithSkeleton
                        src={item.thumbnail}
                        alt={item.title}
                        className="w-full h-full rounded-lg"
                      />
                    </div>
                  </div>
                </article>
                <div className="h-px border-t border-border-2" />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
