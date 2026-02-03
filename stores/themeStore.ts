import themeApi from "@/api/themeApi";
import { SpecialTheme, ThemeStock, ThemeStockInfo } from "@/types/Theme";
import { create } from "zustand";

interface ThemeStore {
  // 상태
  themes: SpecialTheme[];
  selectedTheme: SpecialTheme | null;
  stocks: ThemeStock[];
  stockInfo: ThemeStockInfo | null;
  isLoadingThemes: boolean;
  isLoadingStocks: boolean;
  themesError: string | null;
  stocksError: string | null;

  // 액션
  fetchThemes: (autoSelect?: boolean) => Promise<void>;
  refreshThemes: () => Promise<void>;
  selectTheme: (theme: SpecialTheme) => void;
  fetchThemeStocks: (tmcode: string) => Promise<void>;
  reset: () => void;
}

// 종목 요청 카운터 — stale response 무시용
let stocksFetchId = 0;

export const useThemeStore = create<ThemeStore>()((set, get) => ({
  themes: [],
  selectedTheme: null,
  stocks: [],
  stockInfo: null,
  isLoadingThemes: false,
  isLoadingStocks: false,
  themesError: null,
  stocksError: null,

  // 테마 로드 (autoSelect=true: 상승률 1위 자동 선택, false: 선택 안함)
  fetchThemes: async (autoSelect = true) => {
    if (get().isLoadingThemes) return;

    set({ isLoadingThemes: true, themesError: null });
    try {
      const res = await themeApi.getSpecialThemes();
      if (res.success && res.data) {
        const allThemes = [...res.data.top, ...res.data.bottom];

        if (autoSelect && allThemes.length > 0) {
          // 상승률 1위 테마 자동 선택
          const topTheme = allThemes.reduce((max, theme) =>
            theme.avgdiff > max.avgdiff ? theme : max
          );
          set({
            themes: allThemes,
            selectedTheme: topTheme,
            isLoadingThemes: false,
          });
          get().fetchThemeStocks(topTheme.tmcode);
        } else {
          // 기존 선택 테마가 있으면 새 데이터에서 참조 갱신
          const currentSelected = get().selectedTheme;
          const updatedSelected = currentSelected
            ? allThemes.find((t) => t.tmcode === currentSelected.tmcode) ?? null
            : null;
          set({
            themes: allThemes,
            selectedTheme: updatedSelected,
            isLoadingThemes: false,
          });
        }
      } else {
        set({
          themesError: "테마를 불러오는데 실패했습니다",
          isLoadingThemes: false,
        });
      }
    } catch {
      set({
        themesError: "테마를 불러오는데 실패했습니다",
        themes: [],
        isLoadingThemes: false,
      });
    }
  },

  // 폴링용 강제 갱신 (테마 목록 + 선택된 테마 종목)
  refreshThemes: async () => {
    try {
      const res = await themeApi.getSpecialThemes();
      if (res.success && res.data) {
        const allThemes = [...res.data.top, ...res.data.bottom];
        const currentSelected = get().selectedTheme;
        const updatedSelected = currentSelected
          ? allThemes.find((t) => t.tmcode === currentSelected.tmcode) ?? null
          : null;
        set({ themes: allThemes, selectedTheme: updatedSelected });

        // 유저가 테마 전환 중이면 종목 갱신 건너뛰기
        if (updatedSelected && !get().isLoadingStocks) {
          const requestId = ++stocksFetchId;
          const stockRes = await themeApi.getThemeStocks(updatedSelected.tmcode);
          // 응답 도착 시점에 여전히 최신 요청인지 + 테마가 안 바뀌었는지 확인
          if (requestId !== stocksFetchId) return;
          if (get().selectedTheme?.tmcode !== updatedSelected.tmcode) return;
          if (stockRes.success && stockRes.data) {
            set({ stocks: stockRes.data.stocks, stockInfo: stockRes.data.info });
          }
        }
      }
    } catch {
      // 폴링 실패는 조용히 무시
    }
  },

  // 테마 선택
  selectTheme: (theme: SpecialTheme) => {
    set({ selectedTheme: theme });
    get().fetchThemeStocks(theme.tmcode);
  },

  // 테마 종목 조회
  fetchThemeStocks: async (tmcode: string) => {
    const requestId = ++stocksFetchId;
    set({ isLoadingStocks: true, stocksError: null });
    try {
      const res = await themeApi.getThemeStocks(tmcode);
      // stale response 무시 (더 새로운 요청이 발생한 경우)
      if (requestId !== stocksFetchId) return;
      if (res.success && res.data) {
        set({
          stocks: res.data.stocks,
          stockInfo: res.data.info,
          isLoadingStocks: false,
        });
      } else {
        set({
          stocksError: "종목을 불러오는데 실패했습니다",
          stocks: [],
          stockInfo: null,
          isLoadingStocks: false,
        });
      }
    } catch {
      if (requestId !== stocksFetchId) return;
      set({
        stocksError: "종목을 불러오는데 실패했습니다",
        stocks: [],
        stockInfo: null,
        isLoadingStocks: false,
      });
    }
  },

  // 초기화 (로그아웃 시 등)
  reset: () => {
    set({
      themes: [],
      selectedTheme: null,
      stocks: [],
      stockInfo: null,
      isLoadingThemes: false,
      isLoadingStocks: false,
      themesError: null,
      stocksError: null,
    });
  },
}));
