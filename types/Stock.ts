// 백엔드 domestic_financial_summary 모델 구조
export interface FinancialSummary {
  id: number;
  mkscShrnIscd: string;
  fidDivClsCode: string; // 'Y' = 연도, 'Q' = 분기
  stacYymm: string; // 결산 년월 (예: "202312")
  revenue?: string | null;
  operatingIncome?: string | null;
  netIncome?: string | null;
  totalAssets?: string | null;
  totalLiabilities?: string | null;
  totalEquity?: string | null;
  capitalStock?: string | null;
  debtRatio?: string | null;
  quickRatio?: string | null;
  retainedEarningsRatio?: string | null;
  roe?: string | null;
  eps?: string | null;
  bps?: string | null;
  createdAt: Date | string;
}

// 시장 코드 타입
export type MarketCode = "KR" | "US";

// 거래소 코드 타입
export type ExchangeCode = "KP" | "KQ" | "NAS" | "NYS" | "AMS";

/**
 * WebSocket TR ID 목록
 * 각 멤버에 대한 주석은 에디터 호버(tooltip)에 표시됩니다.
 */
export enum TR_ID {
  /** 국내주식 실시간체결가 (KRX) */
  H0STCNT0 = "H0STCNT0",
  /** 국내주식 실시간체결가 (통합) */
  H0UNCNT0 = "H0UNCNT0",
  /** 국내주식 실시간호가 (KRX) */
  H0STASP0 = "H0STASP0",
  /** 국내주식 실시간호가 (통합) */
  H0UNASP0 = "H0UNASP0",
}

export type TrId = TR_ID;

// 종목 정보 응답 타입 (국내/해외 통합)
export type StockInfo = {
  market: MarketCode; // 시장 코드
  exchange: ExchangeCode; // 거래소 코드
  code: string; // 종목코드 (단축코드)
  nameKo: string; // 한글 종목명
  nameEn: string | null; // 영문 종목명 (국내 주식은 null)
  listedAt: string | null; // 상장일자 (YYYYMMDD 형식, 해외 주식은 null)
  isNxtInMaster: boolean; // 넥스트 마스터 파일에 있는 종목인지 여부
  isInWatchlist?: boolean; // 종목 관심 여부
  summary?: string | null; // 기업개요 (국내 주식만)
};

/** 종목 상태 구분 */
export const StockStatusCode = {
  /** 관리종목 */
  MANAGEMENT: "51",
  /** 투자위험 */
  INVESTMENT_RISK: "52",
  /** 투자경고 */
  INVESTMENT_WARNING: "53",
  /** 투자주의 */
  INVESTMENT_CAUTION: "54",
  /** 신용가능 */
  CREDIT_AVAILABLE: "55",
  /** 증거금 100% */
  MARGIN_100: "57",
  /** 거래정지 */
  TRADING_HALT: "58",
  /** 단기과열종목 */
  SHORT_TERM_OVERHEAT: "59",
} as const;
export type StockStatusCode =
  (typeof StockStatusCode)[keyof typeof StockStatusCode];

export const StockStatusLabelMap: Record<StockStatusCode, string> = {
  51: "관리종목",
  52: "투자위험",
  53: "투자경고",
  54: "투자주의",
  55: "신용가능",
  57: "증거금 100%",
  58: "거래정지",
  59: "단기과열종목",
};

// 캔들 데이터 (API 응답)
export interface Candle {
  time: number; // Unix timestamp (초 단위)
  open: number; // 시가
  high: number; // 고가
  low: number; // 저가
  close: number; // 종가
  volume: number; // 거래량
  turnover: number; // 거래대금
}

// H0UNCNT0 실시간 체결가 데이터 (WebSocket)
export interface StockRealtimeData {
  // 기본 정보
  MKSC_SHRN_ISCD: string; // 종목코드
  STCK_CNTG_HOUR: string; // 체결 시간 (HHMMSS)
  BSOP_DATE: string; // 영업 일자 (YYYYMMDD)

  // 가격 정보
  STCK_PRPR: number; // 현재가
  STCK_OPRC: number; // 시가
  STCK_HGPR: number; // 고가
  STCK_LWPR: number; // 저가

  // 전일 대비 정보
  PRDY_VRSS_SIGN: string; // 전일 대비 부호 (1:상한, 2:상승, 3:보합, 4:하한, 5:하락)
  PRDY_VRSS: number; // 전일 대비
  PRDY_CTRT: number; // 전일 대비율 (%)

  // 거래량 정보
  CNTG_VOL: number; // 체결 거래량
  ACML_VOL: number; // 누적 거래량
  ACML_TR_PBMN: number; // 누적 거래 대금

  // 호가 정보
  ASKP1: number; // 매도호가1
  BIDP1: number; // 매수호가1
}

// H0UNASP0/H0STASP0 실시간 호가 데이터 (WebSocket)
export interface StockOrderbookData {
  /** 유가증권 단축 종목코드 */
  MKSC_SHRN_ISCD?: string;
  /** 영업 시간 (HHMMSS) */
  BSOP_HOUR?: string;
  /** 시간 구분 코드 (0:장중, A:장후예상, B:장전예상, C:9시이후의 예상가/VI발동, D:시간외 단일가 예상) */
  HOUR_CLS_CODE?: string;

