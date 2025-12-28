"use client";

import newsApi, { NewsItem, streamNewsImages } from "@/api/newsApi";
import { CommunityNews } from "@/components/community/CommunityNews";
import { ErrorState } from "@/components/feedback/error-state";
import { LoadingState } from "@/components/feedback/loading-state";
import { SegmentedSpinner } from "@/components/loading";
import { NEWS_TOPICS, NewsTopicKey } from "@/lib/community";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

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

  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  // 무한 스크롤 감지용 ref
  const observerRef = useRef<HTMLDivElement>(null);
  // EventSource 관리용 ref (여러 개 가능)
  const eventSourcesRef = useRef<EventSource[]>([]);

  // 컴포넌트 언마운트 시 모든 EventSource 정리
  useEffect(() => {
    return () => {
      eventSourcesRef.current.forEach((es) => es.close());
    };
  }, []);

  // 유효한 토픽 키인지 확인
  const isValidTopic = topicKey && topicKey in NEWS_TOPICS;
  const topicId = isValidTopic ? NEWS_TOPICS[topicKey] : null;
  const topicLabel = isValidTopic ? TOPIC_LABELS[topicKey] : "뉴스";

  // 통합된 뉴스 로드 함수
  const fetchNews = useCallback(
    async (cursor?: string) => {
      if (!topicId) {
        setError("유효하지 않은 뉴스 페이지 입니다.");
        setLoading(false);
        return;
      }

      const isInitial = !cursor;

      try {
        isInitial ? setLoading(true) : setLoadingMore(true);
        if (isInitial) setError(null);

        const response = await newsApi.getNewsByTopic({
          topicId,
          cursor,
          limit: 10,
        });

        if (response.success) {
          const {
            news: newNews,
            nextCursor: newCursor,
            hasNextPage: hasMore,
          } = response.data;

          // 상태 업데이트
          setNews((prev) => (isInitial ? newNews : [...prev, ...newNews]));
          setNextCursor(newCursor);
          setHasNextPage(hasMore);

          // 이미지 추출 작업 예약 및 SSE 스트림 연결
          const urls = newNews.map((item) => item.link);
          if (urls.length > 0) {
            try {
              const jobResponse = await newsApi.createJob({ urls });
              const jobId = jobResponse.data.jobId;

              // SSE 스트림 연결
              const eventSource = streamNewsImages(jobId, {
                onSuccess: (result) => {
                  // rssUrl로 매칭하여 thumbnail 업데이트
                  setNews((prev) =>
                    prev.map((item) =>
                      item.link === result.rssUrl
                        ? { ...item, thumbnail: result.thumbnail }
                        : item
                    )
                  );
                },
                onError: (error) => {
                  console.warn(
                    "뉴스 썸네일 이미지 추출 실패:",
                    error.rssUrl,
                    error.message
                  );
                },
              });

              // EventSource 추적 (cleanup용)
              eventSourcesRef.current.push(eventSource);
            } catch (err) {
              console.error("이미지 추출 작업 실패");
            }
          }
        } else if (isInitial) {
          setError("뉴스를 불러오는데 실패했습니다.");
        }
      } catch (err) {
        if (isInitial) {
          setError("뉴스를 불러오는데 실패했습니다.");
        } else {
          console.error("추가 뉴스 로드 실패");
        }
      } finally {
        isInitial ? setLoading(false) : setLoadingMore(false);
      }
    },
    [topicId]
  );

  // 초기 뉴스 로드
  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  // 추가 뉴스 로드 함수
  const loadMore = useCallback(() => {
    if (nextCursor && !loadingMore) {
      fetchNews(nextCursor);
    }
  }, [fetchNews, nextCursor, loadingMore]);

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
  }, [hasNextPage, loadingMore, loadMore, loading]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        <LoadingState message="뉴스를 불러오는 중입니다." />
      </div>
    );
  }

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
      />

      {/* 무한 스크롤 감지 영역 */}
      <div ref={observerRef} className="py-4">
        {loadingMore && (
          <div className="flex items-center justify-center gap-4 text-muted-foreground">
            <SegmentedSpinner />
            <span>불러오는 중...</span>
          </div>
        )}
        {!hasNextPage && news.length > 0 && (
          <p className="text-center text-sm text-muted-foreground">
            모든 뉴스를 불러왔습니다.
          </p>
        )}
      </div>
    </div>
  );
}
