"use client";

import { redirectToLogin } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * 페이지가 로그인된 사용자만 접근할 수 있도록 보호하는 훅
 * AuthProvider가 이미 인증 상태를 확인했으므로, 그 결과를 재사용합니다.
 * 인증되지 않은 사용자는 로그인 페이지로 리다이렉트됩니다.
 */
export function useRequireAuth() {
  const router = useRouter();
  const { user, isAuthLoading } = useAuthStore();

  useEffect(() => {
    // AuthProvider가 아직 로딩 중이면 기다림
    if (isAuthLoading) {
      return;
    }

    // 로딩이 완료되었는데 user가 없으면 비로그인 사용자
    if (!user) {
      redirectToLogin(router);
    }
  }, [user, isAuthLoading, router]);
}
