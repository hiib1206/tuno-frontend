import apiClient from "@/api/apiClient";
import { ResponseHeaders } from "@/api/inferenceApi";
import { useAuthStore } from "@/stores/authStore";
import { useQuery, useQueryClient } from "@tanstack/react-query";

/** 쿼터 정보 */
export interface Quota {
  /** 사용자 역할 */
  role: string;
  /** 쿼터 한도 */
  limit: number;
  /** 사용량 */
  used: number;
  /** 잔여량 */
  remaining: number;
  /** 리셋 시간 (Unix timestamp, 초 단위) */
  resetsAt: number;
}

/** 쿼터 쿼리 키 */
export const quotaKeys = {
  all: ["quota"] as const,
};

/**
 * 추론 API 쿼터를 조회한다.
 *
 * @remarks
 * 로그인 상태에서만 활성화되며, 30초 동안 캐시된다.
 *
 * @returns 쿼터 쿼리 결과
 */
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

/**
 * 추론 응답 헤더에서 쿼터를 읽어 캐시를 갱신하는 훅.
 *
 * @returns 헤더에서 쿼터를 업데이트하는 함수
 */
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
