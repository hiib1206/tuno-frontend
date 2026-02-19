import { NewsTopicId } from "@/lib/community";
import apiClient from "./apiClient";

/** 뉴스 아이템 */
export interface NewsItem {
  /** 뉴스 ID */
  id: string;
  /** 뉴스 제목 */
  title: string;
  /** 출처 */
  source: string;
  /** 기사 링크 */
  link: string;
  /** 발행일 */
  pubDate: string;
  /** 썸네일 이미지 URL */
  thumbnail?: string;
}

/** 뉴스 조회 응답 */
export interface NewsResponse {
  success: boolean;
  message: string;
  data: {
    /** 뉴스 목록 */
    news: NewsItem[];
    /** 다음 페이지 커서 */
    nextCursor: string | null;
    /** 다음 페이지 존재 여부 */
    hasNextPage: boolean;
  };
}

/** 뉴스 조회 파라미터 */
export interface GetNewsParams {
  /** 페이지네이션 커서 */
  cursor?: string;
  /** 조회 개수 */
  limit?: number;
}

/** 토픽별 뉴스 조회 파라미터 */
export interface GetNewsByTopicParams {
  /** 토픽 ID (Google News 토픽 ID) */
  topicId: NewsTopicId | string;
  /** 페이지네이션 커서 */
  cursor?: string;
  /** 조회 개수 (1~10, 기본값 10) */
  limit?: number;
}

/** 뉴스 검색 파라미터 */
export interface GetNewsSearchParams {
  /** 검색어 (1~200자, 필수) */
  q: string;
  /** 페이지네이션 커서 */
  cursor?: string;
  /** 조회 개수 (1~10, 기본값 10) */
  limit?: number;
}

/** 뉴스 이미지 추출 작업 요청 파라미터 */
export interface CreateNewsJobParams {
  /** Google News RSS URL 배열 (1~20개) */
  urls: string[];
}

/** 뉴스 이미지 추출 작업 응답 */
export interface CreateNewsJobResponse {
  success: boolean;
  message: string;
  data: {
    /** 작업 ID (UUID) */
    jobId: string;
  };
}

/** 뉴스 이미지 추출 결과 (SSE success 이벤트) */
export interface NewsImageResult {
  /** RSS URL */
  rssUrl: string;
  /** 원본 기사 URL */
  originalUrl: string;
  /** 추출된 썸네일 URL */
  thumbnail: string;
}

/** 뉴스 이미지 추출 에러 (SSE error 이벤트) */
export interface NewsImageError {
  /** RSS URL */
  rssUrl: string;
  /** 에러 메시지 */
  message: string;
}

/** 뉴스 이미지 SSE 스트리밍 콜백 */
export interface StreamNewsImagesCallbacks {
  /** 개별 이미지 추출 성공 시 호출 */
  onSuccess: (result: NewsImageResult) => void;
  /** 개별 이미지 추출 실패 시 호출 */
  onError?: (error: NewsImageError) => void;
  /** 모든 작업 완료 시 호출 */
  onCompleted?: () => void;
}

/**
 * 뉴스 이미지 추출 SSE 스트림을 연결한다.
 *
 * @remarks
 * EventSource를 사용하여 서버로부터 실시간으로 이미지 추출 결과를 수신한다.
 * 연결 에러 시 자동 재연결을 시도하며, completed 이벤트를 받을 때까지 연결을 유지한다.
 *
 * @param jobId - 이미지 추출 작업 ID
 * @param callbacks - 이벤트 콜백
 * @returns EventSource 인스턴스 (수동 종료 시 close() 호출)
 */
export function streamNewsImages(
  jobId: string,
  callbacks: StreamNewsImagesCallbacks
): EventSource {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  const eventSource = new EventSource(
    `${baseUrl}/api/news/jobs/${jobId}/stream`
  );

  eventSource.addEventListener("success", (e) => {
    const result: NewsImageResult = JSON.parse((e as MessageEvent).data);
    callbacks.onSuccess(result);
  });

  eventSource.addEventListener("error", (e) => {
    const error: NewsImageError = JSON.parse((e as MessageEvent).data);
    callbacks.onError?.(error);
  });

  eventSource.addEventListener("completed", () => {
    eventSource.close();
    callbacks.onCompleted?.();
  });

  // EventSource는 자동으로 재연결을 시도하므로 onerror에서 close()를 호출하지 않는다.
  eventSource.onerror = () => {};

  return eventSource;
}

/**
 * 뉴스 관련 API
 *
 * @remarks
 * 뉴스 목록 조회, 토픽별 조회, 검색, 이미지 추출 작업을 처리한다.
 */
const newsApi = {
  /**
   * 뉴스 목록을 조회한다.
   *
   * @param cursor - 페이지네이션 커서
   * @param limit - 조회 개수
   */
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

  /**
   * 토픽별 뉴스를 조회한다.
   *
   * @param params - 조회 파라미터
   */
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

  /**
   * 뉴스를 검색한다.
   *
   * @param params - 검색 파라미터
   */
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

  /**
   * 뉴스 이미지 추출 작업을 예약한다.
   *
   * @param params - 작업 요청 파라미터
   */
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
