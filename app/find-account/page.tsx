"use client";

import authApi from "@/api/authApi";
import { BrandText } from "@/components/ui/BrandText";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getRedirectUrl, withRedirect } from "@/lib/utils";
import { CheckCircle2, Loader2, Mail, User, XCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

type TabType = "find-username" | "reset-password";

export default function ForgotPasswordPage() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabType>("find-username");

  // 아이디 찾기 상태
  const [findEmail, setFindEmail] = useState("");
  const [findEmailStatus, setFindEmailStatus] = useState<"idle" | "valid" | "invalid">("idle");
  const [findLoading, setFindLoading] = useState(false);
  const [findSuccess, setFindSuccess] = useState(false);
  const [findError, setFindError] = useState("");

  // 비밀번호 찾기 상태
  const [resetUsername, setResetUsername] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [resetEmailStatus, setResetEmailStatus] = useState<"idle" | "valid" | "invalid">("idle");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState("");

  // 이메일 형식 검증
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // 아이디 찾기 이메일 변경 핸들러
  const handleFindEmailChange = (value: string) => {
    setFindEmail(value);
    if (value.length === 0) {
      setFindEmailStatus("idle");
    } else if (isValidEmail(value)) {
      setFindEmailStatus("valid");
    } else {
      setFindEmailStatus("invalid");
    }
  };

  // 비밀번호 찾기 이메일 변경 핸들러
  const handleResetEmailChange = (value: string) => {
    setResetEmail(value);
    if (value.length === 0) {
      setResetEmailStatus("idle");
    } else if (isValidEmail(value)) {
      setResetEmailStatus("valid");
    } else {
      setResetEmailStatus("invalid");
    }
  };

  // 아이디 찾기 제출
  const handleFindUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    if (findEmailStatus !== "valid") {
      setFindError("올바른 이메일 형식을 입력해주세요.");
      return;
    }

    setFindLoading(true);
    setFindError("");

    try {
      await authApi.findUsername(findEmail);
      setFindSuccess(true);
    } catch (err: any) {
      setFindError(
        "요청 처리 중 오류가 발생했습니다."
      );
    } finally {
      setFindLoading(false);
    }
  };

  // 비밀번호 재설정 요청 제출
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (resetUsername.length < 4) {
      setResetError("아이디는 최소 4자 이상이어야 합니다.");
      return;
    }
    if (resetEmailStatus !== "valid") {
      setResetError("올바른 이메일 형식을 입력해주세요.");
      return;
    }

    setResetLoading(true);
    setResetError("");

    try {
      await authApi.requestPasswordReset(resetUsername, resetEmail);
      setResetSuccess(true);
    } catch (err: any) {
      setResetError(
        "요청 처리 중 오류가 발생했습니다."
      );
    } finally {
      setResetLoading(false);
    }
  };

  // 탭 전환 시 상태 초기화
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    // 상태 초기화
    setFindEmail("");
    setFindEmailStatus("idle");
    setFindSuccess(false);
    setFindError("");
    setResetUsername("");
    setResetEmail("");
    setResetEmailStatus("idle");
    setResetSuccess(false);
    setResetError("");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background-2 p-4">
      <div className="w-full max-w-md">
        <Card className="p-8 border-none bg-background-1">
          {/* Logo */}
          <div className="mb-8 flex items-center justify-center">
            <BrandText className="text-3xl">Tuno</BrandText>
          </div>

          {/* 탭 */}
          <div className="mb-6 flex border-b border-border">
            <button
              type="button"
              className={`flex-1 pb-3 text-sm font-medium transition-colors ${activeTab === "find-username"
                ? "text-accent border-b-2 border-accent"
                : "text-muted-foreground hover:text-foreground"
                }`}
              onClick={() => handleTabChange("find-username")}
            >
              아이디 찾기
            </button>
            <button
              type="button"
              className={`flex-1 pb-3 text-sm font-medium transition-colors ${activeTab === "reset-password"
                ? "text-accent border-b-2 border-accent"
                : "text-muted-foreground hover:text-foreground"
                }`}
              onClick={() => handleTabChange("reset-password")}
            >
              비밀번호 찾기
            </button>
          </div>

          {/* 아이디 찾기 탭 */}
          {activeTab === "find-username" && (
            <>
              {findSuccess ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="mx-auto h-12 w-12 text-green-500 mb-4" />
                  <h2 className="text-xl font-semibold mb-2">
                    이메일이 발송되었습니다
                  </h2>
                  <p className="text-sm text-muted-foreground mb-6">
                    입력하신 이메일로 아이디 정보를 발송했습니다.
                    <br />
                    이메일을 확인해주세요.
                  </p>
                  <Link
                    href={withRedirect("/login", getRedirectUrl(searchParams))}
                  >
                    <Button variant="accent" className="w-full">
                      로그인으로 돌아가기
                    </Button>
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleFindUsername} className="space-y-4">
                  <div className="text-center mb-4">
                    <h2 className="text-xl font-semibold mb-1">아이디 찾기</h2>
                    <p className="text-sm text-muted-foreground">
                      가입 시 등록한 이메일을 입력해주세요
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="find-email">이메일</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="find-email"
                        type="email"
                        placeholder="example@email.com"
                        value={findEmail}
                        onChange={(e) => handleFindEmailChange(e.target.value)}
                        disabled={findLoading}
                        className={
                          "pl-9 rounded " +
                          (findEmailStatus === "invalid"
                            ? "border-destructive pr-10"
                            : findEmailStatus === "valid"
                              ? "border-green-500 pr-10"
                              : "")
                        }
                      />
                      {findEmailStatus === "valid" && (
                        <CheckCircle2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-green-500" />
                      )}
                      {findEmailStatus === "invalid" && (
                        <XCircle className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-destructive" />
                      )}
                    </div>
                    {findEmailStatus === "invalid" && (
                      <p className="text-xs text-destructive">
                        올바른 이메일 형식을 입력해주세요.
                      </p>
                    )}
                  </div>

                  {findError && (
                    <p className="text-sm text-destructive">{findError}</p>
                  )}

                  <Button
                    type="submit"
                    variant="accent"
                    className="w-full"
                    disabled={findLoading || findEmailStatus !== "valid"}
                  >
                    {findLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        발송 중...
                      </>
                    ) : (
                      "이메일 발송"
                    )}
                  </Button>
                </form>
              )}
            </>
          )}

          {/* 비밀번호 찾기 탭 */}
          {activeTab === "reset-password" && (
            <>
              {resetSuccess ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="mx-auto h-12 w-12 text-green-500 mb-4" />
                  <h2 className="text-xl font-semibold mb-2">
                    이메일이 발송되었습니다
                  </h2>
                  <p className="text-sm text-muted-foreground mb-6">
                    입력하신 이메일로 비밀번호 재설정 링크를 발송했습니다.
                    <br />
                    이메일을 확인해주세요.
                  </p>
                  <Link
                    href={withRedirect("/login", getRedirectUrl(searchParams))}
                  >
                    <Button variant="accent" className="w-full">
                      로그인으로 돌아가기
                    </Button>
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="text-center mb-4">
                    <h2 className="text-xl font-semibold mb-1">비밀번호 찾기</h2>
                    <p className="text-sm text-muted-foreground">
                      아이디와 가입 시 등록한 이메일을 입력해주세요
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reset-username">아이디</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="reset-username"
                        type="text"
                        placeholder="아이디"
                        value={resetUsername}
                        onChange={(e) => setResetUsername(e.target.value)}
                        disabled={resetLoading}
                        className="pl-9 rounded"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reset-email">이메일</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="reset-email"
                        type="email"
                        placeholder="example@email.com"
                        value={resetEmail}
                        onChange={(e) => handleResetEmailChange(e.target.value)}
                        disabled={resetLoading}
                        className={
                          "pl-9 rounded " +
                          (resetEmailStatus === "invalid"
                            ? "border-destructive pr-10"
                            : resetEmailStatus === "valid"
                              ? "border-green-500 pr-10"
                              : "")
                        }
                      />
                      {resetEmailStatus === "valid" && (
                        <CheckCircle2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-green-500" />
                      )}
                      {resetEmailStatus === "invalid" && (
                        <XCircle className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-destructive" />
                      )}
                    </div>
                    {resetEmailStatus === "invalid" && (
                      <p className="text-xs text-destructive">
                        올바른 이메일 형식을 입력해주세요.
                      </p>
                    )}
                  </div>

                  {resetError && (
                    <p className="text-sm text-destructive">{resetError}</p>
                  )}

                  <Button
                    type="submit"
                    variant="accent"
                    className="w-full"
                    disabled={
                      resetLoading ||
                      resetUsername.length === 0 ||
                      resetEmailStatus !== "valid"
                    }
                  >
                    {resetLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        발송 중...
                      </>
                    ) : (
                      "재설정 링크 발송"
                    )}
                  </Button>
                </form>
              )}
            </>
          )}

          {/* 로그인 링크 */}
          {!findSuccess && !resetSuccess && (
            <p className="mt-6 text-center text-sm text-muted-foreground">
              <Link
                href={withRedirect("/login", getRedirectUrl(searchParams))}
                className="text-accent hover:underline"
              >
                로그인으로 돌아가기
              </Link>
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}
