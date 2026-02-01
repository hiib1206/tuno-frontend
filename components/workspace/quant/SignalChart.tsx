"use client";

import {
  calculateMA,
  candlesToPriceData,
  candlesToVolumeData,
  getCssVar,
  toHex,
} from "@/lib/chartUtils";
import { filterSignalHistory } from "@/lib/inference";
import { cn } from "@/lib/utils";
import { QuantSignalHistoryEntry } from "@/types/Inference";
import { Candle } from "@/types/Stock";
import { motion } from "framer-motion";
import {
  CandlestickSeries,
  ColorType,
  createChart,
  createSeriesMarkers,
  HistogramSeries,
  IChartApi,
  ISeriesApi,
  ISeriesMarkersPluginApi,
  LineSeries,
  Time,
  UTCTimestamp,
} from "lightweight-charts";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import { SignalColors } from "./SignalInfoCard";

interface SignalChartProps {
  candles: Candle[];
  signalHistory?: QuantSignalHistoryEntry[];
  colors: SignalColors;
  className?: string;
}

// YYYYMMDD -> UTCTimestamp 변환
function dateToTimestamp(dateStr: string): UTCTimestamp {
  const year = parseInt(dateStr.slice(0, 4));
  const month = parseInt(dateStr.slice(4, 6)) - 1;
  const day = parseInt(dateStr.slice(6, 8));
  return Math.floor(Date.UTC(year, month, day) / 1000) as UTCTimestamp;
}

const PERIOD_TABS = [
  { key: "3M", label: "3M", bars: 63 },
  { key: "6M", label: "6M", bars: 125 },
  { key: "1Y", label: "1Y", bars: 250 },
] as const;

type PeriodKey = (typeof PERIOD_TABS)[number]["key"];

