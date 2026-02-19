import apiClient from "./apiClient";

/** 커뮤니티 통계 조회 응답 */
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

/**
 * 사용자 관련 API
 *
 * @remarks
 * 사용자 정보 조회/수정, 이메일 인증, 프로필 관리 등을 처리한다.
 */
const userApi = {
  /**
   * 내 정보를 조회한다.
   *
   * @param options - 옵션 (skipRedirect: 401 시 리다이렉트 건너뛰기)
   */
  me: async (options?: { skipRedirect?: boolean }) => {
    const response = await apiClient.get("/api/user/me", {
      skipRedirect: options?.skipRedirect,
    });
    return response.data;
  },

  /**
   * 아이디 중복을 확인한다.
   *
   * @param username - 확인할 아이디
   */
  checkUsername: async (username: string) => {
    const response = await apiClient.get(
      `/api/user/username?username=${username}`
    );
    return response.data;
  },

  /**
   * 닉네임 중복을 확인한다.
   *
   * @param nick - 확인할 닉네임
   */
  checkNickname: async (nick: string) => {
    const response = await apiClient.get(`/api/user/nickname?nick=${nick}`);
    return response.data;
  },

  /**
   * 닉네임을 변경한다.
   *
   * @param nick - 새 닉네임
   */
  updateNickname: async (nick: string) => {
    const response = await apiClient.patch(`/api/user/nickname`, {
      nick,
    });
    return response.data;
  },

  /**
   * 이메일 인증 코드를 발송한다.
   *
   * @param email - 인증할 이메일 주소
   */
  sendEmailVerification: async (email: string) => {
    const response = await apiClient.post("/api/user/email/send", {
      email,
    });
    return response.data;
  },

  /**
   * 이메일 인증 코드를 검증한다.
   *
   * @param code - 인증 코드
   */
  verifyEmailCode: async (code: string) => {
    const response = await apiClient.post("/api/user/email/verify", {
      code,
    });
    return response.data;
  },

  /**
   * 이메일 인증 코드를 재발송한다.
   *
   * @param email - 이메일 주소
   */
  resendEmailVerification: async (email: string) => {
    const response = await apiClient.post("/api/user/email/resend", {
      email,
    });
    return response.data;
  },

  /**
   * 프로필 이미지를 업로드한다.
   *
   * @param file - 업로드할 이미지 파일
   */
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

  /**
   * 비밀번호를 변경한다.
   *
   * @param currentPassword - 현재 비밀번호
   * @param newPassword - 새 비밀번호
   */
  changePassword: async (currentPassword: string, newPassword: string) => {
    const response = await apiClient.patch("/api/user/password", {
      oldPw: currentPassword,
      newPw: newPassword,
    });
    return response.data;
  },

  /** 커뮤니티 활동 통계를 조회한다. */
  getCommunityStats: async (): Promise<CommunityStatsResponse> => {
    const response = await apiClient.get("/api/user/community/stats");
    return response.data;
  },

  /** 회원 탈퇴를 요청한다. */
  deleteAccount: async () => {
    const response = await apiClient.delete("/api/user/me");
    return response.data;
  },
};

export default userApi;
