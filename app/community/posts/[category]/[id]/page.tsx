"use client";

import postApi from "@/api/postApi";
import { CommentSection } from "@/components/community/CommentSection";
import TiptapEditor from "@/components/editor/TiptapEditor";
import { ErrorState } from "@/components/feedback/error-state";
import { LoadingState } from "@/components/feedback/loading-state";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuItemDestructive,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/useToast";
import { formatDateTime } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import { PostCategoryLabels, categoryToUrlPath } from "@/types/Common";
import { Post } from "@/types/Post";
import {
  ArrowLeft,
  Calendar,
  ChevronRight,
  Eye,
  Heart,
  MessageSquare,
  MoreVertical,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const category = params.category as string;
  const id = params.id as string;
  const [post, setPost] = useState<Post | null>(null);
  // 게시글 불러오는 중인지 확인
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const { user, isAuthLoading } = useAuthStore();
  const { toast } = useToast();

  useEffect(() => {
    if (isAuthLoading) return;

    const fetchPost = async () => {
      try {
        setIsLoading(true);
        const response = await postApi.getPostById(id);
        if (response.success && response.data.post) {
          setPost(response.data.post);
        } else {
          setError("게시글을 불러오는 중 오류가 발생했습니다.");
        }
      } catch (err: any) {
        setError("게시글을 불러오는 중 오류가 발생했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchPost();
    }
  }, [id, isAuthLoading]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px]">
        <LoadingState />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        <ErrorState message={error || "게시글을 찾을 수 없습니다."} />
        <Button onClick={() => router.back()} variant="destructive">
          <ArrowLeft className="h-4 w-4 mr-2" />
          뒤로가기
        </Button>
      </div>
    );
  }

  // content가 JSON 문자열인 경우 파싱
  let contentJson: any = null;
  try {
    contentJson =
      typeof post.content === "string"
        ? JSON.parse(post.content)
        : post.content;
  } catch (e) {
    // JSON 파싱 실패 시 빈 객체로 처리
    contentJson = { type: "doc", content: [] };
  }

  // 작성자와 현재 사용자가 같은지 확인
  const isAuthor = user && post?.author && user.id === post.author.id;

  // 좋아요 토글 핸들러
  const handleToggleLike = async () => {
    if (!post || !user || isLiking) return;

    try {
      setIsLiking(true);
      const response = await postApi.togglePostLike(post.id);
      if (response.success && response.data) {
        // 게시글 상태 업데이트
        setPost(
          post.copyWith({
            likeCount: response.data.likeCount,
            isLiked: response.data.isLiked,
          })
        );
      }
    } catch (err: any) {
      if (err.response?.status === 400 || err.response?.status === 404) {
        toast({
          description:
            err.response?.data?.message ||
            "좋아요 처리 중 오류가 발생했습니다.",
          variant: "destructive",
        });
      } else {
        toast({
          description: "좋아요 처리 중 오류가 발생했습니다.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLiking(false);
    }
  };

  // 게시글 삭제 핸들러
  const handleDelete = async () => {
    if (!post) return;

    try {
      setIsDeleting(true);
      const response = await postApi.deletePost(post.id);
      if (response.success) {
        toast({
          variant: "success",
          title: "삭제 완료",
          description: "게시글이 삭제되었습니다.",
        });
        // 카테고리 목록 페이지로 리다이렉트
        router.push(`/community/posts/${categoryToUrlPath(post.category)}`);
      } else {
        toast({
          variant: "destructive",
          title: "삭제 실패",
          description: "게시글 삭제에 실패했습니다.",
        });
      }
    } catch (err: any) {
      if (
        err.response?.status === 400 ||
        err.response?.status === 403 ||
        err.response?.status === 404
      ) {
        toast({
          title: "삭제 실패",
          description:
            err.response?.data?.message ||
            "게시글 삭제 중 오류가 발생했습니다.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "삭제 실패",
          description: "게시글 삭제 중 오류가 발생했습니다.",
          variant: "destructive",
        });
      }
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-background-1 rounded-md">
      {/* 게시글 */}
      <Card className="border-none p-6 bg-background-1 gap-0">
        <div className="space-y-4">
          {/* 헤더 영역 */}
          <div className="space-y-2">
            {/* 브레드크럼 */}
            <nav className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
              <Link
                href="/community"
                className="hover:text-accent-text transition-colors"
              >
                소통해요
              </Link>
              <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <Link
                href={`/community/posts/${categoryToUrlPath(post.category)}`}
                className="hover:text-accent-text transition-colors"
              >
                {PostCategoryLabels[post.category]}
              </Link>
            </nav>

            {/* 제목 */}
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              {post.title}
            </h1>

            {/* 작성자 정보 및 메타데이터 */}
            <div className="flex items-center gap-3 pt-4">
              {/* 프로필 사진 */}
              {post.author ? (
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={post.author.profileImageUrl}
                    alt={post.author.nick}
                  />
                  <AvatarFallback className="text-sm">
                    {post.author.nick?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              ) : null}

              {/* 작성자 이름과 날짜/조회수 영역 */}
              <div className="flex flex-col gap-1 flex-1">
                {post.author ? (
                  <span className="text-base font-medium text-foreground">
                    {post.author.nick}
                  </span>
                ) : (
                  <span className="text-sm text-muted-foreground">
                    작성자 정보 없음
                  </span>
                )}

                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDateTime(post.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    <span>{post.viewCount.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* 드롭다운 메뉴 */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 self-end"
                  >
                    <MoreVertical className="h-4 w-4 self-end" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-0 w-auto">
                  {isAuthor ? (
                    <>
                      <DropdownMenuItem
                        onClick={() =>
                          window.open(
                            `/community/posts/edit/${post.id}`,
                            "_blank"
                          )
                        }
                      >
                        <span className="text-sm px-2">수정</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItemDestructive
                        onClick={() => setIsDeleteDialogOpen(true)}
                        className="data-[highlighted]:bg-transparent"
                      >
                        <span className="text-sm px-2">삭제</span>
                      </DropdownMenuItemDestructive>
                    </>
                  ) : (
                    <div className="px-2 py-1.5 text-sm text-muted-foreground">
                      사용 가능한 메뉴가 없습니다
                    </div>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* 본문 구분선 */}
          <div className="border-t border-border-2 mt-4" />

          {/* 게시글 본문 */}
          <div>
            <TiptapEditor
              content={contentJson}
              showToolbar={false}
              minHeight="auto"
              containerClassName=""
              editorOptions={{
                editable: false,
              }}
            />
          </div>
        </div>
        <div className="border-b border-border-2 mt-3 px-4 py-2 flex items-center gap-4 text-sm text-muted-foreground">
          <button
            onClick={handleToggleLike}
            disabled={!user || isLiking}
            className={`flex items-center gap-1  cursor-pointer`}
          >
            <Heart
              className={`h-4 w-4 transition-all ${
                post.isLiked
                  ? "fill-current text-red-500"
                  : user
                  ? "text-muted-foreground hover:text-red-500 hover:fill-current"
                  : "text-muted-foreground"
              }`}
            />
            <span>{post.likeCount.toLocaleString()}</span>
          </button>
          <div className="flex items-center gap-1">
            <MessageSquare className="h-4 w-4" />
            <span>{post.commentCount.toLocaleString()}</span>
          </div>
        </div>
      </Card>

      {/* 댓글 섹션 */}
      <div className="px-6">
        <CommentSection postId={post.id} isLoggedIn={!!user} />
      </div>

      {/* 삭제 확인 다이얼로그 */}
      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="게시글 삭제"
        description="정말로 이 게시글을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
        onConfirm={handleDelete}
        isProcessing={isDeleting}
        confirmText="삭제"
        cancelText="취소"
        variant="destructive"
      />
    </div>
  );
}
