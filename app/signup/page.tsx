"use client";

import authApi from "@/api/authApi";
import userApi from "@/api/userApi";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNicknameCheck } from "@/hooks/useNicknameCheck";
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  UserPlus,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function SignupPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [nick, setNick] = useState("");
  const [pw, setPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // 중복 체크 상태
  const [usernameStatus, setUsernameStatus] = useState<
    "idle" | "checking" | "available" | "unavailable"
  >("idle");
  const [usernameMessage, setUsernameMessage] = useState("");

  // 닉네임 체크 훅 사용
  const { nickStatus, nickMessage } = useNicknameCheck(nick);

  // 비밀번호 일치 상태
  const [passwordMatchStatus, setPasswordMatchStatus] = useState<
    "idle" | "match" | "mismatch"
  >("idle");
  const [passwordMatchMessage, setPasswordMatchMessage] = useState("");

  // 아이디 중복 체크 (debounce) + 4자 이하 경고 메시지
  useEffect(() => {
    if (!username) {
      setUsernameStatus("idle");
      setUsernameMessage("");
      return;
    }

    if (username.length > 0 && username.length < 4) {
      setUsernameStatus("unavailable");
      setUsernameMessage("아이디는 최소 4자 이상이어야 합니다.");
      return;
    }

    const timer = setTimeout(async () => {
      setUsernameStatus("checking");
      try {
        const response = await userApi.checkUsername(username);
        if (response.success) {
          setUsernameStatus("available");
          setUsernameMessage("사용 가능한 아이디입니다.");
        }
      } catch (err: any) {
        if (!err.response.data.success) {
          setUsernameStatus("unavailable");
          setUsernameMessage(err.response.data.message);
        } else {
          setUsernameStatus("idle");
          setUsernameMessage("");
        }
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [username]);

  // 비밀번호 일치 확인
  useEffect(() => {
    if (pw.length == 0 && confirmPw.length == 0) {
      setPasswordMatchStatus("idle");
      setPasswordMatchMessage("");
    } else {
      if (pw === confirmPw) {
        setPasswordMatchStatus("match");
        setPasswordMatchMessage("비밀번호가 일치합니다.");
      } else {
        setPasswordMatchStatus("mismatch");
        setPasswordMatchMessage("비밀번호가 일치하지 않습니다.");
      }
    }
  }, [pw, confirmPw]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    // 비밀번호 확인 검증
    if (pw !== confirmPw) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess(false);

    try {
      await authApi.register(username, nick, pw);
      // 회원가입 성공
      setSuccess(true);
      setIsLoading(false);

      // 입력 필드 초기화
      setUsername("");
      setNick("");
      setPw("");
      setConfirmPw("");
      setTermsAgreed(false);
      setUsernameStatus("idle");
      setPasswordMatchStatus("idle");
      setUsernameMessage("");
      setPasswordMatchMessage("");

      // 2초 후 모달 닫고 로그인 페이지로 이동
      setTimeout(() => {
        setSuccess(false);
        router.push("/login");
      }, 2000);
    } catch (err: any) {
      if (err.response?.data?.success === false) {
        setError(err.response.data.message);
      } else {
        console.log(err);
        setError("회원가입 중 오류가 발생했습니다. 다시 시도해주세요.");
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md">
        {/* Back to Home */}
        <Link
          href="/"
          className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          홈으로 돌아가기
        </Link>

        <Card className="p-8 border-">
          {/* Logo */}
          <div className="mb-8 flex items-center justify-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <svg
                className="h-6 w-6 text-primary-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            </div>
            <span className="text-2xl font-semibold">InvestAI</span>
          </div>

          <div className="mb-8 text-center">
            <h1 className="mb-2 text-2xl font-bold">회원가입</h1>
            <p className="text-sm text-muted-foreground">
              14일 무료 체험을 시작하세요
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="username">아이디</Label>
              <div className="relative">
                <Input
                  id="username"
                  type="text"
                  placeholder="아이디"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  required
                  disabled={isLoading || success}
                  className={
                    "rounded " +
                    (usernameStatus === "unavailable"
                      ? "border-destructive pr-10"
                      : usernameStatus === "available"
                      ? "border-green-500 pr-10"
                      : undefined)
                  }
                />
                {usernameStatus === "checking" && (
                  <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                )}
                {usernameStatus === "available" && (
                  <CheckCircle2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-green-500" />
                )}
                {usernameStatus === "unavailable" && (
                  <XCircle className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-destructive" />
                )}
              </div>
              {usernameMessage && (
                <p
                  className={`text-xs ${
                    usernameStatus === "available"
                      ? "text-green-600 dark:text-green-400"
                      : usernameStatus === "unavailable"
                      ? "text-destructive"
                      : "text-muted-foreground"
                  }`}
                >
                  {usernameMessage}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="nick">닉네임</Label>
              <div className="relative">
                <Input
                  id="nick"
                  type="text"
                  placeholder="닉네임"
                  value={nick}
                  onChange={(e) => setNick(e.target.value)}
                  autoComplete="nickname"
                  required
                  disabled={isLoading || success}
                  className={
                    "rounded " +
                    (nickStatus === "unavailable"
                      ? "border-destructive pr-10"
                      : nickStatus === "available"
                      ? "border-green-500 pr-10"
                      : undefined)
                  }
                />
                {nickStatus === "checking" && (
                  <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                )}
                {nickStatus === "available" && (
                  <CheckCircle2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-green-500" />
                )}
                {nickStatus === "unavailable" && (
                  <XCircle className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-destructive" />
                )}
              </div>
              {nickMessage && (
                <p
                  className={`text-xs ${
                    nickStatus === "available"
                      ? "text-green-600 dark:text-green-400"
                      : nickStatus === "unavailable"
                      ? "text-destructive"
                      : "text-muted-foreground"
                  }`}
                >
                  {nickMessage}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="pw">비밀번호</Label>
              <Input
                id="pw"
                type="password"
                placeholder="••••••••"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                autoComplete="new-password"
                required
                disabled={isLoading}
                className="rounded"
              />
              <p className="text-xs text-muted-foreground">
                나중에 추가. 최소 8자 이상, 영문, 숫자, 특수문자 포함.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-pw">비밀번호 확인</Label>
              <div className="relative">
                <Input
                  id="confirm-pw"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPw}
                  onChange={(e) => setConfirmPw(e.target.value)}
                  autoComplete="new-password"
                  required
                  disabled={isLoading || success}
                  className={
                    "rounded " +
                    (passwordMatchStatus === "mismatch"
                      ? "border-destructive pr-10"
                      : passwordMatchStatus === "match"
                      ? "border-green-500 pr-10"
                      : undefined)
                  }
                />
                {passwordMatchStatus === "match" && (
                  <CheckCircle2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-green-500" />
                )}
                {passwordMatchStatus === "mismatch" && (
                  <XCircle className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-destructive" />
                )}
              </div>
              {passwordMatchMessage && (
                <p
                  className={`text-xs ${
                    passwordMatchStatus === "match"
                      ? "text-green-600 dark:text-green-400"
                      : passwordMatchStatus === "mismatch"
                      ? "text-destructive"
                      : "text-muted-foreground"
                  }`}
                >
                  {passwordMatchMessage}
                </p>
              )}
            </div>

            <div className="flex items-start gap-2">
              <Checkbox
                id="terms"
                className="mt-1"
                checked={termsAgreed}
                onCheckedChange={(checked) => setTermsAgreed(checked === true)}
              />
              <Label
                htmlFor="terms"
                className="text-sm font-normal leading-relaxed"
              >
                <Link
                  href="/terms"
                  className="font-medium text-accent hover:underline"
                >
                  이용약관
                </Link>{" "}
                및{" "}
                <Link
                  href="/privacy"
                  className="font-medium text-accent hover:underline"
                >
                  개인정보처리방침
                </Link>
                에 동의합니다
              </Label>
            </div>

            <div className="flex items-start gap-2">
              <Checkbox id="marketing" className="mt-1" />
              <Label
                htmlFor="marketing"
                className="text-sm font-normal leading-relaxed text-muted-foreground"
              >
                마케팅 정보 수신에 동의합니다 (선택)
              </Label>
            </div>

            <Button
              type="submit"
              className=" w-full rounded bg-accent text-accent-foreground hover:bg-accent/90"
              disabled={
                !termsAgreed ||
                isLoading ||
                success ||
                username.length == 0 ||
                usernameStatus !== "available" ||
                nick.length == 0 ||
                nickStatus !== "available" ||
                pw.length == 0 ||
                confirmPw.length == 0 ||
                passwordMatchStatus !== "match"
              }
            >
              <UserPlus className="mr-2 h-4 w-4" />
              {isLoading
                ? "가입 중..."
                : success
                ? "회원가입 완료"
                : "무료로 시작하기"}
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

          <div className="space-y-3">
            <Button variant="outline" className="w-full" type="button">
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google로 가입하기
            </Button>
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            이미 계정이 있으신가요?{" "}
            <Link
              href="/login"
              className="font-semibold text-accent hover:underline"
            >
              로그인
            </Link>
          </p>
        </Card>
      </div>

      {/* 회원가입 완료 모달 */}
      <Dialog open={success} onOpenChange={setSuccess}>
        <DialogContent className="sm:max-w-md [&>button]:hidden">
          <DialogHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
                <CheckCircle2 className="h-10 w-10 text-green-500" />
              </div>
            </div>
            <DialogTitle className="text-center text-2xl">
              회원가입이 완료되었습니다.
            </DialogTitle>
            <DialogDescription className="text-center pt-2">
              잠시 후 로그인 페이지로 이동합니다.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}
