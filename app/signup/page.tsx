"use client";

import authApi from "@/api/authApi";
import userApi from "@/api/userApi";
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
import { useEmailVerification } from "@/hooks/useEmailVerification";
import { useNicknameCheck } from "@/hooks/useNicknameCheck";
import { usePasswordValidation } from "@/hooks/usePasswordValidation";
import { getRedirectUrl, withRedirect } from "@/lib/utils";
import {
  CheckCircle2,
  Loader2,
  UserCheck,
  UserPlus,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [nick, setNick] = useState("");
  const [pw, setPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  // 약관 동의 모달 온 오프프
  const [termsModalOpen, setTermsModalOpen] = useState(false);
  // 약관 동의 모달 내부 탭 상태
  const [activeTab, setActiveTab] = useState<"terms" | "privacy">("terms");
  // 약관 동의 모달 내부 동의 상태
  const [modalAgreed, setModalAgreed] = useState(false);

  // 중복 체크 상태
  const [usernameStatus, setUsernameStatus] = useState<
    "idle" | "checking" | "available" | "unavailable"
  >("idle");
  const [usernameMessage, setUsernameMessage] = useState("");

  // 닉네임 체크 훅 사용
  const { nickStatus, nickMessage } = useNicknameCheck(nick);

  // 비밀번호 유효성 훅 사용
  const {
    passwordStatus,
    strengthText,
    strengthColorClass,
    errorMessage: passwordErrorMessage,
    successMessage: passwordSuccessMessage,
    reset: resetPassword,
  } = usePasswordValidation(pw);

  // 비밀번호 일치 상태
  const [passwordMatchStatus, setPasswordMatchStatus] = useState<
    "idle" | "match" | "mismatch"
  >("idle");
  const [passwordMatchMessage, setPasswordMatchMessage] = useState("");

  // 이메일 인증 훅 사용
  const {
    email,
    setEmail,
    emailStatus,
    emailMessage,
    emailCode,
    setEmailCode,
    emailCodeMessage,
    isCodeSent,
    isSendingCode,
    isVerifying,
    emailVerified,
    remainingSeconds,
    codeExpiresIn,
    codeSentMessage,
    emailError,
    signupToken,
    attempts,
    maxAttempts,
    handleSendEmailCode,
    handleResendEmailCode,
    handleVerifyEmailCode,
    handleChangeEmail,
    reset: resetEmail,
  } = useEmailVerification();

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

  // 이메일 에러를 전역 에러와 병합
  useEffect(() => {
    if (emailError) {
      setError(emailError);
    }
  }, [emailError]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    // 이메일 검증
    if (!email || emailStatus !== "valid") {
      setError("올바른 이메일을 입력해주세요.");
      return;
    }

    // 이메일 인증 확인
    if (!emailVerified) {
      setError("이메일 인증을 완료해주세요.");
      return;
    }

    // signupToken 확인
    if (!signupToken) {
      setError("이메일 인증 토큰이 없습니다. 다시 인증해주세요.");
      return;
    }

    // 비밀번호 유효성 검증
    if (passwordStatus !== "valid") {
      setError("비밀번호 조건을 모두 충족해주세요.");
      return;
    }

    // 비밀번호 확인 검증
    if (pw !== confirmPw) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess(false);

    try {
      await authApi.register(username, nick, pw, email, signupToken);
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
      resetPassword();
      resetEmail();

      // 2초 후 모달 닫고 로그인 페이지로 이동
      setTimeout(() => {
        setSuccess(false);
        const redirect = getRedirectUrl(searchParams);
        router.push(withRedirect("/login", redirect));
      }, 2000);
    } catch (err: any) {
      if (
        err.response?.data?.success === false ||
        err.response?.status === 400
      ) {
        setError(err.response.data.message);
      } else {
        console.log(err);
        setError("회원가입 중 오류가 발생했습니다. 다시 시도해주세요.");
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-background-2 flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md">
        {/* (홈으로 돌아가기 링크 제거) */}

        <Card className="p-8 border-none bg-background-1">
          {/* Logo */}
          <div className="mb-8 flex items-center justify-center">
            <BrandText className="text-3xl">Tuno</BrandText>
          </div>

          <div className="mb-8 text-center">
            <h1 className="mb-2 text-2xl font-bold">회원가입</h1>
            <p className="text-sm text-muted-foreground">
              Tuno의 회원이 되어 다양한 서비스를 이용해보세요
            </p>
          </div>

          {error && (
            <div className=" rounded bg-destructive/10 p-3 text-sm text-destructive">
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
                    "focus-visible:ring-0 rounded " +
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
                  className={`text-xs ${usernameStatus === "available"
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
                    "rounded focus-visible:ring-0 " +
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
                  className={`text-xs ${nickStatus === "available"
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
              <Label htmlFor="email">이메일</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    id="email"
                    type="email"
                    placeholder="이메일"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                    disabled={isLoading || success || emailVerified}
                    className={
                      "rounded focus-visible:ring-0 " +
                      (emailStatus === "invalid"
                        ? "border-destructive pr-10"
                        : emailStatus === "valid" && emailVerified
                          ? "border-green-500 pr-10"
                          : emailStatus === "valid"
                            ? "border-green-500"
                            : undefined)
                    }
                  />
                  {emailStatus === "valid" && emailVerified && (
                    <CheckCircle2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-green-500" />
                  )}
                  {emailStatus === "invalid" && (
                    <XCircle className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-destructive" />
                  )}
                </div>
                <Button
                  type="button"
                  onClick={() => {
                    setError(""); // 전역 에러 초기화
                    if (emailVerified) {
                      handleChangeEmail();
                    } else if (isCodeSent) {
                      handleResendEmailCode();
                    } else {
                      handleSendEmailCode();
                    }
                  }}
                  disabled={
                    isLoading ||
                    success ||
                    (emailVerified
                      ? false
                      : emailStatus !== "valid" ||
                      isSendingCode ||
                      (isCodeSent && remainingSeconds > 0))
                  }
                  className="shrink-0"
                  variant="outline"
                >
                  {emailVerified ? (
                    "변경"
                  ) : isSendingCode ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      발송 중...
                    </>
                  ) : isCodeSent && remainingSeconds > 0 ? (
                    `재발송 (${Math.floor(remainingSeconds / 60)}:${String(
                      remainingSeconds % 60
                    ).padStart(2, "0")})`
                  ) : isCodeSent ? (
                    "재발송"
                  ) : (
                    "코드 발송"
                  )}
                </Button>
              </div>
              {emailMessage && (
                <p
                  className={`text-xs ${emailStatus === "valid"
                      ? "text-green-600 dark:text-green-400"
                      : emailStatus === "invalid"
                        ? "text-destructive"
                        : "text-muted-foreground"
                    }`}
                >
                  {emailVerified
                    ? "이메일 인증이 완료되었습니다."
                    : emailMessage}
                </p>
              )}
            </div>

            {/* 이메일 인증 코드 입력 */}
            {isCodeSent && !emailVerified && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <Label htmlFor="email-code">인증 코드</Label>
                  {codeExpiresIn > 0 && (
                    <span
                      className={`text-xs whitespace-nowrap tabular-nums ${codeExpiresIn <= 60
                          ? "text-destructive"
                          : "text-muted-foreground"
                        }`}
                    >
                      유효 시간 {Math.floor(codeExpiresIn / 60)}:
                      {String(codeExpiresIn % 60).padStart(2, "0")}
                    </span>
                  )}
                  {/* 시도 횟수 표시 - 항상 표시하되 attempts가 0이면 0/5로 표시 */}
                  <span
                    className={`text-xs whitespace-nowrap tabular-nums ${attempts >= maxAttempts
                        ? "text-destructive font-semibold"
                        : attempts >= maxAttempts - 1
                          ? "text-orange-500"
                          : "text-muted-foreground"
                      }`}
                  >
                    시도 횟수: {attempts}/{maxAttempts}
                  </span>
                </div>
                <div className="flex gap-2 items-center">
                  <Input
                    id="email-code"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="6자리 인증 코드 입력"
                    value={emailCode}
                    onChange={(e) => setEmailCode(e.target.value)}
                    onKeyDown={(e) => {
                      // 숫자, 백스페이스, Delete, 화살표 키, Tab 등은 허용
                      if (
                        !/[0-9]/.test(e.key) &&
                        ![
                          "Backspace",
                          "Delete",
                          "ArrowLeft",
                          "ArrowRight",
                          "Tab",
                          "Home",
                          "End",
                        ].includes(e.key) &&
                        !(e.ctrlKey || e.metaKey) // Ctrl+C, Ctrl+V 등은 허용
                      ) {
                        e.preventDefault();
                      }
                    }}
                    onPaste={(e) => {
                      e.preventDefault();
                      const pastedText = e.clipboardData.getData("text");
                      const numbersOnly = pastedText.replace(/[^0-9]/g, "");
                      setEmailCode(numbersOnly);
                    }}
                    disabled={isLoading || success || isVerifying}
                    className="rounded focus-visible:ring-0"
                    maxLength={6}
                  />
                  <Button
                    type="button"
                    onClick={() => {
                      setError(""); // 전역 에러 초기화
                      handleVerifyEmailCode();
                    }}
                    disabled={
                      isLoading ||
                      success ||
                      !emailCode ||
                      isVerifying ||
                      emailCode.length < 4
                    }
                    className="shrink-0"
                    variant="outline"
                  >
                    {isVerifying ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        확인 중...
                      </>
                    ) : (
                      "인증 확인"
                    )}
                  </Button>
                </div>
                {/* 발송/재발송 성공 메시지 표시 */}
                {codeSentMessage && !emailCodeMessage && (
                  <p className="text-xs text-green-600 dark:text-green-400">
                    {codeSentMessage}
                  </p>
                )}
                {/* 검증 결과 메시지 */}
                {emailVerified ? (
                  <p className="text-xs text-green-600 dark:text-green-400">
                    이메일 인증이 완료되었습니다.
                  </p>
                ) : emailCodeMessage ? (
                  <p className="text-xs text-destructive">{emailCodeMessage}</p>
                ) : null}
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="pw">비밀번호</Label>
                {pw.length > 0 && (
                  <span className={`text-xs font-medium ${strengthColorClass}`}>
                    {strengthText}
                  </span>
                )}
              </div>
              <div className="relative">
                <Input
                  id="pw"
                  type="password"
                  placeholder="••••••••"
                  value={pw}
                  onChange={(e) => setPw(e.target.value)}
                  autoComplete="new-password"
                  required
                  disabled={isLoading || success}
                  className={
                    "rounded focus-visible:ring-0 " +
                    (passwordStatus === "invalid"
                      ? "border-destructive pr-10"
                      : passwordStatus === "valid"
                        ? "border-green-500 pr-10"
                        : undefined)
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
              {pw.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  최소 8자 이상, 영문, 숫자, 특수문자 포함
                </p>
              )}
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
                    "rounded focus-visible:ring-0 " +
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
                  className={`text-xs ${passwordMatchStatus === "match"
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

            <div className="mt-10 flex items-start gap-2">
              <Checkbox
                id="terms"
                className="mt-1"
                checked={termsAgreed}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setTermsModalOpen(true);
                  } else {
                    setTermsAgreed(false);
                  }
                }}
              />
              <Label
                htmlFor="terms"
                className="text-sm font-normal leading-relaxed cursor-pointer"
                onClick={() => {
                  if (!termsAgreed) {
                    setTermsModalOpen(true);
                  }
                }}
              >
                <span className="font-medium text-accent hover:underline">
                  이용약관
                </span>{" "}
                및{" "}
                <span className="font-medium text-accent hover:underline">
                  개인정보처리방침
                </span>
                에 동의합니다
              </Label>
            </div>

            <Button
              type="submit"
              className=" w-full rounded bg-accent text-accent-foreground hover:bg-accent/90 hover:scale-105"
              disabled={
                !termsAgreed ||
                isLoading ||
                success ||
                username.length == 0 ||
                usernameStatus !== "available" ||
                nick.length == 0 ||
                nickStatus !== "available" ||
                email.length == 0 ||
                emailStatus !== "valid" ||
                !emailVerified ||
                passwordStatus !== "valid" ||
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

          <p className="mt-6 text-center text-sm text-muted-foreground">
            이미 계정이 있으신가요?{" "}
            <Link
              href={withRedirect("/login", getRedirectUrl(searchParams))}
              className="font-semibold text-accent hover:underline"
            >
              로그인
            </Link>
          </p>
        </Card>
      </div>

      {/* 약관 동의 모달 */}
      <Dialog
        open={termsModalOpen}
        onOpenChange={(open) => {
          setTermsModalOpen(open);
          if (!open) {
            // 모달이 닫힐 때 상태 초기화
            setModalAgreed(false);
            setActiveTab("terms");
          }
        }}
      >
        <DialogContent className="bg-background-1 border-none sm:max-w-2xl max-h-[85vh] flex flex-col top-[50%] translate-y-[-50%]">
          <DialogHeader>
            <DialogTitle className="text-center text-xl mb-3">
              이용약관 및 개인정보처리방침
            </DialogTitle>
            <DialogDescription className="text-center text-sm text-muted-foreground">
              아래 내용을 확인하시고 동의해주세요.
            </DialogDescription>
          </DialogHeader>

          {/* 탭 */}
          <div className="flex border-b border-border">
            <button
              type="button"
              onClick={() => {
                setActiveTab("terms");
                setModalAgreed(false);
              }}
              className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${activeTab === "terms"
                  ? "border-b-2 border-accent text-accent"
                  : "text-muted-foreground hover:text-foreground"
                }`}
            >
              이용약관
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("privacy");
                setModalAgreed(false);
              }}
              className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${activeTab === "privacy"
                  ? "border-b-2 border-accent text-accent"
                  : "text-muted-foreground hover:text-foreground"
                }`}
            >
              개인정보처리방침
            </button>
          </div>

          {/* 약관 내용 */}
          <div className="flex-1 overflow-y-auto mt-4 pr-2">
            <div className="text-sm text-foreground space-y-4">
              {activeTab === "terms" ? (
                <div className="space-y-4">
                  <h3 className="font-semibold text-base">제1조 (목적)</h3>
                  <p>
                    본 약관은 Tuno(이하 "회사")가 제공하는 서비스의 이용과
                    관련하여 회사와 이용자 간의 권리, 의무 및 책임사항, 기타
                    필요한 사항을 규정함을 목적으로 합니다.
                  </p>

                  <h3 className="font-semibold text-base">제2조 (정의)</h3>
                  <p>
                    1. "서비스"란 회사가 제공하는 AI 기반 주식 투자 분석 및 관련
                    서비스를 의미합니다.
                  </p>
                  <p>
                    2. "이용자"란 본 약관에 동의하고 회사가 제공하는 서비스를
                    이용하는 회원 및 비회원을 의미합니다.
                  </p>
                  <p>
                    3. "회원"이란 회사에 개인정보를 제공하여 회원등록을 한
                    자로서, 회사의 정보를 지속적으로 제공받으며, 회사가 제공하는
                    서비스를 계속적으로 이용할 수 있는 자를 의미합니다.
                  </p>

                  <h3 className="font-semibold text-base">
                    제3조 (약관의 게시와 개정)
                  </h3>
                  <p>
                    1. 회사는 본 약관의 내용을 이용자가 쉽게 알 수 있도록 서비스
                    초기 화면에 게시합니다.
                  </p>
                  <p>
                    2. 회사는 필요한 경우 관련 법령을 위배하지 않는 범위에서 본
                    약관을 개정할 수 있습니다.
                  </p>
                  <p>
                    3. 회사가 약관을 개정할 경우에는 적용일자 및 개정사유를
                    명시하여 현행약관과 함께 서비스의 초기화면에 그 적용일자 7일
                    이전부터 적용일자 전일까지 공지합니다.
                  </p>

                  <h3 className="font-semibold text-base">
                    제4조 (서비스의 제공 및 변경)
                  </h3>
                  <p>1. 회사는 다음과 같은 서비스를 제공합니다:</p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>AI 기반 주식 분석 및 예측 서비스</li>
                    <li>투자 포트폴리오 관리 서비스</li>
                    <li>시장 동향 및 뉴스 제공 서비스</li>
                    <li>
                      기타 회사가 추가 개발하거나 제휴계약 등을 통해 이용자에게
                      제공하는 일체의 서비스
                    </li>
                  </ul>
                  <p>
                    2. 회사는 서비스의 내용을 변경할 수 있으며, 변경 시에는
                    사전에 공지합니다.
                  </p>

                  <h3 className="font-semibold text-base">
                    제5조 (서비스의 중단)
                  </h3>
                  <p>
                    1. 회사는 컴퓨터 등 정보통신설비의 보수점검, 교체 및 고장,
                    통신의 두절 등의 사유가 발생한 경우에는 서비스의 제공을
                    일시적으로 중단할 수 있습니다.
                  </p>
                  <p>
                    2. 회사는 제1항의 사유로 서비스의 제공이 일시적으로
                    중단됨으로 인하여 이용자 또는 제3자가 입은 손해에 대하여
                    배상합니다. 단, 회사가 고의 또는 과실이 없음을 입증하는
                    경우에는 그러하지 아니합니다.
                  </p>

                  <h3 className="font-semibold text-base">제6조 (회원가입)</h3>
                  <p>
                    1. 이용자는 회사가 정한 가입 양식에 따라 회원정보를 기입한
                    후 본 약관에 동의한다는 의사표시를 함으로서 회원가입을
                    신청합니다.
                  </p>
                  <p>
                    2. 회사는 제1항과 같이 회원가입을 신청한 이용자 중 다음 각
                    호에 해당하지 않는 한 회원으로 등록합니다:
                  </p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>
                      가입신청자가 이전에 회원자격을 상실한 적이 있는 경우
                    </li>
                    <li>등록 내용에 허위, 기재누락, 오기가 있는 경우</li>
                    <li>
                      기타 회원으로 등록하는 것이 회사의 기술상 현저히 지장이
                      있다고 판단되는 경우
                    </li>
                  </ul>

                  <h3 className="font-semibold text-base">
                    제7조 (회원 탈퇴 및 자격 상실 등)
                  </h3>
                  <p>
                    1. 회원은 회사에 언제든지 탈퇴를 요청할 수 있으며 회사는
                    즉시 회원탈퇴를 처리합니다.
                  </p>
                  <p>
                    2. 회원이 다음 각 호의 사유에 해당하는 경우, 회사는
                    회원자격을 제한 및 정지시킬 수 있습니다:
                  </p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>가입 신청 시에 허위 내용을 등록한 경우</li>
                    <li>
                      다른 사람의 서비스 이용을 방해하거나 그 정보를 도용하는 등
                      전자상거래 질서를 위협하는 경우
                    </li>
                    <li>
                      서비스를 이용하여 법령 또는 이 약관이 금지하거나
                      공서양속에 반하는 행위를 하는 경우
                    </li>
                  </ul>

                  <h3 className="font-semibold text-base">
                    제8조 (개인정보보호)
                  </h3>
                  <p>
                    회사는 이용자의 개인정보 수집시 서비스제공을 위하여 필요한
                    범위에서 최소한의 개인정보를 수집합니다. 회사는 회원가입시
                    구매계약이행에 필요한 정보를 미리 수집하지 않습니다.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="font-semibold text-base">
                    제1조 (개인정보의 처리목적)
                  </h3>
                  <p>
                    Tuno(이하 "회사")는 다음의 목적을 위하여 개인정보를
                    처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의
                    용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는
                    개인정보보호법 제18조에 따라 별도의 동의를 받는 등 필요한
                    조치를 이행할 예정입니다.
                  </p>
                  <p>
                    1. 홈페이지 회원 가입 및 관리: 회원 가입의사 확인, 회원제
                    서비스 제공에 따른 본인 식별·인증, 회원자격 유지·관리,
                    서비스 부정이용 방지, 각종 고지·통지, 고충처리 등을 목적으로
                    개인정보를 처리합니다.
                  </p>
                  <p>
                    2. 재화 또는 서비스 제공: 서비스 제공, 콘텐츠 제공,
                    맞춤서비스 제공, 본인인증, 요금결제·정산 등을 목적으로
                    개인정보를 처리합니다.
                  </p>
                  <p>
                    3. 마케팅 및 광고에의 활용: 신규 서비스(제품) 개발 및 맞춤
                    서비스 제공, 이벤트 및 광고성 정보 제공 및 참여기회 제공,
                    서비스의 유효성 확인, 접속빈도 파악 또는 회원의 서비스
                    이용에 대한 통계 등을 목적으로 개인정보를 처리합니다.
                  </p>

                  <h3 className="font-semibold text-base">
                    제2조 (개인정보의 처리 및 보유기간)
                  </h3>
                  <p>
                    1. 회사는 법령에 따른 개인정보 보유·이용기간 또는
                    정보주체로부터 개인정보를 수집시에 동의받은 개인정보
                    보유·이용기간 내에서 개인정보를 처리·보유합니다.
                  </p>
                  <p>2. 각각의 개인정보 처리 및 보유 기간은 다음과 같습니다:</p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>
                      홈페이지 회원 가입 및 관리: 회원 탈퇴시까지 (다만,
                      관계법령 위반에 따른 수사·조사 등이 진행중인 경우에는 해당
                      수사·조사 종료시까지)
                    </li>
                    <li>
                      재화 또는 서비스 제공: 재화·서비스 공급완료 및
                      요금결제·정산 완료시까지
                    </li>
                    <li>마케팅 및 광고에의 활용: 회원 탈퇴시까지</li>
                  </ul>

                  <h3 className="font-semibold text-base">
                    제3조 (처리하는 개인정보의 항목)
                  </h3>
                  <p>회사는 다음의 개인정보 항목을 처리하고 있습니다:</p>
                  <p>
                    1. 홈페이지 회원 가입 및 관리: 필수항목(아이디, 비밀번호,
                    닉네임), 선택항목(이메일, 전화번호)
                  </p>
                  <p>
                    2. 재화 또는 서비스 제공: 필수항목(아이디, 닉네임),
                    선택항목(결제정보)
                  </p>
                  <p>
                    3. 인터넷 서비스 이용과정에서 자동 수집되는 정보: IP주소,
                    쿠키, MAC주소, 서비스 이용 기록, 방문 기록, 불량 이용 기록
                    등
                  </p>

                  <h3 className="font-semibold text-base">
                    제4조 (개인정보의 제3자 제공)
                  </h3>
                  <p>
                    1. 회사는 정보주체의 개인정보를 제1조(개인정보의
                    처리목적)에서 명시한 범위 내에서만 처리하며, 정보주체의
                    동의, 법률의 특별한 규정 등 개인정보 보호법 제17조 및
                    제18조에 해당하는 경우에만 개인정보를 제3자에게 제공합니다.
                  </p>
                  <p>
                    2. 회사는 원칙적으로 이용자의 개인정보를 외부에 제공하지
                    않습니다. 다만, 아래의 경우에는 예외로 합니다:
                  </p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>이용자들이 사전에 동의한 경우</li>
                    <li>
                      법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진
                      절차와 방법에 따라 수사기관의 요구가 있는 경우
                    </li>
                  </ul>

                  <h3 className="font-semibold text-base">
                    제5조 (개인정보처리의 위탁)
                  </h3>
                  <p>
                    1. 회사는 원활한 개인정보 업무처리를 위하여 다음과 같이
                    개인정보 처리업무를 위탁하고 있습니다:
                  </p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>클라우드 서비스 제공: AWS, Google Cloud 등</li>
                    <li>결제 처리: 결제 대행사</li>
                  </ul>
                  <p>
                    2. 회사는 위탁계약 체결시 개인정보 보호법 제26조에 따라
                    위탁업무 수행목적 외 개인정보 처리금지, 기술적·관리적
                    보호조치, 재위탁 제한, 수탁자에 대한 관리·감독, 손해배상
                    등에 관한 사항을 계약서 등 문서에 명시하고, 수탁자가
                    개인정보를 안전하게 처리하는지를 감독하고 있습니다.
                  </p>

                  <h3 className="font-semibold text-base">
                    제6조 (정보주체의 권리·의무 및 행사방법)
                  </h3>
                  <p>
                    1. 정보주체는 회사에 대해 언제든지 다음 각 호의 개인정보
                    보호 관련 권리를 행사할 수 있습니다:
                  </p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>개인정보 처리정지 요구권</li>
                    <li>개인정보 열람요구권</li>
                    <li>개인정보 정정·삭제요구권</li>
                    <li>개인정보 처리정지 요구권</li>
                  </ul>
                  <p>
                    2. 제1항에 따른 권리 행사는 회사에 대해 서면, 전자우편,
                    모사전송(FAX) 등을 통하여 하실 수 있으며 회사는 이에 대해
                    지체없이 조치하겠습니다.
                  </p>

                  <h3 className="font-semibold text-base">
                    제7조 (개인정보의 파기)
                  </h3>
                  <p>
                    1. 회사는 개인정보 보유기간의 경과, 처리목적 달성 등
                    개인정보가 불필요하게 되었을 때에는 지체없이 해당 개인정보를
                    파기합니다.
                  </p>
                  <p>2. 개인정보 파기의 절차 및 방법은 다음과 같습니다:</p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>
                      파기절차: 회사는 파기 사유가 발생한 개인정보를 선정하고,
                      회사의 개인정보 보호책임자의 승인을 받아 개인정보를
                      파기합니다.
                    </li>
                    <li>
                      파기방법: 회사는 전자적 파일 형태로 기록·저장된 개인정보는
                      기록을 재생할 수 없도록 파기하며, 종이 문서에 기록·저장된
                      개인정보는 분쇄기로 분쇄하거나 소각하여 파기합니다.
                    </li>
                  </ul>

                  <h3 className="font-semibold text-base">
                    제8조 (개인정보 보호책임자)
                  </h3>
                  <p>
                    회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고,
                    개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을
                    위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.
                  </p>
                  <p>개인정보 보호책임자: Tuno 개인정보보호팀</p>
                  <p>연락처: privacy@tuno.com</p>
                </div>
              )}
            </div>
          </div>

          {/* 모달 내부 동의 체크박스 */}
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex gap-2">
              <Checkbox
                id="modal-terms"
                checked={modalAgreed}
                onCheckedChange={(checked) => setModalAgreed(checked === true)}
              />
              <Label
                htmlFor="modal-terms"
                className="text-sm font-normal leading-none cursor-pointer"
              >
                {activeTab === "terms" ? "이용약관" : "개인정보처리방침"}에
                동의합니다.
              </Label>
            </div>
          </div>

          <DialogFooter className="mt-4 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="cancel-outline"
              onClick={() => {
                setTermsModalOpen(false);
                setModalAgreed(false);
                setActiveTab("terms");
              }}
            >
              취소
            </Button>
            <Button
              type="button"
              variant="accent-outline"
              onClick={() => {
                if (modalAgreed) {
                  if (activeTab === "terms") {
                    // 이용약관 동의 후 개인정보처리방침으로 이동
                    setActiveTab("privacy");
                    setModalAgreed(false);
                  } else {
                    // 개인정보처리방침까지 모두 동의 완료
                    setTermsAgreed(true);
                    setTermsModalOpen(false);
                    setModalAgreed(false);
                    setActiveTab("terms");
                  }
                }
              }}
              disabled={!modalAgreed}
            >
              {activeTab === "terms" ? "다음" : "완료"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 회원가입 완료 모달 */}
      <Dialog open={success} onOpenChange={setSuccess}>
        <DialogContent className="bg-background-1 border-none sm:max-w-md [&>button]:hidden">
          <DialogHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="flex h-16 w-16 items-center justify-center">
                <UserCheck className="h-10 w-10 text-green-500" />
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

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-background-2"></div>}>
      <SignupContent />
    </Suspense>
  );
}
