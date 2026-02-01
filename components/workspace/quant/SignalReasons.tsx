"use client";

import { cn } from "@/lib/utils";
import { QuantSignalReason } from "@/types/Inference";
import { useEffect, useState } from "react";
import { SignalColors } from "./SignalInfoCard";

interface SignalReasonsProps {
  reasons: QuantSignalReason[];
  colors: SignalColors;
  className?: string;
}

export function SignalReasons({ reasons, colors, className }: SignalReasonsProps) {
  // stagger 애니메이션용 상태
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    if (visibleCount < reasons.length) {
      const timer = setTimeout(() => {
        setVisibleCount((prev) => prev + 1);
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [visibleCount, reasons.length]);

  // 마운트 시 초기화
  useEffect(() => {
    setVisibleCount(0);
    const timer = setTimeout(() => setVisibleCount(1), 100);
    return () => clearTimeout(timer);
  }, [reasons]);

  return (
    <div className={cn("bg-background-1 rounded-lg overflow-hidden flex flex-col", className)}>
      {/* 헤더 */}
      <div className="px-5 py-4">
        <h3 className="text-base text-muted-foreground uppercase tracking-wider">
          분석 근거
        </h3>
      </div>

      {/* 리스트 */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {reasons.map((reason, index) => {
          const isVisible = index < visibleCount;
          // API에서 direction/strength가 없을 경우 기본값 사용
          const direction = reason.direction ?? "up";
          const strength = reason.strength ?? 2;
          const activeColor = direction === "up" ? colors.BUY : colors.SELL;

          return (
            <div
              key={index}
              className={cn(
                "relative transition-all duration-400",
                isVisible
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 -translate-x-2"
              )}
            >
              <div className="flex items-start gap-4 px-5 py-4">
                {/* 왼쪽: 인디케이터 + 번호 */}
                <div className="flex items-center gap-3 pt-0.5">
                  {/* 인디케이터 도트 */}
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: activeColor,
                      opacity: 0.5 + strength * 0.125,
                    }}
                  />
                  {/* 번호 */}
                  <span className="text-lg font-light text-muted-foreground/30 tabular-nums leading-none w-5">
                    {index + 1}
                  </span>
                </div>

                {/* 내용 영역 */}
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-medium text-foreground leading-snug">
                    {reason.summary}
                  </p>
                  <p className="text-[13px] text-muted-foreground mt-1 leading-relaxed">
                    {reason.detail}
                  </p>
                </div>

                {/* 영향 강도 표시 */}
                <div className="flex-shrink-0 flex items-center gap-2 pt-0.5">
                  {/* 강도 바 (가로 방향) */}
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={cn(
                          "w-1 h-3 rounded-sm transition-all",
                          level <= strength
                            ? ""
                            : "bg-muted/50"
                        )}
                        style={{
                          backgroundColor: level <= strength ? activeColor : undefined,
                          opacity: level <= strength ? 0.5 + level * 0.125 : 0.3,
                        }}
                      />
                    ))}
                  </div>
                  <span
                    className="text-xs font-medium w-8"
                    style={{ color: activeColor, opacity: 0.8 }}
                  >
                    {direction === "up" ? "상승" : "하락"}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
