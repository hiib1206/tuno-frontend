import { QuantSignalHistoryEntry } from "@/types/Inference";

/**
 * 시그널 히스토리에서 유효한 포지션 구간만 필터링
 *
 * - BUY → 포지션 진입, 이후 HOLD/SELL 표시
 * - SELL → 포지션 청산, 이후 다음 BUY까지 숨김
 * - BUY 이전의 HOLD/SELL → 숨김
 *
 * 입력: 최신→과거 순 배열, 출력: 같은 순서로 필터된 배열
 */
export function filterSignalHistory(
  history: QuantSignalHistoryEntry[]
): QuantSignalHistoryEntry[] {
  // 어떤 인덱스를 보여줄지 마킹
  const visible = new Array(history.length).fill(false);
  let state: "watching" | "holding" = "watching";

  // 과거→최신 순으로 순회
  for (let i = history.length - 1; i >= 0; i--) {
    const signal = history[i].signal;

    if (signal === "BUY") {
      state = "holding";
      visible[i] = true;
    } else if (signal === "SELL") {
      if (state === "holding") {
        visible[i] = true;
        state = "watching";
      }
      // watching 상태의 SELL은 숨김
    } else {
      // HOLD
      if (state === "holding") {
        visible[i] = true;
      }
    }
  }

  return history.filter((_, i) => visible[i]);
}
