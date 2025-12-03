"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/stores/authStore";
import { ArrowLeft, LogIn } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [username, setUsername] = useState("");
  const [pw, setPw] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [rememberId, setRememberId] = useState(false);

  // 저장된 아이디 불러오기
  useEffect(() => {
    const savedUsername = localStorage.getItem("savedUsername");
    if (savedUsername) {
      setUsername(savedUsername);
      setRememberId(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const success = await login(username, pw);
      if (success) {
        // 아이디 저장 처리
        if (rememberId) {
          localStorage.setItem("savedUsername", username);
        } else {
          localStorage.removeItem("savedUsername");
        }
        router.push("/analysis");
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {/* Back to Home */}
        <Link
          href="/"
          className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          홈으로 돌아가기
        </Link>

        <Card className="p-8">
          {/* Logo */}
          <div className="mb-8 flex items-center justify-center gap-2">
            <span className="text-2xl font-semibold">앱 이름뭐로하징</span>
          </div>

          <div className="mb-4 text-center">
            <h1 className="mb-2 text-2xl font-bold">로그인</h1>
            <p className="text-sm text-muted-foreground">뭐라고 적징.</p>
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
                href="/forgot-password"
                className="text-sm text-muted-foreground hover:text-accent transition-colors"
                tabIndex={4}
              >
                비밀번호 찾기
              </Link>
            </div>

            {error && <div className="text-sm text-destructive">{error}</div>}

            <Button
              type="submit"
              className="mt-4 w-full rounded bg-accent text-accent-foreground hover:bg-accent/90"
              disabled={isLoading}
              tabIndex={3}
            >
              <LogIn className="mr-2 h-4 w-4" />
              {isLoading ? "로그인 중..." : "로그인"}
            </Button>
          </form>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-card px-2 text-muted-foreground">또는</span>
            </div>
          </div>

          <div className="flex justify-center gap-4">
            {/* Google 로그인 버튼 */}
            <Button
              variant="login"
              className="h-12 w-12 rounded-full p-0 relative"
              type="button"
              onClick={() => {
                // Google 로그인 로직 추가
                console.log("Google 로그인");
              }}
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
              onClick={() => {
                // Naver 로그인 로직 추가
                console.log("Naver 로그인");
              }}
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
              onClick={() => {
                // Kakao 로그인 로직 추가
                console.log("Kakao 로그인");
              }}
              aria-label="카카오로 로그인"
            >
              <Image
                src="/icons/login-btn-kakao.png"
                alt="Kakao 로그인"
                fill
                className="rounded-full object-contain"
              />
            </Button>
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            계정이 없으신가요?{" "}
            <Link
              href="/signup"
              className="font-semibold text-accent hover:underline"
            >
              회원가입
            </Link>
          </p>
        </Card>

        <p className="mt-8 text-center text-xs text-muted-foreground">
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
      </div>
    </div>
  );
}
