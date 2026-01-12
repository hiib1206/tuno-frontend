"use client";

import postCommentApi from "@/api/commentApi";
import { LoadingState } from "@/components/feedback/loading-state";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Pagination } from "@/components/ui/pagination";
import { Shake } from "@/components/ui/shake";
import { useToast } from "@/hooks/useToast";
import { MYCOMMENTS_LIST_LIMIT } from "@/lib/community";
import { cn, formatDateTime } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import { useCommunityStatsStore } from "@/stores/communityStatsStore";
import { PostComment } from "@/types/Comment";
import {
  categoryToUrlPath,
  PostCategory,
  PostCategoryLabels,
} from "@/types/Common";
import { AlertCircle, ArrowUpDown, Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ErrorState } from "../feedback/error-state";

export default function MyComments() {
  const { isAuthLoading } = useAuthStore();
  const { toast } = useToast();
  const { fetchStats } = useCommunityStatsStore();
  // 선택된 댓글 ID들을 관리하는 state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [comments, setComments] = useState<PostComment[]>([]);
  const [posts, setPosts] = useState<
    ({ id: string; title: string; category: string } | null)[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  // 삭제 실패한 댓글 ID와 메시지를 관리하는 state
  const [failedCommentIds, setFailedCommentIds] = useState<Map<string, string>>(
    new Map()
  );
  // 정렬 순서 state
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // 댓글 목록 조회
  const fetchComments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await postCommentApi.getMyComments({
        page: currentPage,
        limit: MYCOMMENTS_LIST_LIMIT,
        sort: "created_at",
        order: sortOrder,
      });
      if (response.success) {
        setComments(response.data.comments);
        setPosts(response.data.posts);
        setTotalPages(response.data.totalPages || 1);
        setTotalCount(response.data.totalCount || 0);
      } else {
        setError("댓글을 불러오는데 실패했습니다.");
      }
    } catch (err) {
      setError("댓글을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 인증 로딩 중이면 기다림
    if (isAuthLoading) return;
    fetchComments();
  }, [isAuthLoading, currentPage, sortOrder]);

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // 페이지 상단으로 스크롤 (선택사항)
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 정렬 변경 핸들러
  const handleSortChange = (order: "asc" | "desc") => {
    setSortOrder(order);
    setCurrentPage(1); // 정렬 변경 시 첫 페이지로 이동
  };

  // 전체 선택 상태 계산 - 현재 페이지의 댓글만 확인
  const isAllSelected =
    comments.length > 0 &&
    comments.every((comment) => selectedIds.has(comment.id));

  // 전체 선택/해제 핸들러
  const handleSelectAll = (checked: boolean) => {
    const newSelectedIds = new Set(selectedIds);

    if (checked) {
      // 현재 페이지의 모든 댓글을 선택 (다른 페이지 선택은 유지)
      comments.forEach((comment) => newSelectedIds.add(comment.id));
    } else {
      // 현재 페이지의 댓글만 해제 (다른 페이지 선택은 유지)
      comments.forEach((comment) => newSelectedIds.delete(comment.id));
    }

    setSelectedIds(newSelectedIds);
  };

  // 개별 선택/해제 핸들러
  const handleSelectItem = (commentId: string, checked: boolean) => {
    const newSelectedIds = new Set(selectedIds);
    if (checked) {
      newSelectedIds.add(commentId);
    } else {
      newSelectedIds.delete(commentId);
    }
    setSelectedIds(newSelectedIds);
  };

  // 여러 댓글 삭제 핸들러
  const handleDeleteComments = () => {
    if (selectedIds.size === 0) {
      toast({
        title: "선택된 댓글이 없습니다.",
        variant: "destructive",
      });
      return;
    }

    // 다이얼로그 열기
    setIsDeleteDialogOpen(true);
  };

  // 실제 삭제 실행 함수
  const executeDelete = async () => {
    try {
      setDeleting(true);
      const idsArray = Array.from(selectedIds);
      const response = await postCommentApi.deleteComments(idsArray);

      if (response.success) {
        const successCount = response.data.success.length;
        const failedCount = response.data.failed.length;

        // 실패한 댓글 ID와 메시지 저장
        const failedMap = new Map<string, string>();
        response.data.failed.forEach((item) => {
          failedMap.set(item.id, item.message);
        });
        setFailedCommentIds(failedMap);

        // 성공한 항목만 선택 해제
        const newSelectedIds = new Set(selectedIds);
        response.data.success.forEach((item) => {
          newSelectedIds.delete(item.id);
        });
        setSelectedIds(newSelectedIds);
        setIsDeleteDialogOpen(false);

        // 삭제 후 서버에서 현재 페이지 데이터 다시 조회
        const refreshResponse = await postCommentApi.getMyComments({
          page: currentPage,
          limit: MYCOMMENTS_LIST_LIMIT,
          sort: "created_at",
          order: sortOrder,
        });

        if (refreshResponse.success) {
          const newTotalCount = refreshResponse.data.totalCount || 0;
          const newComments = refreshResponse.data.comments;
          const newPosts = refreshResponse.data.posts;
          const newTotalPages = refreshResponse.data.totalPages || 1;

          // 서버 기준으로 최대 페이지 계산
          const maxPage = Math.max(
            1,
            Math.ceil(newTotalCount / MYCOMMENTS_LIST_LIMIT)
          );

          // 현재 페이지에 댓글이 없고, 이전 페이지가 있으면 이전 페이지로 이동
          if (newComments.length === 0 && currentPage > 1) {
            setCurrentPage(currentPage - 1);
            // useEffect가 currentPage 변경을 감지하여 fetchComments() 호출
          } else if (currentPage > maxPage && maxPage > 0) {
            // 현재 페이지가 최대 페이지를 초과하면 최대 페이지로 조정
            setCurrentPage(maxPage);
            // useEffect가 currentPage 변경을 감지하여 fetchComments() 호출
          } else {
            // 현재 페이지 유지하며 데이터만 업데이트
            setComments(newComments);
            setPosts(newPosts);
            setTotalPages(newTotalPages);
            setTotalCount(newTotalCount);
          }
        } else {
          // 서버 조회 실패 시 기존 방식으로 폴백
          fetchComments();
        }

        if (failedCount > 0) {
          toast({
            title: `${successCount}개 삭제 완료, ${failedCount}개 실패`,
            description: "실패한 댓글은 빨간색 테두리로 표시됩니다.",
            variant: "destructive",
          });
          // 5초 후 실패 표시 제거
          setTimeout(() => {
            setFailedCommentIds(new Map());
          }, 5000);
        } else {
          setFailedCommentIds(new Map());
          toast({
            title: `${successCount}개의 댓글이 삭제되었습니다.`,
          });
        }

        // 통계 새로고침
        await fetchStats();
      } else {
        toast({
          title: "삭제에 실패했습니다.",
          description: response.message,
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "삭제 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex-1 rounded-lg bg-background-1 py-4 px-4 md:px-6">
      <h2 className="mb-6 text-lg sm:text-xl font-semibold">나의 댓글</h2>

      {loading ? (
        <div className="py-35">
          <LoadingState message="댓글을 불러오는 중..." />
        </div>
      ) : error ? (
        <div className="py-48">
          <ErrorState message={error ?? "댓글을 불러오는데 실패했습니다."} />
        </div>
      ) : (
        <div className="min-h-[600px] mt-2">
          {/* 통계 및 삭제 버튼 영역 */}
          <div className="flex justify-between items-center">
            <div className="text-xs text-muted-foreground">
              댓글<span className="mx-1">:</span>
              <span className="font-semibold text-foreground">
                {totalCount}
              </span>
              개
            </div>
            <div className="flex items-center">
              <Button
                size="xxs"
                variant="destructive"
                onClick={handleDeleteComments}
                disabled={selectedIds.size === 0 || deleting}
                className="flex items-center gap-1"
              >
                {deleting && <Loader2 className="h-2.5 w-2.5 animate-spin" />}
                <span>
                  {deleting
                    ? "삭제 중..."
                    : `${
                        selectedIds.size > 0 ? `( ${selectedIds.size}개 ) ` : ""
                      } 삭제하기`}
                </span>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="default"
                    size="xxs"
                    className="flex items-center gap-1"
                  >
                    <ArrowUpDown className="h-2.5 w-2.5" />
                    <span>{sortOrder === "desc" ? "최신순" : "등록순"}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  sideOffset={0}
                  onCloseAutoFocus={(e) => e.preventDefault()}
                  className="w-auto min-w-[6rem]"
                >
                  <DropdownMenuItem
                    onClick={() => handleSortChange("desc")}
                    className={cn(
                      "cursor-pointer text-xs hover:text-accent-text",
                      sortOrder === "desc" && "text-accent-text"
                    )}
                  >
                    최신순
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleSortChange("asc")}
                    className={cn(
                      "cursor-pointer text-xs hover:text-accent-text",
                      sortOrder === "asc" && "text-accent-text"
                    )}
                  >
                    등록순
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <div className="h-px border-t border-border-2" />
          {/* 컬럼 헤더 */}
          <div className="py-3 px-2 bg-background-2/50">
            <div className="px-2 flex items-center gap-4">
              {/* 체크박스 헤더 */}
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  className="size-3.5"
                  checked={isAllSelected}
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-xs text-muted-foreground">전체 선택</span>
              </label>

              {/* 댓글 헤더 */}
              <div className="flex-1 flex justify-center min-w-0">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  댓글
                </span>
              </div>
              <div className="flex flex-row items-center">
                {/* 작성일 헤더 */}
                <div className="w-26 flex justify-center flex-shrink-0">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    작성일
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="h-px border-t border-border-2" />
          <div className="flex flex-col">
            {comments.map((comment, index) => {
              const isFailed = failedCommentIds.has(comment.id);
              const failedMessage = failedCommentIds.get(comment.id);
              const post = posts[index];
              const isEdited =
                comment.createdAt.getTime() !== comment.updatedAt.getTime();
              const commentContent = (
                <div
                  className={`group hover:bg-background-2 transition-colors duration-200 border-b border-border-2`}
                >
                  <div className="py-3 px-2">
                    <div className="px-2 flex items-center gap-4">
                      {/* 체크박스 */}
                      <Checkbox
                        className="size-3.5"
                        checked={selectedIds.has(comment.id)}
                        onCheckedChange={(checked) =>
                          handleSelectItem(comment.id, checked as boolean)
                        }
                      />

                      {/* 댓글 내용 및 게시글 정보 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col gap-1">
                          {/* 댓글 내용 */}
                          <p className="text-sm text-foreground line-clamp-2">
                            {comment.content}
                          </p>
                          {/* 게시글 제목 및 카테고리 */}
                          {post ? (
                            <Link
                              href={`/community/posts/${categoryToUrlPath(
                                post.category as PostCategory
                              )}/${post.id}`}
                              className="text-xs text-muted-foreground hover:text-accent-text transition-colors duration-300 hover:underline line-clamp-1"
                            >
                              [
                              {
                                PostCategoryLabels[
                                  post.category as PostCategory
                                ]
                              }
                              ] {post.title}
                            </Link>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              [삭제된 게시글]
                            </span>
                          )}
                          {/* 수정일 (수정된 경우만 표시) */}
                          {isEdited && (
                            <span className="text-xs text-muted-foreground">
                              수정일: {formatDateTime(comment.updatedAt)}
                            </span>
                          )}
                          {/* 실패 메시지 */}
                          {isFailed && failedMessage && (
                            <p className="text-xs text-destructive flex items-center gap-1">
                              <AlertCircle className="h-3 w-3 text-destructive flex-shrink-0" />
                              <span>{failedMessage}</span>
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-row items-center">
                        {/* 작성일 */}
                        <div className="w-26 flex justify-center text-xs text-muted-foreground flex-shrink-0">
                          {formatDateTime(comment.createdAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );

              return (
                <div key={comment.id}>
                  {isFailed ? <Shake>{commentContent}</Shake> : commentContent}
                </div>
              );
            })}
          </div>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                isLoading={loading}
              />
            </div>
          )}
        </div>
      )}

      {/* 삭제 확인 다이얼로그 */}
      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="댓글 삭제"
        description={`정말로 ${selectedIds.size}개의 댓글을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`}
        onConfirm={executeDelete}
        isProcessing={deleting}
        confirmText="삭제"
        cancelText="취소"
        variant="destructive"
      />
    </div>
  );
}
