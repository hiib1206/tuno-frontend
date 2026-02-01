"use client";

import { getCssVar, toHex } from "@/lib/chartUtils";
import { Candle } from "@/types/Stock";
import {
  ColorType,
  createChart,
  LineSeries,
  LineStyle,
} from "lightweight-charts";
import { useTheme } from "next-themes";
import { useEffect, useMemo, useRef, useState } from "react";
import { SignalColors } from "../SignalInfoCard";
import { calcRSI } from "./indicators";

interface RsiChartProps {
  candles: Candle[];
  colors: SignalColors;
  height?: number;
}

export function RsiChart({ candles, colors, height = 200 }: RsiChartProps) {
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

  // 최근 60봉 기준으로 RSI 계산 (계산에는 전체 캔들 사용, 표시는 마지막 60개)
  const rsiData = useMemo(() => {
    const allRsi = calcRSI(candles, 14);
    return allRsi.slice(-60);
  }, [candles]);

  useEffect(() => {
    if (!containerRef.current || rsiData.length === 0) return;

    const container = containerRef.current;
    const initialHeight = container.clientHeight > 0 ? container.clientHeight : height;

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
        scaleMargins: { top: 0.08, bottom: 0.08 },
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
    });

    chartRef.current = chart;

    const timeData = rsiData.map((d) => ({ time: d.time as any, value: d.value }));

    // 기준선 전용 시리즈 (먼저 추가 → 아래 레이어)
    const refSeries = chart.addSeries(LineSeries, {
      color: "transparent",
      lineWidth: 1,
      priceLineVisible: false,
      lastValueVisible: false,
      crosshairMarkerVisible: false,
      priceFormat: {
        type: "custom",
        formatter: (price: number) => {
          const r = Math.round(price);
          return r === 30 || r === 50 || r === 70 ? r.toString() : "";
        },
        minMove: 1,
      },
      autoscaleInfoProvider: () => ({
        priceRange: {
          minValue: 15,
          maxValue: 85,
        },
      }),
    });
    refSeries.setData(timeData);

    const overboughtColor = `rgba(${hexToRgb(colors.SELL)}, 0.7)`;
    const oversoldColor = `rgba(${hexToRgb(colors.BUY)}, 0.7)`;
    const overboughtLabelColor = `rgba(${hexToRgb(colors.SELL)}, 0.85)`;
    const oversoldLabelColor = `rgba(${hexToRgb(colors.BUY)}, 0.85)`;

    // 과매수 라인 (70)
    refSeries.createPriceLine({
      price: 70,
      color: overboughtColor,
      lineWidth: 2,
      lineStyle: LineStyle.Dashed,
      axisLabelVisible: true,
      axisLabelColor: toHex(getCssVar("--background-1")),
      axisLabelTextColor: overboughtLabelColor,
      title: "",
    });

    // 과매도 라인 (30)
    refSeries.createPriceLine({
      price: 30,
      color: oversoldColor,
      lineWidth: 2,
      lineStyle: LineStyle.Dashed,
      axisLabelVisible: true,
      axisLabelColor: toHex(getCssVar("--background-1")),
      axisLabelTextColor: oversoldLabelColor,
      title: "",
    });

    // 중립선 (50)
    refSeries.createPriceLine({
      price: 50,
      color: getCssVar("--chart-line"),
      lineWidth: 2,
      lineStyle: LineStyle.Dotted,
      axisLabelVisible: true,
      axisLabelColor: toHex(getCssVar("--background-1")),
      axisLabelTextColor: getCssVar("--chart-text"),
      title: "",
    });

    // RSI 라인 (나중에 추가 → 위 레이어)
    const lastValue = rsiData[rsiData.length - 1]?.value ?? 50;
    const neutralColor = `rgba(${hexToRgb(getCssVar("--chart-text"))})`;
    const rsiColor =
      lastValue >= 70
        ? `rgba(${hexToRgb(colors.SELL)}, 0.65)`
        : lastValue <= 30
          ? `rgba(${hexToRgb(colors.BUY)}, 0.65)`
          : neutralColor;

    const rsiLine = chart.addSeries(LineSeries, {
      color: rsiColor,
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: false,
      crosshairMarkerVisible: false,
    });
    rsiLine.setData(timeData);

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
  }, [rsiData, height, themeKey, colors.BUY, colors.SELL]);

  if (rsiData.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-muted-foreground text-sm h-full"
        style={{ minHeight }}
      >
        RSI 데이터 부족
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
