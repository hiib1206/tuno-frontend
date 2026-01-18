import stockApi from "@/api/stockApi";
import { ExchangeCode, WatchlistItem } from "@/types/Stock";
import { create } from "zustand";

interface WatchlistStore {
  items: WatchlistItem[];
  isLoading: boolean;
  error: string | null;
  
  // 관심종목 목록 조회
  fetchWatchlist: () => Promise<void>;
  
  // 관심종목 토글 (추가/제거)
  toggleWatchlist: (code: string, exchange: ExchangeCode) => Promise<boolean>;
  
  // 관심종목 순서 변경 (드래그 앤 드롭)
  updateOrder: (newItems: WatchlistItem[]) => void;
  updateOrderWithApi: (newItems: WatchlistItem[]) => Promise<boolean>;
  
  // 전체 삭제
  removeAll: () => Promise<boolean>;
  
  // 특정 종목이 관심종목인지 확인
  isInWatchlist: (code: string, exchange: ExchangeCode) => boolean;
  
  // 초기화 (로그아웃 시)
  reset: () => void;
}

export const useWatchlistStore = create<WatchlistStore>()((set, get) => ({
  items: [],
  isLoading: false,
  error: null,

  fetchWatchlist: async () => {
    set({ isLoading: true, error: null });
    try {
      const result = await stockApi.getWatchlist();
      if (result.success && result.data) {
        set({ items: result.data.items, isLoading: false });
      } else {
        set({ error: "관심종목을 불러오는데 실패했습니다.", isLoading: false });
      }
    } catch (err) {
      set({ error: "관심종목을 불러오는데 실패했습니다.", isLoading: false });
    }
  },

  toggleWatchlist: async (code: string, exchange: ExchangeCode) => {
    const { items } = get();
    const existingItem = items.find(
      (item) => item.code === code && item.exchange === exchange
    );

    try {
      const result = await stockApi.toggleWatchlist(code, exchange);

      if (result.success && result.data) {
        if (result.data.isInWatchlist) {
          // 추가된 경우: 목록을 다시 불러와서 새 아이템 정보 가져오기
          await get().fetchWatchlist();
        } else {
          // 제거된 경우: 로컬에서 바로 제거
          set({
            items: items.filter(
              (item) => !(item.code === code && item.exchange === exchange)
            ),
          });
        }
        return result.data.isInWatchlist;
      }
      return !!existingItem;
    } catch (err) {
      console.error("Failed to toggle watchlist:", err);
      return !!existingItem;
    }
  },

  updateOrder: (newItems: WatchlistItem[]) => {
    set({ items: newItems });
  },

  updateOrderWithApi: async (newItems: WatchlistItem[]) => {
    const previousItems = get().items;
    
    // 낙관적 업데이트
    set({ items: newItems });

    try {
      const order = newItems.map((item) => ({
        exchange: item.exchange,
        code: item.code,
      }));

      const result = await stockApi.updateWatchlistOrder(order);

      if (!result.success) {
        // 실패 시 원래 상태로 복구
        set({ items: previousItems });
        return false;
      }
      return true;
    } catch (err) {
      // 실패 시 원래 상태로 복구
      set({ items: previousItems });
      return false;
    }
  },

  removeAll: async () => {
    const previousItems = get().items;

    if (previousItems.length === 0) return true;

    // 낙관적 업데이트
    set({ items: [] });

    try {
      const result = await stockApi.deleteWatchlist();

      if (!result.success) {
        // 실패 시 원래 상태로 복구
        set({ items: previousItems });
        return false;
      }
      return true;
    } catch {
      // 실패 시 원래 상태로 복구
      set({ items: previousItems });
      return false;
    }
  },

  isInWatchlist: (code: string, exchange: ExchangeCode) => {
    return get().items.some(
      (item) => item.code === code && item.exchange === exchange
    );
  },

  reset: () => {
    set({ items: [], isLoading: false, error: null });
  },
}));
