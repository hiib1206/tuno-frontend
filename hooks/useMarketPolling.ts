import { useEffect, useRef } from "react";

/**
 * 평일 07:55~20:05 KST 에만 주기적으로 콜백을 실행하는 폴링 훅
 */

function isKRMarketOpen(): boolean {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Seoul",
    weekday: "short",
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  }).formatToParts(new Date());

  const weekday = parts.find((p) => p.type === "weekday")?.value;
  const hour = parseInt(parts.find((p) => p.type === "hour")?.value ?? "0");
  const minute = parseInt(parts.find((p) => p.type === "minute")?.value ?? "0");

  const isWeekday = !["Sat", "Sun"].includes(weekday ?? "");
  const time = hour * 60 + minute;
  return isWeekday && time >= 475 && time <= 1205;
}

interface UseMarketPollingOptions {
  enabled?: boolean;
}

export function useMarketPolling(
  callback: () => void,
  intervalMs: number = 1500,
  options: UseMarketPollingOptions = {}
) {
  const { enabled = true } = options;
  const savedCallback = useRef(callback);
  savedCallback.current = callback;

  useEffect(() => {
    if (!enabled) return;

    const id = setInterval(() => {
      if (isKRMarketOpen()) {
        savedCallback.current();
      }
    }, intervalMs);

    return () => clearInterval(id);
  }, [intervalMs, enabled]);
}
