import userApi, { CommunityStatsResponse } from "@/api/userApi";
import { create } from "zustand";

interface CommunityStatsStore {
  stats: CommunityStatsResponse["data"]["stats"] | null;
  isLoading: boolean;
  fetchStats: () => Promise<void>;
  clearStats: () => void;
}

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

