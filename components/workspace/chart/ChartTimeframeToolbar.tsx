"use client";

import { cn } from "@/lib/utils";

type Timeframe = {
  label: string;
  value: string;
  disabled: boolean;
};

const timeframes: Timeframe[] = [
  { label: "1분", value: "1m", disabled: true },
  { label: "5분", value: "5m", disabled: true },
  { label: "15분", value: "15m", disabled: true },
  { label: "1시간", value: "1h", disabled: true },
  { label: "일", value: "1D", disabled: false },
  { label: "주", value: "1W", disabled: true },
  { label: "월", value: "1M", disabled: true },
];

interface ChartTimeframeToolbarProps {
  activeTimeframe: string;
  onTimeframeChange?: (timeframe: string) => void;
  extraActions?: React.ReactNode;
  className?: string;
}

export function ChartTimeframeToolbar({
  activeTimeframe,
  onTimeframeChange,
  extraActions,
  className,
}: ChartTimeframeToolbarProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between px-2 py-1.5 border-b border-border-2",
        className
      )}
    >
      {/* 타임프레임 버튼들 */}
      <div className="flex items-center gap-1">
        {timeframes.map((tf) => (
          <button
            key={tf.value}
            onClick={() => !tf.disabled && onTimeframeChange?.(tf.value)}
            disabled={tf.disabled}
            className={cn(
              "px-2 py-0.5 text-xs rounded transition-colors",
              activeTimeframe === tf.value
                ? "bg-accent text-accent-foreground font-medium"
                : tf.disabled
                  ? "text-muted-foreground/40 cursor-not-allowed"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            {tf.label}
          </button>
        ))}
      </div>

      {/* 액션 버튼 */}
      <div className="flex items-center gap-1">
        {extraActions}
        <button
          disabled
          className="px-2 py-0.5 text-xs rounded bg-chart-down/20 text-chart-down/40 cursor-not-allowed"
        >
          매도
        </button>
        <button
          disabled
          className="px-2 py-0.5 text-xs rounded bg-chart-up/20 text-chart-up/40 cursor-not-allowed"
        >
          매수
        </button>
      </div>
    </div>
  );
}
