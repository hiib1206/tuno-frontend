"use client";

import postApi from "@/api/postApi";
import { CommunityPost } from "@/components/community/CommunityPost";
import { ErrorState } from "@/components/feedback/error-state";
import { Pagination } from "@/components/ui/pagination";
import {
  POST_LIST_LIMIT,
  PostListItem,
  toCommunityPost,
} from "@/lib/community";
import { useAuthStore } from "@/stores/authStore";
import { Post } from "@/types/Post";
import { useEffect, useState } from "react";

export default function PostsPage() {
  const { isAuthLoading } = useAuthStore();
  const [posts, setPosts] = useState<PostListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (isAuthLoading) return;

    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await postApi.getPosts({
          page: currentPage,
          limit: POST_LIST_LIMIT,
        });

        if (response.success) {
          // totalPages 설정
          setTotalPages(response.data.totalPages || 1);

          // list가 없거나 빈 배열인 경우 처리
          if (response.data.list && response.data.list.length > 0) {
            // API의 Post 타입을 CommunityBoard의 Post 타입으로 변환
            const communityPosts: PostListItem[] = response.data.list.map(
              (post: Post) => toCommunityPost(post)
            );
            setPosts(communityPosts);
          } else {
            // 게시글이 0개인 경우 빈 배열로 설정 (CommunityBoard가 emptyMessage 표시)
            setPosts([]);
          }
        } else {
          setError("게시글 목록을 불러오는데 실패했습니다.");
        }
      } catch (err) {
        setError("게시글 목록을 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [currentPage, isAuthLoading]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // 페이지 상단으로 스크롤 (선택사항)
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-4">
        <ErrorState message={error} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CommunityPost title="최신 글" posts={posts} loading={loading} />

      {/* 페이지네이션 */}
      {!loading && totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          isLoading={loading}
        />
      )}
    </div>
  );
}
