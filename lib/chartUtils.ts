import { Candle } from "@/types/Stock";
import { clampRgb, formatHex } from "culori";
import {
  CandlestickData,
  HistogramData,
  UTCTimestamp,
} from "lightweight-charts";

/**
 * CSS 변수 값을 가져오는 함수
 * oklch 형식은 가져와도 oklch 문자열로 반환됩니다.
 * @param name - CSS 변수 이름 (예: "--chart-up")
 * @returns CSS 변수 값
 */
export function getCssVar(name: string): string {
  if (typeof window === "undefined") {
    return "";
  }
  return getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
}

/**
 * oklch 형식의 색상을 rgb 형식으로 변환하고, 그것을 hex 형식으로 변환하는 함수
 * @param color - 색상 문자열 (oklch 형식 등)
 * @returns hex 형식의 색상 문자열
 */
export function toHex(color: string): string {
  return formatHex(clampRgb(color)) ?? "#000000";
}

/**
 * 캔들 데이터를 lightweight-charts의 CandlestickData 형식으로 변환하는 함수
 * @param candles - 변환할 캔들 데이터 배열
 * @returns CandlestickData 배열 (time, open, high, low, close)
 */
export function candlesToPriceData(candles: Candle[]): CandlestickData[] {
  return candles.map((c) => ({
    time: c.time as UTCTimestamp,
    open: c.open,
    high: c.high,
    low: c.low,
    close: c.close,
  }));
}

/**
 * 캔들 데이터를 lightweight-charts의 HistogramData 형식으로 변환하는 함수
 * @param candles - 변환할 캔들 데이터 배열
 * @returns HistogramData 배열 (time, value)
 */
export function candlesToVolumeData(candles: Candle[]): HistogramData[] {
  return candles.map((c) => ({
    time: c.time as UTCTimestamp,
    value: c.volume,
  }));
}

/**
 * 이동평균선 데이터 타입
 */
export interface MALineData {
  time: UTCTimestamp;
  value: number;
}

/**
 * 이동평균선 설정
 */
export interface MAConfig {
  period: number;
  color: string;
}

/**
 * 기본 이동평균선 설정 (10, 20, 60, 120일선)
 * - 10일선: 빨간색 (짧은 기간)
 * - 20일선: 주황색
 * - 60일선: 초록색 (중간 기간)
 * - 120일선: 보라색 (긴 기간)
 */
export const DEFAULT_MA_CONFIGS: MAConfig[] = [
  { period: 10, color: "#EF5350" }, // 빨간색
  { period: 20, color: "#FF9800" }, // 주황색
  { period: 60, color: "#4CAF50" }, // 초록색
  { period: 120, color: "#9C27B0" }, // 보라색
];

/**
 * 캔들 데이터에서 이동평균을 계산하는 함수
 * @param priceData - CandlestickData 배열
 * @param period - 이동평균 기간
 * @returns MALineData 배열
 */
export function calculateMA(
  priceData: CandlestickData[],
  period: number
): MALineData[] {
  const result: MALineData[] = [];

  for (let i = period - 1; i < priceData.length; i++) {
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += priceData[i - j].close;
    }
    result.push({
      time: priceData[i].time as UTCTimestamp,
      value: sum / period,
    });
  }

  return result;
}

/**
 * 여러 이동평균선 데이터를 한번에 계산하는 함수
 * @param priceData - CandlestickData 배열
 * @param periods - 이동평균 기간 배열 (예: [5, 20, 60, 120])
 * @returns 기간별 MALineData 맵
 */
export function calculateMAs(
  priceData: CandlestickData[],
  periods: number[]
): Map<number, MALineData[]> {
  const result = new Map<number, MALineData[]>();

  for (const period of periods) {
    result.set(period, calculateMA(priceData, period));
  }

  return result;
}
