import { ExchangeCode, MarketCode } from "@/types/Stock";

// 거래소 코드 -> 표시명
export const EXCHANGE_NAMES: Record<ExchangeCode, string> = {
  KP: "KOSPI",
  KQ: "KOSDAQ",
  NAS: "NASDAQ",
  NYS: "NYSE",
  AMS: "AMEX",
};

// 미국 거래소 목록
export const US_EXCHANGES: ExchangeCode[] = ["NAS", "NYS", "AMS"];

// 거래소 코드 -> 시장 코드
export function getMarketCode(exchange: ExchangeCode): MarketCode {
  return US_EXCHANGES.includes(exchange) ? "US" : "KR";
}

// 시장 코드 -> 표시명
export function getMarketName(market: MarketCode): string {
  return market === "KR" ? "국내" : "해외";
}

// 거래소 코드 -> 거래소 표시명
export function getExchangeName(exchange: ExchangeCode): string {
  return EXCHANGE_NAMES[exchange] ?? exchange;
}
