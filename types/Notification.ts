/** 알림 타입 */
export type NotificationType =
  | "COMMENT"
  | "REPLY"
  | "AI_INFERENCE_COMPLETE"
  | "SYSTEM_NOTICE";

/** 알림 발신자 정보 */
export interface NotificationActor {
  /** 사용자 ID */
  id: string;
  /** 로그인 아이디 */
  username: string | null;
  /** 닉네임 */
  nick: string;
  /** 프로필 이미지 URL */
  profileImageUrl: string | null;
}

/** 댓글 알림 데이터 */
export type CommentNotificationData = {
  /** 게시물 ID */
  postId: string;
  /** 댓글 ID */
  commentId: string;
  /** 미리보기 텍스트 */
  preview: string;
};

/** 대댓글 알림 데이터 */
export type ReplyNotificationData = {
  /** 게시물 ID */
  postId: string;
  /** 원 댓글 ID */
  commentId: string;
  /** 대댓글 ID */
  replyId: string;
  /** 미리보기 텍스트 */
  preview: string;
};

/** AI 추론 완료 알림 데이터 */
export type AiInferenceNotificationData = {
  /** 추론 ID */
  inferenceId: string;
  /** 종목 심볼 */
  stockSymbol: string;
  /** 결과 요약 */
  resultSummary: string;
};

/** 시스템 공지 알림 데이터 */
export type SystemNoticeNotificationData = {
  /** 공지 ID */
  noticeId: string;
  /** 공지 제목 */
  title: string;
};

/** 알림 타입별 데이터 매핑 */
export type NotificationDataMap = {
  COMMENT: CommentNotificationData;
  REPLY: ReplyNotificationData;
  AI_INFERENCE_COMPLETE: AiInferenceNotificationData;
  SYSTEM_NOTICE: SystemNoticeNotificationData;
};

/** 알림 기본 인터페이스 */
export interface NotificationBase {
  /** 알림 ID */
  id: string;
  /** 읽은 일시 */
  readAt: Date | null;
  /** 생성 일시 */
  createdAt: Date;
  /** 발신자 정보 */
  actor: NotificationActor | null;
}

/** 알림 타입 (Date 객체 포함) */
export type Notification = {
  [K in NotificationType]: NotificationBase & {
    type: K;
    data: NotificationDataMap[K];
  };
}[NotificationType];

/** 알림 API 응답 기본 인터페이스 */
export interface NotificationBaseResponse {
  /** 알림 ID */
  id: string;
  /** 알림 타입 */
  type: NotificationType;
  /** 알림 데이터 */
  data: NotificationDataMap[NotificationType];
  /** 읽은 일시 (ISO 문자열) */
  readAt: string | null;
  /** 생성 일시 (ISO 문자열) */
  createdAt: string;
  /** 발신자 정보 */
  actor: NotificationActor | null;
}

/** 알림 API 응답 타입 */
export type NotificationResponse = {
  [K in NotificationType]: NotificationBaseResponse & {
    type: K;
    data: NotificationDataMap[K];
  };
}[NotificationType];

/**
 * API 응답을 Notification 타입으로 변환한다.
 *
 * @param raw - API 응답 데이터
 * @returns 파싱된 알림 객체
 */
export const parseNotification = (raw: NotificationResponse): Notification => {
  return {
    ...raw,
    readAt: raw.readAt ? new Date(raw.readAt) : null,
    createdAt: new Date(raw.createdAt),
    actor: raw.actor ? { ...raw.actor } : null,
  };
};
