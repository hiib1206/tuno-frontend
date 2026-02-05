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

export type ResponseHeaders = AxiosResponseHeaders | RawAxiosResponseHeaders;

export interface SnapbackRequest {
  ticker: string;
  date?: string;
}

export interface SnapbackResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: SnapbackResult;
  headers: ResponseHeaders;
}

export interface QuantSignalRequest {
  ticker: string;
  date?: string;
}

// Quant Signal 추론 요청 응답 (202 Accepted - 비동기)
export interface QuantSignalResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    historyId: string;
  };
  headers: ResponseHeaders;
}

// AI 추론 이력 조회
export interface InferenceHistoryQueryParams {
  cursor?: string;
  limit?: number;
  model_type?: InferenceModelType;
  ticker?: string;
  days?: number;
  status?: InferenceStatus;
  all?: boolean;
}

export interface InferenceHistoryResponse {
  success: boolean;
  message: string;
  data: {
    items: InferenceHistoryItem[];
    nextCursor: string | null;
    hasNext: boolean;
  } | null;
}

// AI 추론 이력 단건 조회
export interface InferenceHistoryItemResponse {
  success: boolean;
  message: string;
  data: InferenceHistoryItem | null;
}

// AI 추론 이력 삭제
export interface DeleteInferenceHistoryResponse {
  success: boolean;
  message: string;
}

const inferenceApi = {
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

  // AI 추론 이력 조회
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

  // AI 추론 이력 단건 조회
  getHistoryById: async (id: string): Promise<InferenceHistoryItemResponse> => {
    const response = await apiClient.get(`/api/inference/history/${id}`);
    return {
      success: response.data.success,
      message: response.data.message,
      data: response.data.data ? parseInferenceHistoryItem(response.data.data) : null,
    };
  },

  // AI 추론 이력 삭제 (soft delete)
  deleteHistory: async (id: string): Promise<DeleteInferenceHistoryResponse> => {
    const response = await apiClient.delete(`/api/inference/history/${id}`);
    return {
      success: response.data.success,
      message: response.data.message,
    };
  },
};

export default inferenceApi;
