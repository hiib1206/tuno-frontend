"use client";

import AILoader from "@/components/loading/AiLoader";
import { LoginRequestModal } from "@/components/modals/LoginRequestModal";
import { cn } from "@/lib/utils";
import { getExchangeName } from "@/lib/stock";
import { useAuthStore } from "@/stores/authStore";
import { useWatchlistStore } from "@/stores/watchlistStore";
import {
  ExchangeCode,
  StockInfo,
  StockQuote,
  StockRealtimeData,
  StockStatusCode,
  StockStatusLabelMap,
} from "@/types/Stock";
import { ChevronDown, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnalysisStockSearch } from "./AnalysisStockSearch";
import { Skeleton } from "../ui/Skeleton";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

interface AnalysisStockHeaderProps {
  stockInfo?: StockInfo | null;
  stockQuote?: StockQuote | null;
  realtimeData?: StockRealtimeData | null;
  isLoading?: boolean;
  onInference?: () => void;
  isInferring?: boolean;
  onSelectStock?: (code: string, exchange: ExchangeCode) => void;
}

export function AnalysisStockHeader({
  stockInfo,
  stockQuote,
  realtimeData,
  isLoading,
  onInference,
  isInferring,
  onSelectStock,
}: AnalysisStockHeaderProps) {
  const { user } = useAuthStore();
  const { isInWatchlist, toggleWatchlist } = useWatchlistStore();
  const [isToggling, setIsToggling] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const scrollContainerDesktopRef = useRef<HTMLDivElement>(null);
  const scrollContainerMobileRef = useRef<HTMLDivElement>(null);

  // 검색에서 종목 선택 시
  const handleSearchSelect = (code: string, exchange: ExchangeCode) => {
    setIsSearchOpen(false);
    onSelectStock?.(code, exchange);
  };

  // 관심종목 여부 (로그인 상태일 때만)
  const isWatchList = user && stockInfo ? isInWatchlist(stockInfo.code, stockInfo.exchange) : false;

  // 관심종목 토글
  const handleWatchlistToggle = async () => {
    if (isToggling || !stockInfo) return;

    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }

    setIsToggling(true);
    try {
      await toggleWatchlist(stockInfo.code, stockInfo.exchange);
    } finally {
      setIsToggling(false);
    }
  };

  // 현재 보이는 스크롤 컨테이너 가져오기
  const getVisibleContainer = useCallback(() => {
    const desktop = scrollContainerDesktopRef.current;
    const mobile = scrollContainerMobileRef.current;
    // offsetParent가 null이면 숨겨진 상태
    if (desktop && desktop.offsetParent !== null) return desktop;
    if (mobile && mobile.offsetParent !== null) return mobile;
    return desktop || mobile;
  }, []);

  // 스크롤 위치 체크
  const checkScrollPosition = useCallback(() => {
    const container = getVisibleContainer();
    if (!container) return;

    setCanScrollLeft(container.scrollLeft > 0);
    setCanScrollRight(
      container.scrollLeft < container.scrollWidth - container.clientWidth - 1
    );
  }, [getVisibleContainer]);

  // 스크롤 이동
  const scrollLeft = () => {
    const container = getVisibleContainer();
    if (container) {
      container.scrollBy({ left: -120, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    const container = getVisibleContainer();
    if (container) {
      container.scrollBy({ left: 120, behavior: "smooth" });
    }
  };

  // 스크롤 이벤트 리스너
  useEffect(() => {
    const desktop = scrollContainerDesktopRef.current;
    const mobile = scrollContainerMobileRef.current;

    checkScrollPosition();

    if (desktop) {
      desktop.addEventListener("scroll", checkScrollPosition);
    }
    if (mobile) {
      mobile.addEventListener("scroll", checkScrollPosition);
    }
    window.addEventListener("resize", checkScrollPosition);

    return () => {
      if (desktop) {
        desktop.removeEventListener("scroll", checkScrollPosition);
      }
      if (mobile) {
        mobile.removeEventListener("scroll", checkScrollPosition);
      }
      window.removeEventListener("resize", checkScrollPosition);
    };
  }, [checkScrollPosition]);

  // 데이터 변경 시 스크롤 위치 재확인 (초기 로딩 후 콘텐츠가 채워질 때)
  useEffect(() => {
    // DOM 업데이트 후 체크
    const rafId = requestAnimationFrame(checkScrollPosition);
    return () => cancelAnimationFrame(rafId);
  }, [stockQuote, realtimeData, checkScrollPosition]);



  // 실시간 데이터 우선 사용, 없으면 REST API 데이터 사용
  // || 사용: 0값도 유효하지 않은 가격으로 처리하여 stockQuote로 fallback
  const currentPrice = realtimeData?.STCK_PRPR || stockQuote?.currentPrice || 0;
  const open = realtimeData?.STCK_OPRC || stockQuote?.open || 0;
  const high = realtimeData?.STCK_HGPR || stockQuote?.high || 0;
  const low = realtimeData?.STCK_LWPR || stockQuote?.low || 0;
  const volume = realtimeData?.ACML_VOL ?? stockQuote?.volume ?? 0;
  const tradingValue =
    realtimeData?.ACML_TR_PBMN ?? stockQuote?.tradingValue ?? 0;
  const prevClose = stockQuote?.previousClose ?? 0;

  const priceChange = currentPrice - prevClose;
  const priceChangePercent =
    prevClose === 0 ? 0 : (priceChange / prevClose) * 100;
  const isUp = priceChange >= 0;

  // 시가총액 계산 (현재가 × 상장주수)
  const marketCap = currentPrice * (stockQuote?.listedShares ?? 0);

  const formatPrice = (value: number) => value.toLocaleString();

  const formatVolume = (value: number) => {
    if (value >= 100000000) {
      return (value / 100000000).toFixed(1) + "억";
    }
    if (value >= 10000) {
      return (value / 10000).toFixed(0) + "만";
    }
    return value.toLocaleString();
  };

  const formatMarketCap = (value: number) => {
    const unit = value / 100000000;
    if (unit >= 10000) {
      return (unit / 10000).toFixed(1) + "조";
    }
    return Math.floor(unit).toLocaleString() + "억";
  };

  // statusCode 배지 스타일
  const getStatusBadgeStyle = (statusCode: StockStatusCode) => {
    if (statusCode === StockStatusCode.CREDIT_AVAILABLE) {
      return "bg-accent/20 text-accent";
    }
    if (statusCode === StockStatusCode.MARGIN_100) {
      return "bg-orange-500/20 text-orange-500";
    }
    return "bg-destructive/20 text-destructive";
  };

  // 스크롤 영역의 데이터 항목 (현재가 제외)
  const dataItems = [
    { label: "전일", value: formatPrice(prevClose) },
    { label: "시가", value: formatPrice(open) },
    { label: "고가", value: formatPrice(high), isHigh: true },
    { label: "저가", value: formatPrice(low), isLow: true },
    { label: "거래량", value: formatVolume(volume) },
    { label: "거래대금", value: formatVolume(tradingValue) },
    { label: "시총", value: formatMarketCap(marketCap) },
  ];

  // 로딩 중이거나 stockInfo가 없으면 스켈레톤 표시
  if (isLoading || !stockInfo) {
    return (
      <Skeleton variant="shimmer-contrast" className="h-[63px] rounded-sm" />
    );
  }

  // 스크롤 영역 렌더링 (재사용)
  const renderScrollArea = (isMobile: boolean) => (
    <div className={cn(
      "flex-1 relative flex items-stretch min-w-0 overflow-hidden",
      isMobile ? "py-1" : "py-1.5"
    )}>
      {/* 왼쪽 화살표 */}
      {canScrollLeft && (
        <button
          onClick={scrollLeft}
          className="absolute left-0 inset-y-0 z-10 pl-1 pr-4 flex items-center bg-gradient-to-r from-background-1 via-background-1/80 to-transparent"
        >
          <ChevronLeft className="w-4 h-4 text-muted-foreground" />
        </button>
      )}

      {/* 스크롤 컨테이너 */}
      <div
        ref={isMobile ? scrollContainerMobileRef : scrollContainerDesktopRef}
        className={cn(
          "flex-1 min-w-0 flex overflow-x-auto no-scrollbar",
          isMobile ? "gap-4" : "gap-8"
        )}
      >
        {dataItems.map((item) => (
          <div key={item.label} className="flex flex-col justify-between shrink-0">
            <span className="text-[10px] text-muted-foreground">
              {item.label}
            </span>
            <span
              className={cn(
                "text-sm font-medium tabular-nums",
                item.isHigh && "text-chart-up",
                item.isLow && "text-chart-down"
              )}
            >
              {item.value}
            </span>
          </div>
        ))}
      </div>

      {/* 오른쪽 화살표 */}
      {canScrollRight && (
        <button
          onClick={scrollRight}
          className="absolute right-0 inset-y-0 z-10 pl-4 pr-1 flex items-center bg-gradient-to-l from-background-1 via-background-1/80 to-transparent"
        >
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>
      )}
    </div>
  );

  return (
    <>
      <LoginRequestModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
      <div className="bg-background-1 rounded-sm flex flex-col overflow-hidden">
        {/* 1행: 종목정보 + 현재가 + (md이상: 스크롤 + AI버튼) + (md미만: AI버튼) */}
        <div className="flex items-stretch gap-4 md:gap-8 px-4 py-2">
          {/* 관심종목 버튼 + 종목 정보 */}
          <div className="flex items-stretch gap-2 shrink-0">
            {/* 관심종목 버튼 */}
            <Button
              variant="ghost"
              onClick={handleWatchlistToggle}
              disabled={isToggling}
              className={cn(
                "transition-colors hover:opacity-80 flex-shrink-0 has-[>svg]:p-0 items-start mt-1",
                isWatchList && "text-watchlist hover:text-watchlist-hover",
                !isWatchList && "text-muted-foreground"
              )}
            >
              <Star className={cn("!w-5.5 !h-5.5", isWatchList && "fill-current")} />
            </Button>

            {/* 종목 정보 (2행) */}
            <Popover open={isSearchOpen} onOpenChange={setIsSearchOpen}>
              <PopoverTrigger asChild>
                <button className="flex flex-col justify-between py-1 gap-1 text-left hover:opacity-80 transition-opacity cursor-pointer">
                  {/* 1행: 거래소 | statusCode */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium">
                      {getExchangeName(stockInfo.exchange)}
                    </span>
                    {stockQuote?.statusCode && (
                      <span
                        className={cn(
                          "text-[10px] px-1.5 py-0.5 rounded font-medium",
                          getStatusBadgeStyle(stockQuote.statusCode)
                        )}
                      >
                        {StockStatusLabelMap[stockQuote.statusCode]}
                      </span>
                    )}
                  </div>
                  {/* 2행: 종목명 + 종목코드 + 화살표 */}
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-base">
                      {stockInfo.nameKo || stockInfo.nameEn}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {stockInfo.code}
                    </span>
                    <ChevronDown className={cn(
                      "w-4 h-4 text-muted-foreground transition-transform",
                      isSearchOpen && "rotate-180"
                    )} />
                  </div>
                </button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-72 h-80 p-0">
                <AnalysisStockSearch onSelect={handleSearchSelect} />
              </PopoverContent>
            </Popover>
          </div>

          {/* 현재가 (고정) */}
          <div className="flex flex-col justify-between shrink-0 py-1.5">
            <span className="text-[10px] text-muted-foreground">현재가</span>
            <div className="flex items-baseline gap-1">
              <span
                className={cn(
                  "text-sm font-medium tabular-nums",
                  isUp ? "text-chart-up" : "text-chart-down"
                )}
              >
                {formatPrice(currentPrice)}
              </span>
              <span
                className={cn(
                  "text-[10px] tabular-nums",
                  isUp ? "text-chart-up" : "text-chart-down"
                )}
              >
                {isUp ? "+" : ""}
                {priceChangePercent.toFixed(2)}%
              </span>
            </div>
          </div>

          {/* 스크롤 영역 - md 이상에서만 표시 */}
          <div className="hidden md:flex min-w-0 overflow-hidden">
            {renderScrollArea(false)}
          </div>

          {/* AI 분석 버튼 - 450px 미만에서 숨김, md 미만에서는 order-last로 오른쪽 끝 */}
          {onInference && (
            <div className="shrink-0 hidden min-[450px]:flex items-center order-last md:order-none">
              <AILoader
                size={58}
                isActive={isInferring}
                onClick={onInference}
                clickable
                inactiveText="분석"
              />
            </div>
          )}

          {/* 빈 공간 - md 미만에서는 AI버튼 앞에 위치 */}
          <div className="flex-1 md:order-last" />
        </div>

        {/* 2행: 스크롤 영역 - md 미만에서만 표시 */}
        <div className="flex md:hidden px-4 ml-7 pb-2 overflow-hidden">
          {renderScrollArea(true)}
        </div>

        {/* 3행: 분석 버튼 - 450px 미만에서만 표시 */}
        {onInference && (
          <div className="flex min-[450px]:hidden px-4 pb-2">
            <Button
              variant="accent-rounded"
              size="sm"
              onClick={onInference}
              disabled={isInferring}
              className="w-full"
            >
              {isInferring ? "분석 중..." : "분석 하기"}
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
