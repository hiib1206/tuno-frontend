import { ExchangeCode, StockSearchResult } from "@/types/Stock";

const RECENT_SEARCHES_KEY = "recentStockSearches";
const MAX_RECENT_SEARCHES = 20;

const canUseStorage = () =>
  typeof window !== "undefined" && typeof localStorage !== "undefined";

const readStorage = (): StockSearchResult[] => {
  if (!canUseStorage()) return [];
  const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
  if (!saved) return [];
  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? (parsed as StockSearchResult[]) : [];
  } catch {
    return [];
  }
};

const writeStorage = (items: StockSearchResult[]) => {
  if (!canUseStorage()) return;
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(items));
};

export const loadRecentSearches = () => readStorage();

export const saveRecentSearch = (
  stock: StockSearchResult,
  recent: StockSearchResult[] = readStorage()
) => {
  let next = [
    stock,
    ...recent.filter(
      (item) => item.code !== stock.code || item.market !== stock.market
    ),
  ];
  if (next.length > MAX_RECENT_SEARCHES) {
    next = next.slice(0, MAX_RECENT_SEARCHES);
  }
  writeStorage(next);
  return next;
};

export const removeRecentSearch = (
  stock: StockSearchResult,
  recent: StockSearchResult[] = readStorage()
) => {
  const next = recent.filter(
    (item) => item.code !== stock.code || item.market !== stock.market
  );
  writeStorage(next);
  return next;
};

export const clearRecentSearches = () => {
  if (!canUseStorage()) return;
  localStorage.removeItem(RECENT_SEARCHES_KEY);
};

// 마지막으로 본 종목 (페이지별)
const LAST_VIEWED_STOCK_KEY = "lastViewedStock";
const SESSION_LATEST_STOCK_KEY = "sessionLatestStock";

type LastViewedStock = { code: string; exchange: ExchangeCode };
type LastViewedStockMap = Record<string, LastViewedStock>;

export const saveLastViewedStock = (page: string, stock: LastViewedStock) => {
  if (!canUseStorage()) return;
  const saved = localStorage.getItem(LAST_VIEWED_STOCK_KEY);
  let map: LastViewedStockMap = {};
  if (saved) {
    try {
      map = JSON.parse(saved) as LastViewedStockMap;
    } catch {
      // ignore
    }
  }
  map[page] = stock;
  localStorage.setItem(LAST_VIEWED_STOCK_KEY, JSON.stringify(map));
  // 세션 내 마지막 본 종목 (브라우저 닫으면 사라짐)
  sessionStorage.setItem(SESSION_LATEST_STOCK_KEY, JSON.stringify(stock));
};

export const loadSessionLatestStock = (): LastViewedStock | null => {
  if (!canUseStorage()) return null;
  const saved = sessionStorage.getItem(SESSION_LATEST_STOCK_KEY);
  if (!saved) return null;
  try {
    return JSON.parse(saved) as LastViewedStock;
  } catch {
    return null;
  }
};

export const loadLastViewedStock = (page: string): LastViewedStock | null => {
  if (!canUseStorage()) return null;
  const saved = localStorage.getItem(LAST_VIEWED_STOCK_KEY);
  if (!saved) return null;
  try {
    const map = JSON.parse(saved) as LastViewedStockMap;
    return map[page] ?? null;
  } catch {
    return null;
  }
};
