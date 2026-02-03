"use client";

import inferenceApi from "@/api/inferenceApi";
import stockApi from "@/api/stockApi";
import { AnalysisInferenceHistory } from "@/components/analysis/AnalysisInferenceHistory";
import { AnalysisStockSearch } from "@/components/analysis/AnalysisStockSearch";
import { AnalysisWatchlist } from "@/components/analysis/AnalysisWatchlist";
import { LineChartDataPoint, SimpleLineChart } from "@/components/chart/SimpleLineChart";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "@/hooks/useToast";
import { getExchangeName } from "@/lib/stock";
import { loadSessionLatestStock } from "@/lib/stockLocalStorage";
import { cn } from "@/lib/utils";
import aiLogoAnimation from "@/public/lottie/ai-logo.json";
import { ExchangeCode, StockInfo } from "@/types/Stock";
import Lottie from "lottie-react";
import { ArrowUpRight, BarChart3, Calendar, Clock, Loader2, Search, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

type MainTab = "stock" | "portfolio";
type ListTab = "search" | "watchlist" | "history";

const GREETING_MESSAGES = [
  "오늘은 어떤 종목을 살펴볼까요?",
  "관심 있는 기업을 찾아볼까요?",
  "투자 인사이트가 필요하신가요?",
  "어떤 종목이 마음에 드세요?",
];

// 차트 색상 팔레트 (선명하고 예쁜 색상들)
const CHART_COLORS = [
  "#8b5cf6", // violet
  "#06b6d4", // cyan
  "#f59e0b", // amber
  "#ec4899", // pink
  "#10b981", // emerald
  "#3b82f6", // blue
  "#f97316", // orange
  "#14b8a6", // teal
  "#a855f7", // purple
  "#22c55e", // green
];

// 종목 코드 → 색상 (해시 기반)
function getStockColor(code: string): string {
  let hash = 0;
  for (let i = 0; i < code.length; i++) {
    hash = code.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % CHART_COLORS.length;
  return CHART_COLORS[index];
}

export default function QuantAnalysisPage() {
  const router = useRouter();
  const [mainTab, setMainTab] = useState<MainTab>("stock");
  const [listTab, setListTab] = useState<ListTab>("search");

  // 랜덤 인사말 (클라이언트에서만 선택)
  const [greetingMessage, setGreetingMessage] = useState("");
  useEffect(() => {
    setGreetingMessage(
      GREETING_MESSAGES[Math.floor(Math.random() * GREETING_MESSAGES.length)]
    );
  }, []);

  const [selectedStock, setSelectedStock] = useState<{
    code: string;
    exchange: ExchangeCode;
  } | null>(null);

  // 마운트 후 세션 저장된 종목 복원
  useEffect(() => {
    const latest = loadSessionLatestStock();
    if (latest) {
      setSelectedStock({ code: latest.code, exchange: latest.exchange });
    }
  }, []);
  const [stockInfo, setStockInfo] = useState<StockInfo | null>(null);
  const [priceHistory, setPriceHistory] = useState<LineChartDataPoint[]>([]);
  const [latestCandle, setLatestCandle] = useState<{ date: Date; close: number } | null>(null);
  const [isLoadingInfo, setIsLoadingInfo] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeCooldown, setAnalyzeCooldown] = useState(false);
  const [stockInfoError, setStockInfoError] = useState(false);
  const [priceHistoryError, setPriceHistoryError] = useState(false);

  // 종목 선택 시 정보 조회
  useEffect(() => {
    if (!selectedStock) {
      setStockInfo(null);
      setPriceHistory([]);
      setLatestCandle(null);
      setStockInfoError(false);
      setPriceHistoryError(false);
      return;
    }

    const fetchData = async () => {
      setIsLoadingInfo(true);
      setStockInfoError(false);
      setPriceHistoryError(false);
      try {
        const market =
          selectedStock.exchange === "NAS" ||
            selectedStock.exchange === "NYS" ||
            selectedStock.exchange === "AMS"
            ? "US"
            : "KR";

        const [infoRes, candleRes] = await Promise.all([
          stockApi.getStockInfo(selectedStock.code, {
            market,
            exchange: selectedStock.exchange,
          }),
          stockApi.getCandle({
            market,
            exchange: selectedStock.exchange,
            code: selectedStock.code,
            interval: "1d",
            limit: 60,
          }),
        ]);

        if (infoRes.success && infoRes.data) {
          setStockInfo(infoRes.data);
        } else {
          setStockInfoError(true);
        }

        if (candleRes.success && candleRes.data && candleRes.data.candles.length > 0) {
          const candles = candleRes.data.candles;
          const chartData = candles.map((c) => ({
            date: new Date(c.time * 1000).toLocaleDateString("ko-KR", {
              month: "2-digit",
              day: "2-digit",
            }),
            value: c.close,
          }));
          setPriceHistory(chartData);
          const last = candles[candles.length - 1];
          setLatestCandle({ date: new Date(last.time * 1000), close: last.close });
        } else if (!candleRes.success) {
          setPriceHistoryError(true);
        }
      } catch {
        setStockInfoError(true);
        setPriceHistoryError(true);
      } finally {
        setIsLoadingInfo(false);
      }
    };

    fetchData();
  }, [selectedStock]);

  const handleSelectStock = useCallback(
    (code: string, exchange: ExchangeCode) => {
      setSelectedStock({ code, exchange });
    },
    []
  );

  const handleAnalyze = async () => {
    if (!selectedStock || isAnalyzing || analyzeCooldown) return;

    setIsAnalyzing(true);
    try {
      const response = await inferenceApi.quantSignal({
        ticker: selectedStock.code,
      });
      if (response.success) {
        router.push(`/analysis/quant/${response.data.historyId}`);
      } else {
        toast({
          variant: "destructive",
          description: response.message ?? "분석 요청에 실패했습니다.",
        });
        // 에러 후 쿨다운
        setAnalyzeCooldown(true);
        setTimeout(() => setAnalyzeCooldown(false), 3000);
      }
    } catch (error: unknown) {
      const axiosError = error as { response?: { status?: number; data?: { message?: string } } };
      const status = axiosError.response?.status;
      // 400 에러만 서버 메시지 표시 (validation error), 그 외는 일반 메시지
      const message = status === 400
        ? (axiosError.response?.data?.message ?? "분석 요청에 실패했습니다.")
        : "일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
      toast({
        variant: "destructive",
        description: message,
      });
      // 에러 후 쿨다운
      setAnalyzeCooldown(true);
      setTimeout(() => setAnalyzeCooldown(false), 3000);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="h-full flex items-center justify-center">
      <div className="w-full max-w-4xl">
        {/* 헤더 문구 */}
        <div className="flex items-center justify-center gap-3 mb-4 animate-fade-in-up">
          <div className="w-14 h-14">
            <Lottie animationData={aiLogoAnimation} loop className="w-full h-full" />
          </div>
          <h1 className="text-3xl font-medium text-foreground">
            {greetingMessage}
          </h1>
        </div>

        {/* 메인 탭 */}
        <div className="flex justify-center mb-6 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          <button
            onClick={() => setMainTab("stock")}
            className={cn(
              "flex items-center gap-2 px-6 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
              mainTab === "stock"
                ? "border-accent text-accent"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            종목 분석
          </button>
          <button
            disabled
            className="flex items-center gap-2 px-6 py-2 text-sm font-medium border-b-2 -mb-px border-transparent text-muted-foreground/50 cursor-not-allowed"
          >
            AI 포트폴리오
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
              Soon
            </span>
          </button>
        </div>
        {/* 콘텐츠 */}
        {mainTab === "stock" && (
          <div className="bg-background-1 rounded-lg overflow-hidden h-[500px] animate-fade-in-up" style={{ animationDelay: "200ms" }}>
            <div className="flex h-full">
              {/* 왼쪽: 검색/관심종목 탭 */}
              <div className="w-84 border-r border-border-2 flex flex-col py-1">
                {/* 리스트 탭 */}
                <div className="flex border-b border-border-2">
                  <button
                    onClick={() => setListTab("search")}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-medium border-b-2 -mb-px transition-colors",
                      listTab === "search"
                        ? "border-accent text-accent"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Search className="w-3.5 h-3.5" />
                    검색
                  </button>
                  <button
                    onClick={() => setListTab("watchlist")}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-medium border-b-2 -mb-px transition-colors",
                      listTab === "watchlist"
                        ? "border-accent text-accent"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Star className="w-3.5 h-3.5 text-watchlist fill-watchlist" />
                    관심종목
                  </button>
                  <button
                    onClick={() => setListTab("history")}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-medium border-b-2 -mb-px transition-colors",
                      listTab === "history"
                        ? "border-accent text-accent"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    이력
                  </button>
                </div>

                {/* 리스트 콘텐츠 */}
                <div className="flex-1 overflow-hidden p-3">
                  {listTab === "search" ? (
                    <AnalysisStockSearch
                      onSelect={handleSelectStock}
                      className="w-full h-full"
                    />
                  ) : listTab === "watchlist" ? (
                    <AnalysisWatchlist
                      onSelect={handleSelectStock}
                      showHeader={false}
                      className="h-full"
                    />
                  ) : (
                    <AnalysisInferenceHistory
                      modelType="QUANT_SIGNAL"
                      showHeader={false}
                      onSelectHistory={(_ticker, _exchange, historyId) => {
                        router.push(`/analysis/quant/${historyId}`);
                      }}
                      className="h-full"
                    />
                  )}
                </div>
              </div>

              {/* 오른쪽: 종목 정보 */}
              <div className={cn("flex-1 flex items-start justify-center p-6", !selectedStock && "items-center")}>
                {!selectedStock ? (
                  <div className="text-center text-muted-foreground">
                    <BarChart3 className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">분석할 종목을 선택하세요</p>
                  </div>
                ) : (
                  <div className="w-full">
                    {/* 종목 헤더 */}
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className={cn(
                          "text-lg font-semibold",
                          stockInfoError ? "text-destructive" : "text-foreground"
                        )}>
                          {stockInfoError
                            ? "종목 정보 조회 실패"
                            : (stockInfo?.nameKo ?? selectedStock.code)}
                        </h2>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {selectedStock.code} ·{" "}
                          {getExchangeName(selectedStock.exchange)}
                        </p>
                      </div>
                      <button
                        onClick={handleAnalyze}
                        disabled={isAnalyzing || analyzeCooldown || stockInfoError || isLoadingInfo}
                        className="p-2.5 rounded-full bg-accent text-accent-foreground hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="분석 시작"
                      >
                        {isAnalyzing ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <ArrowUpRight className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    {/* 분석 기준 정보 */}
                    {!isLoadingInfo && latestCandle && (
                      <div className="mb-1 flex items-center justify-end gap-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          분석 기준일 {latestCandle.date.toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" })}
                        </span>
                        <span className="text-border">|</span>
                        <span>
                          기준가 {latestCandle.close.toLocaleString()}원
                        </span>
                      </div>
                    )}

                    {/* 미니 차트 */}
                    {isLoadingInfo ? (
                      <div className="mb-4 h-[150px] bg-muted rounded-lg animate-pulse" />
                    ) : priceHistoryError ? (
                      <div className="mb-4 h-[150px] border border-border-2 rounded-lg flex items-center justify-center">
                        <p className="text-sm text-muted-foreground">주가 데이터 조회 실패</p>
                      </div>
                    ) : priceHistory.length > 0 ? (
                      <div className="mb-4 border border-border-2 rounded-lg overflow-hidden h-[150px]">
                        <SimpleLineChart
                          data={priceHistory}
                          showAxis={false}
                          showMinMax={true}
                          color={getStockColor(selectedStock.code)}
                          valueFormatter={(v) => `${v.toLocaleString()}원`}
                          tooltipBgColor="bg-background-2"
                        />
                      </div>
                    ) : (
                      <div className="mb-4 h-[150px] border border-border-2 rounded-lg flex items-center justify-center">
                        <p className="text-sm text-muted-foreground">주가 정보 없음</p>
                      </div>
                    )}

                    {/* 기업개요 */}
                    {isLoadingInfo || isAnalyzing ? (
                      <div className="space-y-2">
                        <div className="h-4 bg-muted rounded animate-pulse w-full" />
                        <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
                        <div className="h-4 bg-muted rounded animate-pulse w-5/6" />
                      </div>
                    ) : stockInfo?.summary ? (
                      <TooltipProvider>
                        <Tooltip delayDuration={200}>
                          <TooltipTrigger asChild>
                            <div className="text-sm text-muted-foreground leading-relaxed cursor-help">
                              <p className="line-clamp-9">{stockInfo.summary}</p>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent
                            side="bottom"
                            className="max-w-md p-3 text-sm leading-relaxed"
                          >
                            {stockInfo.summary}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : stockInfoError ? (
                      <p className="text-sm text-destructive">
                        종목 정보를 가져오는데 실패했습니다
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        기업 개요 정보 없음
                      </p>
                    )}

                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

    </div >
  );
}
