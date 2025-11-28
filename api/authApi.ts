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
};

export default authApi;
