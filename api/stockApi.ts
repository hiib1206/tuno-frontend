import {
  Candle,
  ExchangeCode,
  FinancialSummary,
  MarketCode,
  StockInfo,
  StockOrderbookData,
  StockQuote,
  StockSearchQueryParams,
  IndexMinuteCandle,
  StockSearchResult,
  WatchlistItem,
} from "@/types/Stock";
import apiClient from "./apiClient";

/** 재무 데이터 조회 쿼리 파라미터 */
type FinancialsQueryParams = {
  /** 기간 구분 (y: 연간, q: 분기) */
  period?: "y" | "q";
  /** 조회할 데이터 개수 (최소 1, 기본값 4) */
  limit?: number;
  /** 정렬 방향 (기본값 "desc") */
  order?: "asc" | "desc";
};

/** 재무 데이터 조회 응답 */
type FinancialsResult = {
  success: boolean;
  message: string;
  data: FinancialSummary[];
};

/** 종목 정보 조회 쿼리 파라미터 */
type StockInfoQueryParams = {
  /** 시장 코드 (KR: 국내, US: 미국) */
  market: MarketCode;
  /** 거래소 코드 (KP, KQ, NAS, NYS, AMS) */
  exchange: ExchangeCode;
};

/** 종목 정보 조회 응답 */
type StockInfoResult = {
  success: boolean;
  message: string;
  data: StockInfo | null;
};

/** 지수 분봉 차트 조회 쿼리 파라미터 */
type IndexMinuteChartQueryParams = {
  /** 시간 간격(초), 기본값 "60" */
  interval?: "30" | "60" | "600" | "3600";
  /** 과거 데이터 포함 여부 */
  include_past_data?: "true" | "false";
  /** 시간외 데이터 제외 여부 */
  exclude_after_hours?: "true" | "false";
};

/** 지수 분봉 차트 조회 응답 */
type IndexMinuteChartResult = {
  success: boolean;
  message: string;
  data: IndexMinuteCandle[] | null;
};

/** 지수 캔들 데이터 조회 쿼리 파라미터 */
type IndexCandleQueryParams = {
  /** 업종 코드 (0001: KOSPI, 1001: KOSDAQ) */
  code: string;
  /** 봉 단위 (일, 주, 월, 년) */
  interval: "1d" | "1w" | "1m" | "1y";
  /** 조회 건수 (1~1000) */
  limit?: number;
  /** 시작일 (Unix timestamp, 초 단위) */
  from?: number;
  /** 종료일 (Unix timestamp, 초 단위) */
  to?: number;
};

/** 지수 캔들 데이터 조회 응답 */
type IndexCandleResult = {
  success: boolean;
  message: string;
  data: {
    code: string;
    interval: string;
    count: number;
    candles: Candle[];
  } | null;
};

/** 캔들 데이터 조회 쿼리 파라미터 */
type CandleQueryParams = {
  /** 시장 코드 (대문자) */
  market: "KR" | "US";
  /** 거래소 코드 (KP, KQ, NAS, NYS, AMS 등) */
  exchange: string;
  /** 종목 코드 */
  code: string;
  /** 봉 단위 (현재는 일봉만 지원) */
  interval: "1d";
  /** 조회할 봉 개수 (기본값: 250, 최대: 1000) */
  limit?: number;
  /** 시작 시각 (UTC seconds, Unix timestamp) */
  from?: number;
  /** 종료 시각 (UTC seconds, Unix timestamp) */
  to?: number;
};

/** 캔들 데이터 조회 응답 */
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

/** 주식 검색 응답 */
type StockSearchResultResponse = {
  success: boolean;
  message: string;
  data: {
    query: string;
    count: number;
    results: StockSearchResult[];
  } | null;
};

/** 현재가 시세(Quote) 조회 쿼리 파라미터 */
type StockQuoteQueryParams = {
  /** 시장 구분 코드 (J: KRX, NX: NXT, UN: 통합) */
  market_division_code: "J" | "NX" | "UN";
  /** 기간 타입 (D: 일, W: 주, M: 월) */
  period_type: "D" | "W" | "M";
};

