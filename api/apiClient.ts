import { broadcastAuthEvent } from "@/lib/authSync";
import { getOrCreateDeviceId, redirectToLogin } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import axios from "axios";

/**
 * Axios API 클라이언트 인스턴스
 *
 * @remarks
 * 인증 토큰 자동 주입, 토큰 갱신, 에러 처리를 위한 인터셉터가 설정되어 있다.
 */
const apiClient = axios.create({
  baseURL: process.env?.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// 요청 인터셉터: Authorization 헤더와 device ID를 자동 주입한다.
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

/** 리프레시 토큰 갱신 진행 상태 */
let isRefreshing = false;

/** 토큰 갱신 대기열 */
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}> = [];

/**
 * 토큰 갱신 대기열을 처리한다.
 *
 * @param error - 에러 객체 (갱신 실패 시)
 * @param token - 새 액세스 토큰 (갱신 성공 시)
 */
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
 * 액세스 토큰을 갱신한다.
 *
 * @remarks
 * SSE 등 외부에서도 사용할 수 있도록 export한다.
 * 이미 갱신 중이면 대기열에 추가되어 결과를 공유한다.
 *
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

// 응답 인터셉터: 401 에러 시 토큰 갱신을 시도한다.
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
