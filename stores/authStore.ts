import authApi from "@/api/authApi";
import userApi from "@/api/userApi";
import { broadcastAuthEvent } from "@/lib/authSync";
import { User } from "@/types/User";
import { create } from "zustand";

interface AuthStore {
  accessToken: string | null;
  user: User | null;
  isAuthLoading: boolean; // 추가
  login: (username: string, pw: string) => Promise<boolean>;
  logout: () => Promise<void>;
  me: (options?: { skipRedirect?: boolean }) => Promise<void>;
  uploadProfileImage: (file: File) => Promise<void>;
  setAccessToken: (accessToken: string | null) => void;
  setUser: (user: User | null) => void;
  setIsAuthLoading: (isLoading: boolean) => void; // 추가
}

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
