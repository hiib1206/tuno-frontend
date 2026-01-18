"use client";

import postCommentApi from "@/api/commentApi";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Pagination } from "@/components/ui/pagination";
import { Shake } from "@/components/ui/shake";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/useToast";
import { COMMENT_LIST_LIMIT } from "@/lib/community";
import { cn, formatRelativeTime } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import { PostComment } from "@/types/Comment";
import { MessageSquare, Pencil, Send, Trash2, XCircle } from "lucide-react";
import { useEffect, useState } from "react";

interface CommentSectionProps {
  postId: string; // 게시글 ID
  isLoggedIn?: boolean;
  commentsPerPage?: number; // 페이지당 댓글 수
}

export function CommentSection({ postId, isLoggedIn }: CommentSectionProps) {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [comments, setComments] = useState<PostComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // 댓글 목록 조회 에러
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null); // 댓글 작성 에러
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null); // 댓글 수정 에러
  // 답글 쓰기 관련
  const [replyingToCommentId, setReplyingToCommentId] = useState<string | null>(
    null
  );
  const [replyContent, setReplyContent] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);
  // 삭제 다이얼로그 관련
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [commentIdToDelete, setCommentIdToDelete] = useState<string | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);
  // 페이지네이션 관련
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  // 정렬 관련
  const [order, setOrder] = useState<"asc" | "desc">("asc"); // 기본값: 등록순

  // 댓글 목록 조회
  // 인자로 page와 silent 여부를 받습니다. 기본값은 false (로딩 보여줌)
  const fetchComments = async (page: number = 1, isSilent = false) => {
    if (!postId) return;

    try {
      // 1. 처음 들어왔을 때만 로딩 스피너를 보여줍니다.
      if (!isSilent) setIsLoading(true);

      setError(null);
      const response = await postCommentApi.getComments(postId, {
        page,
        limit: COMMENT_LIST_LIMIT,
        order,
      });
      if (response.success && response.data.list) {
        // 2. 새 데이터를 받아오면 기존 comments를 덮어씁니다.
        // 이때 기존 목록이 화면에 계속 떠 있었으므로 레이아웃이 깨지지 않습니다.
        setComments(response.data.list);
        // 페이지네이션 정보 업데이트
        setCurrentPage(response.data.page || 1);
        setTotalPages(response.data.totalPages || 1);
        setTotal(response.data.total || 0);
      } else {
        setError("댓글 조회 실패");
      }
    } catch {
      setError("댓글 조회 실패");
    } finally {
      // 3. 로딩 상태 해제
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
    fetchComments(1);
  }, [postId, order]);

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchComments(page);
    // 페이지 변경 시 스크롤을 댓글 섹션 상단으로 이동
    const commentSection = document.getElementById("comment-section");
    if (commentSection) {
      commentSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      setSubmitError(null);

      const response = await postCommentApi.createComment(
        postId,
        newComment.trim(),
        {}
      );

      if (response.success) {
        setNewComment("");
        setSubmitError(null);
        // 댓글 작성 후 첫 페이지로 이동하여 새 댓글 확인
        setCurrentPage(1);
        await fetchComments(1, true);
      } else {
        setSubmitError("댓글 작성 실패");
      }
    } catch (err: any) {
      if (
        err.response?.status === 400 ||
        err.response?.status === 403 ||
        err.response?.status === 404
      ) {
        setSubmitError(err.response?.data?.message);
      } else {
        setSubmitError("댓글 작성 실패");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (commentId: string, currentContent: string) => {
    setEditingCommentId(commentId);
    setEditContent(currentContent);
    setEditError(null);
  };

  const handleSaveEdit = async (commentId: string) => {
    if (!editContent.trim()) return;

    try {
      setIsSubmittingEdit(true);
      setEditError(null);

      const response = await postCommentApi.updateComment(
        commentId,
        editContent.trim()
      );

      if (response.success) {
        setEditingCommentId(null);
        setEditContent("");
        setEditError(null);
        // 현재 페이지 새로고침
        await fetchComments(currentPage, true);
      } else {
        setEditError("댓글 수정 실패");
      }
    } catch (err: any) {
      if (
        err.response?.status === 400 ||
        err.response?.status === 403 ||
        err.response?.status === 404
      ) {
        setEditError(err.response?.data?.message);
      } else {
        setEditError("댓글 수정 실패");
      }
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  const handleDeleteClick = (commentId: string) => {
    setCommentIdToDelete(commentId);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!commentIdToDelete) return;

    try {
      setIsDeleting(true);
      const response = await postCommentApi.deleteComment(commentIdToDelete);

      if (response.success) {
        await fetchComments(currentPage, true);
      }
    } catch (err: any) {
      if (
        err.response?.status === 400 ||
        err.response?.status === 403 ||
        err.response?.status === 404
      ) {
        toast({
          description: err.response?.data?.message,
          variant: "destructive",
        });
      } else {
        toast({
          description: "댓글 삭제 중 오류가 발생했습니다.",
          variant: "destructive",
        });
      }
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setCommentIdToDelete(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditContent("");
    setEditError(null);
  };

  const handleStartReply = (commentId: string) => {
    setReplyingToCommentId(commentId);
    setReplyContent("");
    setReplyError(null);
  };

  const handleCancelReply = () => {
    setReplyingToCommentId(null);
    setReplyContent("");
    setReplyError(null);
  };

  const handleSubmitReply = async (parentCommentId: string) => {
    if (!replyContent.trim() || isSubmittingReply) return;

    try {
      setIsSubmittingReply(true);
      setReplyError(null);

      const response = await postCommentApi.createComment(
        postId,
        replyContent.trim(),
        {
          parentId: parentCommentId,
        }
      );

      if (response.success) {
        setReplyingToCommentId(null);
        setReplyContent("");
        setReplyError(null);
        // 현재 페이지 새로고침
        await fetchComments(currentPage, true);
      } else {
        setReplyError("답글 작성 실패");
      }
    } catch {
      setReplyError("답글 작성 실패");
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const renderAvatar = (author?: {
    nick?: string;
    profileImageUrl?: string | null;
  }) => (
    <Avatar className="h-8 w-8 flex-shrink-0">
      <AvatarImage
        src={author?.profileImageUrl || undefined}
        alt={author?.nick}
      />
      <AvatarFallback className="text-sm">
        {author?.nick?.charAt(0).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );

  // 수정 모드 컴포넌트
  const renderEditMode = (
    commentId: string,
    author?: {
      nick?: string;
      profileImageUrl?: string | null;
    } | null
  ) => (
    <div className="space-y-3">
      <div className="flex items-start gap-3">
        {renderAvatar(author || undefined)}
        <div className="flex-1 space-y-2">
          <Textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="min-h-[80px]"
            maxLength={1000}
            rows={3}
          />
          <div className="flex justify-end items-center gap-2 relative">
            {editError && (
              <Shake className="text-xs text-destructive absolute left-0 top-0">
                {editError}
              </Shake>
            )}
            <Button
              variant="default-destructive"
              size="sm"
              onClick={handleCancelEdit}
              disabled={isSubmittingEdit}
            >
              취소
            </Button>
            <Button
              variant="default-accent"
              size="sm"
              onClick={() => handleSaveEdit(commentId)}
              disabled={!editContent.trim() || isSubmittingEdit}
            >
              {isSubmittingEdit ? "저장 중..." : "저장"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  // 정렬 변경 핸들러
  const handleSortChange = (newOrder: "asc" | "desc") => {
    setOrder(newOrder);
    setCurrentPage(1);
  };

  return (
    <div id="comment-section" className="w-full space-y-2">
      {/* 댓글 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button
            variant="default-accent"
            size="sm"
            className={cn("h-7 px-1.5", order === "asc" && "text-accent")}
            onClick={() => handleSortChange("asc")}
          >
            등록순
          </Button>
          <Button
            variant="default-accent"
            size="sm"
            className={cn("h-7 px-1.5", order === "desc" && "text-accent")}
            onClick={() => handleSortChange("desc")}
          >
            최신순
          </Button>
        </div>
      </div>

      {/* 댓글 작성 폼 */}
      {isLoggedIn ? (
        <Card className="p-4 bg-background-2 border-none">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex items-start gap-3">
              {renderAvatar(user || undefined)}
              <div className="flex-1 space-y-2">
                <Textarea
                  placeholder="댓글을 입력하세요. (최대 1000자)"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-[80px]"
                  maxLength={1000}
                  rows={3}
                />
                <div className="flex justify-end items-center gap-2 relative">
                  {submitError && (
                    <Shake className="text-xs text-destructive absolute left-0 top-0">
                      {submitError}
                    </Shake>
                  )}
                  <Button
                    variant="default-accent"
                    type="submit"
                    size="sm"
                    disabled={!newComment.trim() || isSubmitting}
                  >
                    <Send className="h-4 w-4" />
                    {isSubmitting ? "등록 중..." : "등록"}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </Card>
      ) : (
        <Card className="p-4 bg-background-1">
          <div className="text-center py-4 text-muted-foreground">
            댓글을 작성하려면 로그인이 필요합니다.
          </div>
        </Card>
      )}

      {/* 댓글 목록 */}
      <div>
        {isLoading ? (
          <div className="p-8">
            <div className="text-center text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>댓글을 불러오는 중...</p>
            </div>
          </div>
        ) : error ? (
          <div className="p-8">
            <div className="text-center text-muted-foreground">
              <XCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-destructive">{error}</p>
              <p className="text-sm mt-1">잠시 후 다시 시도해주세요.</p>
            </div>
          </div>
        ) : comments.length === 0 ? (
          <div className="p-8">
            <div className="text-center text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>아직 댓글이 없습니다.</p>
              <p className="text-sm mt-1">첫 번째 댓글을 작성해보세요!</p>
            </div>
          </div>
        ) : (
          <>
            {comments.map((comment) => (
              <div key={comment.id} className="p-4 border-b border-border-2">
                {editingCommentId === comment.id ? (
                  // 수정 모드
                  renderEditMode(comment.id, comment.author)
                ) : (
                  // 일반 모드
                  <div className="">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        {renderAvatar(comment.author || undefined)}
                        <div className="flex-1 space-y-6">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-foreground">
                              {comment.author?.nick || "알 수 없음"}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatRelativeTime(comment.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm text-foreground whitespace-pre-wrap">
                            {comment.content}
                          </p>
                        </div>
                      </div>

                      {/* 수정/삭제 버튼 (작성자만) */}
                      {isLoggedIn &&
                        comment.author &&
                        user?.id === Number(comment.author.id) && (
                          <div className="flex items-center gap-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 hover:scale-110"
                                  onClick={() =>
                                    handleEdit(comment.id, comment.content)
                                  }
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>수정</p>
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  className="h-8 w-8 p-0 hover:scale-110"
                                  onClick={() => handleDeleteClick(comment.id)}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>삭제</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        )}
                    </div>

                    {/* 답글 쓰기 버튼 */}
                    {isLoggedIn && (
                      <div className="mt-4 ml-8 flex items-end">
                        <Button
                          size="sm"
                          className="h-3 text-xs text-muted-foreground hover:text-foreground"
                          onClick={() => handleStartReply(comment.id)}
                        >
                          답글 쓰기
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* 답글 작성 폼 */}
                {replyingToCommentId === comment.id && isLoggedIn && (
                  <Card className="mt-3 ml-12 p-4 bg-background-2 border-none">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleSubmitReply(comment.id);
                      }}
                      className="space-y-3"
                    >
                      <div className="flex items-start gap-3">
                        {renderAvatar(user || undefined)}
                        <div className="flex-1 space-y-2">
                          <Textarea
                            placeholder="답글을 입력하세요. (최대 1000자)"
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            className="min-h-[80px]"
                            maxLength={1000}
                            rows={3}
                          />
                          <div className="flex justify-end items-center relative">
                            {replyError && (
                              <Shake className="text-xs text-destructive absolute left-0 top-0">
                                {replyError}
                              </Shake>
                            )}
                            <Button
                              type="button"
                              variant="default-destructive"
                              size="sm"
                              onClick={handleCancelReply}
                              disabled={isSubmittingReply}
                            >
                              취소
                            </Button>
                            <Button
                              variant="default-accent"
                              type="submit"
                              size="sm"
                              disabled={
                                !replyContent.trim() || isSubmittingReply
                              }
                            >
                              <Send className="h-4 w-4" />
                              {isSubmittingReply ? "등록 중..." : "등록"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </form>
                  </Card>
                )}

                {/* 대댓글 */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="ml-12 mt-4 space-y-6 border-l-2 border-border pl-4">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="space-y-3">
                        {editingCommentId === reply.id ? (
                          // 수정 모드
                          renderEditMode(reply.id, reply.author)
                        ) : (
                          // 일반 모드
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3 flex-1">
                              {renderAvatar(reply.author || undefined)}
                              <div className="flex-1 space-y-4">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-foreground">
                                    {reply.author?.nick || "알 수 없음"}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {formatRelativeTime(reply.createdAt)}
                                  </span>
                                  {/* 수정/삭제 버튼 (작성자만) */}
                                  {isLoggedIn &&
                                    reply.author &&
                                    user?.id === Number(reply.author.id) && (
                                      <div className="p-0 flex items-center">
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="!p-1 hover:scale-110"
                                              onClick={() =>
                                                handleEdit(
                                                  reply.id,
                                                  reply.content
                                                )
                                              }
                                            >
                                              <Pencil className="!h-3.5 !w-3.5" />
                                            </Button>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p>수정</p>
                                          </TooltipContent>
                                        </Tooltip>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <Button
                                              variant="destructive"
                                              size="sm"
                                              className="!p-1 hover:scale-110"
                                              onClick={() =>
                                                handleDeleteClick(reply.id)
                                              }
                                            >
                                              <Trash2 className="!h-3.5 !w-3.5" />
                                            </Button>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p>삭제</p>
                                          </TooltipContent>
                                        </Tooltip>
                                      </div>
                                    )}
                                </div>
                                <p className="text-sm text-foreground whitespace-pre-wrap">
                                  {reply.content}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* 페이지네이션 */}
            {totalPages > 1 ? (
              <div className="pt-6 pb-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  isLoading={isLoading}
                />
              </div>
            ) : (
              <div className="h-6"></div>
            )}
          </>
        )}
      </div>

      {/* 삭제 확인 다이얼로그 */}
      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="댓글 삭제"
        description="정말로 이 댓글을 삭제하시겠습니까?"
        onConfirm={handleDelete}
        isProcessing={isDeleting}
        confirmText="삭제"
        cancelText="취소"
        variant="destructive"
      />
    </div>
  );
}
