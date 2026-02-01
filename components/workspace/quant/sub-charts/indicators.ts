import { Candle } from "@/types/Stock";

// ─── RSI (Relative Strength Index) ───
export interface RsiPoint {
  time: number;
  value: number;
}

export function calcRSI(candles: Candle[], period = 14): RsiPoint[] {
  if (candles.length < period + 1) return [];

  const closes = candles.map((c) => c.close);
  const result: RsiPoint[] = [];

  // 초기 평균 gain/loss
  let avgGain = 0;
  let avgLoss = 0;

  for (let i = 1; i <= period; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff > 0) avgGain += diff;
    else avgLoss += Math.abs(diff);
  }

  avgGain /= period;
  avgLoss /= period;

  const firstRsi = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);
  result.push({ time: candles[period].time, value: firstRsi });

  // Wilder's smoothing
  for (let i = period + 1; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    const gain = diff > 0 ? diff : 0;
    const loss = diff < 0 ? Math.abs(diff) : 0;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;

    const rsi = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);
    result.push({ time: candles[i].time, value: rsi });
  }

  return result;
}

// ─── MACD (Moving Average Convergence Divergence) ───
export interface MacdPoint {
  time: number;
  macd: number;
  signal: number;
  histogram: number;
}

function calcEMA(values: number[], period: number): number[] {
  const ema: number[] = [];
  if (values.length < period) return ema;

  // 초기값: 첫 period개의 SMA
  let sum = 0;
  for (let i = 0; i < period; i++) sum += values[i];
  ema.push(sum / period);

  const k = 2 / (period + 1);
  for (let i = period; i < values.length; i++) {
    ema.push(values[i] * k + ema[ema.length - 1] * (1 - k));
  }

  return ema;
}

export function calcMACD(
  candles: Candle[],
  fast = 12,
  slow = 26,
  signalPeriod = 9
): MacdPoint[] {
  if (candles.length < slow + signalPeriod) return [];

  const closes = candles.map((c) => c.close);

  // EMA 계산
  const emaFast = calcEMA(closes, fast); // length = closes.length - fast + 1, 시작 인덱스 = fast - 1
  const emaSlow = calcEMA(closes, slow); // length = closes.length - slow + 1, 시작 인덱스 = slow - 1

  // MACD Line = EMA(fast) - EMA(slow), 정렬 기준: slow 시작점
  const macdValues: number[] = [];
  const macdTimes: number[] = [];
  const offset = slow - fast; // emaFast에서 건너뛸 개수

  for (let i = 0; i < emaSlow.length; i++) {
    macdValues.push(emaFast[i + offset] - emaSlow[i]);
    macdTimes.push(candles[i + slow - 1].time);
  }

  // Signal Line = MACD의 EMA(signalPeriod)
  const signalValues = calcEMA(macdValues, signalPeriod);

  // 결과 조립 (signal이 존재하는 구간만)
  const result: MacdPoint[] = [];
  const signalOffset = signalPeriod - 1;

  for (let i = 0; i < signalValues.length; i++) {
    const mi = i + signalOffset;
    const m = macdValues[mi];
    const s = signalValues[i];
    result.push({
      time: macdTimes[mi],
      macd: m,
      signal: s,
      histogram: m - s,
    });
  }

  return result;
}

// ─── Bollinger Bands ───
export interface BollingerPoint {
  time: number;
  upper: number;
  middle: number;
  lower: number;
}

export function calcBollingerBands(
  candles: Candle[],
  period = 20,
  multiplier = 2
): BollingerPoint[] {
  if (candles.length < period) return [];

  const closes = candles.map((c) => c.close);
  const result: BollingerPoint[] = [];

  for (let i = period - 1; i < closes.length; i++) {
    // SMA
    let sum = 0;
    for (let j = i - period + 1; j <= i; j++) sum += closes[j];
    const sma = sum / period;

    // 표준편차
    let sqSum = 0;
    for (let j = i - period + 1; j <= i; j++) sqSum += (closes[j] - sma) ** 2;
    const std = Math.sqrt(sqSum / period);

    result.push({
      time: candles[i].time,
      upper: sma + multiplier * std,
      middle: sma,
      lower: sma - multiplier * std,
    });
  }

  return result;
}
