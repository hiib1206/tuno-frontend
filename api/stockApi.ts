import {
  Candle,
  ExchangeCode,
  FinancialSummary,
  MarketCode,
  StockInfo,
  StockOrderbookData,
  StockQuote,
  StockSearchQueryParams,
  StockSearchResult,
  WatchlistItem,
} from "@/types/Stock";
import apiClient from "./apiClient";

// 재무 데이터 조회 쿼리 파라미터 타입
type FinancialsQueryParams = {
  period?: "y" | "q"; // y: 연간, q: 분기
  limit?: number; // 조회할 데이터 개수 (최소 1, 기본값 4)
  order?: "asc" | "desc"; // 정렬 방향 (기본값 "desc")
};
// 재무 데이터 조회 응답 타입
type FinancialsResult = {
  success: boolean;
  message: string;
  data: FinancialSummary[];
};

// 종목 정보 조회 쿼리 파라미터 타입
type StockInfoQueryParams = {
  market: MarketCode; // 시장 코드 (KR: 국내, US: 미국)
  exchange: ExchangeCode; // 거래소 코드 (KP, KQ, NAS, NYS, AMS)
};
// 종목 정보 조회 응답 타입
type StockInfoResult = {
  success: boolean;
  message: string;
  data: StockInfo | null;
};

// 캔들 데이터 조회 쿼리 파라미터 타입
type CandleQueryParams = {
  market: "KR" | "US"; // 시장 코드 (대문자)
  exchange: string; // 거래소 코드 (KP, KQ, NAS, NYS, AMS 등)
  code: string; // 종목 코드
  interval: "1d"; // 봉 단위 (현재는 일봉만 지원)
  limit?: number; // 조회할 봉 개수 (기본값: 250, 최대: 1000)
  from?: number; // 시작 시각 (UTC seconds, Unix timestamp)
  to?: number; // 종료 시각 (UTC seconds, Unix timestamp)
};

// 캔들 데이터 조회 응답 타입
type CandleResult = {
  success: boolean;
  message: string;
  data: {
    market: string;
    code: string;
    interval: string;
    count: number;
    candles: Candle[];
  } | null;
};

// 주식 검색 응답 타입 (data 구조 포함)
type StockSearchResultResponse = {
  success: boolean;
  message: string;
  data: {
    query: string;
    count: number;
    results: StockSearchResult[];
  } | null;
};

// 현재가 시세(Quote) 조회 쿼리 파라미터 타입
type StockQuoteQueryParams = {
  market_division_code: "J" | "NX" | "UN";
  period_type: "D" | "W" | "M";
};
// 현재가 시세(Quote) 조회 응답 타입
type StockQuoteResult = {
  success: boolean;
  message: string;
  data: StockQuote | null;
};

// 관심종목 토글 응답 타입
type WatchlistToggleResult = {
  success: boolean;
  message: string;
  data: {
    isInWatchlist: boolean;
  } | null;
};

// 관심종목 목록 조회 쿼리 파라미터 타입
type WatchlistQueryParams = {
  exchange?: ExchangeCode; // 거래소 코드로 필터링 (선택)
};

// 관심종목 목록 조회 응답 타입
type WatchlistResult = {
  success: boolean;
  message: string;
  data: {
    count: number;
    items: WatchlistItem[];
  } | null;
};

// 관심종목 순서 변경 요청 타입
type WatchlistOrderItem = {
  exchange: ExchangeCode;
  code: string;
};

// 관심종목 순서 변경 응답 타입
type WatchlistOrderResult = {
  success: boolean;
  message: string;
  data: {
    count: number;
  } | null;
};

// 전체 관심종목 삭제 응답 타입
type WatchlistDeleteResult = {
  success: boolean;
  message: string;
  data: {
    deletedCount: number;
  } | null;
};

// 호가 조회 쿼리 파라미터 타입
type OrderbookQueryParams = {
  market_division_code: "J" | "NX" | "UN"; // J: KRX, NX: NXT, UN: 통합
};

