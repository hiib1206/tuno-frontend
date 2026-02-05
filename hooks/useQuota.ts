import apiClient from "@/api/apiClient";
import { ResponseHeaders } from "@/api/inferenceApi";
import { useAuthStore } from "@/stores/authStore";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export interface Quota {
  role: string;
  limit: number;
  used: number;
  remaining: number;
  resetsAt: number; // Unix timestamp (초 단위)
}

export const quotaKeys = {
  all: ["quota"] as const,
};

/** 페이지 로드 시 GET /api/inference/quota로 쿼터 조회 (로그인 상태에서만) */
export function useQuota() {
  const { user } = useAuthStore();

  return useQuery<Quota>({
    queryKey: quotaKeys.all,
    queryFn: async () => {
      const res = await apiClient.get("/api/inference/quota");
      return res.data.data;
    },
    staleTime: 30_000,
    enabled: !!user,
  });
}

/** 추론 응답 헤더에서 쿼터를 읽어 캐시를 즉시 갱신하는 유틸 */
export function useUpdateQuotaFromHeaders() {
  const queryClient = useQueryClient();

  return (headers: ResponseHeaders) => {
    const limit = Number(headers["x-quota-limit"]);
    const used = Number(headers["x-quota-used"]);
    const remaining = Number(headers["x-quota-remaining"]);
    const resetsAt = Number(headers["x-quota-reset"]);

    if (!isNaN(limit) && !isNaN(used) && !isNaN(remaining) && !isNaN(resetsAt)) {
      queryClient.setQueryData<Quota>(quotaKeys.all, (old) => ({
        role: old?.role ?? "FREE",
        limit,
        used,
        remaining,
        resetsAt,
      }));
    }
  };
}
