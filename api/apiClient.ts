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
        const refreshResponse = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh`,
          {},
          {
            withCredentials: true,
          }
        );

        const newAccessToken = refreshResponse.data.data.accessToken;

        // 새로운 access token 저장
        useAuthStore.getState().setAccessToken(newAccessToken);

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

        // 로그인 페이지로 리다이렉트 (브라우저 환경에서만, skipRedirect 플래그가 없을 때만)
        if (typeof window !== "undefined" && !originalRequest.skipRedirect) {
          window.location.href = "/login";
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
