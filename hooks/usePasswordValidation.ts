import { useEffect, useMemo, useState } from "react";

type PasswordStatus = "idle" | "valid" | "invalid";
type PasswordStrength = "veryWeak" | "weak" | "medium" | "strong" | "veryStrong";

interface PasswordValidation {
  minLength: boolean;
  hasLetter: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
}

interface UsePasswordValidationReturn {
  /** 비밀번호 유효성 상태 */
  passwordStatus: PasswordStatus;
  /** 각 조건 충족 여부 */
  validation: PasswordValidation;
  /** 비밀번호 강도 */
  strength: PasswordStrength;
  /** 강도 텍스트 (한글) */
  strengthText: string;
  /** 강도에 따른 색상 클래스 */
  strengthColorClass: string;
  /** 미충족 조건 메시지 (첫 번째 미충족 조건만) */
  errorMessage: string;
  /** 충족 시 성공 메시지 */
  successMessage: string;
  /** 충족된 조건 개수 */
  validCount: number;
  /** 초기화 함수 */
  reset: () => void;
}

const STRENGTH_CONFIG = {
  veryWeak: {
    text: "매우 약함",
    colorClass: "text-destructive",
  },
  weak: {
    text: "약함",
    colorClass: "text-orange-500",
  },
  medium: {
    text: "보통",
    colorClass: "text-yellow-600 dark:text-yellow-400",
  },
  strong: {
    text: "강함",
    colorClass: "text-green-600 dark:text-green-400",
  },
  veryStrong: {
    text: "매우 강함",
    colorClass: "text-emerald-600 dark:text-emerald-400",
  },
} as const;

const ERROR_MESSAGES = {
  minLength: "최소 8자 이상 입력해주세요.",
  hasLetter: "영문을 포함해주세요.",
  hasNumber: "숫자를 포함해주세요.",
  hasSpecial: "특수문자를 포함해주세요.",
} as const;

const INITIAL_VALIDATION: PasswordValidation = {
  minLength: false,
  hasLetter: false,
  hasNumber: false,
  hasSpecial: false,
};

/**
 * 비밀번호 유효성 검증 및 강도 측정 커스텀 훅
 *
 * @param password - 검증할 비밀번호
 * @returns 비밀번호 상태, 강도, 메시지 등
 *
 * @example
 * ```tsx
 * const {
 *   passwordStatus,
 *   strength,
 *   strengthText,
 *   strengthColorClass,
 *   errorMessage,
 *   successMessage,
 *   validation,
 * } = usePasswordValidation(password);
 * ```
 */
export function usePasswordValidation(
  password: string
): UsePasswordValidationReturn {
  const [passwordStatus, setPasswordStatus] =
    useState<PasswordStatus>("idle");
  const [validation, setValidation] =
    useState<PasswordValidation>(INITIAL_VALIDATION);

  useEffect(() => {
    if (password.length === 0) {
      setPasswordStatus("idle");
      setValidation(INITIAL_VALIDATION);
      return;
    }

    const newValidation: PasswordValidation = {
      minLength: password.length >= 8,
      hasLetter: /[A-Za-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecial: /[^A-Za-z0-9]/.test(password),
    };

    setValidation(newValidation);
    const isValid = Object.values(newValidation).every(Boolean);
    setPasswordStatus(isValid ? "valid" : "invalid");
  }, [password]);

  const validCount = useMemo(
    () => Object.values(validation).filter(Boolean).length,
    [validation]
  );

  const strength = useMemo((): PasswordStrength => {
    if (passwordStatus === "valid" && password.length >= 12) return "veryStrong";
    if (passwordStatus === "valid") return "strong";
    if (validCount >= 3) return "medium";
    if (validCount >= 1) return "weak";
    return "veryWeak";
  }, [passwordStatus, password.length, validCount]);

  const strengthText = STRENGTH_CONFIG[strength].text;
  const strengthColorClass = STRENGTH_CONFIG[strength].colorClass;

  const errorMessage = useMemo((): string => {
    if (passwordStatus !== "invalid") return "";
    if (!validation.minLength) return ERROR_MESSAGES.minLength;
    if (!validation.hasLetter) return ERROR_MESSAGES.hasLetter;
    if (!validation.hasNumber) return ERROR_MESSAGES.hasNumber;
    if (!validation.hasSpecial) return ERROR_MESSAGES.hasSpecial;
    return "";
  }, [passwordStatus, validation]);

  const successMessage =
    passwordStatus === "valid" ? "안전한 비밀번호입니다." : "";

  const reset = () => {
    setPasswordStatus("idle");
    setValidation(INITIAL_VALIDATION);
  };

  return {
    passwordStatus,
    validation,
    strength,
    strengthText,
    strengthColorClass,
    errorMessage,
    successMessage,
    validCount,
    reset,
  };
}
