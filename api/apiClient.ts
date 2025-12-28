import { broadcastAuthEvent } from "@/lib/authSync";
import { getOrCreateDeviceId, redirectToLogin } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import axios from "axios";

const apiClient = axios.create({
  baseURL: process.env?.NEXT_PUBLIC_API_URL || "http://59.25.224.32:4000",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

//요청 인터셉터
apiClient.interceptors.request.use(
  (config) => {
    const accessToken = useAuthStore.getState().accessToken;
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    // device ID 가져오기 또는 생성
    const deviceId = getOrCreateDeviceId();
    if (deviceId) {
      config.headers["x-device-id"] = deviceId;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 리프레시 토큰 갱신 진행 상태
let isRefreshing = false;
// 토큰 갱신 대기열
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}> = [];

// 토큰 갱신 대기열 처리
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// 응답 인터셉터
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // 401 에러이고, 이미 재시도한 요청이 아닌 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // 이미 refresh 요청이 진행 중이면 대기열에 추가
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // refresh 요청 (쿠키에 refresh token이 있으므로 별도 헤더 불필요)
        // refresh 요청은 인터셉터를 거치되, _retry 플래그로 순환 방지
        const refreshResponse = await apiClient.post(
          "/api/auth/refresh",
          {},
          {
            withCredentials: true,
            _retry: true, // 응답 인터셉터에서 무시하여 순환 방지
          }
        );

        const newAccessToken = refreshResponse.data.data.accessToken;

        // 새로운 access token 저장
        useAuthStore.getState().setAccessToken(newAccessToken);

        // 다른 탭에 새 accessToken 알림 (user 정보도 함께 동기화)
        const user = useAuthStore.getState().user;
        if (user) {
          broadcastAuthEvent({
            type: "LOGIN",
            accessToken: newAccessToken,
            user: user.toMap(),
          });
        }

        // 대기 중인 요청들 처리
        processQueue(null, newAccessToken);

        // 원래 요청 재시도
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError: any) {
        // refresh 요청도 401을 받은 경우 대기 중인 요청들 전부 실패 처리
        processQueue(refreshError, null);
        // 토큰 초기화 및 사용자 정보 초기화
        useAuthStore.getState().setAccessToken(null);
        useAuthStore.getState().setUser(null);

        // 다른 탭에 토큰 무효화 알림
        broadcastAuthEvent({ type: "TOKEN_INVALID" });

        // 로그인 페이지로 리다이렉트 (브라우저 환경에서만, skipRedirect 플래그가 없을 때만)
        if (typeof window !== "undefined" && !originalRequest.skipRedirect) {
          redirectToLogin();
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
