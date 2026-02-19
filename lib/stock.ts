import { ExchangeCode, MarketCode } from "@/types/Stock";

/** 거래소 코드별 표시명 매핑 */
export const EXCHANGE_NAMES: Record<ExchangeCode, string> = {
  KP: "KOSPI",
  KQ: "KOSDAQ",
  NAS: "NASDAQ",
  NYS: "NYSE",
  AMS: "AMEX",
};

/** 미국 거래소 목록 */
export const US_EXCHANGES: ExchangeCode[] = ["NAS", "NYS", "AMS"];

/**
 * 거래소 코드로 시장 코드를 반환한다.
 *
 * @param exchange - 거래소 코드
 * @returns 시장 코드 (KR 또는 US)
 */
export function getMarketCode(exchange: ExchangeCode): MarketCode {
  return US_EXCHANGES.includes(exchange) ? "US" : "KR";
}

/**
 * 시장 코드의 한글 표시명을 반환한다.
 *
 * @param market - 시장 코드
 * @returns 한글 표시명 (국내 또는 해외)
 */
export function getMarketName(market: MarketCode): string {
  return market === "KR" ? "국내" : "해외";
}

/**
 * 거래소 코드의 표시명을 반환한다.
 *
 * @param exchange - 거래소 코드
 * @returns 거래소 표시명 (KOSPI, NASDAQ 등)
 */
export function getExchangeName(exchange: ExchangeCode): string {
  return EXCHANGE_NAMES[exchange] ?? exchange;
}
