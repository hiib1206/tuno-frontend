import { NewsTopicId } from "@/lib/community";
import apiClient from "./apiClient";

// 뉴스 아이템 타입
export interface NewsItem {
  id: string;
  title: string;
  source: string;
  link: string;
  pubDate: string;
  thumbnail?: string;
}

// 뉴스 조회 응답 타입
export interface NewsResponse {
  success: boolean;
  message: string;
  data: {
    news: NewsItem[];
    nextCursor: string | null;
    hasNextPage: boolean;
  };
}

// 뉴스 조회 파라미터 타입
export interface GetNewsParams {
  cursor?: string;
  limit?: number;
}

// 토픽별 뉴스 조회 파라미터 타입
export interface GetNewsByTopicParams {
  topicId: NewsTopicId | string; // 토픽 ID (Google News 토픽 ID)
  cursor?: string;
  limit?: number; // 1~10, 기본값 10
}

// 뉴스 검색 파라미터 타입
export interface GetNewsSearchParams {
  q: string; // 검색어 (1~200자, 필수)
  cursor?: string; // 페이지네이션 커서
  limit?: number; // 1~10, 기본값 10
}

// 뉴스 이미지 추출 작업 요청 타입
export interface CreateNewsJobParams {
  urls: string[]; // Google News RSS URL 배열 (1~20개)
}

// 뉴스 이미지 추출 작업 응답 타입
export interface CreateNewsJobResponse {
  success: boolean;
  message: string;
  data: {
    jobId: string; // UUID
  };
}

// 뉴스 이미지 추출 결과 타입 (SSE success 이벤트)
export interface NewsImageResult {
  rssUrl: string;
  originalUrl: string;
  thumbnail: string;
}

// 뉴스 이미지 추출 에러 타입 (SSE error 이벤트)
export interface NewsImageError {
  rssUrl: string;
  message: string;
}

// SSE 스트리밍 콜백 타입
export interface StreamNewsImagesCallbacks {
  onSuccess: (result: NewsImageResult) => void;
  onError?: (error: NewsImageError) => void;
  onCompleted?: () => void;
}

// SSE 스트리밍 함수
export function streamNewsImages(
  jobId: string,
  callbacks: StreamNewsImagesCallbacks
): EventSource {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  const eventSource = new EventSource(
    `${baseUrl}/api/news/jobs/${jobId}/stream`
  );

  // 개별 성공
  eventSource.addEventListener("success", (e) => {
    const result: NewsImageResult = JSON.parse((e as MessageEvent).data);
    callbacks.onSuccess(result);
  });

  // 개별 실패
  eventSource.addEventListener("error", (e) => {
    const error: NewsImageError = JSON.parse((e as MessageEvent).data);
    callbacks.onError?.(error);
  });

  // 모든 작업 완료
  eventSource.addEventListener("completed", () => {
    eventSource.close();
    callbacks.onCompleted?.();
  });

  // 연결 에러 (네트워크 문제 등)
  // 주의: EventSource는 자동으로 재연결을 시도하므로
  // onerror에서 close()를 호출하면 안 됩니다.
  // completed 이벤트를 받을 때까지 연결을 유지해야 합니다.
  eventSource.onerror = () => {
    // close() 제거 - completed 이벤트를 받을 때까지 연결 유지
    // EventSource가 자동으로 재연결을 시도하도록 함
  };

  return eventSource;
}

const newsApi = {
  // 뉴스 목록 조회 (커서 기반 페이지네이션)
  getNews: async (cursor?: string, limit?: number): Promise<NewsResponse> => {
    const queryParams = new URLSearchParams();
    if (cursor) queryParams.append("cursor", cursor);
    if (limit) queryParams.append("limit", String(limit));

    const queryString = queryParams.toString();
    const url = `/api/news${queryString ? `?${queryString}` : ""}`;

    const response = await apiClient.get(url);
    return {
      success: response.data.success,
      message: response.data.message,
      data: {
        news: response.data.data.news,
        nextCursor: response.data.data.nextCursor,
        hasNextPage: response.data.data.hasNextPage,
      },
    };
  },

  // 토픽별 뉴스 조회 (커서 기반 페이지네이션)
  getNewsByTopic: async ({
    topicId,
    cursor,
    limit,
  }: GetNewsByTopicParams): Promise<NewsResponse> => {
    const queryParams = new URLSearchParams();
    if (cursor) queryParams.append("cursor", cursor);
    if (limit) queryParams.append("limit", String(limit));

    const queryString = queryParams.toString();
    const url = `/api/news/${encodeURIComponent(topicId)}${queryString ? `?${queryString}` : ""
      }`;

    const response = await apiClient.get(url);
    return {
      success: response.data.success,
      message: response.data.message,
      data: {
        news: response.data.data.news,
        nextCursor: response.data.data.nextCursor,
        hasNextPage: response.data.data.hasNextPage,
      },
    };
  },

  // 뉴스 검색 (커서 기반 페이지네이션)
  searchNews: async ({
    q,
    cursor,
    limit,
  }: GetNewsSearchParams): Promise<NewsResponse> => {
    const queryParams = new URLSearchParams();
    queryParams.append("q", q.trim()); // 검색어는 필수, 앞뒤 공백 제거
    if (cursor) queryParams.append("cursor", cursor);
    if (limit) queryParams.append("limit", String(limit));

    const queryString = queryParams.toString();
    const url = `/api/news/search?${queryString}`;

    const response = await apiClient.get(url);
    return {
      success: response.data.success,
      message: response.data.message,
      data: {
        news: response.data.data.news,
        nextCursor: response.data.data.nextCursor,
        hasNextPage: response.data.data.hasNextPage,
      },
    };
  },

  // 뉴스 이미지 추출 작업 예약
  createJob: async ({
    urls,
  }: CreateNewsJobParams): Promise<CreateNewsJobResponse> => {
    const response = await apiClient.post("/api/news/jobs", { urls });
    return {
      success: response.data.success,
      message: response.data.message,
      data: {
        jobId: response.data.data.jobId,
      },
    };
  },
};

export default newsApi;
