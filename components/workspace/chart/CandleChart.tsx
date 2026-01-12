"use client";

import { useStockChart } from "@/hooks/useStockChart";
import {
  ExchangeCode,
  MarketCode,
  StockQuote,
  StockRealtimeData,
} from "@/types/Stock";
import {
  CandlestickData,
  HistogramData,
  IChartApi,
  ISeriesApi,
  LogicalRange,
  MouseEventParams,
  UTCTimestamp,
} from "lightweight-charts";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChartTooltip } from "./ChartTooltip";
import { IndicatorChart } from "./IndicatorChart";
import { PriceChart } from "./PriceChart";

interface ChartTooltipData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  change: number;
  changeRate: number;
}

type Props = {
  code: string;
  market: MarketCode;
  exchange: ExchangeCode;
  stockQuote?: StockQuote | null;
  realtimeData?: StockRealtimeData | null;
};

/**
 * 차트 시간 범위 동기화 함수
 */
function syncTimeScale(chartA: IChartApi, chartB: IChartApi) {
  let isSyncing = false;

  const handlerA = () => {
    if (isSyncing) return;
    const range = chartA.timeScale().getVisibleLogicalRange();
    if (!range) return;

    isSyncing = true;
    chartB.timeScale().setVisibleLogicalRange(range);
    isSyncing = false;
  };

  const handlerB = () => {
    if (isSyncing) return;
    const range = chartB.timeScale().getVisibleLogicalRange();
    if (!range) return;

    isSyncing = true;
    chartA.timeScale().setVisibleLogicalRange(range);
    isSyncing = false;
  };

  chartA.timeScale().subscribeVisibleLogicalRangeChange(handlerA);
  chartB.timeScale().subscribeVisibleLogicalRangeChange(handlerB);

  return () => {
    chartA.timeScale().unsubscribeVisibleLogicalRangeChange(handlerA);
    chartB.timeScale().unsubscribeVisibleLogicalRangeChange(handlerB);
  };
}

/**
 * 가격 스케일 너비 동기화 함수
 */
function syncPriceScaleWidth(chartA: IChartApi, chartB: IChartApi) {
  try {
    const priceScaleA = chartA.priceScale("right");
    const priceScaleB = chartB.priceScale("right");

    if (!priceScaleA || !priceScaleB) return;

    const widthA = priceScaleA.width();
    const widthB = priceScaleB.width();

    if (widthA > 0 && widthB > 0) {
      const maxWidth = Math.max(widthA, widthB);
      priceScaleA.applyOptions({ minimumWidth: maxWidth });
      priceScaleB.applyOptions({ minimumWidth: maxWidth });
    }
  } catch (error) {
    // 차트가 아직 준비되지 않은 경우 무시
  }
}

/**
 * 크로스헤어 동기화 및 툴팁 업데이트 함수
 * - 세로선(시간)은 두 차트 모두에서 표시
 * - 가로선(가격)은 마우스가 있는 차트에서만 표시
 * - 툴팁 데이터 업데이트
 */
