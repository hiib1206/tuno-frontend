"use client";

import { QuantSignalIndicators } from "@/types/Inference";

// ─── 지표 메타 정보 ───
export interface IndicatorMeta {
  label: string;
  visualType: "binary" | "gauge100" | "centerZero" | "baseOne" | "simple";
  /** gauge100: 구간 경계 */
  zones?: { low: number; high: number };
  /** centerZero: 클램프 범위 (±) */
  clamp?: number;
  /** baseOne: 최대 표시 범위 */
  maxRange?: number;
  /** 값 포맷 함수 */
  format?: (v: number) => string;
  /** 이진값: 1일 때 라벨 */
  onLabel?: string;
  /** 이진값: 0일 때 라벨 */
  offLabel?: string;
}

export const INDICATOR_META: Record<keyof QuantSignalIndicators, IndicatorMeta> = {
  // A. 이진값
  trendMa60120: {
    label: "추세방향",
    visualType: "binary",
    onLabel: "정배열",
    offLabel: "역배열",
  },
  defensiveStrength: {
    label: "방어력",
    visualType: "binary",
    onLabel: "방어 성공",
    offLabel: "방어 실패",
  },
  marketStress: {
    label: "시장스트레스",
    visualType: "binary",
    onLabel: "위험",
    offLabel: "안정",
  },

  // B. 0~100 게이지
  rsi14: {
    label: "RSI",
    visualType: "gauge100",
    zones: { low: 30, high: 70 },
  },
  mfi: {
    label: "MFI",
    visualType: "gauge100",
    zones: { low: 20, high: 80 },
  },

  // C. 0 기준 양방향 (비율값)
  momentum20D: {
    label: "20일 수익률",
    visualType: "centerZero",
    clamp: 0.6,
    format: (v) => `${v >= 0 ? "+" : ""}${(v * 100).toFixed(1)}%`,
  },
  momentum60D: {
    label: "60일 수익률",
    visualType: "centerZero",
    clamp: 0.8,
    format: (v) => `${v >= 0 ? "+" : ""}${(v * 100).toFixed(1)}%`,
  },
  maDiff60: {
    label: "이평괴리율",
    visualType: "centerZero",
    clamp: 0.5,
    format: (v) => `${v >= 0 ? "+" : ""}${(v * 100).toFixed(1)}%`,
  },
  relativeStrength20D: {
    label: "20일 상대강도",
    visualType: "centerZero",
    clamp: 0.4,
    format: (v) => `${v >= 0 ? "+" : ""}${(v * 100).toFixed(1)}%`,
  },
  relativeStrength60D: {
    label: "60일 상대강도",
    visualType: "centerZero",
    clamp: 0.5,
    format: (v) => `${v >= 0 ? "+" : ""}${(v * 100).toFixed(1)}%`,
  },

  // D. 1 기준 비교값
  volatilityRegime: {
    label: "변동성 레짐",
    visualType: "baseOne",
    maxRange: 3,
    format: (v) => v.toFixed(2),
  },
  amountRatio: {
    label: "거래대금 비율",
    visualType: "baseOne",
    maxRange: 8,
    format: (v) => `${v.toFixed(2)}x`,
  },
  amountTrend: {
    label: "거래대금 추세",
    visualType: "baseOne",
    maxRange: 2,
    format: (v) => `${v.toFixed(2)}x`,
  },
  beta: {
    label: "베타",
    visualType: "baseOne",
    maxRange: 3,
    format: (v) => v.toFixed(2),
  },

  // E. 특수 → 심플 카드
  trendStrength: {
    label: "추세강도",
    visualType: "simple",
    format: (v) => v.toFixed(2),
  },
  atrPct: {
    label: "ATR 비율",
    visualType: "simple",
    format: (v) => `${v.toFixed(2)}%`,
  },
  bbPosition: {
    label: "밴드 위치",
    visualType: "simple",
    format: (v) => v.toFixed(2),
  },
  macdHistSlope: {
    label: "MACD 기울기",
    visualType: "simple",
    format: (v) => v.toLocaleString("ko-KR", { maximumFractionDigits: 0 }),
  },
};
