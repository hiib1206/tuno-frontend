/**
 * 종목 로컬 스토리지 관리 유틸리티
 *
 * @remarks
 * 최근 검색 종목, 마지막으로 본 종목 등을 로컬 스토리지에 저장/조회한다.
 */

import { ExchangeCode, StockSearchResult } from "@/types/Stock";

const RECENT_SEARCHES_KEY = "recentStockSearches";
const MAX_RECENT_SEARCHES = 20;

/** 브라우저 스토리지 사용 가능 여부 확인 */
const canUseStorage = () =>
  typeof window !== "undefined" && typeof localStorage !== "undefined";

/** 로컬 스토리지에서 최근 검색 목록 읽기 */
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

/** 로컬 스토리지에 최근 검색 목록 저장 */
const writeStorage = (items: StockSearchResult[]) => {
  if (!canUseStorage()) return;
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(items));
};

/** 최근 검색 종목 목록을 불러온다. */
export const loadRecentSearches = () => readStorage();

/**
 * 최근 검색 종목을 저장한다.
 *
 * @param stock - 저장할 종목
 * @param recent - 기존 최근 검색 목록 (기본값: 로컬 스토리지에서 읽음)
 * @returns 업데이트된 최근 검색 목록
 */
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

/**
 * 최근 검색 종목을 삭제한다.
 *
 * @param stock - 삭제할 종목
 * @param recent - 기존 최근 검색 목록 (기본값: 로컬 스토리지에서 읽음)
 * @returns 업데이트된 최근 검색 목록
 */
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

/** 최근 검색 종목 목록을 모두 삭제한다. */
export const clearRecentSearches = () => {
  if (!canUseStorage()) return;
  localStorage.removeItem(RECENT_SEARCHES_KEY);
};

const LAST_VIEWED_STOCK_KEY = "lastViewedStock";
const SESSION_LATEST_STOCK_KEY = "sessionLatestStock";

/** 마지막으로 본 종목 정보 */
type LastViewedStock = { code: string; exchange: ExchangeCode };
/** 페이지별 마지막으로 본 종목 맵 */
type LastViewedStockMap = Record<string, LastViewedStock>;

/**
 * 마지막으로 본 종목을 저장한다.
 *
 * @remarks
 * localStorage에 페이지별로 저장하고, sessionStorage에도 세션 내 최신 종목을 저장한다.
 *
 * @param page - 페이지 식별자
 * @param stock - 저장할 종목 정보
 */
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
  sessionStorage.setItem(SESSION_LATEST_STOCK_KEY, JSON.stringify(stock));
};

/**
 * 세션 내 마지막으로 본 종목을 불러온다.
 *
 * @returns 마지막으로 본 종목 또는 null
 */
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

/**
 * 특정 페이지에서 마지막으로 본 종목을 불러온다.
 *
 * @param page - 페이지 식별자
 * @returns 마지막으로 본 종목 또는 null
 */
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
