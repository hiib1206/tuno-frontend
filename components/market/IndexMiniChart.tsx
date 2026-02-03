"use client";

import stockApi from "@/api/stockApi";
import {
  LineChartDataPoint,
  SimpleLineChart,
} from "@/components/chart/SimpleLineChart";
import { Skeleton } from "@/components/ui/Skeleton";
import { getCssVar, toHex } from "@/lib/chartUtils";
import { cn } from "@/lib/utils";
import { Candle, IndexMinuteCandle } from "@/types/Stock";
import { useCallback, useEffect, useMemo, useState } from "react";

type IndexTab = "kospi" | "kosdaq";
type PeriodTab = "1M" | "3M" | "6M" | "1Y";

const INDEX_CODES: Record<IndexTab, string> = {
  kospi: "0001",
  kosdaq: "1001",
};

const INDEX_LABELS: Record<IndexTab, string> = {
  kospi: "코스피",
  kosdaq: "코스닥",
};

const PERIOD_LIMITS: Record<PeriodTab, number> = {
  "1M": 22,
  "3M": 66,
  "6M": 132,
  "1Y": 250,
};

const MINUTE_PARAMS = {
  interval: "3600" as const,
  include_past_data: "false" as const,
  exclude_after_hours: "false" as const,
};

type IndexCache = Record<
  IndexTab,
  { candles: Candle[]; minuteCandles: IndexMinuteCandle[] | null }
>;

interface IndexMiniChartProps {
  className?: string;
}

