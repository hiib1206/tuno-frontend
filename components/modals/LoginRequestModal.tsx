"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

interface LoginRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  redirectUrl?: string;
}

// useSearchParams를 사용하는 내부 컴포넌트
function LoginRequestModalContent({
  isOpen,
  onClose,
  redirectUrl,
}: LoginRequestModalProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // pathname + 쿼리 파라미터를 합친 전체 URL 생성
  const getCurrentFullPath = () => {
    const queryString = searchParams.toString();
    return queryString ? `${pathname}?${queryString}` : pathname;
  };

  const handleLogin = () => {
    // redirectUrl이 없으면 현재 전체 경로(pathname + 쿼리파라미터)를 기본값으로 사용
    const target = redirectUrl || getCurrentFullPath();
    router.push(`/login?redirect=${encodeURIComponent(target)}`);
    onClose();
  };

  const handleSignup = () => {
    const target = redirectUrl || getCurrentFullPath();
    router.push(`/signup?redirect=${encodeURIComponent(target)}`);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm rounded-xl gap-6 pb-6 bg-background-2 text-foreground">
        <DialogHeader className="space-y-3 text-center sm:text-center">
          <DialogTitle className="text-xl">
            로그인이 필요한 서비스입니다
          </DialogTitle>
          <DialogDescription className="text-center whitespace-pre-line">
            더 많은 기능을 이용하려면 로그인이 필요합니다.{"\n"}
            로그인 후 이용해주세요.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 w-full">
          <Button
            variant="outline"
            size="lg"
            className="w-full font-semibold"
            onClick={handleLogin}
          >
            로그인 하러 가기
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="w-full"
            onClick={handleSignup}
          >
            회원가입 하기
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Suspense로 감싼 외부 컴포넌트
export function LoginRequestModal(props: LoginRequestModalProps) {
  return (
    <Suspense fallback={null}>
      <LoginRequestModalContent {...props} />
    </Suspense>
  );
}
