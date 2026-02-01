"use client";

import { getCssVar } from "@/lib/chartUtils";
import {
  ColorType,
  createChart,
  CrosshairMode,
  IChartApi,
  ISeriesApi,
} from "lightweight-charts";
import { useTheme } from "next-themes";
import { useEffect, useRef } from "react";
import { createVolumeSeries } from "./indicators";

type Props = {
  title?: string;
  // onReady: 차트가 준비되면 호출되는 콜백 함수로 차트와 시리즈 인스턴스를 전달
  onReady?: (chart: IChartApi, volumeSeries: ISeriesApi<"Histogram">) => void;
};

export function IndicatorChart({ onReady, title = "volume" }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  const { resolvedTheme } = useTheme();

  // 차트는 한 번만 생성
  useEffect(() => {
    if (!ref.current || chartRef.current) return;

    // 초기 높이는 컨테이너의 높이를 사용
    const initialHeight = ref.current.clientHeight;

    const chart = createChart(ref.current, {
      autoSize: true,
      height: initialHeight,
      layout: {
        background: { type: ColorType.Solid, color: "rgba(0, 0, 0, 0)" },
        textColor: getCssVar("--chart-text"),
      },
      grid: {
        vertLines: { color: getCssVar("--chart-line") },
        horzLines: { visible: false },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        horzLine: {
          color: getCssVar("--chart-text"),
          labelBackgroundColor: getCssVar("--chart-text"),
        },
        vertLine: {
          color: getCssVar("--chart-text"),
          labelBackgroundColor: getCssVar("--chart-text"),
        },
      },
      timeScale: {
        visible: true,
        secondsVisible: false,
        rightOffset: 20,
        minBarSpacing: 1,
        maxBarSpacing: 30,
        borderColor: getCssVar("--chart-line"),
      },
      localization: {
        timeFormatter: (time: number) => {
          const date = new Date(time * 1000);
          // 원하는 포맷으로 변경
          return date.toLocaleDateString("ko-KR", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          });
        },
      },
      rightPriceScale: {
        visible: true,
        borderColor: getCssVar("--chart-line"),
        textColor: getCssVar("--chart-text"),
        entireTextOnly: true,
        scaleMargins: {
          top: 0.15,
          bottom: 0,
        },
      },
    });

    chartRef.current = chart;

    // 거래량 시리즈 생성
    const volumeSeries = createVolumeSeries(chart);
    volumeSeriesRef.current = volumeSeries;

    // 차트와 시리즈 인스턴스를 부모에게 전달
    onReady?.(chart, volumeSeries);

    return () => {
      chart.remove();
      chartRef.current = null;
      volumeSeriesRef.current = null;
    };
  }, [onReady]);

  // 테마 변경 시 차트 색상 업데이트
  useEffect(() => {
    if (!chartRef.current || !resolvedTheme) return;

    // requestAnimationFrame을 두 번 사용하여 CSS 업데이트 완료 보장
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const chart = chartRef.current;
        if (!chart) return;

        chart.applyOptions({
          layout: { textColor: getCssVar("--chart-text") },
          grid: {
            vertLines: { color: getCssVar("--chart-line") },
            horzLines: { visible: false },
          },
          crosshair: {
            horzLine: {
              color: getCssVar("--chart-text"),
              labelBackgroundColor: getCssVar("--chart-text"),
            },
            vertLine: {
              color: getCssVar("--chart-text"),
              labelBackgroundColor: getCssVar("--chart-text"),
            },
          },
          timeScale: {
            borderColor: getCssVar("--chart-line"),
          },
          rightPriceScale: {
            borderColor: getCssVar("--chart-line"),
            textColor: getCssVar("--chart-text"),
          },
        });
      });
    });
  }, [resolvedTheme]);

  return (
    <div className="relative w-full h-full z-0">
      <div
        className="absolute left-1 z-10 text-xs font-medium"
        style={{
          color: getCssVar("--chart-text"),
          padding: "2px 4px",
          borderRadius: 6,
        }}
        aria-hidden
      >
        {title}
      </div>
      <div ref={ref} className="w-full h-full" />
    </div>
  );
}
