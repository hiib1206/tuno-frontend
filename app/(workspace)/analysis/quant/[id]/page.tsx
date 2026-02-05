"use client";

import inferenceApi from "@/api/inferenceApi";
import stockApi from "@/api/stockApi";
import { ErrorState } from "@/components/feedback/error-state";
import AiAnalysisLoader from "@/components/loading/AiLoader/AiAnalysisLoader";
import { BenchmarkChart } from "@/components/workspace/quant/BenchmarkChart";
import { IndicatorCards } from "@/components/workspace/quant/IndicatorCards";
import { IndicatorRadar } from "@/components/workspace/quant/IndicatorRadar";
import { SignalChart } from "@/components/workspace/quant/SignalChart";
import { SignalColors, SignalInfoCard } from "@/components/workspace/quant/SignalInfoCard";
import { SignalReasons } from "@/components/workspace/quant/SignalReasons";
import { SignalTimeline } from "@/components/workspace/quant/SignalTimeline";
import { SignalWaveCard } from "@/components/workspace/quant/SignalWaveCard";
import { StockHeader } from "@/components/workspace/quant/StockHeader";
import { SubChartPanel } from "@/components/workspace/quant/sub-charts/SubChartPanel";
import { WorkspaceFeedback } from "@/components/workspace/WorkspaceFeedback";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { EXCHANGE_NAMES } from "@/lib/stock";
import { useAuthStore } from "@/stores/authStore";
import { InferenceHistoryItem, InferenceStatus, QuantSignalResult } from "@/types/Inference";
import { Candle, StockInfo } from "@/types/Stock";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const SIGNAL_COLORS: SignalColors = {
  BUY: "#16a34a",
  HOLD: "#f59e0b",
  SELL: "#e3123a",
};

