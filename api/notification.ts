import { Notification, parseNotification } from "@/types/Notification";
import apiClient from "./apiClient";

/** 단건 알림 읽음 처리 응답 */
export interface ReadNotificationResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: null;
}

/** 여러 알림 읽음 처리 응답 */
export interface ReadNotificationsResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    /** 읽음 처리된 알림 수 */
    updatedCount: number;
  };
}

/** 전체 알림 읽음 처리 응답 */
export interface ReadAllNotificationsResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    /** 읽음 처리된 알림 수 */
    updatedCount: number;
  };
}

/** 읽지 않은 알림 개수 조회 응답 */
export interface GetUnreadCountResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    /** 읽지 않은 알림 수 */
    count: number;
  };
}

/** 알림 목록 조회 쿼리 파라미터 */
export interface GetNotificationsParams {
  /** 페이지네이션 커서 */
  cursor?: string;
  /** 조회 개수 */
  limit?: number;
}

/** 알림 목록 조회 응답 */
export interface GetNotificationsResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    /** 알림 목록 */
    list: Notification[];
    /** 다음 페이지 커서 */
    nextCursor: string | null;
    /** 다음 페이지 존재 여부 */
    hasNext: boolean;
  };
}

/**
 * 알림 관련 API
 *
 * @remarks
 * 알림 목록 조회, 읽음 처리, 읽지 않은 알림 개수 조회를 처리한다.
 */
const notificationApi = {
  /**
   * 알림 목록을 조회한다.
   *
   * @param params - 쿼리 파라미터
   */
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

  /**
   * 알림을 읽음 처리한다.
   *
   * @param id - 알림 ID
   */
  readNotification: async (id: string): Promise<ReadNotificationResponse> => {
    const response = await apiClient.patch(`/api/notification/${id}/read`);
    return {
      success: response.data.success,
      statusCode: response.data.statusCode,
      message: response.data.message,
      data: response.data.data ?? null,
    };
  },

  /**
   * 여러 알림을 읽음 처리한다.
   *
   * @param ids - 알림 ID 배열
   */
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

  /** 모든 알림을 읽음 처리한다. */
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

  /** 읽지 않은 알림 개수를 조회한다. */
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
