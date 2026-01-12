"use client";

import newsApi from "@/api/newsApi";
import { CommunityNews } from "@/components/community/CommunityNews";
import { ErrorState } from "@/components/feedback/error-state";
import { useNews } from "@/hooks/useNews";
import { NEWS_TOPICS, NewsTopicKey } from "@/lib/community";
import { useParams } from "next/navigation";
import { useEffect, useRef } from "react";

// 토픽 키에 대한 한글 라벨 매핑
const TOPIC_LABELS: Record<NewsTopicKey, string> = {
  headline: "주요 뉴스",
  economy: "경제",
  finance: "금융",
  technology: "기술",
  politics: "정치",
};

export default function NewsPage() {
  const params = useParams();
  const topicKey = params.topics as NewsTopicKey;

  // 유효한 토픽 키인지 확인
  const isValidTopic = topicKey && topicKey in NEWS_TOPICS;
  const topicId = isValidTopic ? NEWS_TOPICS[topicKey] : null;
  const topicLabel = isValidTopic ? TOPIC_LABELS[topicKey] : "뉴스";

  // useNews 훅 사용
  const {
    news,
    loading,
    error,
    loadingMore,
    nextCursor,
    hasNextPage,
    loadMore,
    failedImageUrls,
    enableImageExtraction,
  } = useNews(
    (cursor) =>
      newsApi.getNewsByTopic({
        topicId: topicId!,
        cursor,
        limit: 10,
      }),
    {
      enablePagination: true,
      enableImageExtraction: true,
      autoFetch: !!topicId, // topicId가 변경되면 자동으로 다시 fetch
    }
  );

  // 무한 스크롤 감지용 ref
  const observerRef = useRef<HTMLDivElement>(null);

  // Intersection Observer로 무한 스크롤 구현
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // 감지 요소가 화면에 보이고, 다음 페이지가 있으면 로드
        if (entries[0].isIntersecting && hasNextPage && !loadingMore) {
          loadMore();
        }
      },
      { threshold: 0.1 } // 10% 보이면 트리거
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, loadingMore, loadMore]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        <ErrorState message={error} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CommunityNews
        title={topicLabel}
        news={news}
        emptyMessage="뉴스가 없습니다."
        failedImageUrls={failedImageUrls}
        loading={loading}
        loadingMore={loadingMore}
        enableImageExtraction={enableImageExtraction}
      />

      {/* 무한 스크롤 감지 영역 */}
      <div ref={observerRef} className="py-4">
        {!hasNextPage && news.length > 0 && (
          <p className="text-center text-sm text-muted-foreground">
            모든 뉴스를 불러왔습니다.
          </p>
        )}
      </div>
    </div>
  );
}
