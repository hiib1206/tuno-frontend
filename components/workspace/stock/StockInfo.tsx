"use client";

import { LoginRequestModal } from "@/components/modals/LoginRequestModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CandleChart } from "@/components/workspace/chart/CandleChart";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import { useWatchlistStore } from "@/stores/watchlistStore";
import {
  ExchangeCode,
  StockInfo as StockInfoType,
  StockQuote,
  StockRealtimeData,
  StockStatusCode,
  StockStatusLabelMap,
} from "@/types/Stock";
import { Star, TrendingDown, TrendingUp } from "lucide-react";
import { useState } from "react";

interface StockInfoProps {
  stockQuote: StockQuote | null;
  stockInfo: StockInfoType;
  realtimeData?: StockRealtimeData | null;
}

export function StockInfo({
  stockQuote,
  stockInfo,
  realtimeData,
}: StockInfoProps) {
  const { user } = useAuthStore();
  const { isInWatchlist, toggleWatchlist } = useWatchlistStore();
  const [isToggling, setIsToggling] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // 전역 스토어에서 관심종목 여부 확인 (로그인 상태일 때만)
  const isWatchList = user ? isInWatchlist(stockInfo.code, stockInfo.exchange) : false;

  // 실시간 데이터 우선 사용, 없으면 초기 REST API 데이터 사용
  const currPrice = realtimeData?.STCK_PRPR ?? stockQuote?.currentPrice ?? 0;
  const open = realtimeData?.STCK_OPRC ?? stockQuote?.open ?? 0;
  const high = realtimeData?.STCK_HGPR ?? stockQuote?.high ?? 0;
  const low = realtimeData?.STCK_LWPR ?? stockQuote?.low ?? 0;
  const volume = realtimeData?.ACML_VOL ?? stockQuote?.volume ?? 0;
  const tradingValue =
    realtimeData?.ACML_TR_PBMN ?? stockQuote?.tradingValue ?? 0;
  const prevClose = stockQuote?.previousClose ?? 0;

  const priceChange = currPrice - prevClose;
  const priceChangePercent =
    prevClose === 0 ? "0.00" : ((priceChange / prevClose) * 100).toFixed(2);
  const isUp = priceChange >= 0;
  const marketCap = currPrice * (stockQuote?.listedShares ?? 0);

  const formatNumber = (value: number) => {
    const unit = value / 100000000;

    if (value >= 100000000) {
      // 1억 이상: 소수점 없이, 내림(자르기)
      return Math.floor(unit).toLocaleString();
    }

    // 1억 미만: 소수점 1자리 (예: 0.7)
    return parseFloat(unit.toFixed(1)).toLocaleString();
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString();
  };

  const formatDate = (dateStr: string) => {
    // YYYYMMDD 형식을 YYYY-MM-DD로 변환
    if (dateStr.length === 8) {
      return `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(
        6,
        8
      )}`;
    }
    return dateStr;
  };

  const getExchangeName = (exchange: ExchangeCode): string => {
    const exchangeMap: Record<ExchangeCode, string> = {
      KP: "KOSPI",
      KQ: "KOSDAQ",
      NAS: "NASDAQ",
      NYS: "NYSE",
      AMS: "AMEX",
    };
    return exchangeMap[exchange];
  };

  const handleWatchlistToggle = async () => {
    if (isToggling) return;

    // 로그인 여부 확인
    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }

    setIsToggling(true);
    try {
      // 전역 스토어를 통해 토글
      await toggleWatchlist(stockInfo.code, stockInfo.exchange);
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <>
      <Card variant="workspace">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-6 flex-1">
              <div className="min-w-[100px]">
                <div className="flex items-center gap-2">
                  <span className="inline-block px-2 py-0.5 text-[10px] sm:text-xs font-semibold rounded-md bg-muted text-muted-foreground mb-2">
                    {getExchangeName(stockInfo.exchange)}
                  </span>
                  {stockQuote?.statusCode && (
                    <span
                      className={cn(
                        "inline-block px-2 py-0.5 text-[10px] sm:text-xs font-semibold rounded-md bg-destructive/20 text-destructive mb-2",
                        stockQuote.statusCode ===
                          StockStatusCode.CREDIT_AVAILABLE &&
                          "bg-accent/20 text-accent",
                        stockQuote.statusCode === StockStatusCode.MARGIN_100 &&
                          "bg-orange-500/20 text-orange-500"
                      )}
                    >
                      {StockStatusLabelMap[stockQuote.statusCode]}
                    </span>
                  )}
                </div>

                <CardTitle className="text-xl sm:text-2xl md:text-3xl">
                  {stockInfo.nameKo || stockInfo.nameEn || "N/A"}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {stockInfo.code}
                </p>
              </div>
              <div className="flex flex-col">
                <span className="self-start px-2 py-0.5 text-[10px] sm:text-xs font-semibold rounded-md bg-muted text-muted-foreground mb-2">
                  현재가
                </span>
                <div
                  className={`text-xl sm:text-2xl md:text-3xl font-bold ${
                    isUp ? "text-chart-up" : "text-chart-down"
                  }`}
                >
                  {formatCurrency(currPrice) ?? "N/A"}원
                </div>
                <div
                  className={`text-sm flex items-center gap-1 ${
                    isUp ? "text-chart-up" : "text-chart-down"
                  }`}
                >
                  {isUp ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  <span>
                    {isUp ? "+" : ""}
                    {formatCurrency(priceChange)} ({isUp ? "+" : ""}
                    {priceChangePercent}%)
                  </span>
                </div>
              </div>
            </div>

            {/* 별 아이콘 */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  onClick={handleWatchlistToggle}
                  disabled={isToggling}
                  className={cn(
                    "transition-colors hover:opacity-80 flex-shrink-0 p-0 has-[>svg]:p-0",
                    isWatchList && "text-watchlist hover:text-watchlist-hover",
                    !isWatchList && "text-muted-foreground"
                  )}
                >
                  <Star
                    className={cn("!w-7 !h-7", isWatchList && "fill-current")}
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isWatchList ? "관심종목 제거" : "관심종목 추가"}</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <span className="text-xs text-muted-foreground text-right mb-1">
            ※ 차트 정보는 KRX와 NXT 통합 데이터 이므로 전일종가 · 등락률등이
            상이할 수 있습니다.
          </span>
        </CardHeader>
        <CardContent>
          {/* 차트와 기본 정보 */}
          <div className="flex flex-col md:flex-row gap-2 sm:gap-0 border-b border-t border-border">
            <div className="flex-1 min-w-0 h-[400px] md:h-auto border-b md:border-b-0 md:border-r border-border">
              <CandleChart
                code={stockInfo.code}
                market={stockInfo.market}
                exchange={stockInfo.exchange}
                stockQuote={stockQuote}
                realtimeData={realtimeData}
              />
            </div>
            <div className="flex flex-col h-[300px] md:h-[450px] w-full md:w-auto md:min-w-[150px] flex-shrink-0 py-2 px-2">
              <div className="flex-1 flex flex-row md:flex-col justify-between items-center md:items-stretch border-b border-border gap-2 md:gap-0 -mx-2 px-2">
                <p className="text-sm text-muted-foreground">시가(원)</p>
                <p className="text-xl sm:text-xl font-semibold text-right md:text-right">
                  {formatCurrency(open) ?? "N/A"}
                </p>
              </div>
              <div className="flex-1 flex flex-row md:flex-col justify-between items-center md:items-stretch border-b border-border pt-2 gap-2 md:gap-0 -mx-2 px-2">
                <p className="text-sm text-muted-foreground">고가(원)</p>
                <p className="text-xl sm:text-xl font-semibold text-chart-up text-right md:text-right">
                  {formatCurrency(high) ?? "N/A"}
                </p>
              </div>
              <div className="flex-1 flex flex-row md:flex-col justify-between items-center md:items-stretch border-b border-border pt-2 gap-2 md:gap-0 -mx-2 px-2">
                <p className="text-sm text-muted-foreground">저가(원)</p>
                <p className="text-xl sm:text-xl font-semibold text-chart-down text-right md:text-right">
                  {formatCurrency(low) ?? "N/A"}
                </p>
              </div>
              <div className="flex-1 flex flex-row md:flex-col justify-between items-center md:items-stretch border-b border-border pt-2 gap-2 md:gap-0 -mx-2 px-2">
                <p className="text-sm text-muted-foreground">전일종가(원)</p>
                <p className="text-xl sm:text-xl font-semibold text-right md:text-right">
                  {formatCurrency(prevClose) ?? "N/A"}
                </p>
              </div>
              <div className="flex-1 flex flex-row md:flex-col justify-between items-center md:items-stretch pt-2 gap-2 md:gap-0 -mx-2 px-2">
                <p className="text-sm text-muted-foreground">시가총액(억)</p>
                <p className="text-lg sm:text-xl font-semibold text-right md:text-right">
                  {formatNumber(marketCap) ?? "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* 거래 정보 및 52주 정보 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-3">
            <div className="border-r border-border pr-4">
              <p className="text-sm text-muted-foreground">거래량(주)</p>
              <p className="text-lg font-semibold text-right">
                {volume?.toLocaleString() ?? "N/A"}
              </p>
            </div>
            <div className="border-r border-border pr-4">
              <p className="text-sm text-muted-foreground">거래대금(억)</p>
              <p className="text-lg font-semibold text-right">
                {formatNumber(tradingValue) ?? "N/A"}
              </p>
            </div>
            <div className="border-r border-border pr-4">
              <p className="text-sm text-muted-foreground">52주 최고(원)</p>
              <p className="text-lg font-semibold text-chart-up text-right">
                {formatCurrency(stockQuote?.high52Week ?? 0) ?? "N/A"}
              </p>
            </div>
            <div className="border-r md:border-r-0 border-border pr-4 md:pr-0">
              <p className="text-sm text-muted-foreground">52주 최저(원)</p>
              <p className="text-lg font-semibold text-chart-down text-right">
                {formatCurrency(stockQuote?.low52Week ?? 0) ?? "N/A"}
              </p>
            </div>
          </div>

          {/* 상장 정보 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t">
            <div className="border-r border-border pr-4">
              <p className="text-sm text-muted-foreground">상장일자</p>
              <p className="text-lg font-semibold text-right">
                {formatDate(stockInfo.listedAt || "N/A")}
              </p>
            </div>
            <div className="border-r border-border pr-4">
              <p className="text-sm text-muted-foreground">상장주수(주)</p>
              <p className="text-lg font-semibold text-right">
                {stockQuote?.listedShares?.toLocaleString() ?? "N/A"}
              </p>
            </div>
            <div className="border-r border-border pr-4">
              <p className="text-sm text-muted-foreground">자본금(억)</p>
              <p className="text-lg font-semibold text-right">
                {stockQuote?.capital?.toLocaleString() ?? "N/A"}
              </p>
            </div>
            <div className="border-r md:border-r-0 border-border pr-4 md:pr-0">
              <p className="text-sm text-muted-foreground">액면가(원)</p>
              <p className="text-lg font-semibold text-right">
                {formatCurrency(stockQuote?.parValue ?? 0) ?? "N/A"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      <LoginRequestModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </>
  );
}
