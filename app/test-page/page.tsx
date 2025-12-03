// /test-page/page.tsx
"use client";

import { ProfileAvatar } from "@/components/ProfileAvatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserMenu } from "@/components/UserMenu";
import { toast } from "@/hooks/useToast";
import { useAuthStore } from "@/stores/authStore";
import { useEffect, useState } from "react";

export default function TestPage() {
  const { user, me } = useAuthStore();
  const [loading, setLoading] = useState(false);

  // 마운트 시 me() 호출
  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        await me({ skipRedirect: true });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "오류",
          description: "사용자 정보를 불러오는데 실패했습니다.",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [me]);

  const handleMe = async () => {
    setLoading(true);
    try {
      await me({ skipRedirect: true });
      toast({
        variant: "success",
        title: "사용자 정보 갱신 완료",
        description: "최신 사용자 정보를 불러왔습니다.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "오류",
        description: "사용자 정보를 불러오는데 실패했습니다.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-6">
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

      <Card className="max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Zustand User 정보</CardTitle>
            <Button onClick={handleMe} disabled={loading} size="sm">
              {loading ? "로딩 중..." : "me() 호출"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {user ? (
            <div className="space-y-2">
              <div className="grid grid-cols-[120px_1fr] gap-2 text-sm">
                <span className="font-medium text-muted-foreground">id:</span>
                <span>{user.id}</span>

                <span className="font-medium text-muted-foreground">
                  username:
                </span>
                <span>{user.username}</span>

                <span className="font-medium text-muted-foreground">nick:</span>
                <span>{user.nick}</span>

                <span className="font-medium text-muted-foreground">
                  email:
                </span>
                <span>{user.email || "없음"}</span>

                <span className="font-medium text-muted-foreground">
                  emailVerifiedAt:
                </span>
                <span>
                  {user.emailVerifiedAt
                    ? new Date(user.emailVerifiedAt).toLocaleString()
                    : "없음"}
                </span>

                <span className="font-medium text-muted-foreground">
                  phone:
                </span>
                <span>{user.phone || "없음"}</span>

                <span className="font-medium text-muted-foreground">
                  address:
                </span>
                <span>{user.address || "없음"}</span>

                <span className="font-medium text-muted-foreground">role:</span>
                <span>{user.role || "없음"}</span>

                <span className="font-medium text-muted-foreground">
                  profileImageUrl:
                </span>
                <span className="break-all">
                  {user.profileImageUrl || "없음"}
                </span>

                <span className="font-medium text-muted-foreground">
                  profileImageUpdatedAt:
                </span>
                <span>
                  {user.profileImageUpdatedAt
                    ? new Date(user.profileImageUpdatedAt).toLocaleString()
                    : "없음"}
                </span>

                <span className="font-medium text-muted-foreground">
                  createdAt:
                </span>
                <span>
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleString()
                    : "없음"}
                </span>

                <span className="font-medium text-muted-foreground">
                  updatedAt:
                </span>
                <span>
                  {user.updatedAt
                    ? new Date(user.updatedAt).toLocaleString()
                    : "없음"}
                </span>

                <span className="font-medium text-muted-foreground">
                  isActive:
                </span>
                <span>
                  {user.isActive !== undefined ? String(user.isActive) : "없음"}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">사용자 정보가 없습니다.</p>
          )}
        </CardContent>
      </Card>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>프로필 사진 크기별 미리보기</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-32 text-sm font-medium text-muted-foreground">
                xs (20px)
              </div>
              <ProfileAvatar size="xs" />
            </div>
            <div className="flex items-center gap-4">
              <div className="w-32 text-sm font-medium text-muted-foreground">
                sm (32px)
              </div>
              <ProfileAvatar size="sm" />
            </div>
            <div className="flex items-center gap-4">
              <div className="w-32 text-sm font-medium text-muted-foreground">
                md (40px)
              </div>
              <ProfileAvatar size="md" />
            </div>
            <div className="flex items-center gap-4">
              <div className="w-32 text-sm font-medium text-muted-foreground">
                lg (64px)
              </div>
              <ProfileAvatar size="lg" />
            </div>
            <div className="flex items-center gap-4">
              <div className="w-32 text-sm font-medium text-muted-foreground">
                xl (96px)
              </div>
              <ProfileAvatar size="xl" />
            </div>
            <div className="flex items-center gap-4">
              <div className="w-32 text-sm font-medium text-muted-foreground">
                2xl (128px)
              </div>
              <ProfileAvatar size="2xl" />
            </div>
          </div>
        </CardContent>
      </Card>

      <UserMenu />
    </div>
  );
}