export default function QuantResultPage() {
  useRequireAuth();
  const params = useParams();
  const id = params.id as string;
  const { isAuthLoading } = useAuthStore();

  const [result, setResult] = useState<QuantSignalResult | null>(null);
  const [historyItem, setHistoryItem] = useState<InferenceHistoryItem | null>(null);
  const [stockInfo, setStockInfo] = useState<StockInfo | null>(null);
  const [candles, setCandles] = useState<Candle[]>([]);
  const [indexCandles, setIndexCandles] = useState<Candle[]>([]);
  const [indexName, setIndexName] = useState("KOSPI");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [status, setStatus] = useState<InferenceStatus | null>(null);

  const POLL_INTERVAL = 2000;

  // 응답 데이터 처리 (초기 로딩 & 폴링 공용)
  // PENDING/PROCESSING → return (로딩 유지)
  // FAILED/CANCELED → status 세팅 후 return
  // COMPLETED → 모든 API 병렬 호출 + 통합 검증, 하나라도 실패하면 throw
  const processItem = useCallback(async (item: InferenceHistoryItem) => {
    setHistoryItem(item);
    setStatus(item.status);

    if (item.status === "PENDING" || item.status === "PROCESSING") return;
    if (item.status === "FAILED" || item.status === "CANCELED") return;
    if (!item.responseData) throw new Error("결과 데이터가 없습니다");

    const parsedResult = item.responseData as unknown as QuantSignalResult;

    const exchange = item.exchange;
    const ticker = item.ticker;
    if (!exchange || !ticker) throw new Error("종목 정보가 없습니다");

    const market = exchange === "NAS" || exchange === "NYS" || exchange === "AMS" ? "US" : "KR";
    const isKR = market === "KR";
    const idxCode = exchange === "KQ" ? "1001" : "0001";

    // 모든 API 병렬 호출 (KR이면 지수 캔들 포함)
    const [stockInfoRes, candleRes, ...rest] = await Promise.all([
      stockApi.getStockInfo(ticker, { market, exchange }),
      stockApi.getCandle({ market, exchange, code: ticker, interval: "1d", limit: 370 }),
      ...(isKR ? [stockApi.getIndexCandle({ code: idxCode, interval: "1d", limit: 370 })] : []),
    ]);
    const indexRes = rest[0];

    // 통합 검증: 하나라도 실패하면 throw
    if (!stockInfoRes.success || !stockInfoRes.data)
      throw new Error("종목 정보를 불러올 수 없습니다");
    if (!candleRes.success || !candleRes.data?.candles?.length)
      throw new Error("차트 데이터를 불러올 수 없습니다");
    if (isKR && (!indexRes?.success || !indexRes?.data?.candles?.length))
      throw new Error("지수 데이터를 불러올 수 없습니다");

    // 모든 검증 통과 → 한 번에 상태 세팅
    setResult(parsedResult);
    setStockInfo(stockInfoRes.data);
    setCandles(candleRes.data.candles);
    if (isKR && indexRes?.data) {
      setIndexName(exchange === "KQ" ? "KOSDAQ" : "KOSPI");
      setIndexCandles(indexRes.data.candles);
    }
  }, []);

  // 초기 데이터 로딩
  useEffect(() => {
    if (isAuthLoading) return;

    const fetchData = async () => {
      setIsLoading(true);
      setError(false);
      try {
        const response = await inferenceApi.getHistoryById(id);
        if (!response.success || !response.data) {
          throw new Error("분석 결과를 찾을 수 없습니다");
        }
        await processItem(response.data);
        // PENDING/PROCESSING이면 isLoading 유지 (폴링이 해제)
        if (response.data.status !== "PENDING" && response.data.status !== "PROCESSING") {
          setIsLoading(false);
        }
      } catch (err) {
        console.error("퀀트 분석 로딩 실패:", err);
        setError(true);
        setResult(null);
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, isAuthLoading, processItem]);

  // PENDING/PROCESSING일 때 2초 간격 폴링
  useEffect(() => {
    if (status !== "PENDING" && status !== "PROCESSING") return;

    const intervalId = setInterval(async () => {
      try {
        const response = await inferenceApi.getHistoryById(id);
        if (!response.success || !response.data) return;
        await processItem(response.data);
        // COMPLETED + 모든 API 완료 → 로딩 해제
        if (response.data.status !== "PENDING" && response.data.status !== "PROCESSING") {
          setIsLoading(false);
        }
      } catch (err) {
        console.error("퀀트 분석 폴링 실패:", err);
        setError(true);
        setResult(null);
        setIsLoading(false);
      }
    }, POLL_INTERVAL);

    return () => clearInterval(intervalId);
  }, [status, id, processItem]);

  // 로딩 중 (초기 로딩 + PENDING/PROCESSING 폴링 대기 통합)
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-[420px] h-[320px]">
          <AiAnalysisLoader />
        </div>
      </div>
    );
  }

  // 에러 / FAILED / CANCELED / 결과 없음 → 통합 에러 화면
  if (error || status === "FAILED" || status === "CANCELED" || !result) {
    return (
      <WorkspaceFeedback>
        <ErrorState message="분석 결과를 불러올 수 없습니다" />
      </WorkspaceFeedback>
    );
  }

  const exchangeName = historyItem?.exchange
    ? EXCHANGE_NAMES[historyItem.exchange] ?? historyItem.exchange
    : null;
  const formattedDate = result.date.length === 8
    ? `${result.date.slice(0, 4)}.${result.date.slice(4, 6)}.${result.date.slice(6, 8)}`
    : result.date;
  const formattedTime = (() => {
    try {
      return new Date(result.inferredAt).toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    } catch {
      return "";
    }
  })();


  return (
    <div className="h-full overflow-auto px-6 3xl:px-20 py-4">
      <div className="flex flex-col gap-4">
        {/* 페이지 타이틀: 종목명 + 분석 일시 */}
        <div className="flex items-end justify-between">
          <div className="flex flex-col">
            {exchangeName && (
              <span className="text-sm px-1.5 py-0.5 text-muted-foreground translate-y-[-5px]">
                {exchangeName}
              </span>
            )}
            <div className="flex items-baseline gap-2">
              <h1 className="text-4xl font-bold text-foreground leading-none">
                {result.name}
              </h1>
              <span className="text-base text-muted-foreground">{result.ticker}</span>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">
              Analyzed
            </span>
            <span className="text-sm text-foreground tabular-nums">
              {formattedDate}
              {formattedTime && (
                <span className="text-muted-foreground ml-1.5">{formattedTime}</span>
              )}
            </span>
          </div>
        </div>

        {/* Row 1-2: 시그널 요약 + 기업개요 + 핵심지표 + 레이더 */}
        <div className="flex flex-col 3xl:flex-row gap-4 3xl:items-stretch">
          {/* 왼쪽 영역 */}
          <div className="flex-1 min-w-0 flex flex-col gap-4">
            <div className="flex gap-4 items-stretch">
              <SignalWaveCard
                signal={result.signal}
                confidence={result.confidence}
                color={SIGNAL_COLORS[result.signal]}
              />
              <SignalInfoCard
                signal={result.signal}
                probabilities={result.probabilities}
                currentPrice={result.currentPrice}
                colors={SIGNAL_COLORS}
              />
              {/* 4xl: 기업개요가 시그널 카드 옆에 */}
              <StockHeader
                summary={stockInfo?.summary}
                className="flex-1 min-w-0 hidden 4xl:flex"
              />
            </div>
            {/* Narrow: 기업개요 + 레이더 나란히 */}
            <div className="flex gap-4 items-stretch 3xl:hidden">
              <StockHeader
                summary={stockInfo?.summary}
                className="flex-1 min-w-0 h-auto"
              />
              <IndicatorRadar
                indicators={result.indicators}
                color={SIGNAL_COLORS[result.signal]}
                className="flex-1 min-w-0 max-w-[520px] hidden md:flex"
              />
            </div>
            {/* 3xl: 기업개요가 시그널 카드 아래 한 줄로 */}
            <StockHeader
              summary={stockInfo?.summary}
              className="hidden 3xl:flex 4xl:hidden h-auto"
            />
            {result.reasons && result.reasons.length > 0 && (
              <IndicatorCards
                reasons={result.reasons}
                color={SIGNAL_COLORS[result.signal]}
                className="flex-1 hidden lg:flex"
              />
            )}
          </div>

          {/* Wide: 레이더 오른쪽 컬럼 */}
          <IndicatorRadar
            indicators={result.indicators}
            color={SIGNAL_COLORS[result.signal]}
            className="w-[520px] min-w-[350px] flex-shrink hidden 3xl:flex"
          />
        </div>

        {/* Row 3-4: 시그널 차트 + 시그널 히스토리/벤치마크 + 분석근거 */}
        <div className="flex flex-col 3xl:flex-row gap-4">
          {/* Narrow: 분석 근거를 시그널 차트 위에 배치 (3xl 미만) */}
          {result.reasons && result.reasons.length > 0 && (
            <SignalReasons
              reasons={result.reasons}
              colors={SIGNAL_COLORS}
              className="min-w-0 3xl:hidden"
            />
          )}

          {/* Left Column */}
          <div className="min-w-0 flex flex-col gap-4 3xl:flex-[4]">
            <SignalChart
              candles={candles}
              signalHistory={result.signalHistory}
              colors={SIGNAL_COLORS}
              className="h-[550px] min-w-0"
            />

            <div className="flex flex-col lg:flex-row gap-4">
              {result.signalHistory && result.signalHistory.length > 0 && (
                <SignalTimeline
                  signalHistory={result.signalHistory}
                  colors={SIGNAL_COLORS}
                  className="flex-1 min-w-0 h-[400px]"
                />
              )}
              {indexCandles.length > 0 && (
                <BenchmarkChart
                  stockCandles={candles}
                  indexCandles={indexCandles}
                  stockName={result.name}
                  indexName={indexName}
                  className="flex-1 min-w-0"
                />
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="min-w-0 flex flex-col gap-4 3xl:flex-[2]">
            {/* Wide: 분석 근거를 오른쪽 컬럼에 배치 (3xl 이상) */}
            {result.reasons && result.reasons.length > 0 && (
              <SignalReasons
                reasons={result.reasons}
                colors={SIGNAL_COLORS}
                className="min-w-0 3xl:h-[550px] hidden 3xl:flex"
              />
            )}
            <SubChartPanel
              candles={candles}
              colors={SIGNAL_COLORS}
              className="min-w-0 h-[400px]"
            />
          </div>
        </div>

      </div>
    </div>
  );
}
