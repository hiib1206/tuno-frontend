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

/**
 * 토큰 갱신 함수 (SSE 등 외부에서도 사용 가능)
 * @returns 새로운 accessToken 또는 실패 시 null
 */
export async function refreshAccessToken(): Promise<string | null> {
  if (isRefreshing) {
    // 이미 갱신 중이면 대기열에 추가
    return new Promise((resolve, reject) => {
      failedQueue.push({ resolve, reject });
    });
  }

  isRefreshing = true;

  try {
    const refreshResponse = await apiClient.post(
      "/api/auth/refresh",
      {},
      {
        withCredentials: true,
        _retry: true,
      }
    );

    const newAccessToken = refreshResponse.data.data.accessToken;

    useAuthStore.getState().setAccessToken(newAccessToken);

    const user = useAuthStore.getState().user;
    if (user) {
      broadcastAuthEvent({
        type: "LOGIN",
        accessToken: newAccessToken,
        user: user.toMap(),
      });
    }

    processQueue(null, newAccessToken);
    return newAccessToken;
  } catch (error) {
    processQueue(error, null);
    useAuthStore.getState().setAccessToken(null);
    useAuthStore.getState().setUser(null);
    broadcastAuthEvent({ type: "TOKEN_INVALID" });
    return null;
  } finally {
    isRefreshing = false;
  }
}

// 응답 인터셉터
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // 401 에러이고, 이미 재시도한 요청이 아닌 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const newAccessToken = await refreshAccessToken();

      if (newAccessToken) {
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      }

      // 갱신 실패 시 로그인 페이지로 리다이렉트
      if (typeof window !== "undefined" && !originalRequest.skipRedirect) {
        redirectToLogin();
      }

      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
