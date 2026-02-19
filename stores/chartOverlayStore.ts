import { create } from "zustand";

/**
 * 차트 오버레이 스토어 인터페이스
 *
 * @remarks
 * AI 분석 결과 오버레이(기준점, 지지선 밴드) 표시 상태를 관리한다.
 */
interface ChartOverlayStore {
  /** 분석 결과 오버레이 표시 여부 */
  showAnalysisOverlay: boolean;
  /** 오버레이 표시를 토글한다. */
  toggleAnalysisOverlay: () => void;
  /** 오버레이 표시 여부를 직접 설정한다. */
  setShowAnalysisOverlay: (show: boolean) => void;
}

/** 차트 오버레이 스토어 */
export const useChartOverlayStore = create<ChartOverlayStore>()((set) => ({
  showAnalysisOverlay: true,

  toggleAnalysisOverlay: () => {
    set((state) => ({ showAnalysisOverlay: !state.showAnalysisOverlay }));
  },

  setShowAnalysisOverlay: (show: boolean) => {
    set({ showAnalysisOverlay: show });
  },
}));
