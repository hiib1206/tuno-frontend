import authApi from "@/api/authApi";
import { useEffect, useState } from "react";

/** 이메일 유효성 상태 타입 */
type EmailStatus = "idle" | "valid" | "invalid";

/** useEmailVerification 훅 반환 타입 */
/** useEmailVerification 훅 반환 타입 */
interface UseEmailVerificationReturn {
  /** 이메일 입력값 */
  email: string;
  /** 이메일 설정 함수 */
  setEmail: (email: string) => void;
  /** 이메일 유효성 상태 */
  emailStatus: EmailStatus;
  /** 이메일 유효성 메시지 */
  emailMessage: string;
  /** 인증 코드 입력값 */
  emailCode: string;
  /** 인증 코드 설정 함수 */
  setEmailCode: (code: string) => void;
  /** 인증 코드 메시지 */
  emailCodeMessage: string;
  /** 인증 코드 발송 여부 */
  isCodeSent: boolean;
  /** 인증 코드 발송 중 여부 */
  isSendingCode: boolean;
  /** 인증 코드 검증 중 여부 */
  isVerifying: boolean;
  /** 이메일 인증 완료 여부 */
  emailVerified: boolean;
  /** 재발송 대기 잔여 시간 (초) */
  remainingSeconds: number;
  /** 인증 코드 만료까지 잔여 시간 (초) */
  codeExpiresIn: number;
  /** 인증 코드 발송 메시지 */
  codeSentMessage: string;
  /** 회원가입 토큰 */
  signupToken: string | null;
  /** 에러 메시지 */
  emailError: string;
  /** 인증 시도 횟수 */
  attempts: number;
  /** 최대 인증 시도 횟수 */
  maxAttempts: number;
  /** 인증 코드 발송 함수 */
  handleSendEmailCode: () => Promise<void>;
  /** 인증 코드 재발송 함수 */
  handleResendEmailCode: () => Promise<void>;
  /** 인증 코드 검증 함수 */
  handleVerifyEmailCode: () => Promise<void>;
  /** 이메일 변경 함수 (인증 상태 초기화) */
  handleChangeEmail: () => void;
  /** 전체 상태 초기화 함수 */
  reset: () => void;
}

/**
 * 이메일 인증 관련 상태 및 로직을 관리하는 커스텀 훅
 *
 * @returns 이메일 인증 관련 상태와 핸들러 함수들
 *
 * @example
 * ```tsx
 * const {
 *   email,
 *   setEmail,
 *   emailStatus,
 *   emailMessage,
 *   emailCode,
 *   setEmailCode,
 *   emailVerified,
 *   handleSendEmailCode,
 *   handleVerifyEmailCode,
 *   emailError
 * } = useEmailVerification();
 * ```
 */
