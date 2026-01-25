import { SnapbackResult } from "@/types/Inference";
import apiClient from "./apiClient";

export interface SnapbackRequest {
  ticker: string;
  date?: string;
}

export interface SnapbackResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: SnapbackResult;
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
      data: response.data.data as SnapbackResult,
    };
  },
};

export default inferenceApi;
