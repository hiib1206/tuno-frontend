"use client";
import {
  getAuthChannel,
  initAuthSync,
  type AuthSyncEvent,
} from "@/lib/authSync";
import { useAuthStore } from "@/stores/authStore";
import { User } from "@/types/User";
import { useEffect } from "react";

/**
 * AuthProvider 컴포넌트는 전역 인증 상태(user, accessToken 등)를 초기화 및 동기화합니다.
 *
 * - 컴포넌트가 마운트될 때, 비동기적으로 현재 사용자의 정보를 조회합니다.
 * - 인증 로딩 상태를 전역 상태로 관리합니다.
 * - 사용자 정보 요청이 실패하면 인증 관련 정보를 모두 초기화합니다.
 * - skipRedirect 옵션을 사용하여 인증 실패 시 로그인 페이지로 강제 리다이렉트하지 않습니다.
 *   비로그인 사용자의 경우 인증 정보가 없는 상태로 글로벌 상태를 유지합니다.
 * - BroadcastChannel을 통해 다른 탭의 로그인/로그아웃 상태 변경을 동기화합니다.
 *
 * UI를 렌더링하지 않고 인증 관련 사이드 이펙트와 전역 상태 관리 목적만 수행합니다.
 */
export function AuthProvider() {
  const me = useAuthStore((state) => state.me);
  const setIsAuthLoading = useAuthStore((state) => state.setIsAuthLoading);
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    const fetchUser = async () => {
      setIsAuthLoading(true);
      try {
        await me({ skipRedirect: true });
      } catch (error: any) {
        useAuthStore.getState().setUser(null);
        useAuthStore.getState().setAccessToken(null);
      } finally {
        setIsAuthLoading(false);
      }
    };

    fetchUser();

    // BroadcastChannel 초기화
    initAuthSync();

    // 다른 탭에서 온 메시지 수신
    const channel = getAuthChannel();
    if (channel) {
      const handleMessage = (event: MessageEvent<AuthSyncEvent>) => {
        const { type } = event.data;

        if (type === "LOGIN") {
          setAccessToken(event.data.accessToken);
          setUser(event.data.user ? User.fromMap(event.data.user) : null);
        } else if (type === "LOGOUT" || type === "TOKEN_INVALID") {
          setAccessToken(null);
          setUser(null);
        }
      };

      channel.addEventListener("message", handleMessage);
      return () => {
        channel.removeEventListener("message", handleMessage);
      };
    }
  }, [me, setIsAuthLoading, setAccessToken, setUser]);

  return null;
}
