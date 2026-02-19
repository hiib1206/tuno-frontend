import { PostCategory } from "@/types/Common";
import { Post } from "@/types/Post";
import apiClient from "./apiClient";

/** 게시글 목록 조회 쿼리 파라미터 */
type PostQueryParams = {
  /** 페이지 번호 */
  page?: number;
  /** 페이지당 항목 수 */
  limit?: number;
  /** 정렬 기준 필드 */
  sort?: "created_at" | "view_count" | "title" | "comment_count" | "like_count";
  /** 정렬 방향 */
  order?: "asc" | "desc";
  /** 검색어 */
  search?: string;
  /** 카테고리 필터 */
  category?: PostCategory;
};

/** 여러 게시글 삭제 응답 */
type DeletePostsResult = {
  success: boolean;
  message: string;
  data: {
    /** 삭제 성공 목록 */
    success: Array<{
      id: string;
      message: string;
    }>;
    /** 삭제 실패 목록 */
    failed: Array<{
      id: string;
      message: string;
    }>;
  };
};

/** 좋아요 일괄 토글 응답 */
type TogglePostLikesResult = {
  success: boolean;
  message: string;
  data: {
    /** 토글 성공 목록 */
    success: Array<{
      id: string;
      message: string;
    }>;
    /** 토글 실패 목록 */
    failed: Array<{
      id: string;
      message: string;
    }>;
  };
};

/** 게시글 목록 조회 응답 (공통) */
type PostsListResult = {
  success: boolean;
  message: string;
  data: {
    /** 게시글 목록 */
    list: Post[];
    /** 전체 게시글 수 */
    totalCount: number;
    /** 현재 페이지 */
    page: number;
    /** 페이지당 항목 수 */
    limit: number;
    /** 전체 페이지 수 */
    totalPages: number;
    /** 다음 페이지 존재 여부 */
    hasNextPage: boolean;
    /** 이전 페이지 존재 여부 */
    hasPrevPage: boolean;
  };
};

/**
 * 쿼리 파라미터 객체를 URL 쿼리 문자열로 변환한다.
 *
 * @param params - 쿼리 파라미터 객체
 * @returns URL 쿼리 문자열 (예: "?page=1&limit=10")
 */
const buildQueryParams = (params?: PostQueryParams): string => {
  if (!params) return "";

  const queryParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      queryParams.append(key, String(value));
    }
  });

  const queryString = queryParams.toString();
  return queryString ? `?${queryString}` : "";
};

/**
 * 게시글 관련 API
 *
 * @remarks
 * 게시글 CRUD, 목록 조회, 좋아요 기능을 처리한다.
 */
