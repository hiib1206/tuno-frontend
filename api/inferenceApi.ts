import {
  InferenceHistoryItem,
  InferenceModelType,
  InferenceStatus,
  parseInferenceHistoryItem,
  parseSnapbackResult,
  SnapbackResult
} from "@/types/Inference";
import { AxiosResponseHeaders, RawAxiosResponseHeaders } from "axios";
import apiClient from "./apiClient";

/** Axios 응답 헤더 타입 */
export type ResponseHeaders = AxiosResponseHeaders | RawAxiosResponseHeaders;

/** Snapback 추론 요청 파라미터 */
export interface SnapbackRequest {
  /** 종목 코드 */
  ticker: string;
  /** 기준일 (YYYY-MM-DD) */
  date?: string;
}

/** Snapback 추론 응답 */
export interface SnapbackResponse {
  success: boolean;
  statusCode: number;
  message: string;
  /** 추론 결과 */
  data: SnapbackResult;
  /** 응답 헤더 */
  headers: ResponseHeaders;
}

/** Quant Signal 추론 요청 파라미터 */
export interface QuantSignalRequest {
  /** 종목 코드 */
  ticker: string;
  /** 기준일 (YYYY-MM-DD) */
  date?: string;
}

/** Quant Signal 추론 응답 (202 Accepted - 비동기) */
export interface QuantSignalResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    /** 추론 이력 ID */
    historyId: string;
  };
  /** 응답 헤더 */
  headers: ResponseHeaders;
}

/** AI 추론 이력 조회 쿼리 파라미터 */
export interface InferenceHistoryQueryParams {
  /** 페이지네이션 커서 */
  cursor?: string;
  /** 조회 개수 */
  limit?: number;
  /** 모델 타입 필터 */
  model_type?: InferenceModelType;
  /** 종목 코드 필터 */
  ticker?: string;
  /** 최근 N일 필터 */
  days?: number;
  /** 상태 필터 */
  status?: InferenceStatus;
  /** 전체 조회 여부 */
  all?: boolean;
}

/** AI 추론 이력 목록 조회 응답 */
export interface InferenceHistoryResponse {
  success: boolean;
  message: string;
  data: {
    /** 추론 이력 목록 */
    items: InferenceHistoryItem[];
    /** 다음 페이지 커서 */
    nextCursor: string | null;
    /** 다음 페이지 존재 여부 */
    hasNext: boolean;
  } | null;
}

/** AI 추론 이력 단건 조회 응답 */
export interface InferenceHistoryItemResponse {
  success: boolean;
  message: string;
  /** 추론 이력 데이터 (없으면 null) */
  data: InferenceHistoryItem | null;
}

/** AI 추론 이력 삭제 응답 */
export interface DeleteInferenceHistoryResponse {
  success: boolean;
  message: string;
}

/**
 * AI 추론 관련 API
 *
 * @remarks
 * Snapback, Quant Signal 추론 요청 및 추론 이력 관리를 처리한다.
 */
const inferenceApi = {
  /**
   * Snapback 추론을 요청한다.
   *
   * @param params - 추론 요청 파라미터
   */
  snapback: async (params: SnapbackRequest): Promise<SnapbackResponse> => {
    const body: SnapbackRequest = {
      ticker: params.ticker,
      ...(params.date ? { date: params.date } : {}),
    };
    const response = await apiClient.post("/api/inference/snapback", body);
    return {
      success: response.data.success,
      statusCode: response.data.statusCode,
      message: response.data.message,
      data: parseSnapbackResult(response.data.data),
      headers: response.headers,
    };
  },

  /**
   * Quant Signal 추론을 요청한다.
   *
   * @remarks
   * 비동기로 처리되며, 완료 시 알림을 받는다.
   *
   * @param params - 추론 요청 파라미터
   */
  quantSignal: async (
    params: QuantSignalRequest
  ): Promise<QuantSignalResponse> => {
    const body: QuantSignalRequest = {
      ticker: params.ticker,
      ...(params.date ? { date: params.date } : {}),
    };
    const response = await apiClient.post("/api/inference/quant-signal", body);
    return {
      success: response.data.success,
      statusCode: response.data.statusCode,
      message: response.data.message,
      data: response.data.data,
      headers: response.headers,
    };
  },

  /**
   * AI 추론 이력 목록을 조회한다.
   *
   * @param params - 쿼리 파라미터
   */
  getHistory: async (
    params?: InferenceHistoryQueryParams
  ): Promise<InferenceHistoryResponse> => {
    const response = await apiClient.get("/api/inference/history", { params });
    const rawData = response.data.data;
    return {
      success: response.data.success,
      message: response.data.message,
      data: rawData
        ? {
          items: rawData.items.map(parseInferenceHistoryItem),
          nextCursor: rawData.nextCursor,
          hasNext: rawData.hasNext,
        }
        : null,
    };
  },

  /**
   * AI 추론 이력을 단건 조회한다.
   *
   * @param id - 추론 이력 ID
   */
  getHistoryById: async (id: string): Promise<InferenceHistoryItemResponse> => {
    const response = await apiClient.get(`/api/inference/history/${id}`);
    return {
      success: response.data.success,
      message: response.data.message,
      data: response.data.data ? parseInferenceHistoryItem(response.data.data) : null,
    };
  },

  /**
   * AI 추론 이력을 삭제한다 (soft delete).
   *
   * @param id - 추론 이력 ID
   */
  deleteHistory: async (id: string): Promise<DeleteInferenceHistoryResponse> => {
    const response = await apiClient.delete(`/api/inference/history/${id}`);
    return {
      success: response.data.success,
      message: response.data.message,
    };
  },
};

export default inferenceApi;
