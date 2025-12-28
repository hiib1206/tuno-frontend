import { PostCategory } from "./Common";
import { User } from "./User";

export class Post {
  id: string; // BigInt를 string으로 변환
  title: string;
  content: string;
  category: PostCategory;
  viewCount: number;
  commentCount: number;
  likeCount: number;
  isLiked: boolean;
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
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

  static fromMap(map: Record<string, any>): Post {
    return new Post(
      String(map.id ?? ""), // 방어적으로 string으로 변환 (백엔드에서 이미 string이지만 다양한 출처 대비)
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

  // JSON 문자열을 Post 객체로 변환
  static fromJson(json: string): Post {
    return Post.fromMap(JSON.parse(json));
  }

  // Post 객체를 JSON 문자열로 변환
  toJson(): string {
    return JSON.stringify(this.toMap());
  }

  // 일부 속성만 업데이트하여 새로운 Post 인스턴스 생성
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
