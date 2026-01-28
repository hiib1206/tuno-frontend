import { create } from "zustand";

interface ChartOverlayStore {
  // 분석 결과 오버레이 표시 여부 (기준점, 지지선 밴드)
  showAnalysisOverlay: boolean;

  // 토글
  toggleAnalysisOverlay: () => void;

  // 직접 설정
  setShowAnalysisOverlay: (show: boolean) => void;
}

export const useChartOverlayStore = create<ChartOverlayStore>()((set) => ({
  showAnalysisOverlay: true,

  toggleAnalysisOverlay: () => {
    set((state) => ({ showAnalysisOverlay: !state.showAnalysisOverlay }));
  },

  setShowAnalysisOverlay: (show: boolean) => {
    set({ showAnalysisOverlay: show });
  },
}));
