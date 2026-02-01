"use client";

import stockApi from "@/api/stockApi";
import {
  calculateMA,
  candlesToPriceData,
  candlesToVolumeData,
  DEFAULT_MA_CONFIGS,
  getCssVar,
  MALineData,
} from "@/lib/chartUtils";
import {
  Candle,
  ExchangeCode,
  MarketCode,
  StockQuote,
  StockRealtimeData,
} from "@/types/Stock";
import {
  CandlestickData,
  HistogramData,
  ISeriesApi,
  LineData,
  UTCTimestamp,
} from "lightweight-charts";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useRef, useState } from "react";

interface UseStockChartOptions {
  interval?: "1d";
  limit?: number;
  stockQuote?: StockQuote | null;
}

interface UseStockChartResult {
  // 로딩/에러 상태
  isLoading: boolean;
  error: string | null;
  // 시리즈 등록 함수
  registerCandleSeries: (series: ISeriesApi<"Candlestick">) => void;
  registerVolumeSeries: (series: ISeriesApi<"Histogram">) => void;
  registerMaSeries: (period: number, series: ISeriesApi<"Line">) => void;
  // 실시간 데이터 업데이트 함수
  updateRealtimeData: (data: StockRealtimeData) => void;
  // 과거 데이터 로드
  loadMoreData: () => Promise<number>;
  hasMoreData: boolean;
  // 데이터 업데이트 이벤트 구독
  onDataUpdate: (callback: () => void) => () => void;
}

/**
 * YYYYMMDD 형식을 Unix timestamp (초 단위)로 변환
 */
function dateStrToTimestamp(dateStr: string): UTCTimestamp {
  if (dateStr.length !== 8) return 0 as UTCTimestamp;

  const year = parseInt(dateStr.slice(0, 4));
  const month = parseInt(dateStr.slice(4, 6)) - 1;
  const day = parseInt(dateStr.slice(6, 8));

  return Math.floor(Date.UTC(year, month, day) / 1000) as UTCTimestamp;
}

/**
 * 통합 차트 관리 훅
 * - REST API로 초기 캔들 데이터 fetch
 * - 차트 시리즈 ref 관리
 * - 데이터는 ref로 관리하여 불필요한 리렌더링 방지
 * - 실시간 데이터는 외부에서 updateRealtimeData로 전달
 */
