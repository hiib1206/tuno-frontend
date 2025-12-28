import { PostCategory, categoryToUrlPath } from "@/types/Common";
import { Post } from "@/types/Post";
import { User } from "@/types/User";
import {
  BarChart3,
  FileQuestion,
  HelpCircle,
  MessageSquare,
} from "lucide-react";
import { extractTextFromTiptapJson } from "./tiptap";

export interface PostCategoryItem {
  label: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
}

// 소통해요 하위 메뉴
export const postCategoryItems: PostCategoryItem[] = [
  {
    label: "질문",
    href: "/community/posts/question",
    icon: FileQuestion,
  },
  { label: "종목", href: "/community/posts/stock", icon: BarChart3 },
  { label: "자유", href: "/community/posts/free", icon: MessageSquare },
];

// Google News 토픽 ID 상수
export const NEWS_TOPICS = {
  headline: "CAAqJggKIiBDQkFTRWdvSUwyMHZNRFZxYUdjU0FtdHZHZ0pMVWlnQVAB", // 주요 뉴스
  economy: "CAAqIggKIhxDQkFTRHdvSkwyMHZNR2RtY0hNekVnSnJieWdBUAE", // 경제
  finance: "CAAqIQgKIhtDQkFTRGdvSUwyMHZNREpmTjNRU0FtdHZLQUFQAQ", // 금융
  technology: "CAAqKAgKIiJDQkFTRXdvSkwyMHZNR1ptZHpWbUVnSnJieG9DUzFJb0FBUAE", // 기술
  politics: "CAAqIQgKIhtDQkFTRGdvSUwyMHZNRFZ4ZERBU0FtdHZLQUFQAQ", // 정치
} as const;

// 토픽 키 타입 (economy, finance 등)
export type NewsTopicKey = keyof typeof NEWS_TOPICS;

// 토픽 ID 타입 (실제 Google News 토픽 ID)
export type NewsTopicId = (typeof NEWS_TOPICS)[NewsTopicKey];

// 토픽 키로 토픽 ID 가져오기
export function getNewsTopicId(topicKey: NewsTopicKey): NewsTopicId {
  return NEWS_TOPICS[topicKey];
}

// 뉴스 하위 메뉴 (토픽별 구성)
export const newsCategoryItems: PostCategoryItem[] = [
  {
    label: "경제",
    href: "/community/news/economy",
  },
  {
    label: "금융",
    href: "/community/news/finance",
  },
  {
    label: "기술",
    href: "/community/news/technology",
  },
  {
    label: "정치",
    href: "/community/news/politics",
  },
];

// 고객 센터 하위 메뉴 (예시 - 필요에 따라 수정 가능)
export const supportCategoryItems: PostCategoryItem[] = [
  {
    label: "FAQ",
    href: "/community/support/faq",
    icon: HelpCircle,
  },
  {
    label: "문의하기",
    href: "/community/support/inquiry",
    icon: MessageSquare,
  },
];

// 각 메뉴 경로와 해당 하위 메뉴 매핑
export const subMenuConfig: Record<string, PostCategoryItem[]> = {
  "/community/posts": postCategoryItems,
  "/community/news": newsCategoryItems,
  "/community/support": supportCategoryItems,
  "/community/mypage/posts": [], // 마이페이지는 하위 메뉴 없음
};

/**
 * 게시글 목록 페이지네이션 상수. 기본값: 20
 */
export const POST_LIST_LIMIT = 20;
/**
 * 내 게시글 목록 페이지네이션 상수. 기본값: 20
 */
export const MYPOSTS_LIST_LIMIT = 20;
/**
 * 댓글 목록 페이지네이션 상수. 기본값: 20
 */
export const COMMENT_LIST_LIMIT = 20;
/**
 * 내 댓글 목록 페이지네이션 상수. 기본값: 20
 */
export const MYCOMMENTS_LIST_LIMIT = 20;
/**
 * 내 좋아요 목록 페이지네이션 상수. 기본값: 20
 */
export const MYLIKES_LIST_LIMIT = 20;

/**
 * 게시글 정렬 필드 타입
 */
export type PostSortField =
  | "created_at"
  | "view_count"
  | "title"
  | "comment_count"
  | "like_count";

/**
 * 정렬 순서 타입
 */
export type SortOrder = "asc" | "desc";

/**
 * 게시글 정렬 옵션 인터페이스
 */
export interface PostSortOption {
  value: string;
  label: string;
  sort?: PostSortField;
  order?: SortOrder;
}

/**
 * 게시글 정렬 옵션 상수
 */
export const POST_SORT_OPTIONS: PostSortOption[] = [
  { value: "latest", label: "최신순", sort: "created_at", order: "desc" },
  { value: "oldest", label: "등록순", sort: "created_at", order: "asc" },
  { value: "views", label: "조회수순", sort: "view_count", order: "desc" },
  { value: "comments", label: "댓글순", sort: "comment_count", order: "desc" },
  { value: "likes", label: "좋아요순", sort: "like_count", order: "desc" },
];

export interface PostListItem {
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
  href: string;
}

/**
 * 도메인 모델 Post를 CommunityPost로 변환
 */
export function toCommunityPost(post: Post): PostListItem {
  return {
    ...post,
    content: extractTextFromTiptapJson(post.content),
    href: `/community/posts/${categoryToUrlPath(post.category)}/${post.id}`,
  };
}
