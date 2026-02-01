"use client";

import { ErrorState } from "@/components/feedback";
import { ThemeStockListSkeleton } from "@/components/market/ThemeStockListSkeleton";
import { useThemeStore } from "@/stores/themeStore";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export function ThemeStockList() {
  const { stocks, stockInfo, isLoadingStocks, stocksError } = useThemeStore();

  const [hasScroll, setHasScroll] = useState(false);
  const [flashMap, setFlashMap] = useState<Record<string, "up" | "down">>({});
  const prevStocksRef = useRef<Map<string, number>>(new Map());
  const listRef = useRef<HTMLDivElement>(null);

  // 가격 변동 감지 → flash 효과
  useEffect(() => {
    const prev = prevStocksRef.current;
    const newFlash: Record<string, "up" | "down"> = {};

    for (const stock of stocks) {
      const prevPrice = prev.get(stock.shcode);
      if (prevPrice !== undefined && prevPrice !== stock.price) {
        newFlash[stock.shcode] = stock.price > prevPrice ? "up" : "down";
      }
    }

    // 이전 데이터 갱신
    const newMap = new Map<string, number>();
    for (const stock of stocks) {
      newMap.set(stock.shcode, stock.price);
    }
    prevStocksRef.current = newMap;

    if (Object.keys(newFlash).length > 0) {
      setFlashMap(newFlash);
      const timer = setTimeout(() => setFlashMap({}), 800);
      return () => clearTimeout(timer);
    }
  }, [stocks]);

  // 스크롤 여부 체크
  useEffect(() => {
    const el = listRef.current;
    if (el) {
      setHasScroll(el.scrollHeight > el.clientHeight);
    }
  }, [stocks]);

  // 등락 부호에 따른 색상
  const getSignColor = (sign: string) => {
    if (sign === "2" || sign === "1") return "text-chart-up"; // 상승
    if (sign === "4" || sign === "5") return "text-chart-down"; // 하락
    return "text-foreground-2"; // 보합
  };

  // 숫자 포맷팅
  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  // 등락률 표시
  const formatDiff = (diff: number | string, sign: string) => {
    const numDiff = typeof diff === "string" ? parseFloat(diff) : diff;
    const prefix = sign === "2" || sign === "1" ? "+" : "";
    return `${prefix}${numDiff.toFixed(2)}%`;
  };

  if (isLoadingStocks) {
    return <ThemeStockListSkeleton />;
  }

  return (
    <div className="h-full flex flex-col bg-background-1 rounded-md overflow-hidden">
      {stocksError ? (
        <div className="flex-1 flex items-center justify-center">
          <ErrorState message={stocksError} />
        </div>
      ) : (
        <>
          {/* 헤더 - 테마 정보 */}
          {stockInfo && (
            <div className="pt-4 px-4 pb-1">
              <h2 className="text-lg mb-4 font-bold text-foreground">{stockInfo.tmname}</h2>
              <div className="flex gap-2 mt-1 text-sm text-foreground-2 justify-end">
                <span>종목 {stockInfo.tmcnt}개</span>
                <span className="text-muted-foreground">·</span>
                <div>
                  <span className="text-chart-up">상승 {stockInfo.upcnt}개</span>
                  <span>({stockInfo.uprate.toFixed(1)}%)</span>
                </div>
              </div>
            </div>
          )}

          {/* 테이블 헤더 - 고정 */}
          <div className={`flex gap-3 text-sm text-foreground-2 border-y border-border-2 p-3 ${hasScroll ? 'pr-8' : ''}`}>
            <span className="flex-1 font-medium">종목명</span>
            <span className="w-20 text-right font-medium">현재가</span>
            <span className="w-16 text-right font-medium">등락률</span>
          </div>

          {/* 종목 리스트 - 스크롤 */}
          <div ref={listRef} className="flex-1 overflow-y-auto text-sm">
            {stocks.map((stock) => (
              <Link
                key={stock.shcode}
                href={{
                  pathname: `/market/stock/${stock.shcode}`,
                  query: { market: "KR", exchange: stock.exchange ?? "KP" },
                }}
                className={`flex gap-3 p-3 border-b border-border-2 hover:bg-background-2 cursor-pointer transition-colors ${flashMap[stock.shcode] === "up" ? "flash-up" : flashMap[stock.shcode] === "down" ? "flash-down" : ""}`}
              >
                <span className="flex-1 font-medium text-foreground">
                  {stock.hname}
                </span>
                <span className={`w-20 text-right ${getSignColor(stock.sign)}`}>
                  {formatNumber(stock.price)}
                </span>
                <span className={`w-16 text-right ${getSignColor(stock.sign)}`}>
                  {formatDiff(stock.diff, stock.sign)}
                </span>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
