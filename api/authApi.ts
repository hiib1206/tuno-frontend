import apiClient from "./apiClient";

/** 인증 관련 기본 응답 (data 없음) */
export interface BasicResponse {
  success: boolean;
  message: string;
}

/**
 * 인증 관련 API
 *
 * @remarks
 * 회원가입, 로그인/로그아웃, 이메일 인증, 비밀번호 재설정 등을 처리한다.
 */
const authApi = {
  /**
   * 회원가입을 요청한다.
   *
   * @param username - 로그인 아이디
   * @param nick - 닉네임
   * @param pw - 비밀번호
   * @param email - 이메일 주소
   * @param signupToken - 이메일 인증 토큰
   */
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

  /**
   * 로그인을 요청한다.
   *
   * @param username - 로그인 아이디
   * @param pw - 비밀번호
   */
  login: async (username: string, pw: string) => {
    const response = await apiClient.post("/api/auth/login", {
      username,
      pw,
    });
    return response.data;
  },

  /** 로그아웃을 요청한다. */
  logout: async () => {
    const response = await apiClient.post("/api/auth/logout");
    return response.data;
  },

  /**
   * 이메일 인증 코드를 발송한다.
   *
   * @param email - 인증할 이메일 주소
   */
  sendEmailCode: async (email: string) => {
    const response = await apiClient.post("/api/auth/email/send", {
      email,
    });
    return response.data;
  },

  /**
   * 이메일 인증 코드를 재발송한다.
   *
   * @param email - 인증할 이메일 주소
   */
  resendEmailCode: async (email: string) => {
    const response = await apiClient.post("/api/auth/email/resend", {
      email,
    });
    return response.data;
  },

  /**
   * 이메일 인증 코드를 검증한다.
   *
   * @param email - 이메일 주소
   * @param code - 인증 코드
   */
  verifyEmailCode: async (email: string, code: string) => {
    const response = await apiClient.post("/api/auth/email/verify", {
      email,
      code,
    });
    return response.data;
  },

  /**
   * 아이디를 찾는다.
   *
   * @param email - 가입 시 사용한 이메일 주소
   */
  findUsername: async (email: string): Promise<BasicResponse> => {
    const response = await apiClient.post("/api/auth/find-username", {
      email,
    });
    return response.data;
  },

  /**
   * 비밀번호 재설정을 요청한다.
   *
   * @param username - 로그인 아이디
   * @param email - 가입 시 사용한 이메일 주소
   */
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

  /**
   * 비밀번호를 재설정한다.
   *
   * @param token - 비밀번호 재설정 토큰
   * @param newPw - 새 비밀번호
   */
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
