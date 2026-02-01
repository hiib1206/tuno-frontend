"use client";

import { cn } from "@/lib/utils";
import { QuantSignalType } from "@/types/Inference";

export type SignalColors = Record<QuantSignalType, string>;

interface SignalInfoCardProps {
  signal: QuantSignalType;
  probabilities: {
    buy: number;
    hold: number;
    sell: number;
  };
  currentPrice: number;
  colors: SignalColors;
  className?: string;
}

export function SignalInfoCard({
  signal,
  probabilities,
  currentPrice,
  colors,
  className,
}: SignalInfoCardProps) {
  return (
    <div
      className={cn(
        "flex-1 h-[220px] rounded-md bg-background-1 p-5 flex flex-col",
        className
      )}
    >
      {/* 기준가 상단 고정 */}
      <div className="mb-4 flex justify-between items-center">
        <p className="text-base uppercase tracking-widest text-muted-foreground mb-1">
          기준가
        </p>
        <p className="text-2xl font-semibold tabular-nums">
          {currentPrice.toLocaleString()}
          <span className="text-sm text-muted-foreground ml-1">원</span>
        </p>
      </div>

      {/* 시그널 확률 정보 */}
      <div className="flex-1 flex flex-col justify-end">
        <div className="space-y-3">
          {(["buy", "hold", "sell"] as const).map((key) => {
            const value = probabilities[key];
            const isActive = key.toUpperCase() === signal;
            return (
              <div key={key} className="flex items-center gap-3">
                <span
                  className={cn(
                    "w-10 text-sm font-medium uppercase",
                    isActive ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {key}
                </span>
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${value * 100}%`,
                      backgroundColor:
                        colors[key.toUpperCase() as QuantSignalType],
                    }}
                  />
                </div>
                <span
                  className={cn(
                    "w-12 text-right text-sm tabular-nums",
                    isActive
                      ? "text-foreground font-medium"
                      : "text-muted-foreground"
                  )}
                >
                  {(value * 100).toFixed(1)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