function syncCrosshair(
  chartA: IChartApi,
  chartB: IChartApi,
  seriesA: ISeriesApi<"Candlestick">,
  seriesB: ISeriesApi<"Histogram">,
  onTooltipUpdate: (data: ChartTooltipData | null) => void,
  onDataUpdateSubscribe: (callback: () => void) => () => void
) {
  // 차트 데이터를 저장 (모든 차트에서 접근 가능하도록)
  let allCandleData: CandlestickData[] = [];
  let allVolumeData: HistogramData[] = [];

  // 마우스 상태 추적
  let isMouseOutside = true; // 기본값: 차트 밖
  let currentHoverTime: UTCTimestamp | null = null; // 현재 마우스가 가리키는 시간

  // 차트 데이터 갱신
  const updateAllData = () => {
    try {
      allCandleData = (seriesA.data() as CandlestickData[]) || [];
      allVolumeData = (seriesB.data() as HistogramData[]) || [];
    } catch (error) {
      console.error("Failed to get chart data:", error);
    }
  };

  // 초기 데이터 로드
  updateAllData();

  // 툴팁 데이터 추출 함수 (time으로 직접 데이터 찾기)
  const extractTooltipData = (time: UTCTimestamp): ChartTooltipData | null => {
    // 저장된 데이터에서 time으로 직접 찾기
    const candleData = allCandleData.find((d) => d.time === time);
    const volumeData = allVolumeData.find((d) => d.time === time);

    if (!candleData) return null;

    // 전일 종가 찾기 (전일 대비 계산용)
    const currentIndex = allCandleData.findIndex((d) => d.time === time);
    const prevCandle =
      currentIndex > 0 ? allCandleData[currentIndex - 1] : null;
    const prevClose = prevCandle ? prevCandle.close : candleData.open;

    const change = candleData.close - prevClose;
    const changeRate = (change / prevClose) * 100;

    return {
      date: formatTimestamp(time),
      open: candleData.open,
      high: candleData.high,
      low: candleData.low,
      close: candleData.close,
      volume: volumeData?.value || 0,
      change,
      changeRate,
    };
  };

  // 마지막 봉 데이터로 툴팁 업데이트
  const updateTooltipWithLastCandle = () => {
    if (allCandleData.length === 0) return;

    const lastCandle = allCandleData[allCandleData.length - 1];
    const prevCandle =
      allCandleData.length > 1 ? allCandleData[allCandleData.length - 2] : null;
    const prevClose = prevCandle ? prevCandle.close : lastCandle.open;
    const change = lastCandle.close - prevClose;
    const changeRate = (change / prevClose) * 100;

    const lastVolume =
      allVolumeData.length > 0 ? allVolumeData[allVolumeData.length - 1] : null;

    onTooltipUpdate({
      date: formatTimestamp(lastCandle.time as UTCTimestamp),
      open: lastCandle.open,
      high: lastCandle.high,
      low: lastCandle.low,
      close: lastCandle.close,
      volume: lastVolume?.value || 0,
      change,
      changeRate,
    });
  };

  // chartA(가격 차트)에 마우스가 있을 때
  const handlerA = (param: MouseEventParams) => {
    if (param.time) {
      isMouseOutside = false;
      currentHoverTime = param.time as UTCTimestamp;
      // chartB에 세로선만 표시
      chartB.setCrosshairPosition(NaN, param.time, seriesB);
      // 툴팁 업데이트
      const tooltipData = extractTooltipData(param.time as UTCTimestamp);
      onTooltipUpdate(tooltipData);
    } else {
      isMouseOutside = true;
      currentHoverTime = null;
      chartB.clearCrosshairPosition();
      // 마우스가 차트를 벗어나면 마지막 값 표시
      updateTooltipWithLastCandle();
    }
  };

  // chartB(보조지표)에 마우스가 있을 때
  const handlerB = (param: MouseEventParams) => {
    if (param.time) {
      isMouseOutside = false;
      currentHoverTime = param.time as UTCTimestamp;
      // chartA에 세로선만 표시
      chartA.setCrosshairPosition(NaN, param.time, seriesA);
      // 툴팁 업데이트
      const tooltipData = extractTooltipData(param.time as UTCTimestamp);
      onTooltipUpdate(tooltipData);
    } else {
      isMouseOutside = true;
      currentHoverTime = null;
      chartA.clearCrosshairPosition();
      // 마우스가 차트를 벗어나면 마지막 값 표시
      updateTooltipWithLastCandle();
    }
  };

  chartA.subscribeCrosshairMove(handlerA);
  chartB.subscribeCrosshairMove(handlerB);

  // 데이터 업데이트 이벤트 구독 (실시간 데이터가 업데이트될 때)
  const unsubscribeDataUpdate = onDataUpdateSubscribe(() => {
    // 차트 데이터 갱신
    updateAllData();

    // 마우스가 차트 밖에 있거나 마지막 봉 위에 있을 때만 툴팁 업데이트
    if (isMouseOutside) {
      // 마우스가 차트 밖 → 마지막 봉 데이터로 업데이트
      updateTooltipWithLastCandle();
    } else if (currentHoverTime && allCandleData.length > 0) {
      // 마우스가 마지막 봉 위에 있는지 확인
      const lastCandle = allCandleData[allCandleData.length - 1];
      if (lastCandle && lastCandle.time === currentHoverTime) {
        // 마지막 봉 위 → 업데이트된 마지막 봉 데이터로 툴팁 갱신
        const tooltipData = extractTooltipData(currentHoverTime);
        onTooltipUpdate(tooltipData);
      }
    }
  });

  return () => {
    chartA.unsubscribeCrosshairMove(handlerA);
    chartB.unsubscribeCrosshairMove(handlerB);
    unsubscribeDataUpdate();
  };
}

