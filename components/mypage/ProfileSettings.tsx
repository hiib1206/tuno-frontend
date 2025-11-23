"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  User,
  Mail,
  Phone,
  Lock,
  Calendar,
  CheckCircle2,
  XCircle,
  Loader2,
  Info,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import { useNicknameCheck } from "@/hooks/useNicknameCheck";
import authApi from "@/api/authApi";
import { useAuthStore } from "@/stores/authStore";
import { ProfileAvatar } from "../ProfileAvatar";

export function ProfileSettings() {
  const { user, me, uploadProfileImage } = useAuthStore();
  const [isEditingNick, setIsEditingNick] = useState(false);
  const [nickValue, setNickValue] = useState("");
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [emailValue, setEmailValue] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageError, setImageError] = useState("");
  // ref는 React에서 DOM 요소에 직접 접근할 때 사용. useRef로 생성한 ref 객체를 연결
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // 핸들러 함수들
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
    try {
      const response = await authApi.requestEmailVerification(emailValue);
      if (response?.data?.expiresAt) {
        setExpiresAt(response.data.expiresAt);
      }
      setIsCodeSent(true);
    } catch (err: any) {
      if (err.response?.status === 400 && err.response?.data?.message) {
        setEmailError(err.response?.data?.message);
      } else {
        setEmailError("인증 코드 발송에 실패했습니다. 다시 시도해주세요.");
      }
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
    setIsSendingCode(false);
    setExpiresAt(null);
    setRemainingTime(null);
  };

  const handleResendVerificationCode = async () => {
    if (!emailValue || emailValue === user?.email) {
      return;
    }
    setIsSendingCode(true);
    setEmailError("");
    try {
      const response = await authApi.resendEmailVerification(emailValue);
      if (response?.data?.expiresAt) {
        setExpiresAt(response.data.expiresAt);
      }
      setVerificationCode("");
      setIsVerifying(false);
    } catch (err: any) {
      setEmailError("인증 코드 재발송에 실패했습니다. 다시 시도해주세요.");
      setExpiresAt(null);
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
    try {
      await authApi.verifyEmailCode(emailValue, verificationCode);
      setIsVerifying(false);
      setIsCodeSent(false);
      setVerificationCode("");
      setIsEditingEmail(false);
      setExpiresAt(null);
      setRemainingTime(null);
      me();
    } catch (err: any) {
      if (err.response?.status === 400 && err.response?.data?.message) {
        setEmailError(err.response?.data?.message);
      } else {
        setEmailError("인증 코드가 올바르지 않습니다. 다시 확인해주세요.");
      }
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

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="mb-1 text-2xl font-bold">내 정보 관리</h2>

        <div className="space-y-4">
          <div className="my-4">
            <div className="mb-4 flex items-center gap-4">
              <h3 className="text-lg font-semibold">프로필</h3>
              <div className="h-px flex-1 bg-muted-foreground/30"></div>
            </div>
          </div>

          <div className="mb-8 flex items-center gap-4">
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
            <Label htmlFor="nick">닉네임</Label>
            <div className="flex flex-col gap-2 lg:flex-row">
              <div className="relative w-full lg:w-1/2">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="nick"
                  type="text"
                  value={nickValue}
                  onChange={(e) => setNickValue(e.target.value)}
                  className={cn(
                    "pl-9 pr-10",
                    isEditingNick && "border-ring/80 ring-ring/20",
                    nickStatus === "unavailable" && "border-destructive",
                    nickStatus === "available" && "border-green-500"
                  )}
                  disabled={!isEditingNick}
                />
                {isEditingNick && (
                  <>
                    {nickStatus === "checking" && (
                      <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                    {nickStatus === "available" && (
                      <CheckCircle2 className="absolute right-3 top-3 h-4 w-4 text-green-500" />
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
                    onClick={() => setIsEditingNick(false)}
                    disabled={nickStatus !== "available"}
                  >
                    확인
                  </Button>
                </div>
              )}
            </div>
            {isEditingNick && nickMessage && (
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

          <div className="my-6">
            <div className="mb-4 flex items-center gap-4">
              <h3 className="text-lg font-semibold">기본 정보</h3>
              <div className="h-px flex-1 bg-muted-foreground/30"></div>
            </div>
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
                <div className="relative w-full lg:w-1/2">
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
                        className="flex-1 whitespace-nowrap"
                        onClick={handleResendVerificationCode}
                        disabled={
                          !emailValue ||
                          emailValue === user?.email ||
                          isSendingCode
                        }
                      >
                        {isSendingCode ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            재발송 중...
                          </>
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
              {isEditingEmail && emailError && (
                <p className="text-sm text-destructive">{emailError}</p>
              )}
              {isEditingEmail && isCodeSent && !isSendingCode && (
                <div className="space-y-2">
                  {!emailError && (
                    <p className="text-sm text-accent">
                      인증 코드를 이메일로 전송했습니다.
                    </p>
                  )}
                  <div className="flex flex-col gap-2 lg:flex-row">
                    <div className="relative w-full lg:w-1/2">
                      <Input
                        type="text"
                        value={verificationCode}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9]/g, "");
                          if (value.length <= 6) {
                            setVerificationCode(value);
                          }
                        }}
                        placeholder="6자리 인증 코드를 입력하세요"
                        className={cn(
                          "pr-32",
                          remainingTime !== null &&
                            remainingTime <= 60 &&
                            "pr-36"
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
            <Label htmlFor="phone">전화번호</Label>
            <div className="flex flex-col gap-2 lg:flex-row">
              <div className="relative w-full lg:w-1/2">
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
              >
                변경
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">비밀번호</Label>
            <div className="flex flex-col gap-2 lg:flex-row">
              <div className="relative w-full lg:w-1/2">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  defaultValue="••••••••"
                  className="pl-9"
                  disabled
                />
              </div>
              <Button
                type="button"
                variant="change"
                size="default"
                className="whitespace-nowrap"
              >
                변경
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="joinDate">가입일</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="joinDate"
                value={formatDate(user?.createdAt)}
                disabled
                className="pl-9"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Button variant="change" className="w-fit border-foreground/50">
              변경사항 저장
            </Button>
            <div className="flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5 text-destructive" />
              <p className="text-xs text-destructive">
                변경 후 저장 버튼을 눌러주세요
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
