"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";

interface ChartTooltipData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  change: number; // 전일 대비 변화량
  changeRate: number; // 전일 대비 변화율
}

interface ChartTooltipProps {
  data?: ChartTooltipData | null;
}

export function ChartTooltip({ data }: ChartTooltipProps) {
  if (!data) return null;

  const [open, setOpen] = useState(false);
  const isPositive = data.change >= 0;
  const isZero = data.change == 0;

  return (
    <div
      className={cn(
        "absolute px-3 py-1 top-1 left-1 rounded-md text-[10px] z-50",
        open
          ? "bg-background-1 border border-border shadow-lg min-w-[160px]"
          : "bg-transparent min-w-[130px]"
      )}
    >
      {/* 헤더: 날짜 + 토글 */}
      <div className="flex items-center justify-between">
        <div className="font-semibold text-foreground">{data.date}</div>
        <button
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? "툴팁 닫기" : "툴팁 열기"}
          title={open ? "닫기" : "열기"}
          className="ml-2 text-muted-foreground/80 hover:text-foreground text-sm"
        >
          {open ? "▾" : "▸"}
        </button>
      </div>

      {/* 내용: 열렸을 때만 표시 */}
      {open && (
        <>
          {/* 가격 정보 */}
          <div className="space-y-1 text-muted-foreground">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground/80">시가</span>
              <span className="font-medium text-foreground">
                {data.open.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-chart-up">고가</span>
              <span className="font-medium text-chart-up">
                {data.high.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-chart-down">저가</span>
              <span className="font-medium text-chart-down">
                {data.low.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground/80">종가</span>
              <span className="font-medium text-foreground">
                {data.close.toLocaleString()}
              </span>
            </div>
            {/* 변화량/변화율 */}
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground/80">등락</span>
              <div
                className={cn(
                  "font-medium text-foreground flex flex-col items-end",
                  isZero
                    ? "text-foreground"
                    : isPositive
                    ? "text-chart-up"
                    : "text-chart-down"
                )}
              >
                <span>
                  {isPositive ? "+ " : ""}
                  {data.change.toLocaleString()}
                </span>
                <span>
                  {isPositive ? "+ " : ""}
                  {data.changeRate.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>

          {/* 거래량 */}
          <div className="mt-1 pt-1 border-t border-border/50">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground/80">거래량</span>
              <span className="font-medium text-foreground">
                {data.volume.toLocaleString()}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