export function useEmailVerification(): UseEmailVerificationReturn {
  // 이메일 입력값
  const [email, setEmail] = useState("");

  // 이메일 유효성 검사 상태
  const [emailStatus, setEmailStatus] = useState<EmailStatus>("idle");
  const [emailMessage, setEmailMessage] = useState("");

  // 이메일 인증 코드 상태
  const [emailCode, setEmailCode] = useState("");
  const [emailCodeMessage, setEmailCodeMessage] = useState("");
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [codeExpiresIn, setCodeExpiresIn] = useState(0);
  const [codeSentMessage, setCodeSentMessage] = useState("");
  const [signupToken, setSignupToken] = useState<string | null>(null);

  // 에러 상태
  const [emailError, setEmailError] = useState("");

  // 시도 횟수 상태
  const [attempts, setAttempts] = useState(0);
  const [maxAttempts, setMaxAttempts] = useState(5);

  // 이메일 유효성 검사
  useEffect(() => {
    if (!email) {
      setEmailStatus("idle");
      setEmailMessage("");
      // 이메일이 변경되면 인증 상태 초기화
      setIsCodeSent(false);
      setEmailCode("");
      setEmailVerified(false);
      setCodeExpiresIn(0);
      setEmailCodeMessage("");
      setCodeSentMessage("");
      setSignupToken(null);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(email)) {
      setEmailStatus("valid");
      setEmailMessage("올바른 이메일 형식입니다.");
    } else {
      setEmailStatus("invalid");
      setEmailMessage("올바른 이메일 형식을 입력해주세요.");
      // 이메일 형식이 잘못되면 인증 상태 초기화
      setIsCodeSent(false);
      setEmailCode("");
      setEmailVerified(false);
      setCodeExpiresIn(0);
      setEmailCodeMessage("");
      setCodeSentMessage("");
      setSignupToken(null);
    }
  }, [email]);

  // 코드 재발송 타이머
  useEffect(() => {
    if (remainingSeconds > 0) {
      const timer = setTimeout(() => {
        setRemainingSeconds(remainingSeconds - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [remainingSeconds]);

  // 코드 만료 시간 타이머
  useEffect(() => {
    if (codeExpiresIn > 0) {
      const timer = setTimeout(() => {
        setCodeExpiresIn(codeExpiresIn - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (codeExpiresIn === 0 && isCodeSent && !emailVerified) {
      // 코드 만료 처리
      setIsCodeSent(false);
      setEmailCode("");
      setEmailCodeMessage("");
      setCodeSentMessage("");
      setEmailError("인증 코드가 만료되었습니다. 다시 발송해주세요.");
    }
  }, [codeExpiresIn, isCodeSent, emailVerified]);

  // 이메일 코드 발송
  const handleSendEmailCode = async () => {
    if (!email || emailStatus !== "valid") {
      setEmailError("올바른 이메일을 입력해주세요.");
      return;
    }

    setIsSendingCode(true);
    setEmailError("");
    setEmailCodeMessage("");
    setCodeSentMessage("");
    try {
      await authApi.sendEmailCode(email);
      setIsCodeSent(true);
      setRemainingSeconds(0); // 1분30초초 타이머 (재발송 제한)
      setCodeExpiresIn(300); // 5분 타이머 (코드 만료)
      setEmailCode("");
      setEmailVerified(false);
      setEmailCodeMessage("");
      setCodeSentMessage("인증 코드가 발송되었습니다. 이메일을 확인해주세요.");
      setSignupToken(null);
      // 시도 횟수 초기화
      setAttempts(0);
    } catch (err: any) {
      // 실패 시 타이머 초기화
      setIsCodeSent(false);
      setCodeExpiresIn(0);
      setRemainingSeconds(0);
      if (err.response?.data?.message) {
        setEmailError(err.response.data.message);
      } else {
        setEmailError("인증 코드 발송에 실패했습니다. 다시 시도해주세요.");
      }
    } finally {
      setIsSendingCode(false);
    }
  };

  // 이메일 코드 재발송
  const handleResendEmailCode = async () => {
    if (!email || emailStatus !== "valid") {
      return;
    }

    setIsSendingCode(true);
    setEmailError("");
    setEmailCodeMessage("");
    setCodeSentMessage("");
    try {
      await authApi.resendEmailCode(email);
      setRemainingSeconds(0); // 1분 30초 타이머 (재발송 제한)
      setCodeExpiresIn(300); // 5분 타이머 (코드 만료)
      setEmailCode("");
      setEmailVerified(false);
      setEmailCodeMessage("");
      setCodeSentMessage(
        "인증 코드가 재발송되었습니다. 이메일을 확인해주세요."
      );
      setSignupToken(null);
      // 시도 횟수 초기화
      setAttempts(0);
    } catch (err: any) {
      // 실패 시 타이머 초기화 (이전 코드 입력란은 유지)
      setIsCodeSent(false);
      setCodeExpiresIn(0);
      setRemainingSeconds(0);
      if (err.response?.data?.message) {
        setEmailError(err.response.data.message);
      } else {
        setEmailError("인증 코드 재발송에 실패했습니다. 다시 시도해주세요.");
      }
    } finally {
      setIsSendingCode(false);
    }
  };

  // 이메일 코드 검증
  const handleVerifyEmailCode = async () => {
    if (!emailCode || !email) {
      setEmailCodeMessage("인증 코드를 입력해주세요.");
      setEmailError("");
      return;
    }

    // 숫자 검증
    if (!/^\d{6}$/.test(emailCode)) {
      setEmailCodeMessage("인증 코드는 6자리 숫자여야 합니다.");
      setEmailError("");
      return;
    }

    setIsVerifying(true);
    setEmailError("");
    setEmailCodeMessage("");
    setCodeSentMessage("");
    try {
      const response = await authApi.verifyEmailCode(email, emailCode);
      // signupToken 저장
      if (response?.data?.signupToken) {
        setSignupToken(response.data.signupToken);
      }
      setEmailVerified(true);
      setIsCodeSent(false);
      setEmailCode("");
      setCodeExpiresIn(0);
      setEmailCodeMessage("");
      setCodeSentMessage("");
      // 성공 시 시도 횟수 초기화
      setAttempts(0);
    } catch (err: any) {
      // 에러 응답에서 attempts와 maxAttempts 추출
      // attempts와 maxAttempts는 data.data 안에 있음
      if (err.response?.data?.data?.attempts !== undefined) {
        setAttempts(err.response.data.data.attempts);
      }
      if (err.response?.data?.data?.maxAttempts !== undefined) {
        setMaxAttempts(err.response.data.data.maxAttempts);
      }

      if (err.response?.data?.message) {
        setEmailCodeMessage(err.response.data.message);
      } else {
        setEmailCodeMessage(
          "인증 코드가 올바르지 않습니다. 다시 확인해주세요."
        );
      }
      setEmailVerified(false);
      setSignupToken(null);
    } finally {
      setIsVerifying(false);
    }
  };

  // 이메일 변경 (인증 상태 초기화)
  const handleChangeEmail = () => {
    setEmailVerified(false);
    setIsCodeSent(false);
    setEmailCode("");
    setCodeExpiresIn(0);
    setRemainingSeconds(0);
    setEmailError("");
    setEmailCodeMessage("");
    setCodeSentMessage("");
    setSignupToken(null);
    // 시도 횟수 초기화
    setAttempts(0);
  };

  // 초기화 함수
  const reset = () => {
    setEmail("");
    setEmailCode("");
    setEmailStatus("idle");
    setEmailMessage("");
    setEmailCodeMessage("");
    setIsCodeSent(false);
    setEmailVerified(false);
    setRemainingSeconds(0);
    setCodeExpiresIn(0);
    setEmailError("");
    setCodeSentMessage("");
    setSignupToken(null);
    // 시도 횟수 초기화
    setAttempts(0);
    setMaxAttempts(5);
  };

  return {
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
    reset,
  };
}
