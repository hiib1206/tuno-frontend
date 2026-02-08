"use client";

import { BrandText } from "@/components/ui/BrandText";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getOrCreateDeviceId, getRedirectUrl, withRedirect } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import { LogIn } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useAuthStore((state) => state.login);
  const [username, setUsername] = useState("");
  const [pw, setPw] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [rememberId, setRememberId] = useState(false);
  const [showOAuthErrorModal, setShowOAuthErrorModal] = useState(false);

  // 저장된 아이디 불러오기
  useEffect(() => {
    const savedUsername = localStorage.getItem("saved-username");
    if (savedUsername) {
      setUsername(savedUsername);
      setRememberId(true);
    }
  }, []);

  // OAuth 콜백 처리
  useEffect(() => {
    const oauthCallback = searchParams.get("oauth_success");
    const oauthError = searchParams.get("error");

    // OAuth 실패 처리
    if (oauthError) {
      setShowOAuthErrorModal(true);
      // URL에서 error 파라미터만 제거 (컴포넌트 리렌더링 없이)
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        url.searchParams.delete("error");
        window.history.replaceState({}, "", url.toString());
      }
      return;
    }

    // OAuth 성공 처리
    if (oauthCallback === "true") {
      const redirect = getRedirectUrl(searchParams);
      const redirectPath = redirect || "/analysis/quant";
      router.push(redirectPath);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const success = await login(username, pw);
      if (success) {
        // 아이디 저장 처리
        if (rememberId) {
          localStorage.setItem("saved-username", username);
        } else {
          localStorage.removeItem("saved-username");
        }
        const redirect = getRedirectUrl(searchParams);
        const redirectPath = redirect || "/analysis/quant";
        router.push(redirectPath);
      } else {
        setError("로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.");
      }
    } catch (err: any) {
      if (err.response?.status === 400 && err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        console.log(err);
        setError("로그인 중 오류가 발생했습니다. 다시 시도해주세요.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const deviceId = getOrCreateDeviceId();
    const redirectUrl = getRedirectUrl(searchParams);
    const redirectParam = encodeURIComponent(redirectUrl || "");

    const params = new URLSearchParams();
    if (deviceId) {
      params.append("deviceId", deviceId);
    }
    if (redirectUrl) {
      params.append("redirect", redirectParam);
    }
    const queryString = params.toString();
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/google${queryString ? `?${queryString}` : ""
      }`;
  };

  const handleNaverLogin = async () => {
    const deviceId = getOrCreateDeviceId();
    const redirect = getRedirectUrl(searchParams);
    const params = new URLSearchParams();
    if (deviceId) {
      params.append("deviceId", deviceId);
    }
    if (redirect) {
      params.append("redirect", redirect);
    }
    const queryString = params.toString();
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/naver${queryString ? `?${queryString}` : ""
      }`;
  };

  const handleKakaoLogin = async () => {
    const deviceId = getOrCreateDeviceId();
    const redirect = getRedirectUrl(searchParams);
    const params = new URLSearchParams();
    if (deviceId) {
      params.append("deviceId", deviceId);
    }
    if (redirect) {
      params.append("redirect", redirect);
    }
    const queryString = params.toString();
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/kakao${queryString ? `?${queryString}` : ""
      }`;
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background-2 p-4">
      <div className="w-full max-w-md">
        <Card className="p-8 border-none bg-background-1">
          {/* Logo */}
          <div className="mb-8 flex items-center justify-center">
            <BrandText className="text-3xl">Tuno</BrandText>
          </div>

          <div className="mb-4 text-center">
            <h1 className="mb-2 text-2xl font-bold">로그인</h1>
            <p className="text-sm text-muted-foreground">
              Tuno의 강력한 투자 분석 도구를 사용해보세요
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="username">아이디</Label>
              <Input
                id="username"
                type="text"
                placeholder="아이디"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                required
                disabled={isLoading}
                className="rounded"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pw">비밀번호</Label>
              <Input
                id="pw"
                type="password"
                placeholder="••••••••"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                autoComplete="current-password"
                required
                disabled={isLoading}
                className="rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="rememberId"
                  checked={rememberId}
                  onCheckedChange={(checked) =>
                    setRememberId(checked as boolean)
                  }
                  disabled={isLoading}
                />
                <Label
                  htmlFor="rememberId"
                  className="text-sm font-normal cursor-pointer text-muted-foreground"
                >
                  아이디 저장
                </Label>
              </div>
              <Link
                href="/find-account"
                className="text-sm text-muted-foreground hover:text-accent transition-colors"
                tabIndex={4}
              >
                아이디/비밀번호 찾기
              </Link>
            </div>

            {error && <div className="text-sm text-destructive">{error}</div>}

            <Button
              type="submit"
              className="group mt-4 w-full rounded bg-accent text-accent-foreground hover:bg-accent/90 hover:scale-100 transition-all duration-300"
              disabled={isLoading}
              tabIndex={3}
            >
              <div className="group-hover:scale-110 transition-all duration-300 flex items-center justify-center">
                <LogIn className="mr-2 h-4 w-4" />
                {isLoading ? "로그인 중..." : "로그인"}
              </div>
            </Button>
          </form>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-background-1 px-2 text-muted-foreground">
                또는
              </span>
            </div>
          </div>

          <div className="flex justify-center gap-4">
            {/* Google 로그인 버튼 */}
            <Button
              variant="login"
              className="h-12 w-12 rounded-full p-0 relative"
              type="button"
              onClick={handleGoogleLogin}
              aria-label="Google로 로그인"
            >
              <Image
                src="/icons/login-btn-google.png"
                alt="Google 로그인"
                fill
                className="rounded-full object-contain"
              />
            </Button>

            {/* Naver 로그인 버튼 */}
            <Button
              variant="login"
              className="h-12 w-12 rounded-full p-0 relative"
              type="button"
              onClick={handleNaverLogin}
              aria-label="네이버로 로그인"
            >
              <Image
                src="/icons/login-btn-naver.png"
                alt="Naver 로그인"
                fill
                className="rounded-full object-contain"
              />
            </Button>

            {/* Kakao 로그인 버튼 */}
            <Button
              variant="login"
              className="h-12 w-12 rounded-full p-0 relative"
              type="button"
              onClick={handleKakaoLogin}
              aria-label="카카오로 로그인"
            >
              <Image
                src="/icons/login-btn-kakao.svg"
                alt="Kakao 로그인"
                fill
                className="rounded-full object-contain"
              />
            </Button>
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            계정이 없으신가요?{" "}
            <Link
              href={withRedirect("/signup", getRedirectUrl(searchParams))}
              className="font-semibold text-accent hover:underline"
            >
              회원가입
            </Link>
          </p>
        </Card>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          로그인함으로써 InvestAI의{" "}
          <Link href="/terms" className="hover:underline">
            이용약관
          </Link>{" "}
          및{" "}
          <Link href="/privacy" className="hover:underline">
            개인정보처리방침
          </Link>
          에 동의하는 것으로 간주됩니다.
        </p>

        {/* OAuth 에러 모달 */}
        <Dialog
          open={showOAuthErrorModal}
          onOpenChange={setShowOAuthErrorModal}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-center text-xl">
                소셜 로그인 실패
              </DialogTitle>
              <DialogDescription>
                소셜 로그인에 실패했습니다. 다시 시도해주세요.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                onClick={() => setShowOAuthErrorModal(false)}
                className="w-full sm:w-auto"
              >
                확인
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-background-2"></div>}>
      <LoginContent />
    </Suspense>
  );
}
