import { PostCategory } from "@/types/Common";
import { Post } from "@/types/Post";
import apiClient from "./apiClient";

// 쿼리 파라미터 타입
type PostQueryParams = {
  page?: number;
  limit?: number;
  sort?: "created_at" | "view_count" | "title" | "comment_count" | "like_count";
  order?: "asc" | "desc";
  search?: string;
  category?: PostCategory;
};

// 여러 게시글 삭제 응답 타입
type DeletePostsResult = {
  success: boolean;
  message: string;
  data: {
    success: Array<{
      id: string;
      message: string;
    }>;
    failed: Array<{
      id: string;
      message: string;
    }>;
  };
};

// 좋아요 일괄 취소 응답 타입
type TogglePostLikesResult = {
  success: boolean;
  message: string;
  data: {
    success: Array<{
      id: string;
      message: string;
    }>;
    failed: Array<{
      id: string;
      message: string;
    }>;
  };
};

// 게시글 목록 조회 응답 타입 (공통)
type PostsListResult = {
  success: boolean;
  message: string;
  data: {
    list: Post[];
    totalCount: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
};

// 쿼리 파라미터 구성 헬퍼 함수
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

const postApi = {
  // 게시글 상세 조회
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

  // 게시글 목록 조회
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

  // 내 게시글 목록 조회
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

  // 좋아요한 게시글 목록 조회
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

  // 게시글 생성 (FormData로 통일, 이미지 파일 포함/미포함 모두 처리)
  createPost: async (
    title: string,
    category: PostCategory,
    content: any, // JSON 객체 (내부에서 문자열로 변환)
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

  // 게시글 수정 (FormData로 통일, 이미지 파일 포함/미포함 모두 처리)
  updatePost: async (
    id: string,
    title: string,
    category: PostCategory,
    content: any, // JSON 객체 (내부에서 문자열로 변환)
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

  // 게시글 삭제
  deletePost: async (id: string) => {
    const response = await apiClient.delete(`/api/post/${id}`);
    return {
      success: response.data.success,
      message: response.data.message,
    };
  },

  // 여러 게시글 삭제
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

  // 좋아요 토글
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

  // 좋아요 일괄 취소
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
