"use client";

import postApi from "@/api/postApi";
import { WritePostForm } from "@/components/community/WritePostForm";
import { ErrorState } from "@/components/feedback/error-state";
import AsyncScanner from "@/components/loading/AiLoader/AsyncScanner";
import { toast } from "@/components/ToastProvider";
import { Button } from "@/components/ui/button";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { PostCategory, categoryToUrlPath } from "@/types/Common";
import { Post } from "@/types/Post";
import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function EditPostPage() {
  useRequireAuth();
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const isSubmittingRef = useRef(false);
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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
        if (err.response?.status === 400 || err.response?.status === 404) {
          setError(
            err.response?.data?.message ||
            "게시글을 불러오는 중 오류가 발생했습니다."
          );
        } else {
          setError("게시글을 불러오는 중 오류가 발생했습니다.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchPost();
    }
  }, [id]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  const handleSubmit = async (data: {
    title: string;
    category: PostCategory;
    content: any; // JSON 객체 (API 레이어에서 문자열로 변환)
    imageFiles?: File[];
    blobUrlToIndex?: Map<string, number>;
  }) => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;

    try {
      // 항상 FormData로 전송 (이미지가 없어도 빈 배열 전송)
      const imageFiles = data.imageFiles || [];
      const blobUrlToIndex = data.blobUrlToIndex || new Map<string, number>();

      const response = await postApi.updatePost(
        id,
        data.title,
        data.category,
        data.content,
        imageFiles,
        blobUrlToIndex
      );

      const postId = response.data.post.id;
      if (postId) {
        router.push(
          `/community/posts/${categoryToUrlPath(data.category)}/${postId}`
        );
      } else {
        router.push(`/community/posts/${categoryToUrlPath(data.category)}`);
      }
    } catch (error: any) {
      if (error.response?.status === 400 && error.response?.data?.message) {
        toast({
          variant: "destructive",
          title: "게시글 수정 실패",
          description: error.response?.data?.message,
        });
      } else {
        toast({
          variant: "destructive",
          title: "게시글 수정 실패",
          description: "게시글 수정에 실패했습니다.",
        });
      }
      isSubmittingRef.current = false;
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[800px] gap-4">
        <div className="w-[440px] h-60 mx-auto">
          <AsyncScanner />
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        <ErrorState message={error || "게시글을 찾을 수 없습니다."} />
        <Button
          variant="destructive"
          onClick={() => router.back()}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
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

  return (
    <div className="w-full max-w-4xl mx-auto">
      <WritePostForm
        onSubmit={handleSubmit}
        pageTitle="글 수정"
        initialData={{
          title: post.title,
          category: post.category,
          content: contentJson,
        }}
      />
    </div>
  );
}
