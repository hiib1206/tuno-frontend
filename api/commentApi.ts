import { PostComment } from "@/types/Comment";
import { PostCategory } from "@/types/Common";
import apiClient from "./apiClient";

// 나의 댓글 목록 조회 응답 타입
export interface GetMyCommentsResponse {
  success: boolean;
  message: string;
  data: {
    comments: PostComment[];
    totalCount: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    posts: ({ id: string; title: string; category: PostCategory } | null)[];
  };
}

// 댓글 여러 개 삭제 응답 타입
export interface DeleteCommentResult {
  id: string;
  message: string;
}
export interface DeleteCommentsResponse {
  success: boolean;
  message: string;
  data: {
    success: DeleteCommentResult[];
    failed: DeleteCommentResult[];
  };
}

const postCommentApi = {
  // 댓글 목록 조회
  getComments: async (
    postId: string,
    params: {
      page?: number;
      limit?: number;
      order?: "asc" | "desc"; // 정렬 순서: asc(등록순), desc(최신순)
    }
  ) => {
    // 쿼리 파라미터 구성
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", String(params.page));
    if (params?.limit) queryParams.append("limit", String(params.limit));
    if (params?.order) queryParams.append("order", params.order);

    const queryString = queryParams.toString();
    const url = `/api/post/${postId}/comment${
      queryString ? `?${queryString}` : ""
    }`;

    const response = await apiClient.get(url);

    return {
      success: response.data.success,
      message: response.data.message,
      data: {
        list: (response.data.data?.list || []).map((comment: any) =>
          PostComment.fromMap(comment)
        ),
        page: response.data.data?.page,
        limit: response.data.data?.limit,
        total: response.data.data?.total,
        totalPages: response.data.data?.totalPages,
        hasNextPage: response.data.data?.hasNextPage,
        hasPrevPage: response.data.data?.hasPrevPage,
      },
    };
  },

  // 댓글 작성
  createComment: async (
    postId: string,
    content: string,
    params: {
      parentId?: string;
    }
  ) => {
    const response = await apiClient.post(`/api/post/${postId}/comment`, {
      content,
      parent_id: params.parentId, // snake_case로 전송
    });
    return {
      success: response.data.success,
      message: response.data.message,
      data: {
        comment: PostComment.fromMap(response.data.data.comment),
      },
    };
  },

  // 댓글 수정
  updateComment: async (commentId: string, content: string) => {
    const response = await apiClient.patch(`/api/comment/${commentId}`, {
      content,
    });
    return {
      success: response.data.success,
      message: response.data.message,
      data: {
        comment: PostComment.fromMap(response.data.data.comment),
      },
    };
  },

  // 댓글 삭제
  deleteComment: async (commentId: string) => {
    const response = await apiClient.delete(`/api/comment/${commentId}`);
    return {
      success: response.data.success,
      message: response.data.message,
    };
  },

  // 댓글 여러 개 삭제
  deleteComments: async (ids: string[]): Promise<DeleteCommentsResponse> => {
    const response = await apiClient.delete("/api/comment", {
      data: { ids },
    });
    return {
      success: response.data.success,
      message: response.data.message,
      data: {
        success: response.data.data?.success || [],
        failed: response.data.data?.failed || [],
      },
    };
  },

  // 나의 댓글 목록 조회
  getMyComments: async (params: {
    page?: number;
    limit?: number;
    sort?: string; // 정렬 필드 (현재는 "created_at"만 지원)
    order?: "asc" | "desc"; // 정렬 방향
  }): Promise<GetMyCommentsResponse> => {
    // 쿼리 파라미터 구성
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", String(params.page));
    if (params?.limit) queryParams.append("limit", String(params.limit));
    if (params?.sort) queryParams.append("sort", params.sort);
    if (params?.order) queryParams.append("order", params.order);

    const queryString = queryParams.toString();
    const url = `/api/comment/me${queryString ? `?${queryString}` : ""}`;

    const response = await apiClient.get(url);

    const result: GetMyCommentsResponse = {
      success: response.data.success,
      message: response.data.message,
      data: {
        comments: (response.data.data?.comments || []).map((comment: any) =>
          PostComment.fromMap(comment)
        ),
        totalCount: response.data.data?.totalCount,
        page: response.data.data?.page,
        limit: response.data.data?.limit,
        totalPages: response.data.data?.totalPages,
        hasNextPage: response.data.data?.hasNextPage,
        hasPrevPage: response.data.data?.hasPrevPage,
        // post 정보도 함께 반환 (게시글이 삭제된 경우 null)
        posts: (response.data.data?.comments || []).map((comment: any) =>
          comment.post
            ? {
                id: comment.post.id,
                title: comment.post.title,
                category: comment.post.category as PostCategory,
              }
            : null
        ),
      },
    };

    return result;
  },
};

export default postCommentApi;
