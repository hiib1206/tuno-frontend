"use client";

import postApi from "@/api/postApi";
import { WritePostForm } from "@/components/community/WritePostForm";
import { toast } from "@/components/ToastProvider";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { PostCategory, categoryToUrlPath } from "@/types/Common";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

export default function WritePostPage() {
  useRequireAuth();
  const router = useRouter();
  const isSubmittingRef = useRef(false);

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

      const response = await postApi.createPost(
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
          title: "게시글 저장 실패",
          description: error.response?.data?.message,
        });
      } else {
        toast({
          variant: "destructive",
          title: "게시글 저장 실패",
          description: "게시글 저장에 실패했습니다.",
        });
      }
      isSubmittingRef.current = false;
    }
  };

  const handleCancel = () => {
    if (confirm("작성 중인 내용이 사라집니다. 정말 떠나시겠습니까?")) {
      isSubmittingRef.current = true;
      router.back();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <WritePostForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        pageTitle="글쓰기"
      />
    </div>
  );
}
