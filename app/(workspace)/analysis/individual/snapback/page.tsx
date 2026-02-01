"use client";

import inferenceApi from "@/api/inferenceApi";
import stockApi from "@/api/stockApi";
import {
  AnalysisInferenceHistory,
  AnalysisInferenceHistoryRef,
} from "@/components/analysis/AnalysisInferenceHistory";
import { AnalysisOrderbook } from "@/components/analysis/AnalysisOrderbook";
import { AnalysisWatchlist } from "@/components/analysis/AnalysisWatchlist";
import { AnalysisSnapbackResult } from "@/components/analysis/AnalysisSnapbackResult";
import { AnalysisStockHeader } from "@/components/analysis/AnalysisStockHeader";
import { AnalysisThemeStocks } from "@/components/analysis/AnalysisThemeStocks";
import { AnalysisTradingPanel } from "@/components/analysis/AnalysisTradingPanel";
import { toast } from "@/components/ToastProvider";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Skeleton } from "@/components/ui/Skeleton";
import { CandleChart } from "@/components/workspace/chart/CandleChart";
import { useStockWebSocket } from "@/hooks/useStockWebSocket";
import { loadLastViewedStock, saveLastViewedStock } from "@/lib/stockLocalStorage";
import { cn } from "@/lib/utils";
import {
  parseSnapbackResult,
  SNAPBACK_ERROR_CODES,
  SnapbackResult,
} from "@/types/Inference";
import {
  ExchangeCode,
  StockInfo,
  StockOrderbookData,
  StockQuote,
  StockRealtimeData,
  TR_ID,
} from "@/types/Stock";
import { useAuthStore } from "@/stores/authStore";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

type BottomTabType = "trading" | "analysis";
type SideTabType = "orderbook" | "history" | "watchlist" | "theme";

// 기본 선택 종목: 삼성전자
const DEFAULT_STOCK = {
  code: "005930",
  exchange: "KP" as ExchangeCode,
};

export default function AnalysisIndividualSnapbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAuthLoading } = useAuthStore();

  // URL에서 종목 코드/거래소/이력ID 읽기
  const codeFromUrl = searchParams.get("code");
  const exchangeFromUrl = searchParams.get("exchange") as ExchangeCode | null;
  const historyId = searchParams.get("historyId");

  // URL에 code가 없으면 lastViewedStock 또는 기본값으로 리다이렉트
  useEffect(() => {
    if (!codeFromUrl) {
      const lastViewed = loadLastViewedStock("snapback");
      const code = lastViewed?.code || DEFAULT_STOCK.code;
      const exchange = lastViewed?.exchange || DEFAULT_STOCK.exchange;
      router.replace(`?code=${code}&exchange=${exchange}`);
    }
  }, [codeFromUrl, router]);

  // 실제 사용할 값 (URL에 code가 있을 때만 사용, 없으면 리다이렉트 대기)
  const selectedCode = codeFromUrl;
  const selectedExchange = exchangeFromUrl || DEFAULT_STOCK.exchange;

  const [stockInfo, setStockInfo] = useState<StockInfo | null>(null);
  const [stockQuote, setStockQuote] = useState<StockQuote | null>(null);
  const [realtimeData, setRealtimeData] = useState<StockRealtimeData | null>(
    null
  );
  const [orderbookData, setOrderbookData] = useState<StockOrderbookData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [snapbackResult, setSnapbackResult] = useState<SnapbackResult | null>(
    null
  );
  const [isInferring, setIsInferring] = useState(false);
  const [errorModal, setErrorModal] = useState<{
    open: boolean;
    title: string;
    description: string;
  }>({ open: false, title: "", description: "" });
  const historyRef = useRef<AnalysisInferenceHistoryRef>(null);
  const [bottomTab, setBottomTab] = useState<BottomTabType>("trading");
  const [sideTab, setSideTab] = useState<SideTabType>("orderbook");

  // AI 추론 실행
  const handleInference = async () => {
    if (!selectedCode || isInferring) return;

    setIsInferring(true);
    try {
      const response = await inferenceApi.snapback({ ticker: selectedCode });
      if (response.success && response.data) {
        setSnapbackResult(response.data);
        // 이력 새로고침
        historyRef.current?.refresh();
        // URL에서 historyId 제거 (새 분석 결과이므로)
        if (historyId) {
          router.replace(`?code=${selectedCode}&exchange=${selectedExchange}`);
        }
      } else {
        toast({
          variant: "destructive",
          title: "분석 실패",
          description: "분석 중 오류가 발생했습니다.",
        });
      }
    } catch (error: any) {
      historyRef.current?.refresh();
      if (SNAPBACK_ERROR_CODES.includes(error?.response?.data?.data?.code)) {
        setErrorModal({
          open: true,
          title: "분석 조건 미충족",
          description: error?.response?.data?.data?.message,
        });
      } else {
        toast({
          variant: "destructive",
          title: "분석 실패",
          description: "분석 중 오류가 발생했습니다.",
        });
      }
    } finally {
      setIsInferring(false);
    }
  };

  // 종목 선택 핸들러 - URL 업데이트
  const handleSelectStock = useCallback(
    (code: string, exchange: ExchangeCode) => {
      if (code !== selectedCode || exchange !== selectedExchange) {
        // 마지막으로 본 종목 저장
        saveLastViewedStock("snapback", { code, exchange });
        // URL 쿼리 파라미터 업데이트
        router.push(`?code=${code}&exchange=${exchange}`);
        // 상태 초기화
        setStockInfo(null);
        setStockQuote(null);
        setRealtimeData(null);
        setOrderbookData(null);
        setSnapbackResult(null);
        setIsLoading(true);
      }
    },
    [selectedCode, selectedExchange, router]
  );

  // 이력 선택 핸들러 - URL에 historyId 추가하여 종목 이동
  const handleSelectHistory = useCallback(
    (ticker: string, exchange: ExchangeCode, id: string) => {
      // 종목이 다르면 종목도 변경, 같으면 historyId만 변경
      if (ticker !== selectedCode) {
        router.push(`?code=${ticker}&exchange=${exchange}&historyId=${id}`);
        // 상태 초기화
        setStockInfo(null);
        setStockQuote(null);
        setRealtimeData(null);
        setOrderbookData(null);
        setIsLoading(true);
      } else {
        router.push(`?code=${selectedCode}&exchange=${selectedExchange}&historyId=${id}`);
      }
    },
    [selectedCode, selectedExchange, router]
  );

  // WebSocket 연결 (체결가 + 호가)
  useStockWebSocket(selectedCode ?? "", {
    enabled: !!stockInfo && !!selectedCode,
    trCodes: stockInfo?.isNxtInMaster
      ? [TR_ID.H0UNCNT0, TR_ID.H0UNASP0]
      : [TR_ID.H0STCNT0, TR_ID.H0STASP0],
    onData: (trId, data) => {
      // 체결가 데이터
      if (trId === TR_ID.H0UNCNT0 || trId === TR_ID.H0STCNT0) {
        const rtData = data as StockRealtimeData;
        // 현재가가 0인 불완전한 데이터(시간외 등) 무시
        if (!rtData.STCK_PRPR) return;
        setRealtimeData(rtData);
      }
      // 호가 데이터
      if (trId === TR_ID.H0UNASP0 || trId === TR_ID.H0STASP0) {
        setOrderbookData(data as StockOrderbookData);
      }
    },
  });

  // 종목 정보 조회
  useEffect(() => {
    if (!selectedCode) return; // 리다이렉트 대기

    const fetchStockInfo = async () => {
      try {
        const response = await stockApi.getStockInfo(selectedCode, {
          market: "KR",
          exchange: selectedExchange,
        });
        if (response.success && response.data) {
          setStockInfo(response.data);
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "종목 정보 조회 실패",
        });
      }
    };

    fetchStockInfo();
  }, [selectedCode, selectedExchange]);

  // 시세 정보 조회
  useEffect(() => {
    if (!selectedCode || !stockInfo) return;

    const fetchStockQuote = async () => {
      try {
        const response = await stockApi.getStockQuote(selectedCode, {
          market_division_code: stockInfo.isNxtInMaster ? "UN" : "J",
          period_type: "D",
        });
        if (response.success && response.data) {
          setStockQuote(response.data);
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "종목 시세 정보 조회 실패",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStockQuote();
  }, [selectedCode, stockInfo]);

  // 호가 정보 조회 (초기 데이터)
  useEffect(() => {
    if (!selectedCode || !stockInfo) return;

    const fetchOrderbook = async () => {
      try {
        const response = await stockApi.getOrderbook(selectedCode, {
          market_division_code: stockInfo.isNxtInMaster ? "UN" : "J",
        });
        if (response.success && response.data) {
          setOrderbookData(response.data);
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "호가 정보 조회 실패",
        });
      }
    };

    fetchOrderbook();
  }, [selectedCode, stockInfo]);

  // 분석 결과 로드 (historyId가 있으면 해당 이력, 없으면 최신 이력)
  useEffect(() => {
    // 인증 로딩 중이거나 selectedCode가 없으면 대기
    if (isAuthLoading || !selectedCode) return;

    const fetchResult = async () => {
      try {
        if (historyId) {
          // historyId로 단건 조회
          const response = await inferenceApi.getHistoryById(historyId);
          if (response.success && response.data?.responseData) {
            setSnapbackResult(
              parseSnapbackResult(response.data.responseData as Record<string, unknown>)
            );
          }
        } else {
          // 최신 이력 조회 (30일 이내)
          const response = await inferenceApi.getHistory({
            ticker: selectedCode,
            model_type: "SNAPBACK",
            status: "COMPLETED",
            days: 30,
            limit: 1,
          });
          if (response.data?.items[0]?.responseData) {
            setSnapbackResult(
              parseSnapbackResult(response.data.items[0].responseData as Record<string, unknown>)
            );
          }
        }
      } catch {
        // 실패해도 무시 (기존 메시지 표시)
      }
    };

    fetchResult();
  }, [selectedCode, historyId, isAuthLoading]);

  return (
    <>
      <ConfirmDialog
        open={errorModal.open}
        onOpenChange={(open) => setErrorModal((prev) => ({ ...prev, open }))}
        title={errorModal.title}
        description={errorModal.description}
        showCancel={false}
      />
      <div className="h-full flex flex-col gap-1">
        {/* 상단: 관심종목, 테마, 차트, 호가 */}
        <div className="h-[800px] flex gap-1 shrink-0">
          {/* 왼쪽: 관심종목 + 테마별 종목 (xl 이상에서만 표시) */}
          <div className="w-62 shrink-0 hidden xl:flex flex-col gap-1 h-full">
            <div className="bg-background-1 rounded-sm flex-1 min-h-0 overflow-hidden">
              <AnalysisWatchlist onSelect={handleSelectStock} showHeader={true} />
            </div>
            <div className="bg-background-1 rounded-sm flex-1 min-h-0 overflow-hidden">
              <AnalysisThemeStocks onSelect={handleSelectStock} />
            </div>
          </div>

          {/* 오른쪽: 종목헤더 + 차트 + 호가 등 */}
          <div className="flex-1 min-w-0 flex flex-col gap-1">
            {/* 종목 헤더 */}
            <AnalysisStockHeader
              stockInfo={stockInfo}
              stockQuote={stockQuote}
              realtimeData={realtimeData}
              isLoading={isLoading}
              onInference={handleInference}
              isInferring={isInferring}
              onSelectStock={handleSelectStock}
            />

            {/* 차트 + 호가창 */}
            <div className="flex-1 flex gap-1 min-h-0">
              {/* 차트 영역 */}
              <div className="flex-1 min-w-0 bg-background-1 rounded-sm overflow-hidden">
                {stockInfo ? (
                  <CandleChart
                    code={stockInfo.code}
                    market={stockInfo.market}
                    exchange={stockInfo.exchange}
                    stockQuote={stockQuote}
                    realtimeData={realtimeData}
                    supportLines={snapbackResult?.supports}
                    basePoint={snapbackResult?.basePoint}
                    className="h-full"
                  />
                ) : (
                  <Skeleton variant="shimmer-contrast" className="h-full rounded-sm" />
                )}
              </div>

              {/* 오른쪽: 호가창 + AI 패널 (md 이상에서만 표시) */}
              <div className="w-62 shrink-0 hidden md:flex flex-col gap-1">
                {/* 호가창 영역 */}
                <div className="h-[505px] bg-background-1 rounded-sm overflow-hidden">
                  <AnalysisOrderbook
                    orderbookData={orderbookData}
                    stockQuote={stockQuote}
                    realtimeData={realtimeData}
                    isLoading={isLoading}
                  />
                </div>

                {/* AI 분석 이력 */}
                <div className="flex-1 bg-background-1 rounded-sm overflow-hidden min-h-0">
                  <AnalysisInferenceHistory
                    ref={historyRef}
                    onSelectHistory={handleSelectHistory}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 중간: 관심종목 + 테마 가로 배치 (md~xl 사이에서만 표시) */}
        <div className="hidden md:flex xl:hidden gap-1 h-[400px] shrink-0">
          <div className="flex-1 bg-background-1 rounded-sm overflow-hidden">
            <AnalysisWatchlist onSelect={handleSelectStock} showHeader={true} />
          </div>
          <div className="flex-1 bg-background-1 rounded-sm overflow-hidden">
            <AnalysisThemeStocks onSelect={handleSelectStock} />
          </div>
        </div>

        {/* 중간: 호가/이력/관심/테마 탭 (md 미만에서만 표시) */}
        <div className="md:hidden h-[538px] flex flex-col bg-background-1 rounded-sm overflow-hidden shrink-0">
          {/* 탭 헤더 */}
          <div className="flex border-b border-border-2">
            <button
              onClick={() => setSideTab("orderbook")}
              className={cn(
                "flex-1 px-2 py-2 text-xs font-medium transition-colors",
                sideTab === "orderbook"
                  ? "text-foreground border-b-2 border-accent"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              호가
            </button>
            <button
              onClick={() => setSideTab("history")}
              className={cn(
                "flex-1 px-2 py-2 text-xs font-medium transition-colors",
                sideTab === "history"
                  ? "text-foreground border-b-2 border-accent"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              이력
            </button>
            <button
              onClick={() => setSideTab("watchlist")}
              className={cn(
                "flex-1 px-2 py-2 text-xs font-medium transition-colors",
                sideTab === "watchlist"
                  ? "text-foreground border-b-2 border-accent"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              관심
            </button>
            <button
              onClick={() => setSideTab("theme")}
              className={cn(
                "flex-1 px-2 py-2 text-xs font-medium transition-colors",
                sideTab === "theme"
                  ? "text-foreground border-b-2 border-accent"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              테마
            </button>
          </div>

          {/* 탭 콘텐츠 */}
          <div className="flex-1 overflow-auto min-h-0">
            {sideTab === "orderbook" && (
              <AnalysisOrderbook
                orderbookData={orderbookData}
                stockQuote={stockQuote}
                realtimeData={realtimeData}
                isLoading={isLoading}
              />
            )}
            {sideTab === "history" && (
              <AnalysisInferenceHistory
                ref={historyRef}
                onSelectHistory={handleSelectHistory}
              />
            )}
            {sideTab === "watchlist" && (
              <AnalysisWatchlist onSelect={handleSelectStock} showHeader={true} />
            )}
            {sideTab === "theme" && (
              <AnalysisThemeStocks onSelect={handleSelectStock} />
            )}
          </div>
        </div>

        {/* 하단: 트레이딩 패널 + AI 분석 결과 (xl 이상: 가로 배치) */}
        <div className="hidden xl:flex min-h-[400px] gap-1 shrink-0">
          {/* 왼쪽: 트레이딩 패널 */}
          <div className="flex-1 bg-background-1 rounded-sm overflow-hidden">
            <AnalysisTradingPanel />
          </div>

          {/* 오른쪽: AI 분석 결과 */}
          <div className="flex-1 bg-background-1 rounded-sm overflow-auto min-h-0">
            {snapbackResult ? (
              <AnalysisSnapbackResult
                result={snapbackResult}
                stockName={stockInfo?.nameKo}
                currentPrice={realtimeData?.STCK_PRPR ?? stockQuote?.currentPrice}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <p className="text-xs">AI 분석 버튼을 클릭하여 결과를 확인하세요</p>
              </div>
            )}
          </div>
        </div>

        {/* 하단: 트레이딩 패널 + AI 분석 결과 (xl 미만: 탭 전환) */}
        <div className="xl:hidden min-h-[400px] flex flex-col bg-background-1 rounded-sm overflow-hidden shrink-0">
          {/* 탭 헤더 */}
          <div className="flex border-b border-border-2">
            <button
              onClick={() => setBottomTab("trading")}
              className={cn(
                "px-4 py-2 text-xs font-medium transition-colors",
                bottomTab === "trading"
                  ? "text-foreground border-b-2 border-accent"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              트레이딩
            </button>
            <button
              onClick={() => setBottomTab("analysis")}
              className={cn(
                "px-4 py-2 text-xs font-medium transition-colors",
                bottomTab === "analysis"
                  ? "text-foreground border-b-2 border-accent"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              AI 분석
            </button>
          </div>

          {/* 탭 콘텐츠 */}
          <div className="flex-1 overflow-auto min-h-0">
            {bottomTab === "trading" && <AnalysisTradingPanel />}
            {bottomTab === "analysis" && (
              snapbackResult ? (
                <AnalysisSnapbackResult
                  result={snapbackResult}
                  stockName={stockInfo?.nameKo}
                  currentPrice={realtimeData?.STCK_PRPR ?? stockQuote?.currentPrice}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground mt-10">
                  <p className="text-xs">AI 분석 버튼을 클릭하여 결과를 확인하세요</p>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </>
  );
}
