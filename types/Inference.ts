export type SnapbackStatus = "above_base" | "active" | "partial" | "breached";

export interface SnapbackPoint {
  date: string; // YYYYMMDD
  price: number;
}

export interface SnapbackCurrent {
  date: string; // YYYYMMDD
  price: number;
  drop_pct: number;
}

export interface SnapbackAtr {
  value: number;
  pct: number;
  bounce_threshold: number;
  bounce_amount: number;
}

export interface SnapbackSupport {
  level: number;
  drop_pct: number;
  price: number;
}

export interface SnapbackResult {
  ticker: string;
  base_point: SnapbackPoint;
  current: SnapbackCurrent;
  days_since_base: number;
  atr: SnapbackAtr;
  supports: SnapbackSupport[];
  status: SnapbackStatus;
}


