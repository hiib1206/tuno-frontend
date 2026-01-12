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
