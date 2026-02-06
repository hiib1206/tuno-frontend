"use client";

import postApi from "@/api/postApi";
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
import { MYLIKES_LIST_LIMIT } from "@/lib/community";
import { cn, formatDateTime } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import { useCommunityStatsStore } from "@/stores/communityStatsStore";
import { categoryToUrlPath } from "@/types/Common";
import { Post } from "@/types/Post";
import {
  AlertCircle,
  ArrowUpDown,
  Heart,
  Loader2,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ErrorState } from "../feedback/error-state";

export default function MyLikes() {
  const { isAuthLoading } = useAuthStore();
  const { toast } = useToast();
  const { fetchStats } = useCommunityStatsStore();
  // 선택된 게시글 ID들을 관리하는 state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unliking, setUnliking] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isUnlikeDialogOpen, setIsUnlikeDialogOpen] = useState(false);
  // 좋아요 취소 실패한 게시글 ID와 메시지를 관리하는 state
  const [failedPostIds, setFailedPostIds] = useState<Map<string, string>>(
    new Map()
  );
  // 정렬 순서 state
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // 좋아요한 게시글 목록 조회
  const fetchLikedPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await postApi.getLikedPosts({
        page: currentPage,
        limit: MYLIKES_LIST_LIMIT,
        order: sortOrder,
      });
      if (response.success) {
        setPosts(response.data.list);
        setTotalPages(response.data.totalPages || 1);
        setTotalCount(response.data.totalCount || 0);
      } else {
        setError("좋아요한 게시글을 불러오는데 실패했습니다.");
      }
    } catch (err) {
      setError("좋아요한 게시글을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 인증 로딩 중이면 기다림
    if (isAuthLoading) return;
    fetchLikedPosts();
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

  // 전체 선택 상태 계산 - 현재 페이지의 게시글만 확인
  const isAllSelected =
    posts.length > 0 && posts.every((post) => selectedIds.has(post.id));

  // 전체 선택/해제 핸들러
  const handleSelectAll = (checked: boolean) => {
    const newSelectedIds = new Set(selectedIds);

    if (checked) {
      // 현재 페이지의 모든 게시글을 선택 (다른 페이지 선택은 유지)
      posts.forEach((post) => newSelectedIds.add(post.id));
    } else {
      // 현재 페이지의 게시글만 해제 (다른 페이지 선택은 유지)
      posts.forEach((post) => newSelectedIds.delete(post.id));
    }

    setSelectedIds(newSelectedIds);
  };

  // 개별 선택/해제 핸들러
  const handleSelectItem = (postId: string, checked: boolean) => {
    const newSelectedIds = new Set(selectedIds);
    if (checked) {
      newSelectedIds.add(postId);
    } else {
      newSelectedIds.delete(postId);
    }
    setSelectedIds(newSelectedIds);
  };

  // 여러 게시글 좋아요 취소 핸들러
  const handleUnlikePosts = () => {
    if (selectedIds.size === 0) {
      toast({
        title: "선택된 게시글이 없습니다.",
        variant: "destructive",
      });
      return;
    }

    // 다이얼로그 열기
    setIsUnlikeDialogOpen(true);
  };

  // 실제 좋아요 취소 실행 함수
  const executeUnlike = async () => {
    try {
      setUnliking(true);
      const idsArray = Array.from(selectedIds);
      const response = await postApi.togglePostLikes(idsArray);

      if (response.success) {
        const successCount = response.data.success.length;
        const failedCount = response.data.failed.length;

        // 실패한 게시글 ID와 메시지 저장
        const failedMap = new Map<string, string>();
        response.data.failed.forEach((item) => {
          failedMap.set(item.id, item.message);
        });
        setFailedPostIds(failedMap);

        // 성공한 항목만 선택 해제
        const newSelectedIds = new Set(selectedIds);
        response.data.success.forEach((item) => {
          newSelectedIds.delete(item.id);
        });
        setSelectedIds(newSelectedIds);
        setIsUnlikeDialogOpen(false);

        // 좋아요 취소 후 서버에서 현재 페이지 데이터 다시 조회
        const refreshResponse = await postApi.getLikedPosts({
          page: currentPage,
          limit: MYLIKES_LIST_LIMIT,
          order: sortOrder,
        });

        if (refreshResponse.success) {
          const newTotalCount = refreshResponse.data.totalCount || 0;
          const newPosts = refreshResponse.data.list;
          const newTotalPages = refreshResponse.data.totalPages || 1;

          // 서버 기준으로 최대 페이지 계산
          const maxPage = Math.max(
            1,
            Math.ceil(newTotalCount / MYLIKES_LIST_LIMIT)
          );

          // 현재 페이지에 게시글이 없고, 이전 페이지가 있으면 이전 페이지로 이동
          if (newPosts.length === 0 && currentPage > 1) {
            setCurrentPage(currentPage - 1);
            // useEffect가 currentPage 변경을 감지하여 fetchLikedPosts() 호출
          } else if (currentPage > maxPage && maxPage > 0) {
            // 현재 페이지가 최대 페이지를 초과하면 최대 페이지로 조정
            setCurrentPage(maxPage);
            // useEffect가 currentPage 변경을 감지하여 fetchLikedPosts() 호출
          } else {
            // 현재 페이지 유지하며 데이터만 업데이트
            setPosts(newPosts);
            setTotalPages(newTotalPages);
            setTotalCount(newTotalCount);
          }
        } else {
          // 서버 조회 실패 시 기존 방식으로 폴백
          fetchLikedPosts();
        }

        if (failedCount > 0) {
          toast({
            title: `${successCount}개 취소 완료, ${failedCount}개 실패`,
            description: "실패한 게시글은 빨간색 테두리로 표시됩니다.",
            variant: "destructive",
          });
          // 5초 후 실패 표시 제거
          setTimeout(() => {
            setFailedPostIds(new Map());
          }, 5000);
        } else {
          setFailedPostIds(new Map());
          toast({
            title: `${successCount}개의 좋아요가 취소되었습니다.`,
          });
        }

        // 통계 새로고침
        await fetchStats();
      } else {
        toast({
          title: "좋아요 취소에 실패했습니다.",
          description: response.message,
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "좋아요 취소 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setUnliking(false);
    }
  };

  return (
    <div className="flex-1 rounded-lg bg-background-1 py-4 px-4 md:px-6">
      <h2 className="mb-6 text-lg sm:text-xl font-semibold">
        내가 보낸 좋아요
      </h2>

      {loading ? (
        <div className="min-h-[600px] mt-2">
          {/* 통계 및 좋아요 취소 버튼 영역 skeleton */}
          <div className="flex justify-between items-center">
            <div className="h-3 w-20 skeleton-gradient-loading rounded" />
            <div className="flex items-center gap-2">
              <div className="h-6 w-20 skeleton-gradient-loading rounded" />
              <div className="h-6 w-16 skeleton-gradient-loading rounded" />
            </div>
          </div>
          <div className="h-px border-t border-border-2 mt-2" />
          {/* 컬럼 헤더 skeleton */}
          <div className="h-10 w-full skeleton-gradient-loading rounded" />
          <div className="h-px border-t border-border-2" />
          {/* 좋아요 리스트 skeleton - 한 덩어리 */}
          <div className="py-2">
            <div className="h-[480px] w-full skeleton-gradient-loading rounded" />
          </div>
        </div>
      ) : error ? (
        <div className="py-48">
          <ErrorState
            message={error ?? "좋아요한 게시글을 불러오는데 실패했습니다."}
          />
        </div>
      ) : (
        <div className="min-h-[600px] mt-2">
          {/* 통계 및 좋아요 취소 버튼 영역 */}
          <div className="flex justify-between items-center">
            <div className="text-xs text-muted-foreground">
              좋아요<span className="mx-1">:</span>
              <span className="font-semibold text-foreground">
                {totalCount}
              </span>
              개
            </div>
            <div className="flex items-center">
              <Button
                size="xxs"
                variant="destructive"
                onClick={handleUnlikePosts}
                disabled={selectedIds.size === 0 || unliking}
                className="flex items-center gap-2"
              >
                {unliking && <Loader2 className="h-2.5 w-2.5 animate-spin" />}
                <span>
                  {unliking
                    ? "취소 중..."
                    : `${
                        selectedIds.size > 0 ? `( ${selectedIds.size}개 ) ` : ""
                      } 좋아요 취소`}
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

              {/* 제목 헤더 */}
              <div className="flex-1 flex justify-center min-w-0">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  제목
                </span>
              </div>
              <div className="flex flex-row items-center">
                {/* 작성자 헤더 */}
                <div className="w-20 flex justify-center flex-shrink-0">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    작성자
                  </span>
                </div>
                {/* 작성일 헤더 */}
                <div className="w-26 flex justify-center flex-shrink-0">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    작성일
                  </span>
                </div>

                {/* 조회수 헤더 */}
                <div className="w-12 flex justify-center flex-shrink-0">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    조회수
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="h-px border-t border-border-2" />
          <div className="flex flex-col">
            {posts.map((post) => {
              const isFailed = failedPostIds.has(post.id);
              const failedMessage = failedPostIds.get(post.id);
              const postContent = (
                <div
                  className={`group hover:bg-background-2 transition-colors duration-200 border-b border-border-2`}
                >
                  <div className="py-3 px-2">
                    <div className="px-2 flex items-center gap-4">
                      {/* 체크박스 */}
                      <Checkbox
                        className="size-3.5"
                        checked={selectedIds.has(post.id)}
                        onCheckedChange={(checked) =>
                          handleSelectItem(post.id, checked as boolean)
                        }
                      />

                      {/* 제목 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-3">
                            <Link
                              href={`/community/posts/${categoryToUrlPath(
                                post.category
                              )}/${post.id}`}
                              className={`text-sm font-medium line-clamp-1 group-hover:text-accent-text transition-colors duration-300 hover:underline text-foreground"
                              }`}
                            >
                              {post.title}
                            </Link>
                            {/* 좋아요와 댓글 수 */}
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Heart className="h-3 w-3" />
                                <span>{post.likeCount}</span>
                              </div>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <MessageSquare className="h-3 w-3" />
                                <span>{post.commentCount}</span>
                              </div>
                            </div>
                          </div>
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
                        {/* 작성자 */}
                        <div className="w-20 flex justify-center text-xs text-muted-foreground flex-shrink-0">
                          <span className="line-clamp-1">
                            {post.author?.nick || "알 수 없음"}
                          </span>
                        </div>
                        {/* 작성일 */}
                        <div className="w-26 flex justify-center text-xs text-muted-foreground flex-shrink-0">
                          {formatDateTime(post.createdAt)}
                        </div>
                        {/* 조회수 */}
                        <div className="w-12 flex justify-center text-xs text-muted-foreground flex-shrink-0">
                          <span>{post.viewCount}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );

              return (
                <div key={post.id}>
                  {isFailed ? <Shake>{postContent}</Shake> : postContent}
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

      {/* 좋아요 취소 확인 다이얼로그 */}
      <ConfirmDialog
        open={isUnlikeDialogOpen}
        onOpenChange={setIsUnlikeDialogOpen}
        title="좋아요 취소"
        description={`정말로 ${selectedIds.size}개의 게시글에 좋아요를 취소하시겠습니까?`}
        onConfirm={executeUnlike}
        isProcessing={unliking}
        confirmText="취소"
        cancelText="닫기"
        variant="destructive"
      />
    </div>
  );
}
