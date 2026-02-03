import {
  StockComment,
  StockCommentOpinion,
  parseStockComment,
} from "@/types/StockComment";
import apiClient from "./apiClient";

// 댓글 목록 조회 쿼리 파라미터 타입
type StockCommentListParams = {
  limit?: number; // 최근 N개 (최대 100, 기본값 100)
  order?: "asc" | "desc"; // 정렬 순서 (기본값 "desc")
  opinion?: StockCommentOpinion; // 의견 필터
};

// 댓글 작성 요청 바디 타입
type CreateStockCommentBody = {
  ticker: string; // 종목코드 (최대 9자)
  exchange: string; // 거래소 코드 (최대 4자)
  content: string; // 댓글 내용 (1~1000자)
  opinion: StockCommentOpinion; // 매매 의견
};

// 댓글 작성 응답 타입
type CreateStockCommentResult = {
  success: boolean;
  message: string;
  data: StockComment;
};

// 댓글 수정 요청 바디 타입 (최소 1개 필수)
type UpdateStockCommentBody = {
  content?: string; // 수정할 내용 (1~1000자)
  opinion?: StockCommentOpinion; // 수정할 의견
};

// 댓글 수정 응답 타입
type UpdateStockCommentResult = {
  success: boolean;
  message: string;
  data: StockComment;
};

// 댓글 목록 조회 응답 타입
type StockCommentListResult = {
  success: boolean;
  message: string;
  data: {
    list: StockComment[];
    limit: number;
  };
};

const stockCommentApi = {
  // 종목 댓글 목록 조회
  getComments: async (
    ticker: string,
    params?: StockCommentListParams
  ): Promise<StockCommentListResult> => {
    const response = await apiClient.get(`/api/stock-comment/${ticker}`, {
      params,
    });
    return {
      success: response.data.success,
      message: response.data.message,
      data: {
        list: (response.data.data?.list || []).map((item: any) =>
          parseStockComment(item)
        ),
        limit: response.data.data?.limit ?? 100,
      },
    };
  },

  // 종목 댓글 작성
  createComment: async (
    body: CreateStockCommentBody
  ): Promise<CreateStockCommentResult> => {
    const response = await apiClient.post("/api/stock-comment", body);
    return {
      success: response.data.success,
      message: response.data.message,
      data: parseStockComment(response.data.data),
    };
  },

  // 종목 댓글 수정
  updateComment: async (
    id: string,
    body: UpdateStockCommentBody
  ): Promise<UpdateStockCommentResult> => {
    const response = await apiClient.patch(`/api/stock-comment/${id}`, body);
    return {
      success: response.data.success,
      message: response.data.message,
      data: parseStockComment(response.data.data),
    };
  },

  // 종목 댓글 삭제
  deleteComment: async (id: string) => {
    const response = await apiClient.delete(`/api/stock-comment/${id}`);
    return {
      success: response.data.success,
      message: response.data.message,
    };
  },

  // 본인 종목 댓글 일괄 삭제 (ticker 없으면 전체, 있으면 해당 종목만)
  deleteMyComments: async (ticker?: string) => {
    const response = await apiClient.delete("/api/stock-comment", {
      params: ticker ? { ticker } : undefined,
    });
    return {
      success: response.data.success,
      message: response.data.message,
      data: response.data.data as { deletedCount: number },
    };
  },
};

export default stockCommentApi;
