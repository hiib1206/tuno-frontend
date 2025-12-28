import { User } from "./User";

export class PostComment {
  id: string; // BigInt를 string으로 변환
  postId: string; // BigInt를 string으로 변환
  content: string;
  parentId: string | null; // 부모 댓글 ID (최상위 댓글은 null)
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null; // 삭제일시
  author: User | null; // 작성자 정보 (삭제된 댓글은 null)
  replies?: PostComment[]; // 대댓글 배열 (최상위 댓글만 포함)

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

    // replies가 있으면 재귀적으로 변환
    if (map.replies && Array.isArray(map.replies)) {
      comment.replies =
        map.replies.length > 0
          ? map.replies.map((reply: any) => PostComment.fromMap(reply))
          : [];
    }

    return comment;
  }

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
