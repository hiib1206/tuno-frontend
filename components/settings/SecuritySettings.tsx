"use client";

import userApi from "@/api/userApi";
import { Button } from "@/components/ui/button";
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
import { usePasswordValidation } from "@/hooks/usePasswordValidation";
import { useToast } from "@/hooks/useToast";
import { useAuthStore } from "@/stores/authStore";
import { CheckCircle2, Loader2, Lock, LogOut, XCircle } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function SecuritySettings() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const { toast } = useToast();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // 로컬 계정 여부 확인 (소셜 로그인만 있으면 비밀번호 변경 불가)
  const hasLocalAuth = user?.authProviders ? user.authProviders?.some(
    (ap) => ap.provider === "local"
  ) : true;

  // 새 비밀번호 검증 훅
  const {
    passwordStatus,
    strengthText,
    strengthColorClass,
    errorMessage: passwordErrorMessage,
    successMessage: passwordSuccessMessage,
  } = usePasswordValidation(newPassword);

  // 비밀번호 확인 일치 상태
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

  const isFormValid =
    currentPassword.length > 0 &&
    passwordStatus === "valid" &&
    confirmStatus === "match";

  const handleChangePassword = async () => {
    if (!isFormValid) return;

    setIsLoading(true);
    try {
      await userApi.changePassword(currentPassword, newPassword);
      toast({
        title: "비밀번호 변경 완료",
        description: "비밀번호가 성공적으로 변경되었습니다.",
      });
      // 입력 필드 초기화
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      console.log(err);
      toast({
        description:
          err.response?.status === 400
            ? err.response?.data?.message
            : "비밀번호 변경에 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await userApi.deleteAccount();
      toast({
        title: "회원탈퇴 완료",
        description: "그동안 이용해 주셔서 감사합니다.",
      });
      await logout();
      const redirectPath = pathname.startsWith("/community")
        ? "/community"
        : "/analysis/quant";
      router.push(redirectPath);
    } catch (err: any) {
      const message =
        err.response?.status === 404
          ? "사용자를 찾을 수 없습니다."
          : "회원탈퇴에 실패했습니다. 다시 시도해 주세요.";
      toast({
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="mb-1 text-2xl font-bold">보안 설정</h2>

      <div className="space-y-4">
        <div className="mb-4 flex items-center gap-4 my-6">
          <h3 className="text-lg font-semibold">비밀번호 변경</h3>
          <div className="h-px flex-1 bg-muted-foreground/30"></div>
        </div>

        {!hasLocalAuth && (
          <p className="text-sm text-muted-foreground mb-4">
            소셜 로그인으로 가입하셨습니다. 비밀번호 변경이 필요하지 않습니다.
          </p>
        )}

        <div className="space-y-2">
          <Label htmlFor="currentPassword">현재 비밀번호</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="currentPassword"
              type="password"
              placeholder="••••••••"
              className="pl-9"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              disabled={!hasLocalAuth}
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="newPassword">새 비밀번호</Label>
            {hasLocalAuth && newPassword.length > 0 && (
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
              disabled={!hasLocalAuth}
              className={
                "pl-9 " +
                (hasLocalAuth && passwordStatus === "invalid"
                  ? "border-destructive pr-10"
                  : hasLocalAuth && passwordStatus === "valid"
                    ? "border-green-500 pr-10"
                    : undefined)
              }
            />
            {hasLocalAuth && passwordStatus === "valid" && (
              <CheckCircle2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-green-500" />
            )}
            {hasLocalAuth && passwordStatus === "invalid" && (
              <XCircle className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-destructive" />
            )}
          </div>
          {hasLocalAuth && passwordErrorMessage && (
            <p className="text-xs text-destructive">{passwordErrorMessage}</p>
          )}
          {hasLocalAuth && passwordSuccessMessage && (
            <p className="text-xs text-green-600 dark:text-green-400">
              {passwordSuccessMessage}
            </p>
          )}
          {hasLocalAuth && newPassword.length === 0 && (
            <p className="text-xs text-muted-foreground">
              최소 8자 이상, 영문, 숫자, 특수문자 포함
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">새 비밀번호 확인</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={!hasLocalAuth}
              className={
                "pl-9 " +
                (hasLocalAuth && confirmStatus === "mismatch"
                  ? "border-destructive pr-10"
                  : hasLocalAuth && confirmStatus === "match"
                    ? "border-green-500 pr-10"
                    : undefined)
              }
            />
            {hasLocalAuth && confirmStatus === "match" && (
              <CheckCircle2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-green-500" />
            )}
            {hasLocalAuth && confirmStatus === "mismatch" && (
              <XCircle className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-destructive" />
            )}
          </div>
          {hasLocalAuth && confirmStatus === "match" && (
            <p className="text-xs text-green-600 dark:text-green-400">
              비밀번호가 일치합니다.
            </p>
          )}
          {hasLocalAuth && confirmStatus === "mismatch" && (
            <p className="text-xs text-destructive">
              비밀번호가 일치하지 않습니다.
            </p>
          )}
        </div>

        <Button
          variant="accent-outline"
          disabled={!hasLocalAuth || !isFormValid || isLoading}
          onClick={handleChangePassword}
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
      </div>

      <div className="border-destructive/50 py-6">
        <div className="mb-4 flex items-center gap-2">
          <LogOut className="h-5 w-5 text-destructive" />
          <h3 className="text-lg font-semibold text-destructive">위험 구역</h3>
        </div>

        <p className="mb-4 text-sm text-muted-foreground">
          계정을 삭제하면 모든 데이터가 영구적으로 삭제됩니다. 이 작업은 되돌릴
          수 없습니다.
        </p>

        <Button variant="cancel" onClick={() => setIsDeleteModalOpen(true)}>
          계정 삭제
        </Button>
      </div>

      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-destructive">정말 탈퇴하시겠습니까?</DialogTitle>
            <DialogDescription>
              회원탈퇴 시 모든 데이터가 영구적으로 삭제되며, 이 작업은 되돌릴 수
              없습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={isDeleting}
            >
              취소
            </Button>
            <Button
              variant="cancel"
              onClick={handleDeleteAccount}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  탈퇴 처리 중...
                </>
              ) : (
                "탈퇴하기"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
