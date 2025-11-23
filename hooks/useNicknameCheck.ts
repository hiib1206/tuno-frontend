import { useState, useEffect } from "react";
import userApi from "@/api/userApi";

type NickStatus = "idle" | "checking" | "available" | "unavailable";

interface UseNicknameCheckOptions {
  /**
   * 현재 사용 중인 닉네임 (동일하면 사용 가능으로 처리)
   */
  currentNick?: string;
  /**
   * 검증 활성화 여부 (기본값: true)
   */
  enabled?: boolean;
  /**
   * Debounce 시간 (ms, 기본값: 500)
   */
  debounceMs?: number;
}

interface UseNicknameCheckReturn {
  nickStatus: NickStatus;
  nickMessage: string;
}

/**
 * 닉네임 중복 체크 및 유효성 검증 커스텀 훅
 *
 * @param nick - 검증할 닉네임
 * @param options - 옵션 설정
 * @returns { nickStatus, nickMessage } - 닉네임 상태와 메시지
 *
 * @example
 * ```tsx
 * const { nickStatus, nickMessage } = useNicknameCheck(nick);
 * ```
 *
 * @example
 * ```tsx
 * // 마이페이지에서 사용 (현재 닉네임과 동일하면 사용 가능)
 * const { nickStatus, nickMessage } = useNicknameCheck(nickValue, {
 *   currentNick: user?.nick,
 *   enabled: isEditingNick,
 * });
 * ```
 */
export function useNicknameCheck(
  nick: string,
  options: UseNicknameCheckOptions = {}
): UseNicknameCheckReturn {
  const { currentNick, enabled = true, debounceMs = 500 } = options;

  const [nickStatus, setNickStatus] = useState<NickStatus>("idle");
  const [nickMessage, setNickMessage] = useState("");

  useEffect(() => {
    // 검증 비활성화 시 초기화
    if (!enabled) {
      setNickStatus("idle");
      setNickMessage("");
      return;
    }

    // 현재 닉네임과 동일하면 사용 가능으로 처리
    if (currentNick && nick === currentNick) {
      setNickStatus("available");
      setNickMessage("현재 사용 중인 닉네임입니다.");
      return;
    }

    // 빈 값이면 초기화
    if (!nick) {
      setNickStatus("idle");
      setNickMessage("");
      return;
    }

    // 3자 미만 검증
    if (nick.length > 0 && nick.length < 3) {
      setNickStatus("unavailable");
      setNickMessage("닉네임은 최소 3자 이상이어야 합니다.");
      return;
    }

    // Debounce 후 API 호출
    const timer = setTimeout(async () => {
      setNickStatus("checking");
      try {
        const response = await userApi.checkNickname(nick);
        if (response.success) {
          setNickStatus("available");
          setNickMessage("사용 가능한 닉네임입니다.");
        }
      } catch (err: any) {
        console.log(err);
        // 네트워크 에러 처리 (err.response가 없는 경우)
        if (!err.response) {
          setNickStatus("unavailable");
          setNickMessage(
            "네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
          );
          return;
        }

        // 500 에러 처리
        if (err.response?.status === 500) {
          setNickStatus("unavailable");
          setNickMessage(
            "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
          );
          return;
        }

        // 일반적인 비즈니스 로직 에러 (예: 중복 닉네임)
        if (!err.response?.data?.success) {
          setNickStatus("unavailable");
          setNickMessage(
            err.response?.data?.message || "사용할 수 없는 닉네임입니다."
          );
        } else {
          setNickStatus("idle");
          setNickMessage("");
        }
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [nick, currentNick, enabled, debounceMs]);

  return { nickStatus, nickMessage };
}
