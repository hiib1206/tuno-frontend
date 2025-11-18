import apiClient from "./apiClient";

const authApi = {
  login: async (username: string, pw: string) => {
    const response = await apiClient.post("/api/auth/login", {
      username,
      pw,
    });
    return response.data;
  },
};

export default authApi;
