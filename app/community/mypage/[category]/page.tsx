"use client";

import MyComments from "@/components/mypage/MyComments";
import MyLikes from "@/components/mypage/MyLikes";
import { MyPageSidebar } from "@/components/mypage/MyPageSidebar";
import MyPosts from "@/components/mypage/MyPosts";
import { useParams } from "next/navigation";

export default function MyPageCategoryPage() {
  const params = useParams();
  const category = params.category as string;

  return (
    <div className="max-w-4xl mx-auto w-full">
      <div className="flex flex-col lg:flex-row gap-2">
        {/* 사이드바 */}
        <MyPageSidebar />

        {/* 메인 영역 */}
        <div className="flex-1">
          {category === "posts" && <MyPosts />}
          {category === "comments" && <MyComments />}
          {category === "likes" && <MyLikes />}
        </div>
      </div>
    </div>
  );
}