export function IndexMiniChart({ className }: IndexMiniChartProps) {
  const [indexTab, setIndexTab] = useState<IndexTab>("kospi");
  const [periodTab, setPeriodTab] = useState<PeriodTab>("3M");
  const [cache, setCache] = useState<IndexCache>({
    kospi: { candles: [], minuteCandles: null },
    kosdaq: { candles: [], minuteCandles: null },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [pollError, setPollError] = useState(false);

  // 초기 fetch — 마운트 시 1회 (코스피·코스닥 캔들 1Y + 분봉)
  useEffect(() => {
    const fetchAll = async () => {
      setIsLoading(true);
      try {
        const [kospiCandle, kosdaqCandle, kospiMinute, kosdaqMinute] =
          await Promise.all([
            stockApi.getIndexCandle({ code: INDEX_CODES.kospi, interval: "1d", limit: 250 }),
            stockApi.getIndexCandle({ code: INDEX_CODES.kosdaq, interval: "1d", limit: 250 }),
            stockApi.getIndexMinuteChart(INDEX_CODES.kospi, MINUTE_PARAMS),
            stockApi.getIndexMinuteChart(INDEX_CODES.kosdaq, MINUTE_PARAMS),
          ]);

        setCache({
          kospi: {
            candles:
              kospiCandle.success && kospiCandle.data?.candles.length
                ? kospiCandle.data.candles
                : [],
            minuteCandles: kospiMinute.success ? kospiMinute.data : null,
          },
          kosdaq: {
            candles:
              kosdaqCandle.success && kosdaqCandle.data?.candles.length
                ? kosdaqCandle.data.candles
                : [],
            minuteCandles: kosdaqMinute.success ? kosdaqMinute.data : null,
          },
        });
      } catch {
        // 전체 실패 → cache 빈 상태 유지 → "조회 실패" 표시
      } finally {
        setIsLoading(false);
      }
    };

    fetchAll();
  }, []);

  // 분봉 폴링 — 1분 간격, 코스피·코스닥 동시
  const pollMinuteCharts = useCallback(async () => {
    const [kospiRes, kosdaqRes] = await Promise.all([
      stockApi.getIndexMinuteChart(INDEX_CODES.kospi, MINUTE_PARAMS).catch(() => null),
      stockApi.getIndexMinuteChart(INDEX_CODES.kosdaq, MINUTE_PARAMS).catch(() => null),
    ]);

    const kospiFailed = !kospiRes?.success;
    const kosdaqFailed = !kosdaqRes?.success;

    setCache((prev) => ({
      kospi: {
        ...prev.kospi,
        minuteCandles: kospiFailed ? prev.kospi.minuteCandles : kospiRes.data,
      },
      kosdaq: {
        ...prev.kosdaq,
        minuteCandles: kosdaqFailed ? prev.kosdaq.minuteCandles : kosdaqRes.data,
      },
    }));
    setPollError(kospiFailed || kosdaqFailed);
  }, []);

  useEffect(() => {
    const id = setInterval(pollMinuteCharts, 60_000);
    return () => clearInterval(id);
  }, [pollMinuteCharts]);

  // 활성 탭 캔들 (기간에 따라 slice)
  const activeCandles = useMemo(
    () => cache[indexTab].candles.slice(-PERIOD_LIMITS[periodTab]),
    [cache, indexTab, periodTab]
  );

  // 분봉 첫 번째 데이터에서 현재가·거래일 추출
  const latestMinute = useMemo(() => {
    const mc = cache[indexTab].minuteCandles;
    if (!mc || mc.length === 0) return null;
    const first = mc[0];
    if (first.close == null) return null;
    return { price: first.close, tradingDate: first.date };
  }, [cache, indexTab]);

  // 차트 데이터 변환 (분봉 현재가 병합)
  const chartData: LineChartDataPoint[] = useMemo(() => {
    const toDateLabel = (d: Date) =>
      d.toLocaleDateString("ko-KR", { month: "2-digit", day: "2-digit" });

    const points: LineChartDataPoint[] = activeCandles.map((c) => ({
      date: toDateLabel(new Date(c.time * 1000)),
      value: c.close,
    }));

    if (latestMinute && points.length > 0) {
      const tradingLabel = toDateLabel(new Date(latestMinute.tradingDate * 1000));
      const last = points[points.length - 1];

      if (last.date === tradingLabel) {
        last.value = latestMinute.price;
      } else {
        points.push({ date: tradingLabel, value: latestMinute.price });
      }
    }

    return points;
  }, [activeCandles, latestMinute]);

  // 현재가 / 등락 (전체 캔들 기준, 분봉 우선)
  const priceInfo = useMemo(() => {
    const candles = cache[indexTab].candles;

    if (latestMinute && candles.length >= 1) {
      const toDateLabel = (d: Date) =>
        d.toLocaleDateString("ko-KR", { month: "2-digit", day: "2-digit" });
      const tradingLabel = toDateLabel(new Date(latestMinute.tradingDate * 1000));
      const lastCandleLabel = toDateLabel(
        new Date(candles[candles.length - 1].time * 1000)
      );

      const prevClose =
        lastCandleLabel === tradingLabel && candles.length >= 2
          ? candles[candles.length - 2].close
          : candles[candles.length - 1].close;

      const change = latestMinute.price - prevClose;
      const changeRate = (change / prevClose) * 100;
      return {
        price: latestMinute.price,
        change,
        changeRate,
        isUp: change > 0,
        isDown: change < 0,
      };
    }
    if (candles.length < 2) return null;
    const last = candles[candles.length - 1];
    const prev = candles[candles.length - 2];
    const change = last.close - prev.close;
    const changeRate = (change / prev.close) * 100;
    return {
      price: last.close,
      change,
      changeRate,
      isUp: change > 0,
      isDown: change < 0,
    };
  }, [cache, indexTab, latestMinute]);

  // 차트 색상 (상승/하락)
  const chartColor = useMemo(() => {
    if (!priceInfo) return "#8b5cf6";
    const cssVar = priceInfo.isUp
      ? getCssVar("--chart-up")
      : priceInfo.isDown
        ? getCssVar("--chart-down")
        : getCssVar("--chart-text");
    return toHex(cssVar) || "#8b5cf6";
  }, [priceInfo]);

  return (
    <div
      className={cn(
        "bg-background-1 rounded-md overflow-hidden flex flex-col relative",
        className
      )}
    >
      {/* 지수 탭 */}
      <div className="flex border-b border-border-2">
        {(["kospi", "kosdaq"] as IndexTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setIndexTab(tab)}
            className={cn(
              "flex-1 py-2 text-xs font-medium transition-colors",
              indexTab === tab
                ? "text-accent border-b-2 border-accent -mb-px"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {INDEX_LABELS[tab]}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex-1 flex flex-col gap-2 px-2 pt-3">
          <Skeleton variant="shimmer-contrast" className="h-10 w-full rounded" />
          <Skeleton variant="shimmer-contrast" className="flex-1 w-full rounded" />
        </div>
      ) : chartData.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-destructive">조회 실패</p>
        </div>
      ) : (
        <>
          {/* 폴링 에러 표시 */}
          {pollError && (
            <p className="absolute top-10 right-2 text-[10px] text-destructive">
              현재가 업데이트 실패
            </p>
          )}

          {/* 현재가 + 등락 */}
          {priceInfo && (
            <div className="px-2 pt-3 pb-1">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text font-semibold text-foreground">오늘의 지수</span>
                <span
                  className={cn(
                    "text-xl font-bold tabular-nums",
                    priceInfo.isUp
                      ? "text-chart-up"
                      : priceInfo.isDown
                        ? "text-chart-down"
                        : "text-foreground"
                  )}
                >
                  {priceInfo.price.toLocaleString("ko-KR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
                <span
                  className={cn(
                    "text-xs font-medium tabular-nums",
                    priceInfo.isUp
                      ? "text-chart-up"
                      : priceInfo.isDown
                        ? "text-chart-down"
                        : "text-muted-foreground"
                  )}
                >
                  {priceInfo.isUp ? "▲" : priceInfo.isDown ? "▼" : ""}
                  {" "}
                  {Math.abs(priceInfo.change).toLocaleString("ko-KR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                  {" "}
                  ({priceInfo.isUp ? "+" : ""}
                  {priceInfo.changeRate.toFixed(2)}%)
                </span>
              </div>
            </div>
          )}

          {/* 차트 */}
          <div className="flex-1 px-2 min-h-0">
            <SimpleLineChart
              data={chartData}
              color={chartColor}
              showAxis={false}
              showMinMax={false}
              showTooltip={true}
              tooltipBgColor="bg-background-2"
              valueFormatter={(v) =>
                v.toLocaleString("ko-KR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })
              }
            />
          </div>

          {/* 기간 탭 */}
          <div className="flex justify-center gap-1 px-3 py-2">
            {(["1M", "3M", "6M", "1Y"] as PeriodTab[]).map((period) => (
              <button
                key={period}
                onClick={() => setPeriodTab(period)}
                className={cn(
                  "px-2.5 py-1 text-[10px] font-medium rounded transition-colors",
                  periodTab === period
                    ? "text-foreground scale-110"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                {period}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
