"use client";

import stockApi from "@/api/stockApi";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ExchangeCode, StockSearchResult } from "@/types/Stock";
import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const MAX_RECENT_SEARCHES = 10;
const RECENT_SEARCHES_KEY = "recentStockSearches";

export default function StockSearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<StockSearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<StockSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();
  // 리스트에서 키보드 이동시 스크롤 되게 하기 위함.
  const listRef = useRef<HTMLUListElement | null>(null);

  // 렌더링할 리스트 결정
  const showRecent = query.trim().length === 0;
  const displayList = showRecent ? recentSearches : results;

  // 초기 로드 시 로컬 스토리지에서 최근 검색어 불러오기
  useEffect(() => {
    const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (error) {
        console.error("Failed to parse recent searches:", error);
      }
    }
  }, []);

  // 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // 검색어 변경 시 인덱스 초기화
  useEffect(() => {
    setSelectedIndex(-1);
  }, [query, results, isOpen]);

  // 검색어 디바운스 처리
  useEffect(() => {
    const timer = setTimeout(async () => {
      const trimmedQuery = query.trim();
      if (trimmedQuery.length === 0) {
        setResults([]);
        // 검색어가 없으면 최근 검색어를 보여주기 위해 isOpen은 유지하거나 true로 설정
        // 하지만 여기서는 검색어가 지워졌을 때의 동작이므로,
        // 사용자가 명시적으로 포커스 중이라면 열려있어야 함.
        return;
      }

      // 검색어에 자음(ㄱ-ㅎ)이 하나라도 포함되어 있으면 API 요청을 보내지 않고 기존 결과 유지
      if (/[ㄱ-ㅎ]/.test(trimmedQuery)) {
        return;
      }

      setIsLoading(true);
      try {
        const response = await stockApi.search({ q: query, limit: 20 });
        if (response.success && response.data) {
          setResults(response.data.results);
          setIsOpen(true);
        }
      } catch (error) {
        console.error("Failed to search stocks:", error);
      } finally {
        setIsLoading(false);
      }
    }, 500); // 300ms debounce

    return () => clearTimeout(timer);
  }, [query]);

  // selectedIndex 변경 시 스크롤 보정(useEffect)
  useEffect(() => {
    if (selectedIndex < 0) return;
    const list = listRef.current;
    const item = list?.children[selectedIndex] as HTMLElement | undefined;
    if (item) {
      item.scrollIntoView({ block: "nearest", inline: "nearest" });
    }
  }, [selectedIndex]);

  const saveRecentSearch = (stock: StockSearchResult) => {
    let newRecent = [
      stock,
      ...recentSearches.filter(
        (item) => item.code !== stock.code || item.market !== stock.market
      ),
    ];
    if (newRecent.length > MAX_RECENT_SEARCHES) {
      newRecent = newRecent.slice(0, MAX_RECENT_SEARCHES);
    }
    setRecentSearches(newRecent);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(newRecent));
  };

  const removeRecentSearch = (
    e: React.MouseEvent,
    stock: StockSearchResult
  ) => {
    e.stopPropagation(); // 부모의 onClick(선택) 이벤트 방지
    const newRecent = recentSearches.filter(
      (item) => item.code !== stock.code || item.market !== stock.market
    );
    setRecentSearches(newRecent);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(newRecent));
  };

  const handleSelect = (stock: StockSearchResult) => {
    saveRecentSearch(stock);
    router.push(
      `/market/stock/${stock.code}?market=${stock.market}&exchange=${stock.exchange}`
    );
    setIsOpen(false);
    setQuery(""); // 선택 후 검색어 초기화
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing) return;

    if (displayList.length === 0) {
      return;
    }

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
      } else if (results.length > 0) {
        handleSelect(results[0]);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
      e.currentTarget.blur();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (results.length > 0) {
      handleSelect(results[0]);
    }
  };

  const getExchangeName = (exchange: ExchangeCode) => {
    const map: Record<string, string> = {
      KP: "KOSPI",
      KQ: "KOSDAQ",
      NAS: "NASDAQ",
      NYS: "NYSE",
      AMS: "AMEX",
    };
    return map[exchange] ?? exchange;
  };

  return (
    <div
      ref={searchRef}
      className="relative w-full flex-1"
      onClick={(e) => {
        // 부모 영역 클릭/터치 시 입력창에 포커스
        if (inputRef.current && e.target !== inputRef.current) {
          inputRef.current.focus();
          // 포커스 시 항상 열기 (최근 검색어 또는 기존 결과)
          setIsOpen(true);
        }
      }}
    >
      <form onSubmit={handleSubmit} className="relative">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-accent-text z-10" />
        <Input
          ref={inputRef}
          type="search"
          placeholder="종목 검색..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => {
            setIsOpen(true);
          }}
          // onBlur는 외부 클릭 처리(useEffect)로 대체하여 링크 클릭 등을 허용
          onKeyDown={handleKeyDown}
          className={cn(
            "h-9 w-full rounded-full border-accent bg-background-1 focus:ring-0 pl-12",
            isOpen ? "rounded-b-none rounded-t-md" : "rounded-full"
          )}
        />
      </form>

      {isOpen && (
        <div className="absolute left-0 right-0 bg-background-1 border-r border-l border-b border-border rounded-b-lg rounded-t-none shadow-lg z-50 overflow-hidden">
          {/* 로딩 상태 (검색 중일 때만) */}
          {!showRecent && isLoading && results.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground ">
              검색 중...
            </div>
          ) : displayList.length > 0 ? (
            <>
              <ul
                ref={listRef}
                className="max-h-84.5 overflow-y-auto bg-background-1"
                onMouseLeave={() => setSelectedIndex(-1)}
              >
                {displayList.map((stock, index) => (
                  <li
                    key={`${stock.market}-${stock.code}`}
                    onMouseDown={() => handleSelect(stock)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={cn(
                      "px-4 py-2 group cursor-pointer transition-colors border-b last:border-0 border-border/50",
                      index === selectedIndex
                        ? "bg-accent/10"
                        : "hover:bg-accent/10",
                      index === 0 ? "pt-3" : ""
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 flex items-center justify-between">
                        <div className="flex flex-col space-y-1">
                          <span className="font-medium text-sm text-foreground">
                            {stock.nameKo}
                          </span>

                          <div className="text-xs text-muted-foreground">
                            {stock.code} | {getExchangeName(stock.exchange)}
                          </div>
                        </div>

                        <div className="flex items-center">
                          <span className="self-center text-xs px-3 py-0.5 rounded-full bg-accent/10 text-accent">
                            {stock.market === "KR" ? "국내" : "해외"}
                          </span>
                        </div>
                      </div>
                      {showRecent && (
                        <button
                          onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                          onClick={(e) => removeRecentSearch(e, stock)}
                          className="py-3 pl-3 rounded-full text-muted-foreground hover:text-foreground hover:scale-120 cursor-pointer"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <div className="p-4 text-center text-sm text-muted-foreground">
              {showRecent
                ? "최근 검색 내역이 없습니다."
                : "검색 결과가 없습니다."}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
