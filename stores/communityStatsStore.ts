import userApi, { CommunityStatsResponse } from "@/api/userApi";
import { create } from "zustand";

/**
 * 커뮤니티 통계 스토어 인터페이스
 *
 * @remarks
 * 사용자의 커뮤니티 활동 통계(게시글, 댓글, 좋아요 수)를 관리한다.
 */
interface CommunityStatsStore {
  /** 커뮤니티 통계 데이터 */
  stats: CommunityStatsResponse["data"]["stats"] | null;
  /** 로딩 중 여부 */
  isLoading: boolean;
  /** 통계를 조회한다. */
  fetchStats: () => Promise<void>;
  /** 통계를 초기화한다. */
  clearStats: () => void;
}

/** 커뮤니티 통계 스토어 */
export const useCommunityStatsStore = create<CommunityStatsStore>()((set) => ({
  stats: null,
  isLoading: false,
  fetchStats: async () => {
    try {
      set({ isLoading: true });
      const response = await userApi.getCommunityStats();
      if (response.success && response.data.stats) {
        set({ stats: response.data.stats });
      }
    } catch (error: any) {
      console.error("커뮤니티 통계 조회 실패:", error.response?.data?.message);
    } finally {
      set({ isLoading: false });
    }
  },
  clearStats: () => set({ stats: null }),
}));