// 호가 조회 응답 타입
type OrderbookResult = {
  success: boolean;
  message: string;
  data: StockOrderbookData | null;
};

const stockApi = {
  // 종목 정보 조회 (국내/해외 통합)
  getStockInfo: async (
    code: string,
    params: StockInfoQueryParams
  ): Promise<StockInfoResult> => {
    const response = await apiClient.get(`/api/stock/${code}`, {
      params,
    });
    return {
      success: response.data.success,
      message: response.data.message,
      data: response.data.data as StockInfo | null,
    };
  },

  // 재무 데이터 조회
  getFinancials: async (
    code: string,
    params?: FinancialsQueryParams
  ): Promise<FinancialsResult> => {
    const response = await apiClient.get(`/api/stock/${code}/financials`, {
      params,
    });
    return {
      success: response.data.success,
      message: response.data.message,
      data: response.data.data as FinancialSummary[],
    };
  },

  // 캔들 데이터 조회
  getCandle: async (params: CandleQueryParams): Promise<CandleResult> => {
    const response = await apiClient.get("/api/stock/candle", {
      params,
    });
    return {
      success: response.data.success,
      message: response.data.message,
      data: response.data.data,
    };
  },

  // 현재가 시세(Quote) 조회
  getStockQuote: async (
    code: string,
    params?: StockQuoteQueryParams
  ): Promise<StockQuoteResult> => {
    const response = await apiClient.get(`/api/stock/${code}/quote`, {
      params,
    });
    return {
      success: response.data.success,
      message: response.data.message,
      data: response.data.data as StockQuote | null,
    };
  },

  // 종목 검색
  search: async (
    params: StockSearchQueryParams
  ): Promise<StockSearchResultResponse> => {
    const response = await apiClient.get("/api/stock/search", {
      params,
    });
    return {
      success: response.data.success,
      message: response.data.message,
      data: response.data.data as {
        query: string;
        count: number;
        results: StockSearchResult[];
      } | null,
    };
  },

  // 관심종목 토글 (추가/제거)
  toggleWatchlist: async (
    code: string,
    exchange: ExchangeCode
  ): Promise<WatchlistToggleResult> => {
    const response = await apiClient.post(
      `/api/stock/${code}/watchlist`,
      {},
      {
        params: { exchange },
      }
    );
    return {
      success: response.data.success,
      message: response.data.message,
      data: response.data.data as { isInWatchlist: boolean } | null,
    };
  },

  // 관심종목 목록 조회
  getWatchlist: async (
    params?: WatchlistQueryParams
  ): Promise<WatchlistResult> => {
    const response = await apiClient.get("/api/stock/watchlist", {
      params,
    });
    return {
      success: response.data.success,
      message: response.data.message,
      data: response.data.data as {
        count: number;
        items: WatchlistItem[];
      } | null,
    };
  },

  // 관심종목 순서 변경
  updateWatchlistOrder: async (
    order: WatchlistOrderItem[]
  ): Promise<WatchlistOrderResult> => {
    const response = await apiClient.patch("/api/stock/watchlist/order", {
      order,
    });
    return {
      success: response.data.success,
      message: response.data.message,
      data: response.data.data as { count: number } | null,
    };
  },

  // 전체 관심종목 삭제
  deleteWatchlist: async (): Promise<WatchlistDeleteResult> => {
    const response = await apiClient.delete("/api/stock/watchlist");
    return {
      success: response.data.success,
      message: response.data.message,
      data: response.data.data as { deletedCount: number } | null,
    };
  },

  // 호가 조회
  getOrderbook: async (
    code: string,
    params: OrderbookQueryParams
  ): Promise<OrderbookResult> => {
    const response = await apiClient.get(`/api/stock/${code}/orderbook`, {
      params,
    });
    return {
      success: response.data.success,
      message: response.data.message,
      data: response.data.data as StockOrderbookData | null,
    };
  },
};

export default stockApi;