export function useStockChart(
  code: string,
  market: MarketCode,
  exchange: ExchangeCode,
  options: UseStockChartOptions = {}
): UseStockChartResult {
  const { interval = "1d", limit = 250, stockQuote = null } = options;
  const { resolvedTheme } = useTheme();

  // === 상태 관리 (UI 표시용만 React state) ===
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [hasMoreData, setHasMoreData] = useState(true);

  // === Ref 관리 (차트 데이터 및 시리즈) ===
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  const maSeriesRef = useRef<Map<number, ISeriesApi<"Line">>>(new Map());

  // 로드된 데이터 ref (React state가 아닌 ref로 관리!)
  const loadedDataRef = useRef<{
    priceData: CandlestickData[];
    volumeData: HistogramData[];
    rawCandles: Candle[];
    maData: Map<number, MALineData[]>;
  }>({
    priceData: [],
    volumeData: [],
    rawCandles: [],
    maData: new Map(),
  });

  // 오늘 캔들 정보 (실시간 업데이트 추적용)
  const todayCandleRef = useRef<{
    time: UTCTimestamp;
    open: number;
  } | null>(null);

  // 초기 데이터 로드 완료 여부
  const isInitialDataLoadedRef = useRef(false);

  // 과거 데이터 로드 관련 ref
  const oldestTimestampRef = useRef<number | null>(null);
  const isLoadingMoreRef = useRef(false);

  // 데이터 업데이트 콜백 리스너들
  const dataUpdateListenersRef = useRef<Set<() => void>>(new Set());

  // === 시리즈 등록 함수 ===
  const registerCandleSeries = useCallback(
    (series: ISeriesApi<"Candlestick">) => {
      candleSeriesRef.current = series;

      // 이미 데이터가 로드되어 있으면 즉시 설정
      if (
        isInitialDataLoadedRef.current &&
        loadedDataRef.current.priceData.length > 0
      ) {
        series.setData(loadedDataRef.current.priceData);
      }
    },
    []
  );

  const registerVolumeSeries = useCallback(
    (series: ISeriesApi<"Histogram">) => {
      volumeSeriesRef.current = series;

      // 이미 데이터가 로드되어 있으면 즉시 설정
      if (
        isInitialDataLoadedRef.current &&
        loadedDataRef.current.volumeData.length > 0
      ) {
        const coloredVolumeData = applyVolumeColors(
          loadedDataRef.current.volumeData,
          loadedDataRef.current.priceData
        );
        series.setData(coloredVolumeData);
      }
    },
    []
  );

  const registerMaSeries = useCallback(
    (period: number, series: ISeriesApi<"Line">) => {
      maSeriesRef.current.set(period, series);

      // 이미 데이터가 로드되어 있으면 즉시 설정
      if (isInitialDataLoadedRef.current) {
        const maData = loadedDataRef.current.maData.get(period);
        if (maData && maData.length > 0) {
          series.setData(maData as LineData[]);
        }
      }
    },
    []
  );

  // === 거래량 색상 적용 함수 (O(n) 최적화) ===
  const applyVolumeColors = (
    volumeData: HistogramData[],
    priceData: CandlestickData[]
  ): HistogramData[] => {
    // priceData를 time 기준으로 Map 생성 (O(n))
    const priceMap = new Map(priceData.map((c) => [c.time, c]));

    // volumeData 순회하며 색상 적용 (O(n))
    return volumeData.map((item) => {
      const candle = priceMap.get(item.time);
      if (!candle) return item;

      return {
        ...item,
        color:
          candle.close >= candle.open
            ? getCssVar("--chart-up")
            : getCssVar("--chart-down"),
      };
    });
  };

  // === 과거 데이터 로드 함수 ===
  const loadMoreData = useCallback(async (): Promise<number> => {
    // 이미 로딩 중이거나 더 불러올 데이터가 없으면 스킵
    if (isLoadingMoreRef.current || !hasMoreData) return 0;
    if (!oldestTimestampRef.current) return 0;

    isLoadingMoreRef.current = true;

    try {
      const response = await stockApi.getCandle({
        code,
        market,
        exchange,
        interval,
        limit: 250,
        to: oldestTimestampRef.current - 1, // 현재 가장 오래된 것 이전부터
      });

      if (response.success && response.data) {
        const newCandles = response.data.candles;

        // 데이터가 없으면 더 이상 불러올 데이터 없음
        if (newCandles.length === 0) {
          setHasMoreData(false);
          return 0;
        }

        // 새 데이터 변환
        const newPriceData = candlesToPriceData(newCandles);
        const newVolumeData = candlesToVolumeData(newCandles);

        // 기존 데이터 앞에 새 데이터 추가 (prepend)
        const mergedPriceData = [
          ...newPriceData,
          ...loadedDataRef.current.priceData,
        ];
        const mergedVolumeData = [
          ...newVolumeData,
          ...loadedDataRef.current.volumeData,
        ];
        const mergedRawCandles = [
          ...newCandles,
          ...loadedDataRef.current.rawCandles,
        ];

        // 이동평균 재계산 (전체 데이터 기준)
        const maData = new Map<number, MALineData[]>();
        for (const config of DEFAULT_MA_CONFIGS) {
          maData.set(
            config.period,
            calculateMA(mergedPriceData, config.period)
          );
        }

        // ref 업데이트
        loadedDataRef.current = {
          priceData: mergedPriceData,
          volumeData: mergedVolumeData,
          rawCandles: mergedRawCandles,
          maData,
        };

        // 가장 오래된 timestamp 업데이트
        oldestTimestampRef.current = newPriceData[0].time as number;

        // 차트에 전체 데이터 다시 설정
        if (candleSeriesRef.current) {
          try {
            candleSeriesRef.current.setData(mergedPriceData);
          } catch {
            // 차트가 이미 dispose된 경우 무시
          }
        }

        if (volumeSeriesRef.current) {
          try {
            const coloredVolumeData = applyVolumeColors(
              mergedVolumeData,
              mergedPriceData
            );
            volumeSeriesRef.current.setData(coloredVolumeData);
          } catch {
            // 차트가 이미 dispose된 경우 무시
          }
        }

        // 이동평균선 데이터 설정
        for (const [period, data] of maData) {
          const maSeries = maSeriesRef.current.get(period);
          if (maSeries && data.length > 0) {
            try {
              maSeries.setData(data as LineData[]);
            } catch {
              // 차트가 이미 dispose된 경우 무시
            }
          }
        }

        // 250개보다 적으면 더 이상 데이터 없음
        if (newCandles.length < 250) {
          setHasMoreData(false);
        }

        dataUpdateListenersRef.current.forEach((callback) => callback());

        return newCandles.length;
      }

      return 0;
    } catch (err) {
      console.error("과거 데이터 로드 실패:", err);
      return 0;
    } finally {
      isLoadingMoreRef.current = false;
    }
  }, [code, market, exchange, interval, hasMoreData]);

  // === 테마 변경 시 거래량 색상 재적용 ===
  useEffect(() => {
    if (!resolvedTheme || !volumeSeriesRef.current) return;
    if (loadedDataRef.current.volumeData.length === 0) return;

    // CSS 변수 업데이트 완료 후 색상 재적용
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!volumeSeriesRef.current) return;

        try {
          const coloredVolumeData = applyVolumeColors(
            loadedDataRef.current.volumeData,
            loadedDataRef.current.priceData
          );
          volumeSeriesRef.current.setData(coloredVolumeData);
        } catch {
          // 차트가 이미 dispose된 경우 무시
        }
      });
    });
  }, [resolvedTheme]);

  // === 초기 데이터 로드 ===
  useEffect(() => {
    let isMounted = true;

    const fetchInitialData = async () => {
      if (!code || !market || !exchange) {
        if (isMounted) {
          setFetchError("잘못된 요청입니다.");
          setIsLoading(false);
        }
        return;
      }

      setIsLoading(true);
      setFetchError(null);
      isInitialDataLoadedRef.current = false;

      try {
        const response = await stockApi.getCandle({
          code,
          market,
          exchange,
          interval,
          limit,
        });

        // 컴포넌트가 언마운트되었으면 상태 업데이트 스킵
        if (!isMounted) return;

        if (response.success && response.data) {
          const candles = response.data.candles;

          // 캔들 데이터 변환
          const priceData = candlesToPriceData(candles);
          const volumeData = candlesToVolumeData(candles);

          // 이동평균 데이터 계산
          const maData = new Map<number, MALineData[]>();
          for (const config of DEFAULT_MA_CONFIGS) {
            maData.set(config.period, calculateMA(priceData, config.period));
          }

          // ref에 데이터 저장
          loadedDataRef.current = {
            priceData,
            volumeData,
            rawCandles: candles,
            maData,
          };

          isInitialDataLoadedRef.current = true;

          // 가장 오래된 캔들의 timestamp 저장
          if (priceData.length > 0) {
            oldestTimestampRef.current = priceData[0].time as number;
          }

          // 데이터가 limit보다 적으면 더 이상 불러올 데이터 없음
          if (candles.length < limit) {
            setHasMoreData(false);
          }

          // 시리즈가 이미 등록되어 있으면 데이터 설정
          if (candleSeriesRef.current) {
            try {
              candleSeriesRef.current.setData(priceData);
            } catch {
              // 차트가 이미 dispose된 경우 무시
            }
          }

          if (volumeSeriesRef.current) {
            try {
              const coloredVolumeData = applyVolumeColors(volumeData, priceData);
              volumeSeriesRef.current.setData(coloredVolumeData);
            } catch {
              // 차트가 이미 dispose된 경우 무시
            }
          }

          // 이동평균선 데이터 설정
          for (const [period, data] of maData) {
            const maSeries = maSeriesRef.current.get(period);
            if (maSeries && data.length > 0) {
              try {
                maSeries.setData(data as LineData[]);
              } catch {
                // 차트가 이미 dispose된 경우 무시
              }
            }
          }

          dataUpdateListenersRef.current.forEach((callback) => callback());
        } else {
          setFetchError("주가 데이터를 가져오는데 실패했습니다.");
        }
      } catch (err) {
        if (isMounted) {
          setFetchError("주가 데이터를 가져오는 중 오류가 발생했습니다.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchInitialData();

    return () => {
      isMounted = false;
    };
  }, [code, market, exchange, interval, limit]);

  // === stockQuote 데이터로 당일 캔들 추가/업데이트 ===
  useEffect(() => {
    // 초기 데이터가 로드되지 않았거나 stockQuote가 없으면 스킵
    if (!isInitialDataLoadedRef.current || !stockQuote?.bsopDate) return;

    const quoteTimestamp = dateStrToTimestamp(stockQuote.bsopDate);
    const { priceData, volumeData, rawCandles, maData } = loadedDataRef.current;

    // 마지막 캔들 확인
    const lastCandle =
      priceData.length > 0 ? priceData[priceData.length - 1] : null;

    // 이미 같은 날짜의 캔들이 있으면 스킵 (중복 방지)
    if (lastCandle && lastCandle.time === quoteTimestamp) return;

    // 당일 캔들 데이터 생성
    // 시가/고가/저가가 0인 경우 (거래 시작 전 상태) 처리
    const todayOpen =
      stockQuote.open === 0
        ? lastCandle?.close || stockQuote.currentPrice
        : stockQuote.open;
    const todayHigh =
      stockQuote.high === 0
        ? Math.max(todayOpen, stockQuote.currentPrice)
        : stockQuote.high;
    const todayLow =
      stockQuote.low === 0
        ? Math.min(todayOpen, stockQuote.currentPrice)
        : stockQuote.low;

    const todayCandle: CandlestickData = {
      time: quoteTimestamp,
      open: todayOpen,
      high: todayHigh,
      low: todayLow,
      close: stockQuote.currentPrice,
    };

    const todayVolume: HistogramData = {
      time: quoteTimestamp,
      value: stockQuote.volume,
      color:
        stockQuote.currentPrice >= todayOpen
          ? getCssVar("--chart-up")
          : getCssVar("--chart-down"),
    };

    // ref 데이터에 추가
    priceData.push(todayCandle);
    volumeData.push(todayVolume);
    rawCandles.push({
      time: quoteTimestamp,
      open: todayOpen,
      high: todayHigh,
      low: todayLow,
      close: stockQuote.currentPrice,
      volume: stockQuote.volume,
      turnover: stockQuote.tradingValue,
    });

    // 이동평균 재계산 (당일 캔들 포함)
    for (const config of DEFAULT_MA_CONFIGS) {
      const maArray = maData.get(config.period);
      if (priceData.length >= config.period) {
        let sum = 0;
        for (let i = 0; i < config.period; i++) {
          sum += priceData[priceData.length - 1 - i].close;
        }
        const maValue = sum / config.period;
        const maPoint = { time: quoteTimestamp, value: maValue };

        if (maArray) {
          maArray.push(maPoint);
        }

        // 차트 시리즈에 업데이트
        const maSeries = maSeriesRef.current.get(config.period);
        if (maSeries) {
          try {
            maSeries.update(maPoint);
          } catch {
            // 차트가 이미 dispose된 경우 무시
          }
        }
      }
    }

    // 오늘 캔들 정보 저장
    todayCandleRef.current = {
      time: quoteTimestamp,
      open: todayOpen,
    };

    // 차트 시리즈에 업데이트
    if (candleSeriesRef.current) {
      try {
        candleSeriesRef.current.update(todayCandle);
      } catch {
        // 차트가 이미 dispose된 경우 무시
      }
    }

    if (volumeSeriesRef.current) {
      try {
        volumeSeriesRef.current.update(todayVolume);
      } catch {
        // 차트가 이미 dispose된 경우 무시
      }
    }

    dataUpdateListenersRef.current.forEach((callback) => callback());
  }, [stockQuote]);

  // === 실시간 데이터 처리 (차트 업데이트) ===
  const updateRealtimeData = useCallback((data: StockRealtimeData) => {
    // 차트 시리즈가 준비되지 않았거나 현재가가 0이면 무시
    if (!candleSeriesRef.current) return;
    if (!data.STCK_PRPR) return;

    const todayTime = dateStrToTimestamp(data.BSOP_DATE);
    const newPrice = data.STCK_PRPR;
    const newHigh = data.STCK_HGPR;
    const newLow = data.STCK_LWPR;
    const newOpen = data.STCK_OPRC;
    const newVolume = data.ACML_VOL;

    // 오늘 캔들이 처음 생성되는 경우 (또는 날짜가 바뀐 경우)
    if (!todayCandleRef.current || todayCandleRef.current.time !== todayTime) {
      todayCandleRef.current = {
        time: todayTime,
        open: newOpen,
      };
    }

    const todayOpen = todayCandleRef.current.open;

    // 오늘 캔들 업데이트
    const todayCandleData: CandlestickData = {
      time: todayTime,
      open: todayOpen,
      high: newHigh,
      low: newLow,
      close: newPrice,
    };

    try {
      candleSeriesRef.current.update(todayCandleData);
    } catch {
      // 차트가 이미 dispose된 경우 무시
      return;
    }

    // 거래량 업데이트
    if (volumeSeriesRef.current) {
      const isUp = newPrice >= todayOpen;
      try {
        volumeSeriesRef.current.update({
          time: todayTime,
          value: newVolume,
          color: isUp ? getCssVar("--chart-up") : getCssVar("--chart-down"),
        });
      } catch {
        // 차트가 이미 dispose된 경우 무시
      }
    }

    // 이동평균선 업데이트 (오늘 종가 기준으로 재계산)
    const priceData = loadedDataRef.current.priceData;
    if (priceData.length > 0) {
      // 오늘 캔들 데이터 업데이트 (또는 추가)
      const lastCandle = priceData[priceData.length - 1];
      if (lastCandle.time === todayTime) {
        lastCandle.close = newPrice;
        lastCandle.high = newHigh;
        lastCandle.low = newLow;
      } else {
        priceData.push(todayCandleData);
      }

      // 거래량 데이터도 동기화
      const volumeData = loadedDataRef.current.volumeData;
      const lastVolume =
        volumeData.length > 0 ? volumeData[volumeData.length - 1] : null;
      const isUp = newPrice >= todayOpen;
      const volumeDataPoint: HistogramData = {
        time: todayTime,
        value: newVolume,
        color: isUp ? getCssVar("--chart-up") : getCssVar("--chart-down"),
      };

      if (lastVolume && lastVolume.time === todayTime) {
        lastVolume.value = newVolume;
        lastVolume.color = volumeDataPoint.color;
      } else {
        volumeData.push(volumeDataPoint);
      }

      // 각 MA 시리즈 업데이트
      for (const config of DEFAULT_MA_CONFIGS) {
        const maSeries = maSeriesRef.current.get(config.period);
        if (priceData.length < config.period) continue;

        // 마지막 MA 값 계산
        let sum = 0;
        for (let i = 0; i < config.period; i++) {
          sum += priceData[priceData.length - 1 - i].close;
        }
        const maValue = sum / config.period;

        const maDataPoint = { time: todayTime, value: maValue };

        // maData ref 동기화
        const maDataArray = loadedDataRef.current.maData.get(config.period);
        if (maDataArray) {
          const lastMa = maDataArray[maDataArray.length - 1];
          if (lastMa && lastMa.time === todayTime) {
            lastMa.value = maValue;
          } else {
            maDataArray.push(maDataPoint);
          }
        }

        // 차트 시리즈 업데이트
        if (maSeries) {
          try {
            maSeries.update(maDataPoint);
          } catch {
            // 차트가 이미 dispose된 경우 무시
          }
        }
      }
    }

    // 데이터 업데이트 리스너들에게 알림
    dataUpdateListenersRef.current.forEach((callback) => callback());
  }, []);

  // === 데이터 업데이트 이벤트 구독 ===
  const onDataUpdate = useCallback((callback: () => void) => {
    dataUpdateListenersRef.current.add(callback);

    // unsubscribe 함수 반환
    return () => {
      dataUpdateListenersRef.current.delete(callback);
    };
  }, []);

  return {
    isLoading,
    error: fetchError,
    registerCandleSeries,
    registerVolumeSeries,
    registerMaSeries,
    updateRealtimeData,
    loadMoreData,
    hasMoreData,
    onDataUpdate,
  };
}
