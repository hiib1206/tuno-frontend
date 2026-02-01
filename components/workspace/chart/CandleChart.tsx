"use client";

import { Skeleton } from "@/components/ui/Skeleton";
import { useStockChart } from "@/hooks/useStockChart";
import { useChartOverlayStore } from "@/stores/chartOverlayStore";
import {
  loadHorizontalLines,
  saveHorizontalLines,
  loadTrendLines,
  saveTrendLines,
} from "@/lib/chartStorage";
import { getCssVar } from "@/lib/chartUtils";
import { cn } from "@/lib/utils";
import { SnapbackPoint, SnapbackSupport } from "@/types/Inference";
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
import { ChartDrawingToolbar, DrawingTool } from "./ChartDrawingToolbar";
import { ChartTimeframeToolbar } from "./ChartTimeframeToolbar";
import { ChartTooltip } from "./ChartTooltip";
import { HorizontalLineEditPopover } from "./HorizontalLineEditPopover";
import { TrendLineEditPopover } from "./TrendLineEditPopover";
import { IndicatorChart } from "./IndicatorChart";
import { PriceChart } from "./PriceChart";
import {
  HorizontalLine,
  HorizontalLinePrimitive,
} from "./primitives/HorizontalLinePrimitive";
import {
  TrendLine,
  TrendLinePrimitive,
} from "./primitives/TrendLinePrimitive";
import { MarkerPrimitive } from "./primitives/MarkerPrimitive";
import {
  BandHoverInfo,
  PriceBand,
  PriceBandPrimitive,
  SUPPORT_BAND_COLORS,
} from "./primitives/PriceBandPrimitive";
import { SupportBandTooltip } from "./SupportBandTooltip";

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
  supportLines?: SnapbackSupport[] | null;
  basePoint?: SnapbackPoint | null;
  className?: string;
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
    // 내부 이벤트(series.update)로 인한 y=NaN 이벤트는 무시
    if (!param.sourceEvent && param.point && isNaN(param.point.y)) {
      return;
    }

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
    // 내부 이벤트(series.update)로 인한 y=NaN 이벤트는 무시
    if (!param.sourceEvent && param.point && isNaN(param.point.y)) {
      return;
    }

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
  supportLines,
  basePoint,
  className,
}: Props) {
  // 분석 결과 오버레이 표시 여부
  const showAnalysisOverlay = useChartOverlayStore(
    (state) => state.showAnalysisOverlay
  );

  // 차트 및 시리즈 인스턴스 상태 (동기화용)
  const [priceChart, setPriceChart] = useState<IChartApi | null>(null);
  const [indicatorChart, setIndicatorChart] = useState<IChartApi | null>(null);
  const [candleSeries, setCandleSeries] =
    useState<ISeriesApi<"Candlestick"> | null>(null);
  const [volumeSeries, setVolumeSeries] =
    useState<ISeriesApi<"Histogram"> | null>(null);
  const [priceBandPrimitive, setPriceBandPrimitive] =
    useState<PriceBandPrimitive | null>(null);
  const [markerPrimitive, setMarkerPrimitive] =
    useState<MarkerPrimitive | null>(null);
  const [hLinePrimitive, setHLinePrimitive] =
    useState<HorizontalLinePrimitive | null>(null);
  const [trendLinePrimitive, setTrendLinePrimitive] =
    useState<TrendLinePrimitive | null>(null);

  // 드로잉 도구 상태
  const [activeTool, setActiveTool] = useState<DrawingTool>("cursor");

  // 추세선 드로잉 상태 (첫 번째 점 클릭 후 두 번째 점 대기)
  const [trendLineFirstPoint, setTrendLineFirstPoint] = useState<{
    time: UTCTimestamp;
    price: number;
  } | null>(null);

  // 툴팁 관련 상태
  const [tooltipData, setTooltipData] = useState<ChartTooltipData | null>(null);

  // 지지선 밴드 호버 툴팁 상태
  const [bandHoverInfo, setBandHoverInfo] = useState<BandHoverInfo | null>(null);
  const [bandTooltipPos, setBandTooltipPos] = useState({ x: 0, y: 0 });

  // 수평선 드래그 및 선택 상태
  const [hoveredLineId, setHoveredLineId] = useState<string | null>(null);
  const [selectedLineId, setSelectedLineId] = useState<string | null>(null);
  const [editingLinePrice, setEditingLinePrice] = useState<number | null>(null);
  const draggingLineIdRef = useRef<string | null>(null);

  // 추세선 드래그 및 선택 상태
  const [hoveredTrendLineId, setHoveredTrendLineId] = useState<string | null>(null);
  const [selectedTrendLineId, setSelectedTrendLineId] = useState<string | null>(null);
  const [editingTrendLine, setEditingTrendLine] = useState<{
    id: string;
    startPrice: number;
    endPrice: number;
  } | null>(null);
  const draggingTrendLineRef = useRef<{
    id: string;
    dragType: "line" | "start" | "end";
    startX: number;
    startY: number;
    originalStartPoint: { time: UTCTimestamp; price: number };
    originalEndPoint: { time: UTCTimestamp; price: number };
  } | null>(null);

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
      maSeries: Map<number, ISeriesApi<"Line">>,
      bandPrimitive: PriceBandPrimitive
    ) => {
      setPriceChart(chart);
      setCandleSeries(series);
      setPriceBandPrimitive(bandPrimitive);
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

  // 기준점 마커 primitive 생성 및 연결
  useEffect(() => {
    if (!candleSeries || !priceChart) return;

    const primitive = new MarkerPrimitive();
    primitive.setChart(priceChart);
    candleSeries.attachPrimitive(primitive);
    setMarkerPrimitive(primitive);

    return () => {
      candleSeries.detachPrimitive(primitive);
      setMarkerPrimitive(null);
    };
  }, [candleSeries, priceChart]);

  // 수평선 primitive 생성 및 연결
  useEffect(() => {
    if (!candleSeries) return;

    const primitive = new HorizontalLinePrimitive();
    candleSeries.attachPrimitive(primitive);
    setHLinePrimitive(primitive);

    return () => {
      candleSeries.detachPrimitive(primitive);
      setHLinePrimitive(null);
    };
  }, [candleSeries]);

  // 추세선 primitive 생성 및 연결
  useEffect(() => {
    if (!candleSeries) return;

    const primitive = new TrendLinePrimitive();
    candleSeries.attachPrimitive(primitive);
    setTrendLinePrimitive(primitive);

    return () => {
      candleSeries.detachPrimitive(primitive);
      setTrendLinePrimitive(null);
    };
  }, [candleSeries]);

  // 종목 변경 시 저장된 수평선 로드
  useEffect(() => {
    if (!hLinePrimitive) return;

    // 기존 선 클리어 (종목 변경 대응)
    hLinePrimitive.clearLines();

    // 저장된 선 로드
    const savedLines = loadHorizontalLines(code, "1D");
    savedLines.forEach((line) => hLinePrimitive.addLine(line));
  }, [hLinePrimitive, code]);

  // 종목 변경 시 저장된 추세선 로드
  useEffect(() => {
    if (!trendLinePrimitive) return;

    // 기존 선 클리어 (종목 변경 대응)
    trendLinePrimitive.clearLines();

    // 저장된 추세선 로드
    const savedLines = loadTrendLines(code, "1D");
    savedLines.forEach((line) => trendLinePrimitive.addLine(line));
  }, [trendLinePrimitive, code]);

  // 기준점 마커 업데이트
  useEffect(() => {
    if (!markerPrimitive) return;

    if (!basePoint || !showAnalysisOverlay) {
      markerPrimitive.clearMarker();
      return;
    }

    // YYYYMMDD -> UTCTimestamp 변환 (UTC 기준으로 변환)
    const year = parseInt(basePoint.date.slice(0, 4));
    const month = parseInt(basePoint.date.slice(4, 6)) - 1;
    const day = parseInt(basePoint.date.slice(6, 8));
    const timestamp = Math.floor(
      Date.UTC(year, month, day) / 1000
    ) as UTCTimestamp;

    markerPrimitive.setMarker({
      time: timestamp,
      price: basePoint.price,
      text: "기준점",
      color: "#fbbf24", // amber-400
    });
  }, [basePoint, markerPrimitive, showAnalysisOverlay]);

  // 지지선 밴드 업데이트
  useEffect(() => {
    if (!priceBandPrimitive) return;

    if (!supportLines || supportLines.length === 0 || !showAnalysisOverlay) {
      priceBandPrimitive.clearBands();
      return;
    }

    // SnapbackSupport를 PriceBand로 변환 (호가 단위 적용된 upperPrice/lowerPrice 사용)
    const bands: PriceBand[] = supportLines.map((support, index) => ({
      price: support.price,
      color: SUPPORT_BAND_COLORS[index] || SUPPORT_BAND_COLORS[0],
      upperPrice: support.upperPrice,
      lowerPrice: support.lowerPrice,
      label: `S${support.level}`,
    }));

    priceBandPrimitive.setBands(bands);
  }, [supportLines, priceBandPrimitive, showAnalysisOverlay]);

  // 지지선 밴드 호버 감지
  useEffect(() => {
    if (!priceChart || !priceBandPrimitive || !supportLines?.length) {
      setBandHoverInfo(null);
      return;
    }

    const handleCrosshairMove = (param: MouseEventParams) => {
      // 마우스가 차트 영역 안에 있고 point가 있을 때
      if (param.point) {
        const hoverInfo = priceBandPrimitive.getBandAtY(param.point.y);
        setBandHoverInfo(hoverInfo);
        setBandTooltipPos({ x: param.point.x, y: param.point.y });
      } else {
        setBandHoverInfo(null);
      }
    };

    priceChart.subscribeCrosshairMove(handleCrosshairMove);

    return () => {
      priceChart.unsubscribeCrosshairMove(handleCrosshairMove);
    };
  }, [priceChart, priceBandPrimitive, supportLines]);

  // 차트 클릭 시 수평선 추가 (hline 도구 선택 시)
  useEffect(() => {
    if (!priceChart || !candleSeries || !hLinePrimitive) return;
    if (activeTool !== "hline") return;

    const handleClick = (param: MouseEventParams) => {
      if (!param.point) return;

      // Y좌표를 가격으로 변환
      const price = candleSeries.coordinateToPrice(param.point.y);
      if (price === null) return;

      // 새 수평선 추가
      const newLine: HorizontalLine = {
        id: `hline-${Date.now()}`,
        price,
        color: "#f59e0b", // amber-500
        lineWidth: 1,
        lineStyle: "solid",
      };

      hLinePrimitive.addLine(newLine);

      // localStorage에 저장
      saveHorizontalLines(code, "1D", hLinePrimitive.getLines());

      // 커서 도구로 전환
      setActiveTool("cursor");
    };

    priceChart.subscribeClick(handleClick);

    return () => {
      priceChart.unsubscribeClick(handleClick);
    };
  }, [priceChart, candleSeries, hLinePrimitive, activeTool, code]);

  // 수평선 도구 선택 시 크로스헤어 가로선 색상 변경
  useEffect(() => {
    if (!priceChart) return;

    if (activeTool === "hline") {
      // 수평선 도구: 가로선을 amber 색상 + 실선으로 변경
      priceChart.applyOptions({
        crosshair: {
          horzLine: {
            color: "#f59e0b",
            style: 0, // Solid
            labelBackgroundColor: "#f59e0b",
          },
        },
      });
    } else {
      // 기본 도구: 세로선과 동일한 기본 색상/스타일로 복원
      priceChart.applyOptions({
        crosshair: {
          horzLine: {
            color: getCssVar("--chart-text"),
            style: 3, // LargeDashed (기본값)
            labelBackgroundColor: getCssVar("--chart-text"),
          },
        },
      });
    }
  }, [priceChart, activeTool]);

  // 차트 클릭 시 추세선 추가 (trendline 도구 선택 시 - 두 번 클릭)
  useEffect(() => {
    if (!priceChart || !trendLinePrimitive) return;
    if (activeTool !== "trendline") {
      // 도구 변경 시 미리보기 초기화
      setTrendLineFirstPoint(null);
      trendLinePrimitive.clearPreview();
      return;
    }

    const handleClick = (param: MouseEventParams) => {
      if (!param.point || !param.time) return;

      const point = trendLinePrimitive.coordinateToPoint(
        param.point.x,
        param.point.y
      );
      if (!point) return;

      if (!trendLineFirstPoint) {
        // 첫 번째 클릭: 시작점 저장 및 미리보기 시작
        setTrendLineFirstPoint(point);
        trendLinePrimitive.setPreviewStart(point);
      } else {
        // 두 번째 클릭: 추세선 생성
        const newLine: TrendLine = {
          id: `trendline-${Date.now()}`,
          startPoint: trendLineFirstPoint,
          endPoint: point,
          color: "#f59e0b", // amber-500
          lineWidth: 1,
          lineStyle: "solid",
        };

        trendLinePrimitive.clearPreview();
        trendLinePrimitive.addLine(newLine);

        // localStorage에 저장
        saveTrendLines(code, "1D", trendLinePrimitive.getLines());

        // 첫 번째 점 초기화 및 커서 도구로 전환
        setTrendLineFirstPoint(null);
        setActiveTool("cursor");
      }
    };

    // 마우스 이동 시 미리보기 업데이트
    const handleCrosshairMove = (param: MouseEventParams) => {
      if (!trendLineFirstPoint || !param.point) return;

      const point = trendLinePrimitive.coordinateToPoint(
        param.point.x,
        param.point.y
      );
      if (point) {
        trendLinePrimitive.setPreviewEnd(point);
      }
    };

    priceChart.subscribeClick(handleClick);
    priceChart.subscribeCrosshairMove(handleCrosshairMove);

    return () => {
      priceChart.unsubscribeClick(handleClick);
      priceChart.unsubscribeCrosshairMove(handleCrosshairMove);
    };
  }, [priceChart, trendLinePrimitive, activeTool, trendLineFirstPoint, code]);

  // 수평선 드래그 이동 처리
  useEffect(() => {
    if (!priceChart || !candleSeries || !hLinePrimitive) return;
    if (activeTool !== "cursor") return;

    const chartElement = priceChart.chartElement();
    if (!chartElement) return;

    const handleCrosshairMove = (param: MouseEventParams) => {
      // 드래그 중이면 무시 (드래그는 document 이벤트로 처리)
      if (draggingLineIdRef.current) return;
      if (!param.point) {
        setHoveredLineId(null);
        chartElement.style.cursor = "crosshair";
        return;
      }

      // 수평선 호버 감지
      const hoveredLine = hLinePrimitive.getLineAtY(param.point.y);
      if (hoveredLine) {
        setHoveredLineId(hoveredLine.id);
        chartElement.style.cursor = "ns-resize";
      } else {
        setHoveredLineId(null);
        chartElement.style.cursor = "crosshair";
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (!hoveredLineId) {
        // 빈 공간 클릭 시 선택 해제
        setSelectedLineId(null);
        hLinePrimitive.setSelectedId(null);
        return;
      }

      e.preventDefault();
      draggingLineIdRef.current = hoveredLineId;

      // 클릭/드래그 시작 시 라인 선택
      setSelectedLineId(hoveredLineId);
      hLinePrimitive.setSelectedId(hoveredLineId);

      // 드래그 중 크로스헤어 및 차트 스크롤 비활성화
      priceChart.applyOptions({
        crosshair: {
          horzLine: { visible: false },
          vertLine: { visible: false },
        },
        handleScroll: false,
        handleScale: false,
      });
      indicatorChart?.applyOptions({
        crosshair: {
          horzLine: { visible: false },
          vertLine: { visible: false },
        },
      });
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!draggingLineIdRef.current) return;

      const rect = chartElement.getBoundingClientRect();
      const y = e.clientY - rect.top;
      const newPrice = candleSeries.coordinateToPrice(y);

      if (newPrice !== null) {
        hLinePrimitive.updateLinePrice(draggingLineIdRef.current, newPrice);
      }
    };

    const handleMouseUp = () => {
      if (!draggingLineIdRef.current) return;

      // localStorage에 저장
      saveHorizontalLines(code, "1D", hLinePrimitive.getLines());

      draggingLineIdRef.current = null;

      // 크로스헤어 및 차트 스크롤 복원
      priceChart.applyOptions({
        crosshair: {
          horzLine: {
            visible: true,
            color: getCssVar("--chart-text"),
            style: 3,
            labelBackgroundColor: getCssVar("--chart-text"),
          },
          vertLine: { visible: true },
        },
        handleScroll: true,
        handleScale: true,
      });
      indicatorChart?.applyOptions({
        crosshair: {
          horzLine: { visible: true },
          vertLine: { visible: true },
        },
      });
    };

    // 더블클릭 시 편집 팝오버 열기
    const handleDoubleClick = () => {
      if (!hoveredLineId) return;

      const line = hLinePrimitive.getLines().find((l) => l.id === hoveredLineId);
      if (line) {
        setSelectedLineId(hoveredLineId);
        hLinePrimitive.setSelectedId(hoveredLineId);
        setEditingLinePrice(line.price);
      }
    };

    priceChart.subscribeCrosshairMove(handleCrosshairMove);
    chartElement.addEventListener("mousedown", handleMouseDown);
    chartElement.addEventListener("dblclick", handleDoubleClick);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      priceChart.unsubscribeCrosshairMove(handleCrosshairMove);
      chartElement.removeEventListener("mousedown", handleMouseDown);
      chartElement.removeEventListener("dblclick", handleDoubleClick);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [priceChart, indicatorChart, candleSeries, hLinePrimitive, activeTool, hoveredLineId, code]);

  // Delete 키로 선택된 수평선 삭제
  useEffect(() => {
    if (!hLinePrimitive || !selectedLineId) return;
    // 편집 팝오버가 열려있으면 키보드 삭제 비활성화
    if (editingLinePrice !== null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Delete" || e.key === "Backspace") {
        hLinePrimitive.removeLine(selectedLineId);
        saveHorizontalLines(code, "1D", hLinePrimitive.getLines());
        setSelectedLineId(null);
        hLinePrimitive.setSelectedId(null);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [hLinePrimitive, selectedLineId, editingLinePrice, code]);

  // 추세선 드래그 이동 처리
  useEffect(() => {
    if (!priceChart || !trendLinePrimitive) return;
    if (activeTool !== "cursor") return;

    const chartElement = priceChart.chartElement();
    if (!chartElement) return;

    const handleCrosshairMove = (param: MouseEventParams) => {
      // 드래그 중이면 무시
      if (draggingTrendLineRef.current) return;
      if (!param.point) {
        setHoveredTrendLineId(null);
        return;
      }

      // 선택된 추세선의 핸들 호버 체크
      const handle = trendLinePrimitive.getHandleAtPoint(param.point.x, param.point.y);
      if (handle) {
        chartElement.style.cursor = "pointer";
        return;
      }

      // 추세선 호버 감지
      const hoveredLine = trendLinePrimitive.getLineAtPoint(
        param.point.x,
        param.point.y
      );
      if (hoveredLine) {
        setHoveredTrendLineId(hoveredLine.id);
        // 수평선 호버 상태가 아닐 때만 커서 변경
        if (!hoveredLineId) {
          chartElement.style.cursor = "move";
        }
      } else {
        setHoveredTrendLineId(null);
        if (!hoveredLineId) {
          chartElement.style.cursor = "crosshair";
        }
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      // 선택된 추세선의 핸들 드래그 체크
      const rect = chartElement.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const handle = trendLinePrimitive.getHandleAtPoint(x, y);

      if (handle && selectedTrendLineId) {
        // 핸들 드래그
        e.preventDefault();
        e.stopPropagation();

        const line = trendLinePrimitive
          .getLines()
          .find((l) => l.id === selectedTrendLineId);
        if (!line) return;

        draggingTrendLineRef.current = {
          id: selectedTrendLineId,
          dragType: handle,
          startX: e.clientX,
          startY: e.clientY,
          originalStartPoint: { ...line.startPoint },
          originalEndPoint: { ...line.endPoint },
        };

        priceChart.applyOptions({
          crosshair: {
            horzLine: { visible: false },
            vertLine: { visible: false },
          },
          handleScroll: false,
          handleScale: false,
        });
        indicatorChart?.applyOptions({
          crosshair: {
            horzLine: { visible: false },
            vertLine: { visible: false },
          },
        });
        return;
      }

      if (!hoveredTrendLineId) {
        // 빈 공간 클릭 시 추세선 선택 해제 (수평선 선택은 별도 처리)
        if (!hoveredLineId) {
          setSelectedTrendLineId(null);
          trendLinePrimitive.setSelectedId(null);
        }
        return;
      }

      e.preventDefault();
      e.stopPropagation();

      const line = trendLinePrimitive
        .getLines()
        .find((l) => l.id === hoveredTrendLineId);
      if (!line) return;

      // 드래그 시작 정보 저장 (전체 이동)
      draggingTrendLineRef.current = {
        id: hoveredTrendLineId,
        dragType: "line",
        startX: e.clientX,
        startY: e.clientY,
        originalStartPoint: { ...line.startPoint },
        originalEndPoint: { ...line.endPoint },
      };

      // 선택 상태 설정
      setSelectedTrendLineId(hoveredTrendLineId);
      trendLinePrimitive.setSelectedId(hoveredTrendLineId);

      // 다른 선택 해제
      setSelectedLineId(null);
      hLinePrimitive?.setSelectedId(null);

      // 드래그 중 크로스헤어 및 차트 스크롤 비활성화
      priceChart.applyOptions({
        crosshair: {
          horzLine: { visible: false },
          vertLine: { visible: false },
        },
        handleScroll: false,
        handleScale: false,
      });
      indicatorChart?.applyOptions({
        crosshair: {
          horzLine: { visible: false },
          vertLine: { visible: false },
        },
      });
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!draggingTrendLineRef.current || !candleSeries) return;

      const { dragType } = draggingTrendLineRef.current;
      const rect = chartElement.getBoundingClientRect();
      const currentX = e.clientX - rect.left;
      const currentY = e.clientY - rect.top;

      if (dragType === "start" || dragType === "end") {
        // 핸들 드래그: 해당 끝점만 업데이트
        const newPoint = trendLinePrimitive.coordinateToPoint(currentX, currentY);
        if (!newPoint) return;

        if (dragType === "start") {
          trendLinePrimitive.updateLine(draggingTrendLineRef.current.id, {
            startPoint: newPoint,
          });
        } else {
          trendLinePrimitive.updateLine(draggingTrendLineRef.current.id, {
            endPoint: newPoint,
          });
        }
      } else {
        // 전체 이동
        const deltaX = e.clientX - draggingTrendLineRef.current.startX;
        const deltaY = e.clientY - draggingTrendLineRef.current.startY;

        const origStartX = priceChart
          .timeScale()
          .timeToCoordinate(draggingTrendLineRef.current.originalStartPoint.time);
        const origStartY = candleSeries.priceToCoordinate(
          draggingTrendLineRef.current.originalStartPoint.price
        );
        const origEndX = priceChart
          .timeScale()
          .timeToCoordinate(draggingTrendLineRef.current.originalEndPoint.time);
        const origEndY = candleSeries.priceToCoordinate(
          draggingTrendLineRef.current.originalEndPoint.price
        );

        if (
          origStartX === null ||
          origStartY === null ||
          origEndX === null ||
          origEndY === null
        )
          return;

        const newStartPoint = trendLinePrimitive.coordinateToPoint(
          origStartX + deltaX,
          origStartY + deltaY
        );
        const newEndPoint = trendLinePrimitive.coordinateToPoint(
          origEndX + deltaX,
          origEndY + deltaY
        );

        if (newStartPoint && newEndPoint) {
          trendLinePrimitive.updateLine(draggingTrendLineRef.current.id, {
            startPoint: newStartPoint,
            endPoint: newEndPoint,
          });
        }
      }
    };

    const handleMouseUp = () => {
      if (!draggingTrendLineRef.current) return;

      // localStorage에 저장
      saveTrendLines(code, "1D", trendLinePrimitive.getLines());

      draggingTrendLineRef.current = null;

      // 크로스헤어 및 차트 스크롤 복원
      priceChart.applyOptions({
        crosshair: {
          horzLine: {
            visible: true,
            color: getCssVar("--chart-text"),
            style: 3,
            labelBackgroundColor: getCssVar("--chart-text"),
          },
          vertLine: { visible: true },
        },
        handleScroll: true,
        handleScale: true,
      });
      indicatorChart?.applyOptions({
        crosshair: {
          horzLine: { visible: true },
          vertLine: { visible: true },
        },
      });
    };

    // 더블클릭 시 편집 팝오버 열기
    const handleDoubleClick = () => {
      if (!hoveredTrendLineId) return;

      const line = trendLinePrimitive
        .getLines()
        .find((l) => l.id === hoveredTrendLineId);
      if (line) {
        setSelectedTrendLineId(hoveredTrendLineId);
        trendLinePrimitive.setSelectedId(hoveredTrendLineId);
        setEditingTrendLine({
          id: hoveredTrendLineId,
          startPrice: line.startPoint.price,
          endPrice: line.endPoint.price,
        });
      }
    };

    priceChart.subscribeCrosshairMove(handleCrosshairMove);
    chartElement.addEventListener("mousedown", handleMouseDown);
    chartElement.addEventListener("dblclick", handleDoubleClick);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      priceChart.unsubscribeCrosshairMove(handleCrosshairMove);
      chartElement.removeEventListener("mousedown", handleMouseDown);
      chartElement.removeEventListener("dblclick", handleDoubleClick);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [
    priceChart,
    indicatorChart,
    candleSeries,
    trendLinePrimitive,
    hLinePrimitive,
    activeTool,
    hoveredTrendLineId,
    hoveredLineId,
    selectedTrendLineId,
    code,
  ]);

  // Delete 키로 선택된 추세선 삭제
  useEffect(() => {
    if (!trendLinePrimitive || !selectedTrendLineId) return;
    // 편집 팝오버가 열려있으면 키보드 삭제 비활성화
    if (editingTrendLine !== null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Delete" || e.key === "Backspace") {
        trendLinePrimitive.removeLine(selectedTrendLineId);
        saveTrendLines(code, "1D", trendLinePrimitive.getLines());
        setSelectedTrendLineId(null);
        trendLinePrimitive.setSelectedId(null);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [trendLinePrimitive, selectedTrendLineId, editingTrendLine, code]);

  // 수평선 편집 팝오버 콜백
  const handleEditConfirm = useCallback(
    (newPrice: number) => {
      if (!hLinePrimitive || !selectedLineId) return;

      hLinePrimitive.updateLinePrice(selectedLineId, newPrice);
      saveHorizontalLines(code, "1D", hLinePrimitive.getLines());
      setEditingLinePrice(null);
    },
    [hLinePrimitive, selectedLineId, code]
  );

  const handleEditClose = useCallback(() => {
    setEditingLinePrice(null);
  }, []);

  // 추세선 편집 팝오버 콜백
  const handleTrendLineEditConfirm = useCallback(
    (startPrice: number, endPrice: number) => {
      if (!trendLinePrimitive || !editingTrendLine) return;

      const line = trendLinePrimitive
        .getLines()
        .find((l) => l.id === editingTrendLine.id);
      if (line) {
        trendLinePrimitive.updateLine(editingTrendLine.id, {
          startPoint: { ...line.startPoint, price: startPrice },
          endPoint: { ...line.endPoint, price: endPrice },
        });
        saveTrendLines(code, "1D", trendLinePrimitive.getLines());
      }
      setEditingTrendLine(null);
    },
    [trendLinePrimitive, editingTrendLine, code]
  );

  const handleTrendLineEditClose = useCallback(() => {
    setEditingTrendLine(null);
  }, []);

  // 모든 드로잉 초기화
  const handleClearDrawings = useCallback(() => {
    hLinePrimitive?.clearLines();
    trendLinePrimitive?.clearLines();
    saveHorizontalLines(code, "1D", []);
    saveTrendLines(code, "1D", []);
    setSelectedLineId(null);
    setSelectedTrendLineId(null);
    hLinePrimitive?.setSelectedId(null);
    trendLinePrimitive?.setSelectedId(null);
  }, [hLinePrimitive, trendLinePrimitive, code]);

  // 로딩 상태
  if (isLoading) {
    return (
      <Skeleton variant="shimmer-contrast" className="w-full h-full" />
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
    <div className={cn("flex flex-col w-full min-w-0 h-[400px] md:h-full", className)}>
      {/* 상단 타임프레임 툴바 */}
      <ChartTimeframeToolbar activeTimeframe="1D" />

      <div className="flex flex-1 min-h-0 min-w-0">
        {/* 좌측 드로잉 툴바 */}
        <ChartDrawingToolbar
          activeTool={activeTool}
          onToolSelect={setActiveTool}
          onClear={handleClearDrawings}
        />

        {/* 차트 영역 */}
        <div
          ref={containerRef}
          className={`flex-1 min-w-0 flex flex-col relative ${
            activeTool === "hline" ? "cursor-crosshair" : "cursor-crosshair"
          }`}
        >
          <div
            style={{ height: `${priceChartHeight}%` }}
            className="min-h-0 relative z-0 overflow-hidden"
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
            className="min-h-0 relative z-0 overflow-hidden"
          >
            <IndicatorChart onReady={handleIndicatorChartReady} />
          </div>

          {/* 차트 툴팁 - 최상위에 배치하여 모든 영역에서 보이도록 */}
          <ChartTooltip data={tooltipData} />

          {/* 지지선 밴드 호버 툴팁 */}
          <SupportBandTooltip
            hoverInfo={bandHoverInfo}
            mouseX={bandTooltipPos.x}
            mouseY={bandTooltipPos.y}
          />

          {/* 수평선 편집 팝오버 */}
          {editingLinePrice !== null && (
            <HorizontalLineEditPopover
              price={editingLinePrice}
              onConfirm={handleEditConfirm}
              onClose={handleEditClose}
            />
          )}

          {/* 추세선 편집 팝오버 */}
          {editingTrendLine && (
            <TrendLineEditPopover
              startPrice={editingTrendLine.startPrice}
              endPrice={editingTrendLine.endPrice}
              onConfirm={handleTrendLineEditConfirm}
              onClose={handleTrendLineEditClose}
            />
          )}
        </div>
      </div>
    </div>
  );
}
