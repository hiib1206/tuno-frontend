"use client";

import newsApi, {
  NewsItem,
  NewsResponse,
  streamNewsImages,
} from "@/api/newsApi";
import { useCallback, useEffect, useRef, useState } from "react";

interface UseNewsOptions {
  /** 페이지네이션 활성화 여부 */
  enablePagination?: boolean;
  /** 이미지 추출 활성화 여부 */
  enableImageExtraction?: boolean;
  /** 자동 초기 로드 여부 */
  autoFetch?: boolean;
  /** 상태 리셋 및 재요청을 위한 키 (변경 시 초기화됨) */
  key?: string;
}

interface UseNewsReturn {
  news: NewsItem[];
  loading: boolean;
  error: string | null;
  // 페이지네이션 관련 (enablePagination이 false일 때는 사용하지 않음)
  loadingMore: boolean;
  nextCursor: string | null;
  hasNextPage: boolean;
  loadMore: () => void;
  // 이미지 추출 관련 (enableImageExtraction이 false일 때는 빈 Set)
  failedImageUrls: Set<string>;
  enableImageExtraction: boolean;
}

/**
 * 뉴스 데이터를 가져오고 관리하는 커스텀 훅
 * @param fetchFn 뉴스를 가져오는 함수 (cursor를 받아서 NewsResponse 반환)
 * @param options 옵션 설정
 */
export function useNews(
  fetchFn: (cursor?: string) => Promise<NewsResponse>,
  options?: UseNewsOptions
): UseNewsReturn {
  const {
    enablePagination = false,
    enableImageExtraction = true,
    autoFetch = true,
    key,
  } = options || {};

  // 기본 상태
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 페이지네이션 상태
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);

  // 이미지 추출 관련 상태
  const [failedImageUrls, setFailedImageUrls] = useState<Set<string>>(
    new Set()
  );

  // EventSource 관리 (페이지네이션 시 여러 개 가능)
  const eventSourcesRef = useRef<EventSource[]>([]);

  // 이미지 추출 작업 실행
  const extractImages = useCallback(
    async (newsItems: NewsItem[]) => {
      if (!enableImageExtraction || newsItems.length === 0) return;

      const urls = newsItems.map((item) => item.link);
      if (urls.length === 0) return;

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
            // 실패한 URL을 Set에 추가하여 스켈레톤 제거
            if (enableImageExtraction) {
              console.warn("이미지 추출 실패:", error);
              setFailedImageUrls((prev) => new Set(prev).add(error.rssUrl));
            }
          },
          onCompleted: () => {
            // EventSource는 이미 streamNewsImages 내부에서 닫혔으므로
            // ref에서 제거
            eventSourcesRef.current = eventSourcesRef.current.filter(
              (es) => es !== eventSource
            );
          },
        });

        // EventSource 추적 (cleanup용)
        eventSourcesRef.current.push(eventSource);
      } catch (err) {
        console.error("이미지 추출 작업 실패:", err);
      }
    },
    [enableImageExtraction]
  );

  // 뉴스 가져오기
  const fetchNews = useCallback(
    async (cursor?: string) => {
      const isInitial = !cursor;

      try {
        if (isInitial) {
          setLoading(true);
          setError(null);
        } else {
          setLoadingMore(true);
        }

        const response = await fetchFn(cursor);

        if (response.success) {
          const {
            news: newNews,
            nextCursor: newCursor,
            hasNextPage: hasMore,
          } = response.data;

          // 상태 업데이트
          if (enablePagination && !isInitial) {
            // 페이지네이션: 기존 뉴스에 추가
            setNews((prev) => [...prev, ...newNews]);
          } else {
            // 초기 로드 또는 페이지네이션 없음: 교체
            setNews(newNews);
          }

          if (enablePagination) {
            setNextCursor(newCursor);
            setHasNextPage(hasMore);
          }

          // 이미지 추출 작업 실행
          await extractImages(newNews);
        } else if (isInitial) {
          setError("뉴스를 불러오는데 실패했습니다.");
        }
      } catch (err: any) {
        if (isInitial) {
          setError("뉴스를 불러오는데 실패했습니다.");
          setNews([]);
        } else {
          console.error("추가 뉴스 로드 실패");
        }
      } finally {
        if (isInitial) {
          setLoading(false);
        } else {
          setLoadingMore(false);
        }
      }
    },
    [fetchFn, enablePagination, extractImages]
  );

  // 추가 뉴스 로드 (페이지네이션)
  const loadMore = useCallback(() => {
    if (enablePagination && nextCursor && !loadingMore && hasNextPage) {
      fetchNews(nextCursor);
    }
  }, [enablePagination, nextCursor, loadingMore, hasNextPage, fetchNews]);

  // 초기 로드 (key가 변경되면 상태 초기화 후 재요청)
  useEffect(() => {
    if (autoFetch) {
      // key가 변경되면 상태 초기화
      setNews([]);
      setNextCursor(null);
      setHasNextPage(false);
      setFailedImageUrls(new Set());
      fetchNews();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoFetch, key]);

  // 컴포넌트 언마운트 시 모든 EventSource 정리
  useEffect(() => {
    return () => {
      eventSourcesRef.current.forEach((es) => {
        if (es.readyState !== EventSource.CLOSED) {
          es.close();
        }
      });
      eventSourcesRef.current = [];
    };
  }, []);

  return {
    news,
    loading,
    error,
    loadingMore,
    nextCursor,
    hasNextPage,
    loadMore,
    failedImageUrls,
    enableImageExtraction,
  };
}
