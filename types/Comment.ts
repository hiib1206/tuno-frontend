import { User } from "./User";

/**
 * 게시물 댓글 클래스
 *
 * @remarks
 * 백엔드 PostComment 엔티티와 매핑되는 클라이언트 모델.
 * 대댓글 구조를 지원한다.
 */
export class PostComment {
  /** 댓글 ID (BigInt를 string으로 변환) */
  id: string;
  /** 게시물 ID (BigInt를 string으로 변환) */
  postId: string;
  /** 댓글 내용 */
  content: string;
  /** 부모 댓글 ID (최상위 댓글은 null) */
  parentId: string | null;
  /** 작성 일시 */
  createdAt: Date;
  /** 수정 일시 */
  updatedAt: Date;
  /** 삭제 일시 */
  deletedAt: Date | null;
  /** 작성자 정보 (삭제된 댓글은 null) */
  author: User | null;
  /** 대댓글 배열 (최상위 댓글만 포함) */
  replies?: PostComment[];

  constructor(
    id: string,
    postId: string,
    content: string,
    parentId: string | null,
    createdAt: Date,
    updatedAt: Date,
    deletedAt: Date | null,
    author: User | null,
    replies?: PostComment[]
  ) {
    this.id = id;
    this.postId = postId;
    this.content = content;
    this.parentId = parentId;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.deletedAt = deletedAt;
    this.author = author;
    this.replies = replies;
  }

  /**
   * Record 객체에서 PostComment 인스턴스를 생성한다.
   *
   * @remarks
   * replies가 있으면 재귀적으로 변환한다.
   *
   * @param map - 변환할 객체 (백엔드 API 응답)
   */
  static fromMap(map: Record<string, any>): PostComment {
    const comment = new PostComment(
      String(map.id ?? ""),
      String(map.postId ?? ""),
      map.content ?? "",
      map.parentId ? String(map.parentId) : null,
      map.createdAt
        ? typeof map.createdAt === "string"
          ? new Date(map.createdAt)
          : map.createdAt
        : new Date(),
      map.updatedAt
        ? typeof map.updatedAt === "string"
          ? new Date(map.updatedAt)
          : map.updatedAt
        : new Date(),
      map.deletedAt === null || map.deletedAt === undefined
        ? null
        : typeof map.deletedAt === "string"
        ? new Date(map.deletedAt)
        : map.deletedAt,
      map.author ? User.fromMap(map.author) : null
    );

    if (map.replies && Array.isArray(map.replies)) {
      comment.replies =
        map.replies.length > 0
          ? map.replies.map((reply: any) => PostComment.fromMap(reply))
          : [];
    }

    return comment;
  }

  /** PostComment 인스턴스를 Record 객체로 변환한다. */
  toMap(): Record<string, any> {
    return {
      id: this.id,
      postId: this.postId,
      content: this.content,
      parentId: this.parentId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      deletedAt: this.deletedAt,
      author: this.author?.toMap() ?? null,
      replies: this.replies?.map((reply) => reply.toMap()) ?? [],
    };
  }
}
