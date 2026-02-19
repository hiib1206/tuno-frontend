import { ExchangeCode } from "./Stock";

/** 스냅백 상태 타입 */
export type SnapbackStatus = "above_base" | "active" | "partial" | "breached";

/** 스냅백 추론 에러 코드 */
export type SnapbackErrorCode =
  | "INSUFFICIENT_DATA"
  | "NO_BASE_POINT"
  | "BASE_POINT_EXPIRED";

/** 스냅백 에러 코드 목록 */
export const SNAPBACK_ERROR_CODES: SnapbackErrorCode[] = [
  "INSUFFICIENT_DATA",
  "NO_BASE_POINT",
  "BASE_POINT_EXPIRED",
];

/** 스냅백 기준점 정보 */
export interface SnapbackPoint {
  /** 일자 (YYYYMMDD) */
  date: string;
  /** 가격 */
  price: number;
}

/** 스냅백 현재 상태 정보 */
export interface SnapbackCurrent {
  /** 일자 (YYYYMMDD) */
  date: string;
  /** 현재 가격 */
  price: number;
  /** 기준점 대비 하락률 (%) */
  dropPct: number;
}

/** 스냅백 ATR(평균진폭) 정보 */
export interface SnapbackAtr {
  /** ATR 값 */
  value: number;
  /** ATR 백분율 */
  pct: number;
  /** 반등 임계값 */
  bounceThreshold: number;
  /** 반등 금액 */
  bounceAmount: number;
}

/** 스냅백 지지선 정보 */
export interface SnapbackSupport {
  /** 지지선 레벨 (1, 2, 3...) */
  level: number;
  /** 기준점 대비 하락률 (%) */
  dropPct: number;
  /** 지지선 가격 */
  price: number;
  /** 지지 구간 상단 (호가 단위 적용) */
  upperPrice: number;
  /** 지지 구간 하단 (호가 단위 적용) */
  lowerPrice: number;
}

/**
 * 국내 주식 호가 단위 테이블 (2026년 기준)
 *
 * @remarks
 * 가격대별 호가 단위를 정의한다.
 */
const TICK_SIZE_TABLE = [
  { max: 2000, tick: 1 },
  { max: 5000, tick: 5 },
  { max: 20000, tick: 10 },
  { max: 50000, tick: 50 },
  { max: 200000, tick: 100 },
  { max: 500000, tick: 500 },
  { max: Infinity, tick: 1000 },
];

/**
 * 주어진 가격에 해당하는 호가 단위를 반환한다.
 *
 * @param price - 기준 가격
 * @returns 해당 가격대의 호가 단위
 */
export function getTickSize(price: number): number {
  for (const { max, tick } of TICK_SIZE_TABLE) {
    if (price < max) return tick;
  }
  return 1000;
}

/**
 * 가격을 호가 단위에 맞게 반올림한다.
 *
 * @param price - 반올림할 가격
 * @param direction - 반올림 방향 (up = 올림, down = 내림, nearest = 반올림)
 * @returns 호가 단위에 맞춰 조정된 가격
 */
export function roundToTick(
  price: number,
  direction: "up" | "down" | "nearest" = "nearest"
): number {
  const tick = getTickSize(price);
  if (direction === "up") return Math.ceil(price / tick) * tick;
  if (direction === "down") return Math.floor(price / tick) * tick;
  return Math.round(price / tick) * tick;
}

/** 지지선 구간 범위 (±2.5%) */
const SUPPORT_RANGE = 0.025;

/**
 * API 응답의 지지선 데이터에 upperPrice, lowerPrice를 추가한다.
 *
 * @param support - 원본 지지선 데이터
 * @returns 구간 상하단이 추가된 지지선 데이터
 */
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

/** 스냅백 분석 결과 */
export interface SnapbackResult {
  /** 종목 코드 */
  ticker: string;
  /** 기준점 정보 */
  basePoint: SnapbackPoint;
  /** 현재 상태 */
  current: SnapbackCurrent;
  /** 기준점 이후 경과일 */
  daysSinceBase: number;
  /** ATR 정보 */
  atr: SnapbackAtr;
  /** 지지선 목록 */
  supports: SnapbackSupport[];
  /** 스냅백 상태 */
  status: SnapbackStatus;
}

/**
 * API 응답을 SnapbackResult로 변환한다.
 *
 * @remarks
 * supports 배열에 upperPrice, lowerPrice를 계산하여 추가한다.
 *
 * @param data - API 응답 데이터
 * @returns 파싱된 스냅백 결과
 */
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

/** 퀀트 시그널 타입 (BUY = 매수, HOLD = 보유, SELL = 매도) */
export type QuantSignalType = "BUY" | "HOLD" | "SELL";

