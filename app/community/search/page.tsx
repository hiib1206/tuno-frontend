"use client";

import newsApi from "@/api/newsApi";
import postApi from "@/api/postApi";
import { CommunityNews } from "@/components/community/CommunityNews";
import { CommunityPost } from "@/components/community/CommunityPost";
import { ErrorState } from "@/components/feedback/error-state";
import { LoadingState } from "@/components/feedback/loading-state";
import { Pagination } from "@/components/ui/pagination";
import { useNews } from "@/hooks/useNews";
import {
  POST_LIST_LIMIT,
  POST_SORT_OPTIONS,
  PostListItem,
  PostSortOption,
  toCommunityPost,
} from "@/lib/community";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import { Post } from "@/types/Post";
import { FileText, Newspaper, Search } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";

type SearchTab = "posts" | "news";

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const { isAuthLoading } = useAuthStore();

  const [activeTab, setActiveTab] = useState<SearchTab>("posts");

  // 게시글 상태
  const [posts, setPosts] = useState<PostListItem[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [postsError, setPostsError] = useState<string | null>(null);
  const [postsPage, setPostsPage] = useState(1);
  const [postsTotalPages, setPostsTotalPages] = useState(1);
  const [currentSort, setCurrentSort] = useState<PostSortOption>(POST_SORT_OPTIONS[0]);

  // 검색용 정렬 옵션 (등록순 제외)
  const searchSortOptions = POST_SORT_OPTIONS.filter(
    (option) => option.value !== "oldest"
  );

  // 뉴스 상태 - useNews 훅 사용
  const fetchNewsCallback = useCallback(
    (cursor?: string) =>
      newsApi.searchNews({
        q: query,
        cursor,
        limit: 10,
      }),
    [query]
  );

  const {
    news,
    loading: newsLoading,
    error: newsError,
    loadingMore: newsLoadingMore,
    hasNextPage: newsHasNextPage,
    loadMore: loadMoreNews,
    failedImageUrls,
    enableImageExtraction,
  } = useNews(fetchNewsCallback, {
    enablePagination: true,
    enableImageExtraction: true,
    autoFetch: !!query,
    key: query, // query가 변경되면 상태 초기화 후 재요청
  });

  // 무한 스크롤 감지용 ref
  const newsObserverRef = useRef<HTMLDivElement>(null);

  // 게시글 검색
  useEffect(() => {
    if (!query || isAuthLoading) return;

    const fetchPosts = async () => {
      try {
        setPostsLoading(true);
        setPostsError(null);
        const response = await postApi.getPosts({
          page: postsPage,
          limit: POST_LIST_LIMIT,
          search: query,
          sort: currentSort.sort,
          order: currentSort.order,
        });

        if (response.success) {
          setPostsTotalPages(response.data.totalPages || 1);
          if (response.data.list && response.data.list.length > 0) {
            const communityPosts: PostListItem[] = response.data.list.map(
              (post: Post) => toCommunityPost(post)
            );
            setPosts(communityPosts);
          } else {
            setPosts([]);
          }
        } else {
          setPostsError("게시글 검색에 실패했습니다.");
        }
      } catch {
        setPostsError("게시글 검색에 실패했습니다.");
      } finally {
        setPostsLoading(false);
      }
    };

    fetchPosts();
  }, [query, postsPage, isAuthLoading, currentSort]);

  // 뉴스 무한 스크롤 감지
  useEffect(() => {
    if (activeTab !== "news") return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && newsHasNextPage && !newsLoadingMore) {
          loadMoreNews();
        }
      },
      { threshold: 0.1 }
    );

    if (newsObserverRef.current) {
      observer.observe(newsObserverRef.current);
    }

    return () => observer.disconnect();
  }, [activeTab, newsHasNextPage, newsLoadingMore, loadMoreNews]);

  const handlePostsPageChange = (page: number) => {
    setPostsPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 검색어가 없는 경우
  if (!query) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-4">
        <Search className="h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground">검색어를 입력해주세요.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-background-1 rounded-lg">
      {/* 검색 결과 헤더 */}
      <div className="px-4 md:px-6 py-4">
        <div className="flex items-center gap-2 mb-4">
          <Search className="h-5 w-5 text-accent-text" />
          <h1 className="text-lg sm:text-xl font-semibold">
            &quot;{query}&quot; 검색 결과
          </h1>
        </div>

        {/* 탭 네비게이션 */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("posts")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded text-sm font-medium transition-colors",
              activeTab === "posts"
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-background-2"
            )}
          >
            <FileText className="h-4 w-4" />
            <span>소통해요</span>
            {!postsLoading && (
              <span className="ml-1 text-xs">({posts.length})</span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("news")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded text-sm font-medium transition-colors",
              activeTab === "news"
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-background-2"
            )}
          >
            <Newspaper className="h-4 w-4" />
            <span>뉴스</span>
          </button>
        </div>
      </div>

      {/* 탭 컨텐츠 */}
      {activeTab === "posts" && (
        <div className="space-y-6">
          {postsLoading ? (
            <div className="flex flex-col items-center justify-center min-h-[300px] gap-4">
              <LoadingState />
            </div>
          ) : postsError ? (
            <div className="flex flex-col items-center justify-center min-h-[300px] gap-4">
              <ErrorState message={postsError} />
            </div>
          ) : (
            <>
              <CommunityPost
                title=""
                posts={posts}
                showWriteButton={false}
                showSort={true}
                sortOptions={searchSortOptions}
                currentSort={currentSort.value}
                onSortChange={(option) => {
                  setCurrentSort(option);
                  setPostsPage(1);
                }}
              />
              {postsTotalPages > 1 && (
                <Pagination
                  currentPage={postsPage}
                  totalPages={postsTotalPages}
                  onPageChange={handlePostsPageChange}
                  isLoading={postsLoading}
                />
              )}
            </>
          )}
        </div>
      )}

      {activeTab === "news" && (
        <div className="space-y-6">
          {newsError ? (
            <div className="flex flex-col items-center justify-center min-h-[300px] gap-4">
              <ErrorState message={newsError} />
            </div>
          ) : (
            <>
              <CommunityNews
                title="뉴스 검색 결과"
                news={news}
                emptyMessage="검색 결과가 없습니다."
                failedImageUrls={failedImageUrls}
                loading={newsLoading}
                loadingMore={newsLoadingMore}
                enableImageExtraction={enableImageExtraction}
              />

              {/* 무한 스크롤 감지 영역 */}
              <div ref={newsObserverRef} className="py-4">
                {!newsHasNextPage && news.length > 0 && (
                  <p className="text-center text-sm text-muted-foreground">
                    모든 뉴스를 불러왔습니다.
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-12"></div>}>
      <SearchContent />
    </Suspense>
  );
}