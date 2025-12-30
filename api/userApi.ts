import apiClient from "./apiClient";

// getCommunityStats 응답 타입
export interface CommunityStatsResponse {
  success: boolean;
  message: string;
  data: {
    stats: {
      postCount: number;
      commentCount: number;
      likeCount: number;
    };
  };
}

const userApi = {
  // 내 정보 조회
  me: async (options?: { skipRedirect?: boolean }) => {
    const response = await apiClient.get("/api/user/me", {
      skipRedirect: options?.skipRedirect,
    });
    return response.data;
  },
  // 아이디 중복 체크
  checkUsername: async (username: string) => {
    const response = await apiClient.get(
      `/api/user/username?username=${username}`
    );
    return response.data;
  },
  // 닉네임 중복 체크
  checkNickname: async (nick: string) => {
    const response = await apiClient.get(`/api/user/nickname?nick=${nick}`);
    return response.data;
  },
  // 닉네임 변경
  updateNickname: async (nick: string) => {
    const response = await apiClient.patch(`/api/user/nickname`, {
      nick,
    });
    return response.data;
  },
  // 이메일 인증 요청
  sendEmailVerification: async (email: string) => {
    const response = await apiClient.post("/api/user/email/send", {
      email,
    });
    return response.data;
  },
  // 이메일 인증 코드 검증
  verifyEmailCode: async (code: string) => {
    const response = await apiClient.post("/api/user/email/verify", {
      code,
    });
    return response.data;
  },
  // 이메일 인증 코드 재전송
  resendEmailVerification: async (email: string) => {
    const response = await apiClient.post("/api/user/email/resend", {
      email,
    });
    return response.data;
  },
  // 프로필 이미지 업로드
  uploadProfileImage: async (file: File) => {
    const formData = new FormData();
    formData.append("profileImage", file);

    const response = await apiClient.post("/api/user/profile-image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
  // 비번 변경 요청
  changePassword: async (currentPassword: string, newPassword: string) => {
    const response = await apiClient.patch("/api/user/password", {
      currentPassword,
      newPassword,
    });
    return response.data;
  },
  // 커뮤니티 통계 조회
  getCommunityStats: async (): Promise<CommunityStatsResponse> => {
    const response = await apiClient.get("/api/user/community/stats");
    return response.data;
  },
};

export default userApi;
