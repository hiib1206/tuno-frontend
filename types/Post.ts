import { PostCategory } from "./Common";
import { User } from "./User";

/**
 * 게시물 클래스
 *
 * @remarks
 * 백엔드 Post 엔티티와 매핑되는 클라이언트 모델
 */
export class Post {
  /** 게시물 ID (BigInt를 string으로 변환) */
  id: string;
  /** 제목 */
  title: string;
  /** 본문 내용 */
  content: string;
  /** 카테고리 */
  category: PostCategory;
  /** 조회수 */
  viewCount: number;
  /** 댓글 수 */
  commentCount: number;
  /** 좋아요 수 */
  likeCount: number;
  /** 현재 사용자의 좋아요 여부 */
  isLiked: boolean;
  /** 고정 게시물 여부 */
  isPinned: boolean;
  /** 작성 일시 */
  createdAt: Date;
  /** 수정 일시 */
  updatedAt: Date;
  /** 삭제 일시 */
  deletedAt?: Date;
  /** 작성자 정보 */
  author?: User;

  constructor(
    id: string,
    title: string,
    content: string,
    category: PostCategory,
    viewCount: number,
    commentCount: number,
    likeCount: number,
    isLiked: boolean,
    isPinned: boolean,
    createdAt: Date,
    updatedAt: Date,
    deletedAt?: Date,
    author?: User
  ) {
    this.id = id;
    this.title = title;
    this.content = content;
    this.category = category;
    this.viewCount = viewCount;
    this.commentCount = commentCount;
    this.likeCount = likeCount;
    this.isLiked = isLiked;
    this.isPinned = isPinned;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.deletedAt = deletedAt;
    this.author = author;
  }

  /**
   * Record 객체에서 Post 인스턴스를 생성한다.
   *
   * @param map - 변환할 객체 (백엔드 API 응답)
   */
  static fromMap(map: Record<string, any>): Post {
    return new Post(
      // 방어적으로 string으로 변환 (백엔드에서 이미 string이지만 다양한 출처 대비)
      String(map.id ?? ""),
      map.title,
      map.content,
      map.category,
      map.viewCount ?? 0,
      map.commentCount ?? 0,
      map.likeCount ?? 0,
      map.isLiked ?? false,
      map.isPinned ?? false,
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
      map.deletedAt
        ? typeof map.deletedAt === "string"
          ? new Date(map.deletedAt)
          : map.deletedAt
        : undefined,
      map.author ? User.fromMap(map.author) : undefined
    );
  }

  /** Post 인스턴스를 Record 객체로 변환한다. */
  toMap(): Record<string, any> {
    return {
      id: this.id,
      title: this.title,
      content: this.content,
      category: this.category,
      viewCount: this.viewCount,
      commentCount: this.commentCount,
      likeCount: this.likeCount,
      isLiked: this.isLiked,
      isPinned: this.isPinned,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      deletedAt: this.deletedAt,
      author: this.author?.toMap(),
    };
  }

  /**
   * JSON 문자열에서 Post 인스턴스를 생성한다.
   *
   * @param json - 변환할 JSON 문자열
   */
  static fromJson(json: string): Post {
    return Post.fromMap(JSON.parse(json));
  }

  /** Post 인스턴스를 JSON 문자열로 변환한다. */
  toJson(): string {
    return JSON.stringify(this.toMap());
  }

  /**
   * 일부 속성만 업데이트하여 새로운 Post 인스턴스를 생성한다.
   *
   * @param updates - 업데이트할 속성들
   * @returns 새로운 Post 인스턴스
   */
  copyWith(
    updates: Partial<
      Pick<Post, "likeCount" | "isLiked" | "commentCount" | "viewCount">
    >
  ): Post {
    return new Post(
      this.id,
      this.title,
      this.content,
      this.category,
      updates.viewCount ?? this.viewCount,
      updates.commentCount ?? this.commentCount,
      updates.likeCount ?? this.likeCount,
      updates.isLiked ?? this.isLiked,
      this.isPinned,
      this.createdAt,
      this.updatedAt,
      this.deletedAt,
      this.author
    );
  }
}