/**
 * Unix timestamp를 날짜 문자열로 변환
 */
function formatTimestamp(timestamp: UTCTimestamp): string {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  });
}

export function CandleChart({
  code,
  market,
  exchange,
  stockQuote,
  realtimeData,
}: Props) {
  // 차트 및 시리즈 인스턴스 상태 (동기화용)
  const [priceChart, setPriceChart] = useState<IChartApi | null>(null);
  const [indicatorChart, setIndicatorChart] = useState<IChartApi | null>(null);
  const [candleSeries, setCandleSeries] =
    useState<ISeriesApi<"Candlestick"> | null>(null);
  const [volumeSeries, setVolumeSeries] =
    useState<ISeriesApi<"Histogram"> | null>(null);

  // 툴팁 관련 상태
  const [tooltipData, setTooltipData] = useState<ChartTooltipData | null>(null);

  // 리사이저 관련 상태 및 ref
  // flex-[5]와 flex-[2] 비율 = 5/7 ≈ 71.4%
  const [priceChartHeight, setPriceChartHeight] = useState(71.4);
  const containerRef = useRef<HTMLDivElement>(null);
  const isResizingRef = useRef(false);

  // 통합 차트 관리 훅
  const {
    isLoading,
    error,
    registerCandleSeries,
    registerVolumeSeries,
    registerMaSeries,
    updateRealtimeData,
    loadMoreData,
    hasMoreData,
    onDataUpdate,
  } = useStockChart(code, market, exchange, { stockQuote });

  // 과거 데이터 로드 관련 ref
  const isLoadingMoreRef = useRef(false);
  const loadMoreDataRef = useRef(loadMoreData);
  const hasMoreDataRef = useRef(hasMoreData);

  // ref 동기화
  useEffect(() => {
    loadMoreDataRef.current = loadMoreData;
  }, [loadMoreData]);

  useEffect(() => {
    hasMoreDataRef.current = hasMoreData;
  }, [hasMoreData]);

  // 리사이저 드래그 핸들러
  const handleResizerMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    isResizingRef.current = true;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizingRef.current || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const mouseY = e.clientY - containerRect.top;
      const containerHeight = containerRect.height;

      // 최소/최대 높이 제한 (30% ~ 85%)
      const minHeight = 30;
      const maxHeight = 85;
      const newHeight = Math.max(
        minHeight,
        Math.min(maxHeight, (mouseY / containerHeight) * 100)
      );

      setPriceChartHeight(newHeight);
    };

    const handleMouseUp = () => {
      isResizingRef.current = false;
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    // 드래그 중 커서 및 선택 방지
    document.body.style.cursor = "row-resize";
    document.body.style.userSelect = "none";

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }, []);

  // PriceChart onReady 콜백
  const handlePriceChartReady = useCallback(
    (
      chart: IChartApi,
      series: ISeriesApi<"Candlestick">,
      maSeries: Map<number, ISeriesApi<"Line">>
    ) => {
      setPriceChart(chart);
      setCandleSeries(series);
      registerCandleSeries(series);

      // 이동평균선 시리즈 등록
      for (const [period, lineSeries] of maSeries) {
        registerMaSeries(period, lineSeries);
      }
    },
    [registerCandleSeries, registerMaSeries]
  );

  // IndicatorChart onReady 콜백
  const handleIndicatorChartReady = useCallback(
    (chart: IChartApi, series: ISeriesApi<"Histogram">) => {
      setIndicatorChart(chart);
      setVolumeSeries(series);
      registerVolumeSeries(series);
    },
    [registerVolumeSeries]
  );

  // 차트 시간축 동기화
  useEffect(() => {
    if (!priceChart || !indicatorChart) return;

    const cleanup = syncTimeScale(priceChart, indicatorChart);
    return cleanup;
  }, [priceChart, indicatorChart]);

  // 크로스헤어 동기화 및 툴팁 업데이트
  useEffect(() => {
    if (!priceChart || !indicatorChart || !candleSeries || !volumeSeries)
      return;

    const cleanup = syncCrosshair(
      priceChart,
      indicatorChart,
      candleSeries,
      volumeSeries,
      setTooltipData,
      onDataUpdate
    );
    return cleanup;
  }, [priceChart, indicatorChart, candleSeries, volumeSeries, onDataUpdate]);

  // 가격 스케일 너비 동기화
  useEffect(() => {
    if (!priceChart || !indicatorChart) return;

    const syncWidth = () => {
      requestAnimationFrame(() => {
        syncPriceScaleWidth(priceChart, indicatorChart);
      });
    };

    const observer = new ResizeObserver(syncWidth);

    const priceElement = priceChart.chartElement();
    const indicatorElement = indicatorChart.chartElement();

    if (priceElement) observer.observe(priceElement);
    if (indicatorElement) observer.observe(indicatorElement);

    // 초기 동기화
    syncWidth();

    return () => {
      observer.disconnect();
    };
  }, [priceChart, indicatorChart]);

  // 왼쪽 스크롤 시 과거 데이터 로드 (뷰포트 위치 유지)
  useEffect(() => {
    if (!priceChart) return;

    const handleRangeChange = async (logicalRange: LogicalRange | null) => {
      if (!logicalRange) return;
      if (!hasMoreDataRef.current) return;
      if (isLoadingMoreRef.current) return;

      // 왼쪽 여백이 20봉 이하면 과거 데이터 로드
      if (logicalRange.from <= 20) {
        isLoadingMoreRef.current = true;

        // 현재 visible range 저장
        const currentRange = priceChart.timeScale().getVisibleLogicalRange();

        // 과거 데이터 로드
        const addedCount = await loadMoreDataRef.current();

        // 뷰포트 위치 보정 (새로 추가된 데이터 개수만큼 오프셋)
        if (addedCount > 0 && currentRange) {
          priceChart.timeScale().setVisibleLogicalRange({
            from: currentRange.from + addedCount,
            to: currentRange.to + addedCount,
          });
        }

        isLoadingMoreRef.current = false;
      }
    };

    priceChart
      .timeScale()
      .subscribeVisibleLogicalRangeChange(handleRangeChange);

    return () => {
      priceChart
        .timeScale()
        .unsubscribeVisibleLogicalRangeChange(handleRangeChange);
    };
  }, [priceChart]);

  // 실시간 데이터 업데이트
  useEffect(() => {
    if (realtimeData) {
      updateRealtimeData(realtimeData);
    }
  }, [realtimeData, updateRealtimeData]);

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-full text-muted-foreground">
        차트 로딩 중...
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="flex items-center justify-center w-full h-full text-destructive">
        {error}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex flex-col w-full h-[400px] md:h-full cursor-crosshair relative"
    >
      <div
        style={{ height: `${priceChartHeight}%` }}
        className="min-h-0 relative z-0"
      >
        <PriceChart onReady={handlePriceChartReady} />
      </div>
      <div
        onMouseDown={handleResizerMouseDown}
        className="h-0.25 bg-chart-text/60 cursor-row-resize hover:bg-chart-text/80 transition-colors relative group flex-shrink-0 z-[5]"
      >
        {/* 호버 시 시각적 피드백 */}
        <div className="absolute inset-0 bg-transparent group-hover:bg-chart-text/20" />
      </div>
      <div
        style={{ height: `${100 - priceChartHeight}%` }}
        className="min-h-0 relative z-0"
      >
        <IndicatorChart onReady={handleIndicatorChartReady} />
      </div>

      {/* 차트 툴팁 - 최상위에 배치하여 모든 영역에서 보이도록 */}
      <ChartTooltip data={tooltipData} />
    </div>
  );
}
