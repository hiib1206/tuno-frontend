"use client";

import postApi from "@/api/postApi";
import { CommunityPost } from "@/components/community/CommunityPost";
import { ErrorState } from "@/components/feedback/error-state";
import { LoadingState } from "@/components/feedback/loading-state";
import { Pagination } from "@/components/ui/pagination";
import {
  POST_LIST_LIMIT,
  postCategoryItems,
  PostListItem,
  toCommunityPost,
} from "@/lib/community";
import { useAuthStore } from "@/stores/authStore";
import { urlPathToCategory } from "@/types/Common";
import { Post } from "@/types/Post";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function CategoryPostsPage() {
  const { isAuthLoading } = useAuthStore();
  const params = useParams();
  const categoryPath = params.category as string;
  const category = urlPathToCategory(categoryPath);

  const [posts, setPosts] = useState<PostListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // postCategoryItems에서 현재 category와 일치하는 항목 찾기
  const currentItem = postCategoryItems.find(
    (item) => item.href === `/community/posts/${categoryPath}`
  );
  const title = currentItem?.label || "게시글";

  useEffect(() => {
    if (isAuthLoading) return;
    if (!category) {
      setError("유효하지 않은 카테고리입니다.");
      setLoading(false);
      return;
    }

    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await postApi.getPosts({
          page: currentPage,
          limit: POST_LIST_LIMIT,
          category: category,
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
  }, [currentPage, isAuthLoading, category]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // 페이지 상단으로 스크롤 (선택사항)
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        <LoadingState />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        <ErrorState message={error} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CommunityPost title={title} posts={posts} />

      {/* 페이지네이션 */}
      {totalPages > 1 && (
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
