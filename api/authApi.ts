import apiClient from "./apiClient";

const authApi = {
  register: async (username: string, nick: string, pw: string) => {
    const response = await apiClient.post("/api/auth/register", {
      username,
      nick,
      pw,
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
  me: async (options?: { skipRedirect?: boolean }) => {
    const response = await apiClient.get("/api/auth/me", {
      skipRedirect: options?.skipRedirect,
    });
    return response.data;
  },
  requestEmailVerification: async (email: string) => {
    const response = await apiClient.post("/api/auth/email/request", {
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
  resendEmailVerification: async (email: string) => {
    const response = await apiClient.post("/api/auth/email/resend", {
      email,
    });
    return response.data;
  },
};

export default authApi;
