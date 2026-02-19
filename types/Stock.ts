/** 백엔드 domestic_financial_summary 모델 구조 */
export interface FinancialSummary {
  id: number;
  /** 유가증권 단축 종목코드 */
  mkscShrnIscd: string;
  /** 기간 구분 코드 ('Y' = 연도, 'Q' = 분기) */
  fidDivClsCode: string;
  /** 결산 년월 (예: "202312") */
  stacYymm: string;
  /** 매출액 */
  revenue?: string | null;
  /** 영업이익 */
  operatingIncome?: string | null;
  /** 당기순이익 */
  netIncome?: string | null;
  /** 총자산 */
  totalAssets?: string | null;
  /** 총부채 */
  totalLiabilities?: string | null;
  /** 총자본 */
  totalEquity?: string | null;
  /** 자본금 */
  capitalStock?: string | null;
  /** 부채비율 */
  debtRatio?: string | null;
  /** 당좌비율 */
  quickRatio?: string | null;
  /** 유보율 */
  retainedEarningsRatio?: string | null;
  /** 자기자본이익률 (ROE) */
  roe?: string | null;
  /** 주당순이익 (EPS) */
  eps?: string | null;
  /** 주당순자산 (BPS) */
  bps?: string | null;
  createdAt: Date | string;
}

/** 시장 코드 타입 (KR = 국내, US = 미국) */
export type MarketCode = "KR" | "US";

/** 거래소 코드 타입 (KP = 코스피, KQ = 코스닥, NAS = 나스닥, NYS = 뉴욕, AMS = 아멕스) */
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

