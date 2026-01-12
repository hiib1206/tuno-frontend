import { getCssVar } from "@/lib/chartUtils";
import {
  HistogramData,
  HistogramSeries,
  IChartApi,
  ISeriesApi,
} from "lightweight-charts";

/**
 * 빈 거래량 시리즈 생성 (실시간 데이터용)
 */
export function createVolumeSeries(chart: IChartApi): ISeriesApi<"Histogram"> {
  const series = chart.addSeries(HistogramSeries, {
    priceFormat: { type: "volume" },
    color: getCssVar("--chart-text"),
    priceLineVisible: false,
  }) as ISeriesApi<"Histogram">;

  return series;
}

/**
 * 거래량 시리즈에 데이터 설정/업데이트
 * 색상은 캔들스틱과 동일하게 종가 >= 시가면 상승, 아니면 하락
 */
export function addVolume(
  chart: IChartApi,
  data: HistogramData[],
  candlestickData: { time: string; open: number; close: number }[],
  existingSeries?: ISeriesApi<"Histogram"> | null
): ISeriesApi<"Histogram"> {
  // 거래량 색상을 캔들 기준으로 설정 (종가 vs 시가)
  const coloredData = data.map((item) => {
    const candle = candlestickData.find((c) => c.time === item.time);
    if (!candle) return item;

    return {
      ...item,
      color:
        candle.close >= candle.open
          ? getCssVar("--chart-up")
          : getCssVar("--chart-down"),
    };
  });

  // 기존 시리즈가 있으면 데이터만 업데이트
  if (existingSeries) {
    existingSeries.setData(coloredData);
    return existingSeries;
  }

  // 없으면 새로 생성
  const series = createVolumeSeries(chart);
  series.setData(coloredData);
  return series;
}
