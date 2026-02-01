"use client";

import { DEFAULT_MA_CONFIGS, getCssVar } from "@/lib/chartUtils";
import {
  CandlestickSeries,
  ColorType,
  createChart,
  CrosshairMode,
  IChartApi,
  ISeriesApi,
  LineSeries,
} from "lightweight-charts";
import { useTheme } from "next-themes";
import { useEffect, useRef } from "react";
import { PriceBandPrimitive } from "./primitives/PriceBandPrimitive";

type Props = {
  // onReady: 차트가 준비되면 호출되는 콜백 함수로 차트와 시리즈 인스턴스를 전달
  onReady?: (
    chart: IChartApi,
    series: ISeriesApi<"Candlestick">,
    maSeries: Map<number, ISeriesApi<"Line">>,
    priceBandPrimitive: PriceBandPrimitive
  ) => void;
};

export function PriceChart({ onReady }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const maSeriesRef = useRef<Map<number, ISeriesApi<"Line">>>(new Map());
  const priceBandPrimitiveRef = useRef<PriceBandPrimitive | null>(null);
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
        horzLines: { color: getCssVar("--chart-line") },
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
        visible: false,
        rightOffset: 20,
        minBarSpacing: 1,
        maxBarSpacing: 30,
      },
      rightPriceScale: {
        visible: true,
        borderColor: getCssVar("--chart-line"),
        textColor: getCssVar("--chart-text"),
        entireTextOnly: true,
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

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: getCssVar("--chart-up"),
      downColor: getCssVar("--chart-down"),
      borderVisible: false,
      wickUpColor: getCssVar("--chart-up"),
      wickDownColor: getCssVar("--chart-down"),
      priceFormat: {
        type: "price",
        precision: 0,
        minMove: 1,
      },
    });

    // 이동평균선 시리즈 생성
    const maSeries = new Map<number, ISeriesApi<"Line">>();
    for (const config of DEFAULT_MA_CONFIGS) {
      const lineSeries = chart.addSeries(LineSeries, {
        color: config.color,
        lineWidth: 1,
        priceLineVisible: false,
        lastValueVisible: false,
        crosshairMarkerVisible: false,
      });
      maSeries.set(config.period, lineSeries);
    }

    // 가격 밴드 프리미티브 생성 및 연결
    const priceBandPrimitive = new PriceBandPrimitive();
    candlestickSeries.attachPrimitive(priceBandPrimitive);

    chartRef.current = chart;
    seriesRef.current = candlestickSeries;
    maSeriesRef.current = maSeries;
    priceBandPrimitiveRef.current = priceBandPrimitive;

    // 차트와 시리즈 인스턴스를 부모에게 전달
    onReady?.(chart, candlestickSeries, maSeries, priceBandPrimitive);

    return () => {
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
      maSeriesRef.current = new Map();
      priceBandPrimitiveRef.current = null;
    };
  }, [onReady]);

  // 테마 변경 시 차트 색상 업데이트
  useEffect(() => {
    if (!chartRef.current || !seriesRef.current || !resolvedTheme) return;

    // requestAnimationFrame을 두 번 사용하여 CSS 업데이트 완료 보장
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const chart = chartRef.current;
        const series = seriesRef.current;
        if (!chart || !series) return;

        chart.applyOptions({
          layout: { textColor: getCssVar("--chart-text") },
          grid: {
            vertLines: { color: getCssVar("--chart-line") },
            horzLines: { color: getCssVar("--chart-line") },
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
          rightPriceScale: {
            borderColor: getCssVar("--chart-line"),
            textColor: getCssVar("--chart-text"),
          },
        });

        series.applyOptions({
          upColor: getCssVar("--chart-up"),
          downColor: getCssVar("--chart-down"),
          wickUpColor: getCssVar("--chart-up"),
          wickDownColor: getCssVar("--chart-down"),
        });
      });
    });
  }, [resolvedTheme]);

  return <div ref={ref} className="w-full h-full" />;
}
