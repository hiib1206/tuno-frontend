"use client";

import { getCssVar, toHex } from "@/lib/chartUtils";
import { Candle } from "@/types/Stock";
import {
  CandlestickSeries,
  ColorType,
  createChart,
  LineSeries,
} from "lightweight-charts";
import { useTheme } from "next-themes";
import { useEffect, useMemo, useRef, useState } from "react";
import { calcBollingerBands } from "./indicators";

interface BollingerChartProps {
  candles: Candle[];
  height?: number;
}

export function BollingerChart({ candles, height = 200 }: BollingerChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<ReturnType<typeof createChart> | null>(null);
  const { resolvedTheme } = useTheme();
  const [themeKey, setThemeKey] = useState(0);
  const minHeight = `clamp(140px, 22vh, ${height}px)`;
  const toRgba = (color: string, alpha: number) => {
    const hex = toHex(color);
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  // 테마 변경 시 CSS 변수가 완전히 업데이트된 후 차트 재생성 트리거
  useEffect(() => {
    if (!resolvedTheme) return;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setThemeKey((k) => k + 1);
      });
    });
  }, [resolvedTheme]);

  // 볼린저 밴드 계산 (전체 캔들로 계산, 마지막 60봉 표시)
  const bbData = useMemo(() => {
    const all = calcBollingerBands(candles, 20, 2);
    return all.slice(-60);
  }, [candles]);

  // 표시할 캔들 데이터 (볼린저 밴드와 같은 범위)
  const displayCandles = useMemo(() => {
    if (bbData.length === 0) return [];
    const startTime = bbData[0].time;
    return candles.filter((c) => c.time >= startTime).slice(0, bbData.length);
  }, [candles, bbData]);

  useEffect(() => {
    if (!containerRef.current || bbData.length === 0) return;

    const container = containerRef.current;
    const initialHeight =
      container.clientHeight > 0 ? container.clientHeight : height;

    const chart = createChart(container, {
      height: initialHeight,
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: getCssVar("--chart-text"),
        fontSize: 11,
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { visible: false },
      },
      rightPriceScale: {
        borderVisible: false,
        scaleMargins: { top: 0.12, bottom: 0.08 },
      },
      timeScale: {
        borderVisible: false,
        timeVisible: false,
      },
      crosshair: {
        horzLine: { visible: false, labelVisible: false },
        vertLine: { visible: false, labelVisible: false },
      },
      handleScroll: false,
      handleScale: false,
      localization: {
        priceFormatter: (price: number) =>
          new Intl.NumberFormat("ko-KR", {
            maximumFractionDigits: 0,
          }).format(Math.round(price)),
      },
    });

    chartRef.current = chart;

    // 상단 밴드 (chart-up)
    const upperSeries = chart.addSeries(LineSeries, {
      color: toRgba(getCssVar("--chart-up"), 0.50),
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: false,
      crosshairMarkerVisible: false,
    });

    upperSeries.setData(
      bbData.map((d) => ({ time: d.time as any, value: d.upper }))
    );

    // 하단 밴드 (chart-down)
    const lowerSeries = chart.addSeries(LineSeries, {
      color: toRgba(getCssVar("--chart-down"), 0.50),
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: false,
      crosshairMarkerVisible: false,
    });

    lowerSeries.setData(
      bbData.map((d) => ({ time: d.time as any, value: d.lower }))
    );

    // 중간 밴드 SMA(20) (chart-text)
    const middleSeries = chart.addSeries(LineSeries, {
      color: toRgba(getCssVar("--chart-text"), 0.7),
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: false,
      crosshairMarkerVisible: false,
    });

    middleSeries.setData(
      bbData.map((d) => ({ time: d.time as any, value: d.middle }))
    );

    // 캔들스틱 (가장 위 레이어)
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: getCssVar("--chart-up"),
      downColor: getCssVar("--chart-down"),
      borderVisible: false,
      wickUpColor: getCssVar("--chart-up"),
      wickDownColor: getCssVar("--chart-down"),
      priceLineVisible: false,
      lastValueVisible: false,
    });

    candleSeries.setData(
      displayCandles.map((c) => ({
        time: c.time as any,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      }))
    );

    chart.timeScale().fitContent();

    const resizeObserver = new ResizeObserver(() => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      if (width > 0 && height > 0) {
        chart.applyOptions({ width, height });
      }
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
    };
  }, [bbData, displayCandles, height, themeKey]);

  if (bbData.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-muted-foreground text-sm h-full"
        style={{ minHeight }}
      >
        Bollinger Bands 데이터 부족
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      style={{ minHeight }}
    />
  );
}
