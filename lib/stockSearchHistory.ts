import { StockSearchResult } from "@/types/Stock";

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
