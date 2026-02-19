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

/** 게시물 카테고리 메뉴 항목 */
export interface PostCategoryItem {
  /** 메뉴 라벨 */
  label: string;
  /** 링크 경로 */
  href: string;
  /** 아이콘 컴포넌트 */
  icon?: React.ComponentType<{ className?: string }>;
}

/** 소통해요 하위 메뉴 항목들 */
export const postCategoryItems: PostCategoryItem[] = [
  {
    label: "질문",
    href: "/community/posts/question",
    icon: FileQuestion,
  },
  { label: "종목", href: "/community/posts/stock", icon: BarChart3 },
  { label: "자유", href: "/community/posts/free", icon: MessageSquare },
];

/**
 * Google News 토픽 ID 상수
 *
 * @remarks
 * 각 토픽별 Google News RSS 피드 ID를 매핑한다.
 */
export const NEWS_TOPICS = {
  /** 주요 뉴스 */
  headline: "CAAqJggKIiBDQkFTRWdvSUwyMHZNRFZxYUdjU0FtdHZHZ0pMVWlnQVAB",
  /** 경제 */
  economy: "CAAqIggKIhxDQkFTRHdvSkwyMHZNR2RtY0hNekVnSnJieWdBUAE",
  /** 금융 */
  finance: "CAAqIQgKIhtDQkFTRGdvSUwyMHZNREpmTjNRU0FtdHZLQUFQAQ",
  /** 기술 */
  technology: "CAAqKAgKIiJDQkFTRXdvSkwyMHZNR1ptZHpWbUVnSnJieG9DUzFJb0FBUAE",
  /** 정치 */
  politics: "CAAqIQgKIhtDQkFTRGdvSUwyMHZNRFZ4ZERBU0FtdHZLQUFQAQ",
} as const;

/** 토픽 키 타입 (economy, finance 등) */
export type NewsTopicKey = keyof typeof NEWS_TOPICS;

/** 토픽 ID 타입 (실제 Google News 토픽 ID) */
export type NewsTopicId = (typeof NEWS_TOPICS)[NewsTopicKey];

/**
 * 토픽 키로 Google News 토픽 ID를 반환한다.
 *
 * @param topicKey - 토픽 키
 * @returns Google News 토픽 ID
 */
export function getNewsTopicId(topicKey: NewsTopicKey): NewsTopicId {
  return NEWS_TOPICS[topicKey];
}

/** 뉴스 하위 메뉴 항목들 (토픽별 구성) */
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

/** 고객 센터 하위 메뉴 항목들 */
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

/** 각 메뉴 경로와 해당 하위 메뉴 매핑 */
export const subMenuConfig: Record<string, PostCategoryItem[]> = {
  "/community/posts": postCategoryItems,
  "/community/news": newsCategoryItems,
  "/community/support": supportCategoryItems,
  "/community/mypage/posts": [],
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

/** 게시글 목록 아이템 */
export interface PostListItem {
  /** 게시글 ID (BigInt를 string으로 변환) */
  id: string;
  /** 제목 */
  title: string;
  /** 본문 (텍스트 추출됨) */
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
  /** 상세 페이지 링크 */
  href: string;
}

/**
 * Post 도메인 모델을 PostListItem으로 변환한다.
 *
 * @param post - 변환할 Post 객체
 * @returns 목록 표시용 PostListItem
 */
export function toCommunityPost(post: Post): PostListItem {
  return {
    ...post,
    content: extractTextFromTiptapJson(post.content),
    href: `/community/posts/${categoryToUrlPath(post.category)}/${post.id}`,
  };
}