export function SignalChart({
  candles,
  signalHistory,
  colors,
  className,
}: SignalChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  const ma60SeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const ma120SeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const signalMarkersRef = useRef<ISeriesMarkersPluginApi<Time> | null>(null);
  const visibleRangeRef = useRef<{ from: number; to: number } | null>(null);
  const dataLengthRef = useRef(0);
  const { resolvedTheme } = useTheme();
  const [period, setPeriod] = useState<PeriodKey>("6M");

  const barCount = PERIOD_TABS.find((t) => t.key === period)!.bars;

  // 고정 픽셀 여백 → 논리 단위 변환 (기간 무관 동일 px 여백)
  const LEFT_MARGIN_PX = 8;
  const calcVisibleRange = (dataLength: number) => {
    const chartWidth = chartContainerRef.current?.clientWidth ?? 1000;
    const leftPad = (LEFT_MARGIN_PX * dataLength) / chartWidth;
    return { from: -leftPad, to: dataLength - 1 };
  };

  const toRgba = (color: string, alpha: number) => {
    const hex = toHex(color);
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  // 차트 초기화
  useEffect(() => {
    if (!chartContainerRef.current || chartRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      autoSize: true,
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: getCssVar("--chart-text"),
      },
      grid: {
        vertLines: { color: getCssVar("--chart-line"), visible: false },
        horzLines: { color: getCssVar("--chart-line"), visible: false },
      },
      crosshair: {
        horzLine: { visible: false, labelVisible: false },
        vertLine: { visible: false, labelVisible: false },
      },
      handleScroll: false,
      handleScale: false,
      timeScale: {
        visible: true,
        rightOffset: 2,
        minBarSpacing: 3,
        fixLeftEdge: false,
        fixRightEdge: true,
        timeVisible: false,
        borderColor: getCssVar("--chart-line"),
      },
      rightPriceScale: {
        visible: true,
        borderColor: getCssVar("--chart-line"),
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
      },
      localization: {
        priceFormatter: (price: number) => {
          return new Intl.NumberFormat("ko-KR", {
            style: "decimal",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          }).format(price);
        },
      },
    });

    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: "volume" },
      color: toRgba(getCssVar("--chart-text"), 0.35),
      priceLineVisible: false,
      lastValueVisible: false,
      priceScaleId: "volume",
    });
    chart.priceScale("volume").applyOptions({
      scaleMargins: { top: 0.75, bottom: 0 },
      visible: false,
    });

    // 캔들스틱 시리즈
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: getCssVar("--chart-up"),
      downColor: getCssVar("--chart-down"),
      borderVisible: false,
      wickUpColor: getCssVar("--chart-up"),
      wickDownColor: getCssVar("--chart-down"),
      priceLineVisible: false,
      priceFormat: {
        type: "price",
        precision: 0,
        minMove: 1,
      },
    });

    // MA60 시리즈 (초록색)
    const ma60Series = chart.addSeries(LineSeries, {
      color: getCssVar("--chart-up"),
      lineWidth: 1,
      priceLineVisible: false,
      lastValueVisible: false,
      crosshairMarkerVisible: false,
    });

    // MA120 시리즈 (보라색)
    const ma120Series = chart.addSeries(LineSeries, {
      color: getCssVar("--chart-down"),
      lineWidth: 1,
      priceLineVisible: false,
      lastValueVisible: false,
      crosshairMarkerVisible: false,
    });

    chartRef.current = chart;
    volumeSeriesRef.current = volumeSeries;
    candleSeriesRef.current = candleSeries;
    ma60SeriesRef.current = ma60Series;
    ma120SeriesRef.current = ma120Series;
    const signalMarkers = createSeriesMarkers(candleSeries);
    signalMarkersRef.current = signalMarkers;

    // 컨테이너 리사이즈 시 새 너비 기준으로 visibleRange 재계산
    let resizeTimer: ReturnType<typeof setTimeout>;
    const resizeObserver = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (chartRef.current && dataLengthRef.current > 0) {
          const range = calcVisibleRange(dataLengthRef.current);
          visibleRangeRef.current = range;
          chartRef.current.timeScale().setVisibleLogicalRange(range);
        }
      }, 50);
    });
    resizeObserver.observe(chartContainerRef.current);

    return () => {
      clearTimeout(resizeTimer);
      resizeObserver.disconnect();
      signalMarkers.detach();
      chart.remove();
      chartRef.current = null;
      volumeSeriesRef.current = null;
      candleSeriesRef.current = null;
      ma60SeriesRef.current = null;
      ma120SeriesRef.current = null;
      signalMarkersRef.current = null;
    };
  }, []);

  // 데이터 업데이트 (기간 변경 시에도 재실행)
  useEffect(() => {
    if (
      !chartRef.current ||
      !volumeSeriesRef.current ||
      !candleSeriesRef.current ||
      !ma60SeriesRef.current ||
      !ma120SeriesRef.current ||
      candles.length === 0
    ) {
      return;
    }

    // 전체 데이터로 MA 계산 후, 선택 기간만큼 잘라서 표시
    const allPriceData = candlesToPriceData(candles);
    const allVolumeData = candlesToVolumeData(candles);
    const sliceStart = Math.max(0, allPriceData.length - barCount);
    const priceData = allPriceData.slice(sliceStart);
    const volumeData = allVolumeData.slice(sliceStart);

    candleSeriesRef.current.setData(priceData);

    const candleByTime = new Map<number, Candle>();
    candles.forEach((c) => candleByTime.set(c.time, c));
    const coloredVolumeData = volumeData.map((item) => {
      const candle = candleByTime.get(item.time as number);
      if (!candle) return item;

      const baseColor =
        candle.close >= candle.open
          ? getCssVar("--chart-up")
          : getCssVar("--chart-down");
      return {
        ...item,
        color: toRgba(baseColor, 0.35),
      };
    });

    volumeSeriesRef.current.setData(coloredVolumeData);

    // MA는 전체 데이터로 계산 후 같은 범위만 잘라서 표시
    if (allPriceData.length >= 60) {
      const ma60All = calculateMA(allPriceData, 60);
      const ma60Start = Math.max(0, ma60All.length - barCount);
      ma60SeriesRef.current.setData(ma60All.slice(ma60Start));
    }

    if (allPriceData.length >= 120) {
      const ma120All = calculateMA(allPriceData, 120);
      const ma120Start = Math.max(0, ma120All.length - barCount);
      ma120SeriesRef.current.setData(ma120All.slice(ma120Start));
    }

    // 시그널 세로줄 설정 (포지션 구간만 필터링)
    const filtered = signalHistory ? filterSignalHistory(signalHistory) : [];
    if (signalMarkersRef.current) {
      if (filtered.length === 0) {
        signalMarkersRef.current.setMarkers([]);
      } else {
        const size = period === "3M" ? 1 : period === "6M" ? 1 : 1;
        const markers = filtered
          .map((signal) => {
            const time = dateToTimestamp(signal.date);
            const candle = priceData.find((c) => c.time === time);
            if (!candle) return null;
            const position = signal.signal === "SELL" ? "aboveBar" : "belowBar";

            return {
              time: time as UTCTimestamp,
              position: position as "aboveBar" | "belowBar",
              shape: "circle" as const,
              color: colors[signal.signal],
              size,
            };
          })
          .filter(
            (
              marker
            ): marker is {
              time: UTCTimestamp;
              position: "aboveBar";
              shape: "circle";
              color: string;
              size: number;
            } => marker !== null
          );

        signalMarkersRef.current.setMarkers(markers);
      }
    }

    dataLengthRef.current = priceData.length;
    const timeScale = chartRef.current.timeScale();
    const range = calcVisibleRange(priceData.length);
    visibleRangeRef.current = range;
    timeScale.setVisibleLogicalRange(range);
  }, [candles, signalHistory, barCount, resolvedTheme]);

  // 테마 변경 시 색상 업데이트
  useEffect(() => {
    if (
      !chartRef.current ||
      !candleSeriesRef.current ||
      !ma60SeriesRef.current ||
      !ma120SeriesRef.current ||
      !volumeSeriesRef.current ||
      !resolvedTheme
    )
      return;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const chart = chartRef.current;
        const series = candleSeriesRef.current;
        const ma60 = ma60SeriesRef.current;
        const ma120 = ma120SeriesRef.current;
        const volumeSeries = volumeSeriesRef.current;
        if (!chart || !series || !ma60 || !ma120 || !volumeSeries) return;

        chart.applyOptions({
          layout: { textColor: getCssVar("--chart-text") },
          grid: {
            vertLines: { color: getCssVar("--chart-line"), visible: false },
            horzLines: { color: getCssVar("--chart-line"), visible: false },
          },
          rightPriceScale: {
            borderColor: getCssVar("--chart-line"),
          },
          timeScale: {
            borderColor: getCssVar("--chart-line"),
          },
        });

        series.applyOptions({
          upColor: getCssVar("--chart-up"),
          downColor: getCssVar("--chart-down"),
          wickUpColor: getCssVar("--chart-up"),
          wickDownColor: getCssVar("--chart-down"),
        });

        ma60.applyOptions({ color: getCssVar("--chart-up") });
        ma120.applyOptions({ color: getCssVar("--chart-down") });

        const allVolumeData = candlesToVolumeData(candles);
        const sliceStart = Math.max(0, allVolumeData.length - barCount);
        const volumeData = allVolumeData.slice(sliceStart);
        const candleByTime = new Map<number, Candle>();
        candles.forEach((c) => candleByTime.set(c.time, c));
        const coloredVolumeData = volumeData.map((item) => {
          const candle = candleByTime.get(item.time as number);
          if (!candle) return item;

          const baseColor =
            candle.close >= candle.open
              ? getCssVar("--chart-up")
              : getCssVar("--chart-down");
          return {
            ...item,
            color: toRgba(baseColor, 0.35),
          };
        });
        volumeSeries.setData(coloredVolumeData);
      });
    });
  }, [resolvedTheme, candles, barCount]);

  return (
    <div
      className={cn(
        "bg-background-1 rounded-md overflow-hidden p-4 flex flex-col",
        className
      )}
    >
      {/* 헤더: 타이틀 + 범례 + 기간 탭 */}
      <div className="flex items-start justify-between mb-4 flex-shrink-0">
        <h3 className="text-base text-muted-foreground uppercase tracking-wider">
          시그널 차트
        </h3>
        <div className="flex items-center gap-4">
          <div className="inline-flex items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: colors.BUY }}
              />
              BUY
            </span>
            <span className="inline-flex items-center gap-1">
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: colors.HOLD }}
              />
              HOLD
            </span>
            <span className="inline-flex items-center gap-1">
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: colors.SELL }}
              />
              SELL
            </span>
            <span className="inline-flex items-center gap-1">
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: "var(--chart-up)" }}
              />
              MA60
            </span>
            <span className="inline-flex items-center gap-1">
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: "var(--chart-down)" }}
              />
              MA120
            </span>
          </div>
          <div className="inline-flex items-center bg-background-2 rounded-full p-1">
            {PERIOD_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setPeriod(tab.key)}
                className={cn(
                  "relative px-4 py-1 rounded-full text-sm font-medium transition-colors z-10",
                  period === tab.key
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {period === tab.key && (
                  <motion.div
                    layoutId="signal-chart-period-bg"
                    className="absolute inset-0 bg-background-1 rounded-full shadow-sm"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div ref={chartContainerRef} className="w-full flex-1 min-h-[300px]" />
    </div>
  );
}
