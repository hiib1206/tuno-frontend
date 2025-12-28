export enum Role {
  USER = "USER",
  ADMIN = "ADMIN",
}

export enum IsActive {
  Y = "Y",
  N = "N",
}

export enum PostCategory {
  QUESTION = "QUESTION",
  STOCK = "STOCK",
  FREE = "FREE",
}

export const PostCategoryLabels: Record<PostCategory, string> = {
  [PostCategory.QUESTION]: "질문",
  [PostCategory.STOCK]: "종목",
  [PostCategory.FREE]: "자유",
};

// URL 경로와 PostCategory 간 변환 유틸리티
export const categoryToUrlPath = (category: PostCategory): string => {
  const map: Record<PostCategory, string> = {
    [PostCategory.QUESTION]: "question",
    [PostCategory.STOCK]: "stock",
    [PostCategory.FREE]: "free",
  };
  return map[category];
};

export const urlPathToCategory = (path: string): PostCategory | null => {
  const map: Record<string, PostCategory> = {
    question: PostCategory.QUESTION,
    stock: PostCategory.STOCK,
    free: PostCategory.FREE,
  };
  return map[path.toLowerCase()] || null;
};

// 엔티티 타입 (백엔드와 동일한 구조)
export const ENTITY_TYPES = {
  POST: "POST",
} as const;

export type EntityType = (typeof ENTITY_TYPES)[keyof typeof ENTITY_TYPES];
