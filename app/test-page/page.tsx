// /test-page/page.tsx
"use client";

import apiClient from "@/api/apiClient";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/UserMenu";
import { toast } from "@/hooks/useToast";
import { useEffect } from "react";

export default function TestPage() {
  // GET api/test/important 요청하기

  useEffect(() => {
    const fetchImportant = async () => {
      try {
        const response = await apiClient.get("/api/test/important");
        console.log(response.data);
      } catch (error) {
        console.error("Error fetching important:", error);
      }
    };
    fetchImportant();
  }, []);

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold mb-6">Toast 테스트 페이지</h1>

      <div className="flex flex-col gap-4 max-w-md">
        <Button
          onClick={() => {
            toast({
              variant: "default",
              title:
                "기본 토스트 제목 asdfsdfasdfasdfsdfsdfasdfasfdasdfasdfasdfaf",
              description:
                "이것은 기본 스타일의 토스트 메시지입니다.asdfasdfasfdㅁㅁㅇㄹㄴㅇㄹㄴㅇ",
            });
          }}
        >
          기본 토스트
        </Button>

        <Button
          onClick={() => {
            toast({
              title:
                "성공 메시지ㅁㄴㅇㄹㄹㄹㄹㄹㄹㄹㄹㄹㄹㄹㄹㄹㄹㄹㄹㄹㄹㄹㄹㄹㄹㄹㄹㄹ",
              description:
                "작업이 성공적으로 완료되었습니다!ㅁㄻㄴㅇㄻㄴㅇㄻㄴㅇㄻㄴㅇㄻㄴㅇㄻㄴㅇㄻㄴㅇㄻㄴㅇㄻㄴㅇㄹㄹ",
              variant: "success",
            });
          }}
        >
          성공 토스트
        </Button>

        <Button
          onClick={() => {
            toast({
              variant: "warning",
              title: "경고 메시지",
              description: "주의가 필요한 상황입니다.",
            });
          }}
        >
          경고 토스트
        </Button>

        <Button
          onClick={() => {
            toast({
              variant: "info",
              title: "정보 메시지",
              description: "유용한 정보를 제공합니다.",
            });
          }}
        >
          정보 토스트
        </Button>

        <Button
          variant="destructive"
          onClick={() => {
            toast({
              variant: "destructive",
              title: "오류 메시지",
              description: "문제가 발생했습니다. 다시 시도해주세요.",
            });
          }}
        >
          오류 토스트
        </Button>

        <Button
          onClick={() => {
            toast({
              variant: "default",
              title: "제목만 있는 토스트",
            });
          }}
        >
          제목만 있는 토스트
        </Button>

        <Button
          onClick={() => {
            toast({
              variant: "success",
              description: "설명만 있는 토스트입니다.",
            });
          }}
        >
          설명만 있는 토스트
        </Button>
      </div>
      <UserMenu />
    </div>
  );
}
