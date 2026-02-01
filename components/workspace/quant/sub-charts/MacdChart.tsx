"use client";

import { getCssVar, toHex } from "@/lib/chartUtils";
import { Candle } from "@/types/Stock";
import {
  ColorType,
  createChart,
  HistogramSeries,
  LineSeries,
  LineStyle,
} from "lightweight-charts";
import { useTheme } from "next-themes";
import { useEffect, useMemo, useRef, useState } from "react";
import { SignalColors } from "../SignalInfoCard";
import { calcMACD } from "./indicators";

interface MacdChartProps {
  candles: Candle[];
  colors: SignalColors;
  height?: number;
}

export function MacdChart({ candles, colors, height = 200 }: MacdChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<ReturnType<typeof createChart> | null>(null);
  const { resolvedTheme } = useTheme();
  const [themeKey, setThemeKey] = useState(0);
  const minHeight = `clamp(140px, 22vh, ${height}px)`;

  // 테마 변경 시 CSS 변수가 완전히 업데이트된 후 차트 재생성 트리거
  useEffect(() => {
    if (!resolvedTheme) return;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setThemeKey((k) => k + 1);
      });
    });
  }, [resolvedTheme]);

  // 최근 60봉 기준으로 MACD 계산 (계산에는 전체 캔들 사용, 표시는 마지막 60개)
  const macdData = useMemo(() => {
    const all = calcMACD(candles, 12, 26, 9);
    return all.slice(-60);
  }, [candles]);

  useEffect(() => {
    if (!containerRef.current || macdData.length === 0) return;

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
        scaleMargins: { top: 0.1, bottom: 0.15 },
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

    const bgColor = toHex(getCssVar("--background-1"));

    // 히스토그램 시리즈 (먼저 추가 → 아래 레이어)
    const histogramSeries = chart.addSeries(HistogramSeries, {
      priceLineVisible: false,
      lastValueVisible: false,
    });

    histogramSeries.setData(
      macdData.map((d) => ({
        time: d.time as any,
        value: d.histogram,
        color:
          d.histogram >= 0
            ? `rgba(${hexToRgb(colors.BUY)}, 0.50)`
            : `rgba(${hexToRgb(colors.SELL)}, 0.50)`,
      }))
    );

    // MACD Line (인디고) — zero line도 여기에 추가
    const macdLine = chart.addSeries(LineSeries, {
      color: `rgba(${hexToRgb(colors.BUY)}, 0.7)`,
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: false,
      crosshairMarkerVisible: false,
      priceFormat: {
        type: "custom",
        formatter: (price: number) => {
          return Math.abs(price) < 0.5 ? "0" : "";
        },
        minMove: 0.01,
      },
    });

    macdLine.setData(
      macdData.map((d) => ({ time: d.time as any, value: d.macd }))
    );

    // Zero Line (0 기준선)
    macdLine.createPriceLine({
      price: 0,
      color: getCssVar("--chart-line"),
      lineWidth: 1,
      lineStyle: LineStyle.Dotted,
      axisLabelVisible: true,
      axisLabelColor: bgColor,
      axisLabelTextColor: getCssVar("--chart-text"),
      title: "",
    });

    // Signal Line (주황)
    const signalLine = chart.addSeries(LineSeries, {
      color: `rgba(${hexToRgb(getCssVar("--chart-text"))}, 0.7)`,
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: false,
      crosshairMarkerVisible: false,
    });

    signalLine.setData(
      macdData.map((d) => ({ time: d.time as any, value: d.signal }))
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
  }, [macdData, height, themeKey, colors.BUY, colors.SELL]);

  if (macdData.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-muted-foreground text-sm h-full"
        style={{ minHeight }}
      >
        MACD 데이터 부족
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

function hexToRgb(hexColor: string) {
  const hex = toHex(hexColor);
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
}
