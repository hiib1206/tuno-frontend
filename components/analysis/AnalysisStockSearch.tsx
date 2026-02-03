"use client";

import stockApi from "@/api/stockApi";
import { Input } from "@/components/ui/input";
import {
  loadRecentSearches,
  removeRecentSearch,
  saveRecentSearch,
} from "@/lib/stockLocalStorage";
import { cn } from "@/lib/utils";
import { ExchangeCode, StockSearchResult } from "@/types/Stock";
import { Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface AnalysisStockSearchProps {
  className?: string;
  onSelect: (code: string, exchange: ExchangeCode) => void;
}

export function AnalysisStockSearch({
  className,
  onSelect,
}: AnalysisStockSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<StockSearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<StockSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const showRecent = query.trim().length === 0;
  const displayList = showRecent ? recentSearches : results;

  useEffect(() => {
    setRecentSearches(loadRecentSearches());
  }, []);

  // 검색어 디바운스
  useEffect(() => {
    const trimmedQuery = query.trim();
    if (trimmedQuery.length === 0) {
      setResults([]);
      return;
    }

    // 자음만 있으면 검색 안함
    if (/[ㄱ-ㅎ]/.test(trimmedQuery)) {
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await stockApi.search({ q: trimmedQuery });
        if (response.success && response.data) {
          setResults(response.data.results);
        }
      } catch {
        setError("검색 결과를 불러오는데 실패했습니다");
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // 검색어 변경 시 인덱스 초기화
  useEffect(() => {
    setSelectedIndex(-1);
  }, [query, results, recentSearches]);

  // selectedIndex 변경 시 스크롤
  useEffect(() => {
    if (selectedIndex < 0) return;
    const item = listRef.current?.children[selectedIndex] as HTMLElement | undefined;
    if (item) {
      item.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex]);

  const handleSelect = (stock: StockSearchResult) => {
    const next = saveRecentSearch(stock, recentSearches);
    setRecentSearches(next);
    onSelect(stock.code, stock.exchange);
  };

  const handleRemoveRecent = (e: React.MouseEvent, stock: StockSearchResult) => {
    e.stopPropagation();
    e.preventDefault();
    const next = removeRecentSearch(stock, recentSearches);
    setRecentSearches(next);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing) return;

    if (displayList.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < displayList.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && displayList[selectedIndex]) {
        handleSelect(displayList[selectedIndex]);
      } else if (displayList.length > 0) {
        handleSelect(displayList[0]);
      }
    }
  };

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* 검색 입력 */}
      <div className="p-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="text"
            placeholder="종목명 또는 코드 검색..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setRecentSearches(loadRecentSearches())}
            onKeyDown={handleKeyDown}
            className="pl-8 h-8 text-xs"
          />
        </div>
      </div>

      {/* 검색 결과 */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {isLoading && !showRecent ? (
          <div className="p-4 text-center text-xs text-muted-foreground">
            검색 중...
          </div>
        ) : error ? (
          <div className="p-4 text-center text-xs text-destructive">
            {error}
          </div>
        ) : displayList.length === 0 ? (
          <div className="p-4 text-center text-xs text-muted-foreground">
            {showRecent
              ? "최근 검색 내역이 없습니다"
              : "검색 결과가 없습니다"}
          </div>
        ) : (
          <div>
            {showRecent && (
              <div className="px-3 pt-2 text-[10px] text-muted-foreground">
                최근 검색
              </div>
            )}
            <ul ref={listRef} onMouseLeave={() => setSelectedIndex(-1)}>
              {displayList.map((stock, index) => (
              <li key={`${stock.market}-${stock.code}`} className="group">
                <div
                  onMouseDown={() => handleSelect(stock)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-1.5 transition-colors text-left cursor-pointer",
                    index === selectedIndex
                      ? "bg-accent/10"
                      : "hover:bg-accent/10"
                  )}
                >
                  {/* 종목명 */}
                  <span className="font-medium text-xs truncate min-w-0">
                    {stock.nameKo}
                  </span>
                  {/* 종목코드 + 국내/해외 + 삭제 */}
                  <div className="flex items-center gap-2 ml-2 shrink-0">
                    <span className="text-xs text-muted-foreground">
                      {stock.code}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                      {stock.market === "KR" ? "국내" : "해외"}
                    </span>
                    {showRecent && (
                      <div className="max-w-0 overflow-hidden group-hover:max-w-[24px] transition-all duration-150">
                        <button
                          onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                          onClick={(e) => handleRemoveRecent(e, stock)}
                          className="p-0.5 rounded text-muted-foreground hover:text-foreground hover:scale-110 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
