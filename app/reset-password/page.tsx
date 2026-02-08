"use client";

import authApi from "@/api/authApi";
import { BrandText } from "@/components/ui/BrandText";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePasswordValidation } from "@/hooks/usePasswordValidation";
import { CheckCircle2, Loader2, Lock, XCircle } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // 비밀번호 유효성 검사 훅
  const {
    passwordStatus,
    strengthText,
    strengthColorClass,
    errorMessage: passwordErrorMessage,
    successMessage: passwordSuccessMessage,
  } = usePasswordValidation(newPassword);

  // 비밀번호 확인 상태
  const [confirmStatus, setConfirmStatus] = useState<
    "idle" | "match" | "mismatch"
  >("idle");

  useEffect(() => {
    if (newPassword.length === 0 && confirmPassword.length === 0) {
      setConfirmStatus("idle");
    } else if (newPassword === confirmPassword) {
      setConfirmStatus("match");
    } else {
      setConfirmStatus("mismatch");
    }
  }, [newPassword, confirmPassword]);

  const isFormValid = passwordStatus === "valid" && confirmStatus === "match";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setError("유효하지 않은 접근입니다. 비밀번호 재설정 링크를 다시 확인해주세요.");
      return;
    }

    if (!isFormValid) return;

    setIsLoading(true);
    setError("");

    try {
      await authApi.resetPassword(token, newPassword);
      setShowSuccessModal(true);
      // 2초 후 로그인 페이지로 이동
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: any) {
      if (err.response?.status === 400) {
        setError(err.response?.data?.message || "유효하지 않거나 만료된 토큰입니다.");
      } else {
        setError("비밀번호 변경 중 오류가 발생했습니다. 다시 시도해주세요.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 토큰이 없는 경우
  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-2 p-4">
        <div className="w-full max-w-md">
          <Card className="p-8 border-none bg-background-1">
            <div className="mb-8 flex items-center justify-center">
              <BrandText className="text-3xl">Tuno</BrandText>
            </div>
            <div className="text-center py-8">
              <XCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">잘못된 접근입니다</h2>
              <p className="text-sm text-muted-foreground mb-6">
                비밀번호 재설정 링크가 올바르지 않습니다.
                <br />
                이메일의 링크를 다시 확인해주세요.
              </p>
              <Link href="/find-account">
                <Button variant="accent" className="w-full">
                  비밀번호 찾기로 이동
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background-2 p-4">
      <div className="w-full max-w-md">
        <Card className="p-8 border-none bg-background-1">
          {/* Logo */}
          <div className="mb-8 flex items-center justify-center">
            <BrandText className="text-3xl">Tuno</BrandText>
          </div>

          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold mb-1">비밀번호 재설정</h1>
            <p className="text-sm text-muted-foreground">
              새로운 비밀번호를 입력해주세요
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 새 비밀번호 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="newPassword">새 비밀번호</Label>
                {newPassword.length > 0 && (
                  <span className={`text-xs font-medium ${strengthColorClass}`}>
                    {strengthText}
                  </span>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={isLoading}
                  className={
                    "pl-9 rounded " +
                    (passwordStatus === "invalid"
                      ? "border-destructive pr-10"
                      : passwordStatus === "valid"
                        ? "border-green-500 pr-10"
                        : "")
                  }
                />
                {passwordStatus === "valid" && (
                  <CheckCircle2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-green-500" />
                )}
                {passwordStatus === "invalid" && (
                  <XCircle className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-destructive" />
                )}
              </div>
              {passwordErrorMessage && (
                <p className="text-xs text-destructive">{passwordErrorMessage}</p>
              )}
              {passwordSuccessMessage && (
                <p className="text-xs text-green-600 dark:text-green-400">
                  {passwordSuccessMessage}
                </p>
              )}
              {newPassword.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  최소 8자 이상, 영문, 숫자, 특수문자 포함
                </p>
              )}
            </div>

            {/* 비밀번호 확인 */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">비밀번호 확인</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  className={
                    "pl-9 rounded " +
                    (confirmStatus === "mismatch"
                      ? "border-destructive pr-10"
                      : confirmStatus === "match"
                        ? "border-green-500 pr-10"
                        : "")
                  }
                />
                {confirmStatus === "match" && (
                  <CheckCircle2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-green-500" />
                )}
                {confirmStatus === "mismatch" && (
                  <XCircle className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-destructive" />
                )}
              </div>
              {confirmStatus === "match" && (
                <p className="text-xs text-green-600 dark:text-green-400">
                  비밀번호가 일치합니다.
                </p>
              )}
              {confirmStatus === "mismatch" && (
                <p className="text-xs text-destructive">
                  비밀번호가 일치하지 않습니다.
                </p>
              )}
            </div>

            {error && (
              <div className="rounded bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <Button
              type="submit"
              variant="accent"
              className="w-full"
              disabled={isLoading || !isFormValid}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  변경 중...
                </>
              ) : (
                "비밀번호 변경"
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            <Link href="/login" className="text-accent hover:underline">
              로그인으로 돌아가기
            </Link>
          </p>
        </Card>

        {/* 성공 모달 */}
        <Dialog open={showSuccessModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <div className="flex justify-center mb-4">
                <CheckCircle2 className="h-12 w-12 text-green-500" />
              </div>
              <DialogTitle className="text-center text-xl">
                비밀번호가 변경되었습니다
              </DialogTitle>
              <DialogDescription className="text-center pt-2">
                잠시 후 로그인 페이지로 이동합니다.
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-background-2"></div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