/** 퀀트 시그널 지표 */
export interface QuantSignalIndicators {
  /** 이동평균 배열 (0: 역배열, 1: 정배열) */
  trendMa60120: number;
  /** 추세 강도 */
  trendStrength: number;
  /** 60일 이동평균 괴리율 */
  maDiff60: number;
  /** 20일 모멘텀 */
  momentum20D: number;
  /** 60일 모멘텀 */
  momentum60D: number;
  /** 14일 RSI */
  rsi14: number;
  /** MACD 히스토그램 기울기 */
  macdHistSlope: number;
  /** ATR 백분율 */
  atrPct: number;
  /** 변동성 레짐 */
  volatilityRegime: number;
  /** 볼린저밴드 위치 */
  bbPosition: number;
  /** 20일 상대강도 */
  relativeStrength20D: number;
  /** 60일 상대강도 */
  relativeStrength60D: number;
  /** 베타 */
  beta: number;
  /** 방어적 강도 (0 또는 1) */
  defensiveStrength: number;
  /** 시장 스트레스 (0 또는 1) */
  marketStress: number;
  /** 거래대금 비율 */
  amountRatio: number;
  /** 거래대금 추세 */
  amountTrend: number;
  /** MFI (자금흐름지수) */
  mfi: number;
}

/** 퀀트 시그널 판단 근거 */
export interface QuantSignalReason {
  /** 요약 설명 */
  summary: string;
  /** 상세 설명 */
  detail: string;
  /** 영향 방향 (up = 상승 방향, down = 하락 방향) */
  direction: "up" | "down";
  /** 영향 강도 (1: 약한 <5%, 2: 보통 5-15%, 3: 강한 15-30%, 4: 매우 강한 30%+) */
  strength: 1 | 2 | 3 | 4;
  /** 관련 지표 (예: { momentum20D: 0.3319 }) */
  indicator: Partial<Record<keyof QuantSignalIndicators, number>>
}

/** 퀀트 시그널 이력 항목 */
export interface QuantSignalHistoryEntry {
  /** 일자 */
  date: string;
  /** 시그널 */
  signal: QuantSignalType;
  /** 당시 가격 */
  price: number;
}

/** 퀀트 시그널 모델 정보 */
export interface QuantSignalModelInfo {
  /** 모델 ID */
  modelId: string;
  /** 실행 ID */
  runId: string;
}

/** 퀀트 시그널 분석 결과 */
export interface QuantSignalResult {
  /** 종목 코드 */
  ticker: string;
  /** 종목명 */
  name: string;
  /** 분석 기준일 */
  date: string;
  /** 추론 시각 */
  inferredAt: string;
  /** 현재가 */
  currentPrice: number;
  /** 시그널 */
  signal: QuantSignalType;
  /** 신뢰도 */
  confidence: number;
  /** 시그널별 확률 */
  probabilities: {
    /** 매도 확률 */
    sell: number;
    /** 보유 확률 */
    hold: number;
    /** 매수 확률 */
    buy: number;
  };
  /** 지표 값들 */
  indicators: QuantSignalIndicators;
  /** 판단 근거 목록 */
  reasons: QuantSignalReason[];
  /** 시그널 이력 */
  signalHistory: QuantSignalHistoryEntry[];
  /** 모델 정보 */
  modelInfo: QuantSignalModelInfo;
}

/** AI 추론 모델 타입 */
export type InferenceModelType = "SNAPBACK" | "QUANT_SIGNAL";

/** AI 추론 상태 */
export type InferenceStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "CANCELED";

/** AI 추론 이력 항목 */
export interface InferenceHistoryItem {
  /** 추론 ID */
  id: string;
  /** 모델 타입 */
  modelType: InferenceModelType;
  /** 모델 버전 */
  modelVersion: string | null;
  /** 종목 코드 */
  ticker: string | null;
  /** 거래소 코드 */
  exchange: ExchangeCode | null;
  /** 한글 종목명 */
  nameKo: string | null;
  /** 요청 파라미터 */
  requestParams: Record<string, unknown>;
  /** 응답 데이터 */
  responseData: Record<string, unknown> | null;
  /** 추론 상태 */
  status: InferenceStatus;
  /** 응답 지연시간 (ms) */
  latencyMs: number | null;
  /** 요청 일시 */
  requestedAt: Date;
  /** 완료 일시 */
  completedAt: Date | null;
  /** 삭제 일시 */
  deleted_at: Date | null;
}

/**
 * API 응답을 InferenceHistoryItem으로 변환한다.
 *
 * @param data - API 응답 데이터
 * @returns 파싱된 추론 이력 항목
 */
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


