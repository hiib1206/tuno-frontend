export type NotificationType =
  | "COMMENT"
  | "REPLY"
  | "AI_INFERENCE_COMPLETE"
  | "SYSTEM_NOTICE";

export interface NotificationActor {
  id: string;
  username: string | null;
  nick: string;
  profile_image_url: string | null;
}

export interface NotificationActorResponse {
  id: string;
  username: string | null;
  nick: string;
  profile_image_url: string | null;
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
  read_at: Date | null;
  created_at: Date;
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
  read_at: string | null;
  created_at: string;
  actor: NotificationActorResponse | null;
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
    read_at: raw.read_at ? new Date(raw.read_at) : null,
    created_at: new Date(raw.created_at),
    actor: raw.actor ? { ...raw.actor } : null,
  };
};