/** 현재가 시세(Quote) 조회 응답 */
type StockQuoteResult = {
  success: boolean;
  message: string;
  data: StockQuote | null;
};

/** 관심종목 토글 응답 */
type WatchlistToggleResult = {
  success: boolean;
  message: string;
  data: {
    isInWatchlist: boolean;
  } | null;
};

/** 관심종목 목록 조회 쿼리 파라미터 */
type WatchlistQueryParams = {
  /** 거래소 코드로 필터링 (선택) */
  exchange?: ExchangeCode;
};

/** 관심종목 목록 조회 응답 */
type WatchlistResult = {
  success: boolean;
  message: string;
  data: {
    count: number;
    items: WatchlistItem[];
  } | null;
};

/** 관심종목 순서 변경 요청 항목 */
type WatchlistOrderItem = {
  exchange: ExchangeCode;
  code: string;
};

/** 관심종목 순서 변경 응답 */
type WatchlistOrderResult = {
  success: boolean;
  message: string;
  data: {
    count: number;
  } | null;
};

/** 전체 관심종목 삭제 응답 */
type WatchlistDeleteResult = {
  success: boolean;
  message: string;
  data: {
    deletedCount: number;
  } | null;
};

/** 호가 조회 쿼리 파라미터 */
type OrderbookQueryParams = {
  /** 시장 구분 코드 (J: KRX, NX: NXT, UN: 통합) */
  market_division_code: "J" | "NX" | "UN";
};

/** 호가 조회 응답 */
type OrderbookResult = {
  success: boolean;
  message: string;
  data: StockOrderbookData | null;
};

/**
 * 주식 관련 API
 *
 * @remarks
 * 종목 정보, 시세, 캔들, 관심종목 등을 조회/관리한다.
 */
const stockApi = {
  /**
   * 종목 정보를 조회한다.
   *
   * @param code - 종목 코드
   * @param params - 시장/거래소 정보
   */
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

  /**
   * 재무 데이터를 조회한다.
   *
   * @param code - 종목 코드
   * @param params - 조회 옵션
   */
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

  /**
   * 지수 분봉 차트를 조회한다.
   *
   * @param industryCode - 업종 코드
   * @param params - 조회 옵션
   */
  getIndexMinuteChart: async (
    industryCode: string,
    params?: IndexMinuteChartQueryParams
  ): Promise<IndexMinuteChartResult> => {
    const response = await apiClient.get(
      `/api/stock/index/${industryCode}/minute-chart`,
      { params }
    );
    return {
      success: response.data.success,
      message: response.data.message,
      data: response.data.data as IndexMinuteCandle[] | null,
    };
  },

  /**
   * 지수 캔들 데이터를 조회한다.
   *
   * @param params - 조회 파라미터
   */
  getIndexCandle: async (
    params: IndexCandleQueryParams
  ): Promise<IndexCandleResult> => {
    const response = await apiClient.get("/api/stock/index/candle", {
      params,
    });
    return {
      success: response.data.success,
      message: response.data.message,
      data: response.data.data,
    };
  },

  /**
   * 종목 캔들 데이터를 조회한다.
   *
   * @param params - 조회 파라미터
   */
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

  /**
   * 현재가 시세를 조회한다.
   *
   * @param code - 종목 코드
   * @param params - 조회 옵션
   */
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

  /**
   * 종목을 검색한다.
   *
   * @param params - 검색 파라미터
   */
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

  /**
   * 관심종목을 토글한다 (추가/제거).
   *
   * @param code - 종목 코드
   * @param exchange - 거래소 코드
   */
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

  /**
   * 관심종목 목록을 조회한다.
   *
   * @param params - 조회 옵션
   */
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

  /**
   * 관심종목 순서를 변경한다.
   *
   * @param order - 새로운 순서 배열
   */
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

  /** 전체 관심종목을 삭제한다. */
  deleteWatchlist: async (): Promise<WatchlistDeleteResult> => {
    const response = await apiClient.delete("/api/stock/watchlist");
    return {
      success: response.data.success,
      message: response.data.message,
      data: response.data.data as { deletedCount: number } | null,
    };
  },

  /**
   * 호가를 조회한다.
   *
   * @param code - 종목 코드
   * @param params - 조회 옵션
   */
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
