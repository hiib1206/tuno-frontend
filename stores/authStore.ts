import authApi from "@/api/authApi";
import userApi from "@/api/userApi";
import { User } from "@/types/User";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthStore {
  accessToken: string | null;
  user: User | null;
  login: (username: string, pw: string) => Promise<boolean>;
  logout: () => Promise<void>;
  me: (options?: { skipRedirect?: boolean }) => Promise<void>;
  uploadProfileImage: (file: File) => Promise<void>;
  setAccessToken: (accessToken: string | null) => void;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      accessToken: null,
      user: null,
      login: async (username: string, pw: string) => {
        const response = await authApi.login(username, pw);
        if (response.success) {
          set({
            accessToken: response.data.accessToken,
            user: User.fromMap(response.data.user),
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
        // persist 스토리지에서 완전히 제거
        useAuthStore.persist.clearStorage();
      },
      me: async (options?: { skipRedirect?: boolean }) => {
        const response = await authApi.me(options);
        if (response.success) {
          set({ user: User.fromMap(response.data.user) });
        }
      },
      uploadProfileImage: async (file: File) => {
        const response = await userApi.uploadProfileImage(file);
        if (response.success) {
          console.log(response.data.user);
          set({ user: User.fromMap(response.data.user) });
        }
      },
      setAccessToken: (accessToken) => set({ accessToken }),
      setUser: (user) => set({ user }),
    }),
    {
      name: "auth-storage", // localStorage 키 이름
      partialize: (state) => ({
        accessToken: state.accessToken,
        user: state.user,
      }), // accessToken과 user 모두 persist
    }
  )
);
