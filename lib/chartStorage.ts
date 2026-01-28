import { HorizontalLine } from "@/components/workspace/chart/primitives/HorizontalLinePrimitive";
import { TrendLine } from "@/components/workspace/chart/primitives/TrendLinePrimitive";

const STORAGE_KEY = "chart_drawings";

/**
 * 전체 차트 드로잉 데이터 타입
 * @example { "005930_1D": {...}, "035720_1D": {...} }
 */
interface ChartDrawingsData {
  [key: string]: {
    horizontalLines?: HorizontalLine[];
    trendLines?: TrendLine[];
  };
}

/**
 * 종목+타임프레임 조합 키 생성
 */
function getStockKey(code: string, timeframe: string): string {
  return `${code}_${timeframe}`;
}

/**
 * 전체 드로잉 데이터 불러오기
 */
function getAllDrawings(): ChartDrawingsData {
  if (typeof window === "undefined") return {};

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch (error) {
    console.error("Failed to load chart drawings:", error);
    return {};
  }
}

/**
 * 전체 드로잉 데이터 저장
 */
function saveAllDrawings(data: ChartDrawingsData): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save chart drawings:", error);
  }
}

/**
 * 저장된 수평선 불러오기
 */
export function loadHorizontalLines(
  code: string,
  timeframe: string
): HorizontalLine[] {
  const allData = getAllDrawings();
  const stockKey = getStockKey(code, timeframe);
  return allData[stockKey]?.horizontalLines ?? [];
}

/**
 * 수평선 저장
 */
export function saveHorizontalLines(
  code: string,
  timeframe: string,
  lines: HorizontalLine[]
): void {
  const allData = getAllDrawings();
  const stockKey = getStockKey(code, timeframe);

  const existing = allData[stockKey] ?? {};

  if (lines.length === 0) {
    delete existing.horizontalLines;
  } else {
    existing.horizontalLines = lines;
  }

  // 데이터가 모두 비어있으면 키 삭제
  if (!existing.horizontalLines?.length && !existing.trendLines?.length) {
    delete allData[stockKey];
  } else {
    allData[stockKey] = existing;
  }

  saveAllDrawings(allData);
}

/**
 * 저장된 추세선 불러오기
 */
export function loadTrendLines(
  code: string,
  timeframe: string
): TrendLine[] {
  const allData = getAllDrawings();
  const stockKey = getStockKey(code, timeframe);
  return allData[stockKey]?.trendLines ?? [];
}

/**
 * 추세선 저장
 */
export function saveTrendLines(
  code: string,
  timeframe: string,
  lines: TrendLine[]
): void {
  const allData = getAllDrawings();
  const stockKey = getStockKey(code, timeframe);

  const existing = allData[stockKey] ?? {};

  if (lines.length === 0) {
    delete existing.trendLines;
  } else {
    existing.trendLines = lines;
  }

  // 데이터가 모두 비어있으면 키 삭제
  if (!existing.horizontalLines?.length && !existing.trendLines?.length) {
    delete allData[stockKey];
  } else {
    allData[stockKey] = existing;
  }

  saveAllDrawings(allData);
}
