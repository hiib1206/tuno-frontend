import { PostComment } from "@/types/Comment";
import { PostCategory } from "@/types/Common";
import apiClient from "./apiClient";

/** 나의 댓글 목록 조회 응답 */
export interface GetMyCommentsResponse {
  success: boolean;
  message: string;
  data: {
    /** 댓글 목록 */
    comments: PostComment[];
    /** 전체 댓글 수 */
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
    /** 댓글이 속한 게시글 정보 (삭제된 게시글은 null) */
    posts: ({ id: string; title: string; category: PostCategory } | null)[];
  };
}

/** 댓글 삭제 결과 항목 */
export interface DeleteCommentResult {
  /** 댓글 ID */
  id: string;
  /** 결과 메시지 */
  message: string;
}

/** 여러 댓글 삭제 응답 */
export interface DeleteCommentsResponse {
  success: boolean;
  message: string;
  data: {
    /** 삭제 성공 목록 */
    success: DeleteCommentResult[];
    /** 삭제 실패 목록 */
    failed: DeleteCommentResult[];
  };
}

/**
 * 게시글 댓글 관련 API
 *
 * @remarks
 * 댓글 CRUD, 대댓글, 나의 댓글 조회 등을 처리한다.
 */
const postCommentApi = {
  /**
   * 게시글의 댓글 목록을 조회한다.
   *
   * @param postId - 게시글 ID
   * @param params - 쿼리 파라미터
   * @param params.page - 페이지 번호
   * @param params.limit - 페이지당 항목 수
   * @param params.order - 정렬 순서 (asc: 등록순, desc: 최신순)
   */
  getComments: async (
    postId: string,
    params: {
      page?: number;
      limit?: number;
      order?: "asc" | "desc";
    }
  ) => {
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

  /**
   * 댓글을 작성한다.
   *
   * @param postId - 게시글 ID
   * @param content - 댓글 내용
   * @param params - 추가 옵션
   * @param params.parentId - 부모 댓글 ID (대댓글인 경우)
   */
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

  /**
   * 댓글을 수정한다.
   *
   * @param commentId - 댓글 ID
   * @param content - 수정할 내용
   */
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

  /**
   * 댓글을 삭제한다.
   *
   * @param commentId - 댓글 ID
   */
  deleteComment: async (commentId: string) => {
    const response = await apiClient.delete(`/api/comment/${commentId}`);
    return {
      success: response.data.success,
      message: response.data.message,
    };
  },

  /**
   * 여러 댓글을 일괄 삭제한다.
   *
   * @param ids - 삭제할 댓글 ID 배열
   */
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

  /**
   * 내가 작성한 댓글 목록을 조회한다.
   *
   * @param params - 쿼리 파라미터
   * @param params.page - 페이지 번호
   * @param params.limit - 페이지당 항목 수
   * @param params.sort - 정렬 필드 (현재 "created_at"만 지원)
   * @param params.order - 정렬 방향
   */
  getMyComments: async (params: {
    page?: number;
    limit?: number;
    sort?: string;
    order?: "asc" | "desc";
  }): Promise<GetMyCommentsResponse> => {
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