/** 종목 정보 응답 타입 (국내/해외 통합) */
export type StockInfo = {
  /** 시장 코드 */
  market: MarketCode;
  /** 거래소 코드 */
  exchange: ExchangeCode;
  /** 종목코드 (단축코드) */
  code: string;
  /** 한글 종목명 */
  nameKo: string;
  /** 영문 종목명 (국내 주식은 null) */
  nameEn: string | null;
  /** 상장일자 (YYYYMMDD 형식, 해외 주식은 null) */
  listedAt: string | null;
  /** 넥스트 마스터 파일에 있는 종목인지 여부 */
  isNxtInMaster: boolean;
  /** 종목 관심 여부 */
  isInWatchlist?: boolean;
  /** 기업개요 (국내 주식만) */
  summary?: string | null;
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

/** 캔들 데이터 (API 응답) */
export interface Candle {
  /** Unix timestamp (초 단위) */
  time: number;
  /** 시가 */
  open: number;
  /** 고가 */
  high: number;
  /** 저가 */
  low: number;
  /** 종가 */
  close: number;
  /** 거래량 */
  volume: number;
  /** 거래대금 */
  turnover: number;
}

/**
 * H0UNCNT0 실시간 체결가 데이터 (WebSocket)
 *
 * @remarks
 * 한국투자증권 WebSocket API의 실시간 체결가 응답 구조
 */
export interface StockRealtimeData {
  /** 종목코드 */
  MKSC_SHRN_ISCD: string;
  /** 체결 시간 (HHMMSS) */
  STCK_CNTG_HOUR: string;
  /** 영업 일자 (YYYYMMDD) */
  BSOP_DATE: string;

  /** 현재가 */
  STCK_PRPR: number;
  /** 시가 */
  STCK_OPRC: number;
  /** 고가 */
  STCK_HGPR: number;
  /** 저가 */
  STCK_LWPR: number;

  /** 전일 대비 부호 (1:상한, 2:상승, 3:보합, 4:하한, 5:하락) */
  PRDY_VRSS_SIGN: string;
  /** 전일 대비 */
  PRDY_VRSS: number;
  /** 전일 대비율 (%) */
  PRDY_CTRT: number;

  /** 체결 거래량 */
  CNTG_VOL: number;
  /** 누적 거래량 */
  ACML_VOL: number;
  /** 누적 거래 대금 */
  ACML_TR_PBMN: number;

  /** 매도호가1 */
  ASKP1: number;
  /** 매수호가1 */
  BIDP1: number;
}

/**
 * H0UNASP0/H0STASP0 실시간 호가 데이터 (WebSocket)
 *
 * @remarks
 * 한국투자증권 WebSocket API의 실시간 호가 응답 구조
 */
export interface StockOrderbookData {
  /** 유가증권 단축 종목코드 */
  MKSC_SHRN_ISCD?: string;
  /** 영업 시간 (HHMMSS) */
  BSOP_HOUR?: string;
  /** 시간 구분 코드 (0:장중, A:장후예상, B:장전예상, C:9시이후의 예상가/VI발동, D:시간외 단일가 예상) */
  HOUR_CLS_CODE?: string;

  /** 매도호가 1 */ ASKP1: number;
  /** 매도호가 2 */ ASKP2: number;
  /** 매도호가 3 */ ASKP3: number;
  /** 매도호가 4 */ ASKP4: number;
  /** 매도호가 5 */ ASKP5: number;
  /** 매도호가 6 */ ASKP6: number;
  /** 매도호가 7 */ ASKP7: number;
  /** 매도호가 8 */ ASKP8: number;
  /** 매도호가 9 */ ASKP9: number;
  /** 매도호가 10 */ ASKP10: number;

  /** 매수호가 1 */ BIDP1: number;
  /** 매수호가 2 */ BIDP2: number;
  /** 매수호가 3 */ BIDP3: number;
  /** 매수호가 4 */ BIDP4: number;
  /** 매수호가 5 */ BIDP5: number;
  /** 매수호가 6 */ BIDP6: number;
  /** 매수호가 7 */ BIDP7: number;
  /** 매수호가 8 */ BIDP8: number;
  /** 매수호가 9 */ BIDP9: number;
  /** 매수호가 10 */ BIDP10: number;

  /** 매도호가 잔량 1 */ ASKP_RSQN1: number;
  /** 매도호가 잔량 2 */ ASKP_RSQN2: number;
  /** 매도호가 잔량 3 */ ASKP_RSQN3: number;
  /** 매도호가 잔량 4 */ ASKP_RSQN4: number;
  /** 매도호가 잔량 5 */ ASKP_RSQN5: number;
  /** 매도호가 잔량 6 */ ASKP_RSQN6: number;
  /** 매도호가 잔량 7 */ ASKP_RSQN7: number;
  /** 매도호가 잔량 8 */ ASKP_RSQN8: number;
  /** 매도호가 잔량 9 */ ASKP_RSQN9: number;
  /** 매도호가 잔량 10 */ ASKP_RSQN10: number;

  /** 매수호가 잔량 1 */ BIDP_RSQN1: number;
  /** 매수호가 잔량 2 */ BIDP_RSQN2: number;
  /** 매수호가 잔량 3 */ BIDP_RSQN3: number;
  /** 매수호가 잔량 4 */ BIDP_RSQN4: number;
  /** 매수호가 잔량 5 */ BIDP_RSQN5: number;
  /** 매수호가 잔량 6 */ BIDP_RSQN6: number;
  /** 매수호가 잔량 7 */ BIDP_RSQN7: number;
  /** 매수호가 잔량 8 */ BIDP_RSQN8: number;
  /** 매수호가 잔량 9 */ BIDP_RSQN9: number;
  /** 매수호가 잔량 10 */ BIDP_RSQN10: number;

  /** 총 매도호가 잔량 */ TOTAL_ASKP_RSQN: number;
  /** 총 매수호가 잔량 */ TOTAL_BIDP_RSQN: number;
  /** 시간외 총 매도호가 잔량 */ OVTM_TOTAL_ASKP_RSQN: number;
  /** 시간외 총 매수호가 잔량 */ OVTM_TOTAL_BIDP_RSQN: number;

  /** 예상 체결가 */ ANTC_CNPR?: number;
  /** 예상 체결 수량 */ ANTC_CNQN?: number;
  /** 예상 거래량 */ ANTC_VOL?: number;
  /** 예상 체결 대비 */ ANTC_CNTG_VRSS?: number;
  /** 예상 체결 대비 부호 */ ANTC_CNTG_VRSS_SIGN?: string;
  /** 예상 체결 전일 대비율 */ ANTC_CNTG_PRDY_CTRT?: number;

  /** 누적 거래량 */ ACML_VOL?: number;
  /** 총 매도호가 잔량 증감 */ TOTAL_ASKP_RSQN_ICDC?: number;
  /** 총 매수호가 잔량 증감 */ TOTAL_BIDP_RSQN_ICDC?: number;
  /** 시간외 총 매도 증감 */ OVTM_TOTAL_ASKP_ICDC?: number;
  /** 시간외 총 매수 증감 */ OVTM_TOTAL_BIDP_ICDC?: number;
  /** 주식 매매 구분 코드 */ STCK_DEAL_CLS_CODE?: string;
}

/** 현재가 시세(Quote) 데이터 */
export interface StockQuote {
  /** 종목코드 */
  code: string;
  /** 현재가 */
  currentPrice: number;
  /** 전일 대비 */
  priceChange: number;
  /** 전일 대비 부호 */
  priceChangeSign: string;
  /** 전일 대비율 (%) */
  priceChangeRate: number;
  /** 전일 종가 */
  previousClose: number;
  /** 시가 */
  open: number;
  /** 고가 */
  high: number;
  /** 저가 */
  low: number;
  /** 거래량 */
  volume: number;
  /** 거래대금 */
  tradingValue: number;
  /** 52주 최고가 */
  high52Week: number;
  /** 52주 최저가 */
  low52Week: number;
  /** 상장주식수 */
  listedShares: number;
  /** 자본금 */
  capital: number;
  /** 액면가 */
  parValue: number;
  /** 영업일자 (YYYYMMDD) */
  bsopDate: string;
  /** 종목 상태 코드 */
  statusCode: StockStatusCode | null;
}

/** 주식 검색 쿼리 파라미터 타입 */
export type StockSearchQueryParams = {
  /** 검색어 (1~50자) */
  q: string;
  /** 검색 대상 (all = 전체, domestic = 국내, overseas = 해외) */
  type?: "all" | "domestic" | "overseas";
  /** 검색 결과 최대 개수 (1~50) */
  limit?: number;
};

/** 주식 검색 결과 항목 타입 */
export type StockSearchResult = {
  /** 시장 구분 (domestic = 국내, overseas = 해외) */
  type: "domestic" | "overseas";
  /** 시장 코드 */
  market: "KR" | "US";
  /** 거래소 코드 */
  exchange: "KP" | "KQ" | "NAS" | "NYS" | "AMS";
  /** 종목코드 */
  code: string;
  /** 한글 종목명 */
  nameKo: string;
  /** 영문 종목명 */
  nameEn: string | null;
  /** 상장일자 (YYYYMMDD 또는 null) */
  listedAt: string | null;
  /** 넥스트 마스터 포함 여부 */
  isNxtInMaster: boolean | null;
};

/** 국내 지수 현재가 데이터 */
export interface IndexPrice {
  /** 현재가 */ currentPrice: number | null;
  /** 전일 대비 */ priceChange: number | null;
  /** 전일 대비 부호 */ priceChangeSign: string | null;
  /** 전일 대비율 (%) */ priceChangeRate: number | null;

  /** 거래량 */ volume: number | null;
  /** 전일 거래량 */ previousVolume: number | null;
  /** 거래대금 */ tradingValue: number | null;
  /** 전일 거래대금 */ previousTradingValue: number | null;

  /** 시가 */ open: number | null;
  /** 시가 대비 전일 */ openVsPrevious: number | null;
  /** 시가 대비 현재 부호 */ openVsCurrentSign: string | null;
  /** 시가 변동률 */ openChangeRate: number | null;

  /** 고가 */ high: number | null;
  /** 고가 대비 전일 */ highVsPrevious: number | null;
  /** 고가 대비 현재 부호 */ highVsCurrentSign: string | null;
  /** 고가 변동률 */ highChangeRate: number | null;

  /** 저가 */ low: number | null;
  /** 저가 대비 전일 종가 */ lowVsPrevClose: number | null;
  /** 저가 대비 현재 부호 */ lowVsCurrentSign: string | null;
  /** 저가 대비 전일 종가 변동률 */ lowVsPrevCloseRate: number | null;

  /** 상승 종목 수 */ advancingCount: number | null;
  /** 상한가 종목 수 */ upperLimitCount: number | null;
  /** 보합 종목 수 */ unchangedCount: number | null;
  /** 하락 종목 수 */ decliningCount: number | null;
  /** 하한가 종목 수 */ lowerLimitCount: number | null;

  /** 연중 최고가 */ yearHigh: number | null;
  /** 연중 최고가 대비 현재 변동률 */ yearHighVsCurrentRate: number | null;
  /** 연중 최고가 일자 */ yearHighDate: string | null;
  /** 연중 최저가 */ yearLow: number | null;
  /** 연중 최저가 대비 현재 변동률 */ yearLowVsCurrentRate: number | null;
  /** 연중 최저가 일자 */ yearLowDate: string | null;

  /** 총 매도 호가 잔량 */ totalAskVolume: number | null;
  /** 총 매수 호가 잔량 */ totalBidVolume: number | null;
  /** 매도 잔량 비율 */ askVolumeRate: number | null;
  /** 매수 잔량 비율 */ bidVolumeRate: number | null;
  /** 순매수 잔량 */ netBidVolume: number | null;
}

/** 국내 지수 분봉 데이터 */
export interface IndexMinuteCandle {
  /** 일자 (Unix timestamp, 초 단위) */
  date: number;
  /** 시간 (HHMMSS) */
  time: string | null;
  /** 종가 */
  close: number | null;
  /** 시가 */
  open: number | null;
  /** 고가 */
  high: number | null;
  /** 저가 */
  low: number | null;
  /** 틱 거래량 */
  tickVolume: number | null;
  /** 거래대금 */
  tradingValue: number | null;
}

/** 관심종목 아이템 타입 */
export type WatchlistItem = {
  /** 시장 코드 */
  market: MarketCode;
  /** 거래소 코드 */
  exchange: ExchangeCode;
  /** 종목코드 */
  code: string;
  /** 한글 종목명 */
  nameKo: string;
  /** 영문 종목명 */
  nameEn: string | null;
  /** 상장일자 */
  listedAt: string | null;
  /** 넥스트 마스터 포함 여부 */
  isNxtInMaster: boolean | null;
};
