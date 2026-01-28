"use client";

import themeApi from "@/api/themeApi";
import { cn } from "@/lib/utils";
import { ExchangeCode } from "@/types/Stock";
import { SpecialTheme, ThemeStock } from "@/types/Theme";
import { ChevronLeft, ChevronRight, Layers } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Skeleton } from "../ui/Skeleton";

interface AnalysisThemeStocksProps {
  className?: string;
  onSelect: (code: string, exchange: ExchangeCode) => void;
}

export function AnalysisThemeStocks({
  className,
  onSelect,
}: AnalysisThemeStocksProps) {
  const [themes, setThemes] = useState<SpecialTheme[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<SpecialTheme | null>(null);
  const [stocks, setStocks] = useState<ThemeStock[]>([]);
  const [isLoadingThemes, setIsLoadingThemes] = useState(true);
  const [isLoadingStocks, setIsLoadingStocks] = useState(false);
  const [themesError, setThemesError] = useState<string | null>(null);
  const [stocksError, setStocksError] = useState<string | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // 스크롤 위치 체크
  const checkScrollPosition = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    setCanScrollLeft(container.scrollLeft > 0);
    setCanScrollRight(
      container.scrollLeft < container.scrollWidth - container.clientWidth - 1
    );
  }, []);

  // 스크롤 이동
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -120, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 120, behavior: "smooth" });
    }
  };

  // 스크롤 이벤트 리스너
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    checkScrollPosition();
    container.addEventListener("scroll", checkScrollPosition);
    window.addEventListener("resize", checkScrollPosition);

    return () => {
      container.removeEventListener("scroll", checkScrollPosition);
      window.removeEventListener("resize", checkScrollPosition);
    };
  }, [checkScrollPosition, themes]);

  // 테마 종목 조회
  const fetchThemeStocks = useCallback(async (tmcode: string) => {
    setIsLoadingStocks(true);
    setStocksError(null);
    try {
      const res = await themeApi.getThemeStocks(tmcode);
      if (res.success && res.data) {
        setStocks(res.data.stocks);
      }
    } catch {
      setStocksError("종목을 불러오는데 실패했습니다");
      setStocks([]);
    } finally {
      setIsLoadingStocks(false);
    }
  }, []);

  // 테마 목록 조회 + 상승률 1위 자동 선택
  const fetchThemes = useCallback(async () => {
    setIsLoadingThemes(true);
    setThemesError(null);
    try {
      const res = await themeApi.getSpecialThemes();
      if (res.success && res.data) {
        const allThemes = [...res.data.top, ...res.data.bottom];
        setThemes(allThemes);

        // 상승률 1위 테마 자동 선택
        if (allThemes.length > 0) {
          const topTheme = allThemes.reduce((max, theme) =>
            theme.avgdiff > max.avgdiff ? theme : max
          );
          setSelectedTheme(topTheme);
          fetchThemeStocks(topTheme.tmcode);
        }
      }
    } catch {
      setThemesError("테마를 불러오는데 실패했습니다");
      setThemes([]);
    } finally {
      setIsLoadingThemes(false);
    }
  }, [fetchThemeStocks]);

  useEffect(() => {
    fetchThemes();
  }, [fetchThemes]);

  // 테마 선택 시 종목 조회
  const handleSelectTheme = (theme: SpecialTheme) => {
    setSelectedTheme(theme);
    fetchThemeStocks(theme.tmcode);
  };

  if (isLoadingThemes) {
    return (
      <div className={cn("flex flex-col h-full", className)}>
        <Skeleton variant="shimmer-contrast" className="flex-1 rounded-b-sm md:rounded-sm" />
      </div>
    );
  }

  if (themesError) {
    return (
      <div className={cn("flex flex-col h-full items-center justify-center", className)}>
        <p className="text-xs text-destructive">{themesError}</p>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* 헤더 */}
      <div className="px-4 pt-2">
        <div className="flex items-center gap-2 min-w-0">
          <Layers className="w-3 h-3 text-muted-foreground shrink-0" />
          <span className="font-semibold text-sm truncate min-w-0">
            {selectedTheme ? selectedTheme.tmname : "테마 선택"}
          </span>
          {selectedTheme && (
            <span
              className={cn(
                "text-xs font-medium shrink-0",
                selectedTheme.avgdiff >= 0 ? "text-chart-up" : "text-chart-down"
              )}
            >
              {selectedTheme.avgdiff >= 0 ? "+" : ""}
              {selectedTheme.avgdiff.toFixed(2)}%
            </span>
          )}
        </div>
      </div>

      {/* 테마 가로 스크롤 리스트 */}
      {!isLoadingThemes && themes.length > 0 && (
        <div className={cn("relative flex items-center", isLoadingStocks ? "" : "border-b border-border-2")}>
          {/* 왼쪽 화살표 + 블러 */}
          {canScrollLeft && (
            <button
              onClick={scrollLeft}
              className="absolute left-0 z-10 h-full pl-1 pr-4 flex items-center bg-gradient-to-r from-background-1 via-background-1/80 to-transparent"
            >
              <ChevronLeft className="w-4 h-4 text-muted-foreground" />
            </button>
          )}

          {/* 스크롤 컨테이너 */}
          <div
            ref={scrollContainerRef}
            className="flex-1 flex overflow-x-auto no-scrollbar px-6 py-1.5"
          >
            {themes.map((theme) => (
              <button
                key={theme.tmcode}
                onClick={() => handleSelectTheme(theme)}
                className={cn(
                  "shrink-0 px-2 py-1 text-xs rounded transition-colors select-none",
                  selectedTheme?.tmcode === theme.tmcode
                    ? "font-medium"
                    : "opacity-60 hover:opacity-100 hover:bg-muted",
                  theme.avgdiff >= 0 ? "text-chart-up" : "text-chart-down"
                )}
              >
                {theme.tmname}
              </button>
            ))}
          </div>

          {/* 오른쪽 화살표 + 블러 */}
          {canScrollRight && (
            <button
              onClick={scrollRight}
              className="absolute right-0 z-10 h-full pl-4 pr-1 flex items-center bg-gradient-to-l from-background-1 via-background-1/80 to-transparent"
            >
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>
      )}

      {/* 종목 리스트 */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {!selectedTheme ? (
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
            <p className="text-xs text-muted-foreground">테마를 선택하세요</p>
          </div>
        ) : isLoadingStocks ? (
          <Skeleton variant="shimmer-contrast" className="h-full" />
        ) : stocksError ? (
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
            <p className="text-xs text-destructive">{stocksError}</p>
          </div>
        ) : stocks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
            <p className="text-xs text-muted-foreground">종목이 없습니다</p>
          </div>
        ) : (
          <ul>
            {stocks.map((stock) => (
              <li key={stock.shcode}>
                <button
                  onClick={() => onSelect(stock.shcode, (stock.exchange as ExchangeCode) || "KP")}
                  className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-accent/10 transition-colors text-left cursor-pointer"
                >
                  <span className="font-medium text-xs text-foreground truncate min-w-0">
                    {stock.hname}
                  </span>
                  <div className="flex items-center gap-2 ml-2 shrink-0">
                    <span className="text-xs font-medium">
                      {Number(stock.price).toLocaleString()}
                    </span>
                    <span
                      className={cn(
                        "text-xs w-14 text-right",
                        Number(stock.diff) >= 0 ? "text-chart-up" : "text-chart-down"
                      )}
                    >
                      {Number(stock.diff) >= 0 ? "+" : ""}
                      {Number(stock.diff).toFixed(2)}%
                    </span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
