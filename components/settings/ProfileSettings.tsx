"use client";

import userApi from "@/api/userApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNicknameCheck } from "@/hooks/useNicknameCheck";
import { useToast } from "@/hooks/useToast";
import { cn, getSocialProviderName } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import {
  CheckCircle2,
  Loader2,
  Mail,
  Phone,
  User,
  UserRoundPen,
  XCircle,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ProfileAvatar } from "../ProfileAvatar";

export function ProfileSettings() {
  const { user, me, uploadProfileImage } = useAuthStore();
  const [isEditingNick, setIsEditingNick] = useState(false);
  const [nickValue, setNickValue] = useState("");
  // 이메일 관련
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [emailValue, setEmailValue] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [emailSuccess, setEmailSuccess] = useState("");
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  const [resendCooldown, setResendCooldown] = useState<number | null>(null);
  const [attempts, setAttempts] = useState<number | null>(null);
  const [maxAttempts, setMaxAttempts] = useState<number | null>(null);

  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageError, setImageError] = useState("");
  // ref는 React에서 DOM 요소에 직접 접근할 때 사용. useRef로 생성한 ref 객체를 연결
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (user?.nick) {
      setNickValue(user.nick);
    }
  }, [user?.nick]);

  useEffect(() => {
    if (user?.email) {
      setEmailValue(user.email);
    }
  }, [user?.email]);

  // email 인증 코드 유효시간 실시간 업데이트
  useEffect(() => {
    if (!expiresAt) {
      setRemainingTime(null);
      return;
    }

    const updateRemainingTime = () => {
      const now = new Date().getTime();
      const expires = new Date(expiresAt).getTime();
      const remaining = Math.max(0, Math.floor((expires - now) / 1000));
      setRemainingTime(remaining);

      if (remaining <= 0) {
        setRemainingTime(null);
        setExpiresAt(null);
        setEmailSuccess("");
        setEmailError(
          "인증 코드 입력 시간이 초과되었습니다. 재발송을 눌러주세요."
        );
      }
    };

    // 즉시 한 번 실행
    updateRemainingTime();

    // 1초마다 업데이트
    const interval = setInterval(updateRemainingTime, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  // 재발송 쿨타임 카운트다운
  useEffect(() => {
    if (resendCooldown === null || resendCooldown <= 0) {
      return;
    }

    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev === null || prev <= 0) {
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [resendCooldown]);

  // 닉네임 체크 훅 사용
  const { nickStatus, nickMessage } = useNicknameCheck(nickValue, {
    currentNick: user?.nick,
    enabled: isEditingNick,
  });

  // 남은 시간 포맷팅 함수
  const formatRemainingTime = (seconds: number | null): string => {
    if (seconds === null || seconds <= 0) {
      return "만료됨";
    }
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}분 ${secs.toString().padStart(2, "0")}초`;
  };

  // 재발송 쿨타임 포맷팅 함수
  const formatCooldownTime = (seconds: number | null): string => {
    if (seconds === null || seconds <= 0) {
      return "";
    }
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const socialProviderName = getSocialProviderName(user);

  const handleCancelNickEdit = () => {
    setNickValue(user?.nick || "");
    setIsEditingNick(false);
  };

  const handleSendVerificationCode = async () => {
    if (!emailValue || emailValue === user?.email) {
      return;
    }
    setIsSendingCode(true);
    setEmailError("");
    setEmailSuccess("");
    try {
      await userApi.sendEmailVerification(emailValue);
      // 백엔드에서 expiresAt을 반환하지 않으므로 클라이언트에서 계산 (5분 유효기간)
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 5 * 60 * 1000); // 5분 후
      setExpiresAt(expiresAt.toISOString());
      setIsCodeSent(true);
      setEmailSuccess("인증 코드를 이메일로 전송했습니다.");
      // 재발송 쿨타임 시작 (90초)
      setResendCooldown(90);
      // 시도 횟수 초기화 (0/5)
      setAttempts(0);
      setMaxAttempts(5);
    } catch (err: any) {
      if (err.response?.status === 400 && err.response?.data?.message) {
        setEmailError(err.response?.data?.message);
      } else {
        setEmailError("인증 코드 발송에 실패했습니다. 다시 시도해주세요.");
      }
      setEmailSuccess("");
      setExpiresAt(null);
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleCancelEmailEdit = () => {
    setEmailValue(user?.email || "");
    setIsEditingEmail(false);
    setIsCodeSent(false);
    setVerificationCode("");
    setIsVerifying(false);
    setEmailError("");
    setEmailSuccess("");
    setIsSendingCode(false);
    setExpiresAt(null);
    setRemainingTime(null);
    setResendCooldown(null);
    // 시도 횟수 초기화
    setAttempts(null);
    setMaxAttempts(null);
  };

  const handleResendVerificationCode = async () => {
    if (!emailValue || emailValue === user?.email) {
      return;
    }
    setIsSendingCode(true);
    setEmailError("");
    setEmailSuccess("");
    try {
      await userApi.resendEmailVerification(emailValue);
      // 백엔드에서 expiresAt을 반환하지 않으므로 클라이언트에서 계산 (5분 유효기간)
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 5 * 60 * 1000); // 5분 후
      setExpiresAt(expiresAt.toISOString());
      setVerificationCode("");
      setIsVerifying(false);
      setEmailSuccess("인증 코드를 이메일로 전송했습니다.");
      // 재발송 쿨타임 시작 (90초)
      setResendCooldown(90);
      // 재발송 시 시도 횟수 초기화 (0/5)
      setAttempts(0);
      setMaxAttempts(5);
    } catch (err: any) {
      if (err.response?.status === 400 && err.response?.data?.message) {
        setEmailError(err.response?.data?.message);
      } else {
        setEmailError("인증 코드 재발송에 실패했습니다. 다시 시도해주세요.");
      }
      setEmailSuccess("");
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleVerifyEmailCode = async () => {
    if (!verificationCode || !emailValue) {
      return;
    }
    setIsVerifying(true);
    setEmailError("");
    setEmailSuccess("");
    try {
      await userApi.verifyEmailCode(verificationCode);
      setIsVerifying(false);
      setIsCodeSent(false);
      setVerificationCode("");
      setIsEditingEmail(false);
      setExpiresAt(null);
      setRemainingTime(null);
      // 인증 성공 시 시도 횟수 초기화
      setAttempts(null);
      setMaxAttempts(null);
      me();
    } catch (err: any) {
      if (err.response?.status === 400 && err.response?.data?.message) {
        const errorMessage = err.response?.data?.message;
        const attemptsData = err.response?.data?.data?.attempts;
        const maxAttemptsData = err.response?.data?.data?.maxAttempts;

        // 백엔드에서 시도 횟수 정보가 오면 업데이트
        if (attemptsData !== undefined && maxAttemptsData !== undefined) {
          setAttempts(attemptsData);
          setMaxAttempts(maxAttemptsData);
        }

        setEmailError(errorMessage);
      } else {
        setEmailError("인증 코드가 올바르지 않습니다. 다시 확인해주세요.");
      }
      setEmailSuccess("");
      setIsVerifying(false);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageError("");

    // 파일 크기 검증 (3MB)
    if (file.size > 3 * 1024 * 1024) {
      setImageError("파일 크기는 3MB 이하여야 합니다.");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    // 파일 타입 검증
    if (!file.type.match(/^image\/(jpeg|jpg|png|webp)$/)) {
      setImageError("jpg, jpeg, png, webp 형식의 이미지만 업로드 가능합니다.");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    setIsUploadingImage(true);
    try {
      await uploadProfileImage(file);
      setImageError("");
    } catch (err: any) {
      if (err.response?.status === 400 && err.response?.data?.message) {
        setImageError(err.response?.data?.message);
      } else {
        setImageError("이미지 업로드에 실패했습니다.");
      }
    } finally {
      setIsUploadingImage(false);
      // 파일 입력 초기화
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // 닉네임 변경 핸들러
  const handleConfirmNickEdit = async () => {
    if (!nickValue) {
      toast({
        title: "실패!",
        description: "닉네임을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }
    setIsEditingNick(false);
    try {
      await userApi.updateNickname(nickValue);
      toast({
        title: "성공!",
        description: "닉네임이 변경되었습니다.",
        variant: "success",
      });
      me();
    } catch (err: any) {
      setIsEditingNick(false);
      if (err.response?.status === 400 && err.response?.data?.message) {
        toast({
          title: "실패!",
          description: err.response?.data?.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "실패!",
          description: "닉네임 변경에 실패했습니다.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="p-5">
      <h2 className="mb-1 text-xl font-bold">내 정보 관리</h2>

      <div className="space-y-4">
        <div className="flex items-center gap-3 my-4">
          <h3 className="text-lg font-semibold">프로필</h3>
          <div className="h-px flex-1 bg-muted-foreground/30"></div>
        </div>

        <div className="mb-6 flex items-center gap-4">
          <ProfileAvatar size="xl" textSize="2xl" />
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleImageChange}
              className="hidden"
              id="profile-image-input"
              disabled={isUploadingImage}
            />
            <Button
              size="sm"
              variant="change"
              className="whitespace-nowrap"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingImage}
            >
              {isUploadingImage ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  업로드 중...
                </>
              ) : (
                "사진 변경"
              )}
            </Button>
            <p className="mt-2 text-xs text-muted-foreground">
              jpg, jpeg, png, webp 형식 (최대 3MB)
            </p>
            {imageError && (
              <p className="mt-1 text-xs text-destructive">{imageError}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="username">아이디</Label>
          <div className="flex flex-col gap-2 lg:flex-row">
            <div className="relative w-full">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="username"
                type="text"
                value={
                  user?.username
                    ? user.username
                    : socialProviderName
                      ? `${socialProviderName} 로그인 사용자`
                      : "아이디를 입력해주세요"
                }
                className="pl-9"
                disabled
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="nick">닉네임</Label>
          <div className="flex flex-col gap-2 lg:flex-row">
            <div className="relative w-full">
              <UserRoundPen className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="nick"
                type="text"
                value={nickValue}
                onChange={(e) => setNickValue(e.target.value)}
                className={cn(
                  "pl-9 pr-10",
                  isEditingNick && "border-ring/80 ring-ring/20",
                  nickStatus === "unavailable" && "border-destructive",
                  nickStatus === "available" && "border-accent"
                )}
                disabled={!isEditingNick}
              />
              {isEditingNick && (
                <>
                  {nickStatus === "checking" && (
                    <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                  {nickStatus === "available" && (
                    <CheckCircle2 className="absolute right-3 top-3 h-4 w-4 text-accent" />
                  )}
                  {nickStatus === "unavailable" && (
                    <XCircle className="absolute right-3 top-3 h-4 w-4 text-destructive" />
                  )}
                </>
              )}
            </div>
            {!isEditingNick ? (
              <Button
                type="button"
                variant="change"
                size="default"
                className="whitespace-nowrap"
                onClick={() => setIsEditingNick(true)}
              >
                변경
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="cancel"
                  size="default"
                  className="flex-1 whitespace-nowrap"
                  onClick={handleCancelNickEdit}
                >
                  취소
                </Button>
                <Button
                  type="button"
                  variant="change"
                  size="default"
                  className="flex-1 whitespace-nowrap"
                  onClick={handleConfirmNickEdit}
                  disabled={nickStatus !== "available"}
                >
                  변경 하기
                </Button>
              </div>
            )}
          </div>
          {isEditingNick && nickMessage && (
            <p
              className={`text-xs ${nickStatus === "available"
                ? "text-accent dark:text-accent"
                : nickStatus === "unavailable"
                  ? "text-destructive"
                  : "text-muted-foreground"
                }`}
            >
              {nickMessage}
            </p>
          )}
        </div>

        <div className="mb-4 flex items-center gap-4 my-6">
          <h3 className="text-lg font-semibold">기본 정보</h3>
          <div className="h-px flex-1 bg-muted-foreground/30"></div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">
            이메일
            {user?.emailVerifiedAt && (
              <span className="text-sm font-normal text-muted-foreground">
                (인증완료)
              </span>
            )}
            {!user?.emailVerifiedAt && (
              <span className="text-sm font-normal text-destructive">
                (인증대기)
              </span>
            )}
          </Label>
          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-2 lg:flex-row">
              <div className="relative w-full">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={
                    isEditingEmail
                      ? emailValue
                      : emailValue || "email을 입력해주세요"
                  }
                  onChange={(e) => setEmailValue(e.target.value)}
                  className={cn(
                    "pl-9 pr-10",
                    isEditingEmail && "border-ring/80 ring-ring/20"
                  )}
                  disabled={!isEditingEmail || isCodeSent}
                />
              </div>
              {!isEditingEmail ? (
                <Button
                  type="button"
                  variant="change"
                  size="default"
                  className="whitespace-nowrap"
                  onClick={() => setIsEditingEmail(true)}
                >
                  변경
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="cancel"
                    size="default"
                    className="flex-1 whitespace-nowrap"
                    onClick={handleCancelEmailEdit}
                  >
                    취소
                  </Button>
                  {isCodeSent ? (
                    <Button
                      type="button"
                      variant="change"
                      size="default"
                      className="flex-1 whitespace-nowrap tabular-nums"
                      onClick={handleResendVerificationCode}
                      disabled={
                        !emailValue ||
                        emailValue === user?.email ||
                        isSendingCode ||
                        (resendCooldown !== null && resendCooldown > 0)
                      }
                    >
                      {isSendingCode ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          재발송 중...
                        </>
                      ) : resendCooldown !== null && resendCooldown > 0 ? (
                        `재발송(${formatCooldownTime(resendCooldown)})`
                      ) : (
                        "재발송"
                      )}
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="change"
                      size="default"
                      className="flex-1 whitespace-nowrap"
                      onClick={handleSendVerificationCode}
                      disabled={
                        !emailValue ||
                        emailValue === user?.email ||
                        isSendingCode
                      }
                    >
                      {isSendingCode ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          발송 중...
                        </>
                      ) : (
                        "인증 코드 발송"
                      )}
                    </Button>
                  )}
                </div>
              )}
            </div>
            {isEditingEmail && isCodeSent && (
              <div className="min-h-5">
                {emailError ? (
                  <p className="text-sm text-destructive">{emailError}</p>
                ) : emailSuccess ? (
                  <p className="text-sm text-accent">{emailSuccess}</p>
                ) : null}
              </div>
            )}
            {isEditingEmail && attempts !== null && maxAttempts !== null && (
              <p className="text-xs text-muted-foreground">
                시도 횟수: {attempts}/{maxAttempts}
              </p>
            )}
            {isEditingEmail && isCodeSent && !isSendingCode && (
              <div className="space-y-2">
                <div className="flex flex-col gap-2 lg:flex-row">
                  <div className="relative w-full">
                    <Input
                      type="text"
                      value={verificationCode}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, "");
                        if (value.length <= 6) {
                          setVerificationCode(value);
                        }
                      }}
                      placeholder="6자리 인증 코드를 입력하세요."
                      className={cn(
                        "pr-30",
                        remainingTime !== null && remainingTime <= 60 && "pr-30"
                      )}
                      maxLength={6}
                      inputMode="numeric"
                    />
                    {remainingTime !== null && (
                      <div
                        className={cn(
                          "absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium pointer-events-none",
                          remainingTime <= 60
                            ? "text-destructive"
                            : remainingTime <= 180
                              ? "text-orange-500"
                              : "text-muted-foreground"
                        )}
                      >
                        {formatRemainingTime(remainingTime)}
                      </div>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="change"
                    size="default"
                    className="whitespace-nowrap"
                    onClick={handleVerifyEmailCode}
                    disabled={!verificationCode || isVerifying}
                  >
                    {isVerifying ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        인증 중...
                      </>
                    ) : (
                      "인증 하기"
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="phone">전화번호</Label>
            <span className="text-sm font-normal text-muted-foreground">
              (현재는 해당 기능을 사용 할 수 없습니다)
            </span>
          </div>
          <div className="flex flex-col gap-2 lg:flex-row">
            <div className="relative w-full">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="phone"
                type="tel"
                value={user?.phone || "전화번호를 입력해주세요"}
                className="pl-9"
                disabled
              />
            </div>
            <Button
              type="button"
              variant="change"
              size="default"
              className="whitespace-nowrap"
              disabled
            >
              변경
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