  // 매도호가 (1~10)
  ASKP1: number;
  ASKP2: number;
  ASKP3: number;
  ASKP4: number;
  ASKP5: number;
  ASKP6: number;
  ASKP7: number;
  ASKP8: number;
  ASKP9: number;
  ASKP10: number;

  // 매수호가 (1~10)
  BIDP1: number;
  BIDP2: number;
  BIDP3: number;
  BIDP4: number;
  BIDP5: number;
  BIDP6: number;
  BIDP7: number;
  BIDP8: number;
  BIDP9: number;
  BIDP10: number;

  // 매도호가 잔량 (1~10)
  ASKP_RSQN1: number;
  ASKP_RSQN2: number;
  ASKP_RSQN3: number;
  ASKP_RSQN4: number;
  ASKP_RSQN5: number;
  ASKP_RSQN6: number;
  ASKP_RSQN7: number;
  ASKP_RSQN8: number;
  ASKP_RSQN9: number;
  ASKP_RSQN10: number;

  // 매수호가 잔량 (1~10)
  BIDP_RSQN1: number;
  BIDP_RSQN2: number;
  BIDP_RSQN3: number;
  BIDP_RSQN4: number;
  BIDP_RSQN5: number;
  BIDP_RSQN6: number;
  BIDP_RSQN7: number;
  BIDP_RSQN8: number;
  BIDP_RSQN9: number;
  BIDP_RSQN10: number;

  // 총 잔량
  TOTAL_ASKP_RSQN: number;
  TOTAL_BIDP_RSQN: number;
  OVTM_TOTAL_ASKP_RSQN: number;
  OVTM_TOTAL_BIDP_RSQN: number;

  // 예상 체결 정보
  ANTC_CNPR?: number;
  ANTC_CNQN?: number;
  ANTC_VOL?: number;
  ANTC_CNTG_VRSS?: number;
  ANTC_CNTG_VRSS_SIGN?: string;
  ANTC_CNTG_PRDY_CTRT?: number;

  // 기타
  ACML_VOL?: number;
  TOTAL_ASKP_RSQN_ICDC?: number;
  TOTAL_BIDP_RSQN_ICDC?: number;
  OVTM_TOTAL_ASKP_ICDC?: number;
  OVTM_TOTAL_BIDP_ICDC?: number;
  STCK_DEAL_CLS_CODE?: string;
}

// 현재가 시세(Quote) 데이터
export interface StockQuote {
  code: string;
  currentPrice: number;
  priceChange: number;
  priceChangeSign: string;
  priceChangeRate: number;
  previousClose: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  tradingValue: number;
  high52Week: number;
  low52Week: number;
  listedShares: number;
  capital: number;
  parValue: number;
  bsopDate: string; // YYYYMMDD
  statusCode: StockStatusCode | null;
}

// 주식 검색 쿼리 파라미터 타입
export type StockSearchQueryParams = {
  q: string; // 검색어 (1~50자)
  type?: "all" | "domestic" | "overseas";
  limit?: number; // 1 ~ 50
};

// 주식 검색 결과 항목 타입 (StockSearchResult)
export type StockSearchResult = {
  type: "domestic" | "overseas";
  market: "KR" | "US";
  exchange: "KP" | "KQ" | "NAS" | "NYS" | "AMS";
  code: string;
  nameKo: string;
  nameEn: string | null;
  listedAt: string | null; // YYYYMMDD or null
  isNxtInMaster: boolean | null;
};

// 국내 지수 현재가 데이터
export interface IndexPrice {
  currentPrice: number | null;
  priceChange: number | null;
  priceChangeSign: string | null;
  priceChangeRate: number | null;

  volume: number | null;
  previousVolume: number | null;
  tradingValue: number | null;
  previousTradingValue: number | null;

  open: number | null;
  openVsPrevious: number | null;
  openVsCurrentSign: string | null;
  openChangeRate: number | null;

  high: number | null;
  highVsPrevious: number | null;
  highVsCurrentSign: string | null;
  highChangeRate: number | null;

  low: number | null;
  lowVsPrevClose: number | null;
  lowVsCurrentSign: string | null;
  lowVsPrevCloseRate: number | null;

  advancingCount: number | null;
  upperLimitCount: number | null;
  unchangedCount: number | null;
  decliningCount: number | null;
  lowerLimitCount: number | null;

  yearHigh: number | null;
  yearHighVsCurrentRate: number | null;
  yearHighDate: string | null;
  yearLow: number | null;
  yearLowVsCurrentRate: number | null;
  yearLowDate: string | null;

  totalAskVolume: number | null;
  totalBidVolume: number | null;
  askVolumeRate: number | null;
  bidVolumeRate: number | null;
  netBidVolume: number | null;
}

// 국내 지수 분봉 데이터
export interface IndexMinuteCandle {
  date: number; // YYYYMMDD → Unix timestamp(초)
  time: string | null; // HHMMSS
  close: number | null;
  open: number | null;
  high: number | null;
  low: number | null;
  tickVolume: number | null;
  tradingValue: number | null;
}

// 관심종목 아이템 타입
export type WatchlistItem = {
  market: MarketCode;
  exchange: ExchangeCode;
  code: string;
  nameKo: string;
  nameEn: string | null;
  listedAt: string | null;
  isNxtInMaster: boolean | null;
};
