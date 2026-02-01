import { ExchangeCode } from "./Stock";

export type SnapbackStatus = "above_base" | "active" | "partial" | "breached";

// Snapback 추론 에러 코드
export type SnapbackErrorCode =
  | "INSUFFICIENT_DATA"
  | "NO_BASE_POINT"
  | "BASE_POINT_EXPIRED";

export const SNAPBACK_ERROR_CODES: SnapbackErrorCode[] = [
  "INSUFFICIENT_DATA",
  "NO_BASE_POINT",
  "BASE_POINT_EXPIRED",
];

export interface SnapbackPoint {
  date: string; // YYYYMMDD
  price: number;
}

export interface SnapbackCurrent {
  date: string; // YYYYMMDD
  price: number;
  dropPct: number;
}

export interface SnapbackAtr {
  value: number;
  pct: number;
  bounceThreshold: number;
  bounceAmount: number;
}

export interface SnapbackSupport {
  level: number;
  dropPct: number;
  price: number;
  upperPrice: number; // 지지 구간 상단 (호가 단위 적용)
  lowerPrice: number; // 지지 구간 하단 (호가 단위 적용)
}

// 국내 주식 호가 단위 (2026년 기준)
const TICK_SIZE_TABLE = [
  { max: 2000, tick: 1 },
  { max: 5000, tick: 5 },
  { max: 20000, tick: 10 },
  { max: 50000, tick: 50 },
  { max: 200000, tick: 100 },
  { max: 500000, tick: 500 },
  { max: Infinity, tick: 1000 },
];

// 호가 단위 반환
export function getTickSize(price: number): number {
  for (const { max, tick } of TICK_SIZE_TABLE) {
    if (price < max) return tick;
  }
  return 1000;
}

// 호가 단위에 맞게 반올림
export function roundToTick(
  price: number,
  direction: "up" | "down" | "nearest" = "nearest"
): number {
  const tick = getTickSize(price);
  if (direction === "up") return Math.ceil(price / tick) * tick;
  if (direction === "down") return Math.floor(price / tick) * tick;
  return Math.round(price / tick) * tick;
}

// 지지선 구간 범위 (±2.5%)
const SUPPORT_RANGE = 0.025;

// API 응답의 supports 배열에 upperPrice, lowerPrice 추가
function parseSnapbackSupport(support: {
  level: number;
  dropPct: number;
  price: number;
}): SnapbackSupport {
  const upperPrice = roundToTick(support.price * (1 + SUPPORT_RANGE), "up");
  const lowerPrice = roundToTick(support.price * (1 - SUPPORT_RANGE), "down");
  return {
    ...support,
    upperPrice,
    lowerPrice,
  };
}

export interface SnapbackResult {
  ticker: string;
  basePoint: SnapbackPoint;
  current: SnapbackCurrent;
  daysSinceBase: number;
  atr: SnapbackAtr;
  supports: SnapbackSupport[];
  status: SnapbackStatus;
}

// API 응답 -> SnapbackResult 변환 (supports에 upperPrice, lowerPrice 추가)
export function parseSnapbackResult(
  data: Record<string, unknown>
): SnapbackResult {
  const raw = data as {
    ticker: string;
    basePoint: SnapbackPoint;
    current: SnapbackCurrent;
    daysSinceBase: number;
    atr: SnapbackAtr;
    supports: { level: number; dropPct: number; price: number }[];
    status: SnapbackStatus;
  };

  return {
    ...raw,
    supports: raw.supports.map(parseSnapbackSupport),
  };
}

// Quant Signal 타입
export type QuantSignalType = "BUY" | "HOLD" | "SELL";

export interface QuantSignalIndicators {
  trendMa60120: number; // 0: 역배열, 1: 정배열
  trendStrength: number;
  maDiff60: number;
  momentum20D: number;
  momentum60D: number;
  rsi14: number;
  macdHistSlope: number;
  atrPct: number;
  volatilityRegime: number;
  bbPosition: number;
  relativeStrength20D: number;
  relativeStrength60D: number;
  beta: number;
  defensiveStrength: number; // 0 or 1
  marketStress: number; // 0 or 1
  amountRatio: number;
  amountTrend: number;
  mfi: number;
}

export interface QuantSignalReason {
  summary: string;
  detail: string;
  /** 영향 방향: "up" = 상승 방향 영향, "down" = 하락 방향 영향 */
  direction: "up" | "down";
  /** 영향 강도: 1 = 약한(<5%), 2 = 보통(5-15%), 3 = 강한(15-30%), 4 = 매우 강한(30%+) */
  strength: 1 | 2 | 3 | 4;
  /** API 형식: { momentum20D: 0.3319 } 처럼 키 하나만 옴 */
  indicator: Partial<Record<keyof QuantSignalIndicators, number>>
}

export interface QuantSignalHistoryEntry {
  date: string;
  signal: QuantSignalType;
  price: number;
}

export interface QuantSignalModelInfo {
  modelId: string;
  runId: string;
}

export interface QuantSignalResult {
  ticker: string;
  name: string;
  date: string;
  inferredAt: string;
  currentPrice: number;
  signal: QuantSignalType;
  confidence: number;
  probabilities: {
    sell: number;
    hold: number;
    buy: number;
  };
  indicators: QuantSignalIndicators;
  reasons: QuantSignalReason[];
  signalHistory: QuantSignalHistoryEntry[];
  modelInfo: QuantSignalModelInfo;
}

// AI 추론 이력
export type InferenceModelType = "SNAPBACK" | "QUANT_SIGNAL";
export type InferenceStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "CANCELED";

export interface InferenceHistoryItem {
  id: string;
  modelType: InferenceModelType;
  modelVersion: string | null;
  ticker: string | null;
  exchange: ExchangeCode | null;
  nameKo: string | null;
  requestParams: Record<string, unknown>;
  responseData: Record<string, unknown> | null;
  status: InferenceStatus;
  latencyMs: number | null;
  requestedAt: Date;
  completedAt: Date | null;
  deleted_at: Date | null;
}

// API 응답 -> InferenceHistoryItem 변환
export function parseInferenceHistoryItem(
  data: Record<string, unknown>
): InferenceHistoryItem {
  return {
    id: data.id as string,
    modelType: data.modelType as InferenceModelType,
    modelVersion: (data.modelVersion as string) ?? null,
    ticker: (data.ticker as string) ?? null,
    nameKo: (data.nameKo as string) ?? null,
    exchange: (data.exchange as ExchangeCode) ?? null,
    requestParams: (data.requestParams as Record<string, unknown>) ?? {},
    responseData: (data.responseData as Record<string, unknown>) ?? null,
    status: data.status as InferenceStatus,
    latencyMs: (data.latencyMs as number) ?? null,
    requestedAt:
      typeof data.requestedAt === "string"
        ? new Date(data.requestedAt)
        : (data.requestedAt as Date),
    completedAt: data.completedAt
      ? typeof data.completedAt === "string"
        ? new Date(data.completedAt)
        : (data.completedAt as Date)
      : null,
    deleted_at: data.deleted_at
      ? typeof data.deleted_at === "string"
        ? new Date(data.deleted_at)
        : (data.deleted_at as Date)
      : null,
  };
}


