/** 사용자 역할 */
export enum Role {
  /** 일반 사용자 */
  USER = "USER",
  /** 관리자 */
  ADMIN = "ADMIN",
}

/** 활성 상태 */
export enum IsActive {
  /** 활성 */
  Y = "Y",
  /** 비활성 */
  N = "N",
}

/** 게시물 카테고리 */
export enum PostCategory {
  /** 질문 게시판 */
  QUESTION = "QUESTION",
  /** 종목 게시판 */
  STOCK = "STOCK",
  /** 자유 게시판 */
  FREE = "FREE",
}

/** 게시물 카테고리 한글 라벨 */
export const PostCategoryLabels: Record<PostCategory, string> = {
  [PostCategory.QUESTION]: "질문",
  [PostCategory.STOCK]: "종목",
  [PostCategory.FREE]: "자유",
};

/**
 * 게시물 카테고리를 URL 경로로 변환한다.
 *
 * @param category - 변환할 카테고리
 * @returns URL 경로 문자열
 */
export const categoryToUrlPath = (category: PostCategory): string => {
  const map: Record<PostCategory, string> = {
    [PostCategory.QUESTION]: "question",
    [PostCategory.STOCK]: "stock",
    [PostCategory.FREE]: "free",
  };
  return map[category];
};

/**
 * URL 경로를 게시물 카테고리로 변환한다.
 *
 * @param path - URL 경로 문자열
 * @returns 해당하는 카테고리 또는 null
 */
export const urlPathToCategory = (path: string): PostCategory | null => {
  const map: Record<string, PostCategory> = {
    question: PostCategory.QUESTION,
    stock: PostCategory.STOCK,
    free: PostCategory.FREE,
  };
  return map[path.toLowerCase()] || null;
};

/** 엔티티 타입 (백엔드와 동일한 구조) */
export const ENTITY_TYPES = {
  /** 게시물 */
  POST: "POST",
} as const;

/** 엔티티 타입 유니온 */
export type EntityType = (typeof ENTITY_TYPES)[keyof typeof ENTITY_TYPES];
