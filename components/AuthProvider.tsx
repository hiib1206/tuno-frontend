"use client";
import { useAuthStore } from "@/stores/authStore";
import { useEffect } from "react";

export function AuthProvider() {
  //get으로 최신 상태 직접 가져오기 (hydration 완료 후 값)
  const { user } = useAuthStore.getState();
  const me = useAuthStore((state) => state.me);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // user가 있으면 어쨋든 확인
        if (user) {
          await me({ skipRedirect: true });
        }
      } catch (error: any) {
        useAuthStore.getState().setUser(null);
        useAuthStore.getState().setAccessToken(null);
        // persist 스토리지에서 완전히 제거
        useAuthStore.persist.clearStorage();
      }
    };

    fetchUser();
  }, []);

  return null;
}
