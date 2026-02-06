import apiClient from "./apiClient";

// 인증 관련 기본 응답 (data 없음)
export interface BasicResponse {
  success: boolean;
  message: string;
}

const authApi = {
  register: async (
    username: string,
    nick: string,
    pw: string,
    email: string,
    signupToken: string
  ) => {
    const response = await apiClient.post("/api/auth/register", {
      username,
      nick,
      pw,
      email,
      signupToken,
    });
    return response.data;
  },
  login: async (username: string, pw: string) => {
    const response = await apiClient.post("/api/auth/login", {
      username,
      pw,
    });
    return response.data;
  },
  logout: async () => {
    const response = await apiClient.post("/api/auth/logout");
    return response.data;
  },
  sendEmailCode: async (email: string) => {
    const response = await apiClient.post("/api/auth/email/send", {
      email,
    });
    return response.data;
  },
  resendEmailCode: async (email: string) => {
    const response = await apiClient.post("/api/auth/email/resend", {
      email,
    });
    return response.data;
  },
  verifyEmailCode: async (email: string, code: string) => {
    const response = await apiClient.post("/api/auth/email/verify", {
      email,
      code,
    });
    return response.data;
  },
  // 아이디 찾기
  findUsername: async (email: string): Promise<BasicResponse> => {
    const response = await apiClient.post("/api/auth/find-username", {
      email,
    });
    return response.data;
  },
  // 비밀번호 재설정 요청
  requestPasswordReset: async (
    username: string,
    email: string
  ): Promise<BasicResponse> => {
    const response = await apiClient.post("/api/auth/password/reset-request", {
      username,
      email,
    });
    return response.data;
  },
  // 비밀번호 재설정
  resetPassword: async (
    token: string,
    newPw: string
  ): Promise<BasicResponse> => {
    const response = await apiClient.post("/api/auth/password/reset", {
      token,
      newPw,
    });
    return response.data;
  },
};

export default authApi;
