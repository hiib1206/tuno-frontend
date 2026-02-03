export type NotificationType =
  | "COMMENT"
  | "REPLY"
  | "AI_INFERENCE_COMPLETE"
  | "SYSTEM_NOTICE";

export interface NotificationActor {
  id: string;
  username: string | null;
  nick: string;
  profileImageUrl: string | null;
}

// 알림 data 타입 정의
export type CommentNotificationData = {
  postId: string;
  commentId: string;
  preview: string;
};

export type ReplyNotificationData = {
  postId: string;
  commentId: string;
  replyId: string;
  preview: string;
};

export type AiInferenceNotificationData = {
  inferenceId: string;
  stockSymbol: string;
  resultSummary: string;
};

export type SystemNoticeNotificationData = {
  noticeId: string;
  title: string;
};

export type NotificationDataMap = {
  COMMENT: CommentNotificationData;
  REPLY: ReplyNotificationData;
  AI_INFERENCE_COMPLETE: AiInferenceNotificationData;
  SYSTEM_NOTICE: SystemNoticeNotificationData;
};

export interface NotificationBase {
  id: string;
  readAt: Date | null;
  createdAt: Date;
  actor: NotificationActor | null;
}

export type Notification = {
  [K in NotificationType]: NotificationBase & {
    type: K;
    data: NotificationDataMap[K];
  };
}[NotificationType];

export interface NotificationBaseResponse {
  id: string;
  type: NotificationType;
  data: NotificationDataMap[NotificationType];
  readAt: string | null;
  createdAt: string;
  actor: NotificationActor | null;
}

export type NotificationResponse = {
  [K in NotificationType]: NotificationBaseResponse & {
    type: K;
    data: NotificationDataMap[K];
  };
}[NotificationType];

export const parseNotification = (raw: NotificationResponse): Notification => {
  return {
    ...raw,
    readAt: raw.readAt ? new Date(raw.readAt) : null,
    createdAt: new Date(raw.createdAt),
    actor: raw.actor ? { ...raw.actor } : null,
  };
};
