import {
  StockComment,
  StockCommentOpinion,
  parseStockComment,
} from "@/types/StockComment";
import apiClient from "./apiClient";

/** 종목 댓글 목록 조회 쿼리 파라미터 */
type StockCommentListParams = {
  /** 최근 N개 (최대 100, 기본값 100) */
  limit?: number;
  /** 정렬 순서 (기본값 "desc") */
  order?: "asc" | "desc";
  /** 의견 필터 */
  opinion?: StockCommentOpinion;
};

/** 종목 댓글 작성 요청 바디 */
type CreateStockCommentBody = {
  /** 종목코드 (최대 9자) */
  ticker: string;
  /** 거래소 코드 (최대 4자) */
  exchange: string;
  /** 댓글 내용 (1~1000자) */
  content: string;
  /** 매매 의견 */
  opinion: StockCommentOpinion;
};

/** 종목 댓글 작성 응답 */
type CreateStockCommentResult = {
  success: boolean;
  message: string;
  /** 생성된 댓글 */
  data: StockComment;
};

/** 종목 댓글 수정 요청 바디 (최소 1개 필수) */
type UpdateStockCommentBody = {
  /** 수정할 내용 (1~1000자) */
  content?: string;
  /** 수정할 의견 */
  opinion?: StockCommentOpinion;
};

/** 종목 댓글 수정 응답 */
type UpdateStockCommentResult = {
  success: boolean;
  message: string;
  /** 수정된 댓글 */
  data: StockComment;
};

/** 종목 댓글 목록 조회 응답 */
type StockCommentListResult = {
  success: boolean;
  message: string;
  data: {
    /** 댓글 목록 */
    list: StockComment[];
    /** 조회 개수 */
    limit: number;
  };
};

/**
 * 종목 댓글 관련 API
 *
 * @remarks
 * 종목별 댓글 CRUD를 처리한다.
 */
const stockCommentApi = {
  /**
   * 종목 댓글 목록을 조회한다.
   *
   * @param ticker - 종목 코드
   * @param params - 쿼리 파라미터
   */
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

  /**
   * 종목 댓글을 작성한다.
   *
   * @param body - 댓글 작성 데이터
   */
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

  /**
   * 종목 댓글을 수정한다.
   *
   * @param id - 댓글 ID
   * @param body - 수정할 데이터
   */
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

  /**
   * 종목 댓글을 삭제한다.
   *
   * @param id - 댓글 ID
   */
  deleteComment: async (id: string) => {
    const response = await apiClient.delete(`/api/stock-comment/${id}`);
    return {
      success: response.data.success,
      message: response.data.message,
    };
  },

  /**
   * 본인이 작성한 종목 댓글을 일괄 삭제한다.
   *
   * @param ticker - 종목 코드 (없으면 전체 삭제)
   */
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
