"use client";

import { filterSignalHistory } from "@/lib/inference";
import { cn } from "@/lib/utils";
import { QuantSignalHistoryEntry } from "@/types/Inference";
import { ChevronDown } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { SignalColors } from "./SignalInfoCard";

interface SignalTimelineProps {
  signalHistory: QuantSignalHistoryEntry[];
  colors: SignalColors;
  className?: string;
}

function formatDate(dateStr: string) {
  // "20260105" → "2026.01.05"
  return `${dateStr.slice(0, 4)}.${dateStr.slice(4, 6)}.${dateStr.slice(6, 8)}`;
}

function formatPrice(price: number) {
  return price.toLocaleString("ko-KR");
}

/** BUY 기준 수익률 계산: 과거→최신 순으로 탐색, BUY가 기준점, HOLD/SELL은 그 BUY 대비 % */
function calcBuyBasedChanges(history: QuantSignalHistoryEntry[]): (number | null)[] {
  const changes: (number | null)[] = new Array(history.length).fill(null);
  let buyPrice: number | null = null;

  // history는 최신→과거 순이므로 역순(과거→최신)으로 순회
  for (let i = history.length - 1; i >= 0; i--) {
    const entry = history[i];
    if (entry.signal === "BUY") {
      buyPrice = entry.price;
      // BUY 자체는 기준점이므로 % 없음
    } else if (buyPrice !== null) {
      changes[i] = ((entry.price - buyPrice) / buyPrice) * 100;
    }
  }
  return changes;
}

export function SignalTimeline({
  signalHistory,
  colors,
  className,
}: SignalTimelineProps) {
  const filtered = useMemo(() => filterSignalHistory(signalHistory), [signalHistory]);
  const changes = useMemo(() => calcBuyBasedChanges(filtered), [filtered]);
  // stagger 애니메이션
  const [visibleCount, setVisibleCount] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (visibleCount < filtered.length) {
      const timer = setTimeout(
        () => setVisibleCount((prev) => prev + 1),
        60
      );
      return () => clearTimeout(timer);
    }
  }, [visibleCount, signalHistory.length]);

  useEffect(() => {
    setVisibleCount(0);
    const timer = setTimeout(() => setVisibleCount(1), 100);
    return () => clearTimeout(timer);
  }, [filtered]);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const checkOverflow = () => {
      setHasOverflow(el.scrollHeight > el.clientHeight + 1);
    };
    checkOverflow();
    const ro = new ResizeObserver(checkOverflow);
    ro.observe(el);
    return () => ro.disconnect();
  }, [filtered, visibleCount, isExpanded]);

  return (
    <div
      className={cn(
        "bg-background-1 rounded-lg overflow-hidden flex flex-col",
        className
      )}
    >
      {/* 헤더 */}
      <div className="px-5 py-4">
        <h3 className="text-base text-muted-foreground uppercase tracking-wider">
          시그널 히스토리
        </h3>
      </div>

      {/* 타임라인 */}
      <div className="px-5 pb-5 flex-1 min-h-0">
        <div
          ref={listRef}
          className={cn(
            "relative h-full",
            isExpanded ? "overflow-y-auto pr-2" : "overflow-hidden"
          )}
        >
          {/* 세로 연결선 */}
          <div className="absolute left-[4.5px] top-[15px] bottom-[15px] w-px bg-border" />

          {filtered.map((entry, index) => {
            const isVisible = index < visibleCount;
            const color = colors[entry.signal];
            const isFirst = index === 0;
            const change = changes[index];

            return (
              <div
                key={`${entry.date}-${index}`}
                className={cn(
                  "transition-all duration-400",
                  isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 -translate-y-2"
                )}
              >
                {/* 시그널 항목 */}
                <div className="relative flex items-center gap-4 py-2.5">
                  {/* 타임라인 dot */}
                  <div
                    className={cn(
                      "relative z-10 w-[10px] h-[10px] rounded-full border-2 flex-shrink-0",
                      isFirst ? "border-transparent" : "bg-background-1"
                    )}
                    style={{
                      backgroundColor: isFirst ? color : undefined,
                      borderColor: isFirst ? color : color,
                    }}
                  >
                    {isFirst && (
                      <span
                        className="absolute inset-0 rounded-full animate-ping opacity-30"
                        style={{ backgroundColor: color }}
                      />
                    )}
                  </div>

                  {/* 날짜 */}
                  <span
                    className={cn(
                      "text-sm tabular-nums w-[85px] flex-shrink-0",
                      isFirst
                        ? "text-foreground font-medium"
                        : "text-muted-foreground"
                    )}
                  >
                    {formatDate(entry.date)}
                  </span>

                  {/* 시그널 뱃지 */}
                  <span
                    className="text-xs font-bold w-11 text-center py-0.5 rounded"
                    style={{
                      color: color,
                      backgroundColor: color + "26",
                    }}
                  >
                    {entry.signal}
                  </span>

                  {/* 가격 */}
                  <span
                    className={cn(
                      "text-sm tabular-nums flex-1 text-right",
                      isFirst ? "text-foreground font-medium" : "text-muted-foreground"
                    )}
                  >
                    ₩ {formatPrice(entry.price)}
                  </span>

                  {/* 수익률 / 진입 표시 */}
                  <span
                    className={cn(
                      "text-xs tabular-nums w-16 text-right font-medium",
                      entry.signal !== "BUY" && change === null
                        ? "text-muted-foreground/40"
                        : "text-muted-foreground"
                    )}
                    style={
                      entry.signal === "BUY"
                        ? { color: colors.BUY, opacity: 0.7 }
                        : change !== null
                          ? { color: change > 0 ? colors.BUY : change < 0 ? colors.SELL : undefined }
                          : undefined
                    }
                  >
                    {entry.signal === "BUY"
                      ? "진입"
                      : change !== null
                        ? `${change > 0 ? "+" : ""}${change.toFixed(1)}%`
                        : "-"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {hasOverflow && !isExpanded && (
          <div className="relative -mt-16 h-16 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-t from-background-1 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 flex justify-center pb-1 pointer-events-auto">
              <button
                type="button"
                className="inline-flex items-center gap-1 px-3 py-1 text-sm rounded-full text-muted-foreground transition-all duration-150 hover:text-foreground hover:scale-105"
                onClick={() => setIsExpanded(true)}
              >
                더보기
                <ChevronDown className="h-3 w-3" aria-hidden />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
