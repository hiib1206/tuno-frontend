import { Notification, parseNotification } from "@/types/Notification";
import apiClient from "./apiClient";

export interface ReadNotificationResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: null;
}

export interface ReadNotificationsResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    updatedCount: number;
  };
}

export interface ReadAllNotificationsResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    updatedCount: number;
  };
}

export interface GetUnreadCountResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    count: number;
  };
}
export interface GetNotificationsParams {
  cursor?: string;
  limit?: number;
}

export interface GetNotificationsResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    list: Notification[];
    nextCursor: string | null;
    hasNext: boolean;
  };
}

const notificationApi = {
  getNotifications: async (
    params?: GetNotificationsParams
  ): Promise<GetNotificationsResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.cursor) queryParams.append("cursor", params.cursor);
    if (params?.limit) queryParams.append("limit", String(params.limit));

    const queryString = queryParams.toString();
    const url = `/api/notification${queryString ? `?${queryString}` : ""}`;

    const response = await apiClient.get(url);
    return {
      success: response.data.success,
      statusCode: response.data.statusCode,
      message: response.data.message,
      data: {
        list: (response.data.data?.list || []).map((item: any) =>
          parseNotification(item)
        ),
        nextCursor: response.data.data?.nextCursor ?? null,
        hasNext: response.data.data?.hasNext ?? false,
      },
    };
  },
  readNotification: async (id: string): Promise<ReadNotificationResponse> => {
    const response = await apiClient.patch(`/api/notification/${id}/read`);
    return {
      success: response.data.success,
      statusCode: response.data.statusCode,
      message: response.data.message,
      data: response.data.data ?? null,
    };
  },
  readNotifications: async (ids: string[]): Promise<ReadNotificationsResponse> => {
    const response = await apiClient.patch(`/api/notification/read`, { ids });
    return {
      success: response.data.success,
      statusCode: response.data.statusCode,
      message: response.data.message,
      data: {
        updatedCount: response.data.data?.updatedCount ?? 0,
      },
    };
  },
  readAllNotifications: async (): Promise<ReadAllNotificationsResponse> => {
    const response = await apiClient.patch(`/api/notification/read-all`);
    return {
      success: response.data.success,
      statusCode: response.data.statusCode,
      message: response.data.message,
      data: {
        updatedCount: response.data.data?.updatedCount ?? 0,
      },
    };
  },
  getUnreadCount: async (): Promise<GetUnreadCountResponse> => {
    const response = await apiClient.get(`/api/notification/unread-count`);
    return {
      success: response.data.success,
      statusCode: response.data.statusCode,
      message: response.data.message,
      data: {
        count: response.data.data?.count ?? 0,
      },
    };
  },
};

export default notificationApi;