const postApi = {
  /**
   * 게시글 상세를 조회한다.
   *
   * @param id - 게시글 ID
   */
  getPostById: async (id: string) => {
    const response = await apiClient.get(`/api/post/${id}`);
    return {
      success: response.data.success,
      message: response.data.message,
      data: {
        post: Post.fromMap(response.data.data.post),
      },
    };
  },

  /**
   * 게시글 목록을 조회한다.
   *
   * @param params - 쿼리 파라미터 (페이지, 정렬, 검색어 등)
   */
  getPosts: async (params?: PostQueryParams): Promise<PostsListResult> => {
    const queryString = buildQueryParams(params);
    const url = `/api/post${queryString}`;

    const response = await apiClient.get(url);
    return {
      success: response.data.success,
      message: response.data.message,
      data: {
        totalCount: response.data.data.totalCount,
        page: response.data.data.page,
        limit: response.data.data.limit,
        totalPages: response.data.data.totalPages,
        hasNextPage: response.data.data.hasNextPage,
        hasPrevPage: response.data.data.hasPrevPage,
        list: response.data.data.list.map((post: any) => Post.fromMap(post)),
      },
    };
  },

  /**
   * 내가 작성한 게시글 목록을 조회한다.
   *
   * @param params - 쿼리 파라미터
   */
  getMyPosts: async (params?: PostQueryParams): Promise<PostsListResult> => {
    const queryString = buildQueryParams(params);
    const url = `/api/post/me${queryString}`;

    const response = await apiClient.get(url);
    return {
      success: response.data.success,
      message: response.data.message,
      data: {
        totalCount: response.data.data.totalCount,
        page: response.data.data.page,
        limit: response.data.data.limit,
        totalPages: response.data.data.totalPages,
        hasNextPage: response.data.data.hasNextPage,
        hasPrevPage: response.data.data.hasPrevPage,
        list: response.data.data.list.map((post: any) => Post.fromMap(post)),
      },
    };
  },

  /**
   * 내가 좋아요한 게시글 목록을 조회한다.
   *
   * @param params - 쿼리 파라미터 (page, limit, order만 지원)
   */
  getLikedPosts: async (
    params?: Pick<PostQueryParams, "page" | "limit" | "order">
  ): Promise<PostsListResult> => {
    const queryString = buildQueryParams(params);
    const url = `/api/post/me/liked${queryString}`;

    const response = await apiClient.get(url);
    return {
      success: response.data.success,
      message: response.data.message,
      data: {
        totalCount: response.data.data.totalCount,
        page: response.data.data.page,
        limit: response.data.data.limit,
        totalPages: response.data.data.totalPages,
        hasNextPage: response.data.data.hasNextPage,
        hasPrevPage: response.data.data.hasPrevPage,
        list: response.data.data.list.map((post: any) => Post.fromMap(post)),
      },
    };
  },

  /**
   * 게시글을 생성한다.
   *
   * @remarks
   * FormData로 전송하며, 이미지 파일 포함/미포함 모두 처리한다.
   *
   * @param title - 게시글 제목
   * @param category - 게시글 카테고리
   * @param content - 게시글 내용 (JSON 객체, 내부에서 문자열로 변환)
   * @param imageFiles - 첨부 이미지 파일 배열
   * @param blobUrlToIndex - Blob URL과 이미지 인덱스 매핑 (서버에서 순서 매칭용)
   */
  createPost: async (
    title: string,
    category: PostCategory,
    content: any,
    imageFiles: File[],
    blobUrlToIndex: Map<string, number>
  ) => {
    const formData = new FormData();
    formData.append("title", title);
    formData.append("category", category);
    // content를 JSON 문자열로 변환하여 전송
    formData.append("content", JSON.stringify(content));

    // 이미지 파일들 추가 (있는 경우만)
    imageFiles.forEach((file) => {
      formData.append("images", file);
    });
    // Blob URL과 인덱스 매핑 정보도 전송 (서버에서 순서 매칭용, 있는 경우만)
    if (blobUrlToIndex.size > 0) {
      const blobUrlMapping: { [key: string]: number } = {};
      blobUrlToIndex.forEach((index, blobUrl) => {
        blobUrlMapping[blobUrl] = index;
      });
      formData.append("blobUrlMapping", JSON.stringify(blobUrlMapping));
    }

    const response = await apiClient.post("/api/post", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return {
      success: response.data.success,
      message: response.data.message,
      data: {
        post: Post.fromMap(response.data.data.post),
      },
    };
  },

  /**
   * 게시글을 수정한다.
   *
   * @remarks
   * FormData로 전송하며, 이미지 파일 포함/미포함 모두 처리한다.
   *
   * @param id - 게시글 ID
   * @param title - 게시글 제목
   * @param category - 게시글 카테고리
   * @param content - 게시글 내용 (JSON 객체, 내부에서 문자열로 변환)
   * @param imageFiles - 첨부 이미지 파일 배열
   * @param blobUrlToIndex - Blob URL과 이미지 인덱스 매핑
   */
  updatePost: async (
    id: string,
    title: string,
    category: PostCategory,
    content: any,
    imageFiles: File[],
    blobUrlToIndex: Map<string, number>
  ) => {
    const formData = new FormData();
    formData.append("title", title);
    formData.append("category", category);
    // content를 JSON 문자열로 변환하여 전송
    formData.append("content", JSON.stringify(content));

    // 이미지 파일들 추가 (있는 경우만)
    imageFiles.forEach((file) => {
      formData.append("images", file);
    });
    // Blob URL과 인덱스 매핑 정보도 전송 (서버에서 순서 매칭용, 있는 경우만)
    if (blobUrlToIndex.size > 0) {
      const blobUrlMapping: { [key: string]: number } = {};
      blobUrlToIndex.forEach((index, blobUrl) => {
        blobUrlMapping[blobUrl] = index;
      });
      formData.append("blobUrlMapping", JSON.stringify(blobUrlMapping));
    }

    const response = await apiClient.patch(`/api/post/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return {
      success: response.data.success,
      message: response.data.message,
      data: {
        post: Post.fromMap(response.data.data.post),
      },
    };
  },

  /**
   * 게시글을 삭제한다.
   *
   * @param id - 게시글 ID
   */
  deletePost: async (id: string) => {
    const response = await apiClient.delete(`/api/post/${id}`);
    return {
      success: response.data.success,
      message: response.data.message,
    };
  },

  /**
   * 여러 게시글을 일괄 삭제한다.
   *
   * @param ids - 삭제할 게시글 ID 배열
   */
  deletePosts: async (ids: string[]): Promise<DeletePostsResult> => {
    const response = await apiClient.delete("/api/post", {
      data: { ids },
    });
    return {
      success: response.data.success,
      message: response.data.message,
      data: {
        success: response.data.data.success,
        failed: response.data.data.failed,
      },
    };
  },

  /**
   * 게시글 좋아요를 토글한다.
   *
   * @param id - 게시글 ID
   */
  togglePostLike: async (id: string) => {
    const response = await apiClient.post(`/api/post/${id}/like`);
    return {
      success: response.data.success,
      message: response.data.message,
      data: {
        isLiked: response.data.data.isLiked,
        likeCount: response.data.data.likeCount,
      },
    };
  },

  /**
   * 여러 게시글의 좋아요를 일괄 토글한다.
   *
   * @param ids - 게시글 ID 배열
   */
  togglePostLikes: async (ids: string[]): Promise<TogglePostLikesResult> => {
    const response = await apiClient.post("/api/post/likes", { ids });
    return {
      success: response.data.success,
      message: response.data.message,
      data: {
        success: response.data.data.success,
        failed: response.data.data.failed,
      },
    };
  },
};

export default postApi;
