import authApi from "@/api/authApi";
import userApi from "@/api/userApi";
import { broadcastAuthEvent } from "@/lib/authSync";
import { User } from "@/types/User";
import { create } from "zustand";

/**
 * 인증 상태 스토어 인터페이스
 *
 * @remarks
 * 로그인/로그아웃, 사용자 정보 관리, 프로필 이미지 업로드를 처리한다.
 */
interface AuthStore {
  /** 액세스 토큰 */
  accessToken: string | null;
  /** 사용자 정보 */
  user: User | null;
  /** 인증 상태 로딩 중 여부 */
  isAuthLoading: boolean;
  /** 로그인을 수행한다. */
  login: (username: string, pw: string) => Promise<boolean>;
  /** 로그아웃을 수행한다. */
  logout: () => Promise<void>;
  /** 내 정보를 조회한다. */
  me: (options?: { skipRedirect?: boolean }) => Promise<void>;
  /** 프로필 이미지를 업로드한다. */
  uploadProfileImage: (file: File) => Promise<void>;
  /** 액세스 토큰을 설정한다. */
  setAccessToken: (accessToken: string | null) => void;
  /** 사용자 정보를 설정한다. */
  setUser: (user: User | null) => void;
  /** 인증 로딩 상태를 설정한다. */
  setIsAuthLoading: (isLoading: boolean) => void;
}

/** 인증 상태 스토어 */
export const useAuthStore = create<AuthStore>()((set) => ({
  accessToken: null,
  user: null,
  isAuthLoading: true,
  login: async (username: string, pw: string) => {
    const response = await authApi.login(username, pw);
    if (response.success) {
      const accessToken = response.data.accessToken;
      const user = User.fromMap(response.data.user);
      set({
        accessToken,
        user,
      });
      // 다른 탭에 로그인 알림
      broadcastAuthEvent({
        type: "LOGIN",
        accessToken,
        user: user.toMap(),
      });
      return true;
    }
    return false;
  },
  logout: async () => {
    await authApi.logout();
    set({
      accessToken: null,
      user: null,
    });
    // 다른 탭에 로그아웃 알림
    broadcastAuthEvent({ type: "LOGOUT" });
  },
  me: async (options?: { skipRedirect?: boolean }) => {
    const response = await userApi.me(options);
    if (response.success) {
      const user = User.fromMap(response.data.user);
      const accessToken = useAuthStore.getState().accessToken;
      set({ user });
      // 다른 탭에 user 정보 동기화 (OAuth 로그인 후 동기화를 위해)
      // accessToken이 없을 수도 있지만 (OAuth 직후), user 정보는 동기화
      broadcastAuthEvent({
        type: "LOGIN",
        accessToken: accessToken || "",
        user: user.toMap(),
      });
    }
  },
  uploadProfileImage: async (file: File) => {
    const response = await userApi.uploadProfileImage(file);
    if (response.success) {
      set({ user: User.fromMap(response.data.user) });
    }
  },
  setAccessToken: (accessToken) => set({ accessToken }),
  setUser: (user) => set({ user }),
  setIsAuthLoading: (isLoading) => set({ isAuthLoading: isLoading }),
}));
