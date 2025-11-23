import apiClient from "./apiClient";

const userApi = {
  checkUsername: async (username: string) => {
    const response = await apiClient.get(
      `/api/user/check-username?username=${username}`
    );
    return response.data;
  },
  checkNickname: async (nick: string) => {
    const response = await apiClient.get(
      `/api/user/check-nickname?nick=${nick}`
    );
    return response.data;
  },
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
};

export default userApi;
