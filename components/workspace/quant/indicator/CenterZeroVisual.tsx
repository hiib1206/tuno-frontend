"use client";

import { QuantSignalIndicators } from "@/types/Inference";
import { motion } from "framer-motion";
import { IndicatorMeta } from "./indicatorMeta";

interface CenterZeroVisualProps {
  value: number;
  meta: IndicatorMeta;
  direction: "up" | "down";
  color: string;
  progress: number;
  indicatorName: keyof QuantSignalIndicators;
}

export function CenterZeroVisual({
  value,
  meta,
  color,
  progress,
  indicatorName,
}: CenterZeroVisualProps) {
  // 1. Clamp 설정 (지표별 최대/최소 범위)
  let clamp = 0.3; // 기본 ±30%
  if (
    indicatorName === "momentum60D" ||
    indicatorName === "relativeStrength60D"
  ) {
    clamp = 0.5; // 60일 데이터는 ±50%
  } else if (indicatorName === "maDiff60") {
    clamp = 0.3; // 이평괴리율은 ±30%
  }

  // 2. 값 계산
  const isPositive = value > 0;
  const isZero = value === 0;
  const absValue = Math.abs(value);
  const isOverClamp = absValue > clamp;

  // 애니메이션 progress 적용
  const animatedValue = absValue * progress;
  const ratio = Math.min(animatedValue / clamp, 1.0); // 0.0 ~ 1.0 (capped)

  // 3. Dual Limit Bar 높이 계산
  const limitVal = (clamp * 100).toFixed(0);
  const negHeight = !isPositive && !isZero ? ratio * 100 : 0;
  const posHeight = isPositive ? ratio * 100 : 0;

  // 4. 포맷팅
  const percentage = (animatedValue * 100).toFixed(1);

  return (
    <div className="w-full h-full flex flex-col overflow-hidden p-4">
      {/* Header */}
      <div className="flex items-start justify-between flex-shrink-0 mb-2">
        <span className="text-sm font-bold tracking-widest text-muted-foreground uppercase">
          {meta.label}
        </span>
        {isOverClamp && (
          <span
            className="text-[10px] font-black border-b-2 leading-none pb-0.5"
            style={{ color, borderColor: color }}
          >
            MAX
          </span>
        )}
      </div>

      {/* Main */}
      <div
        className="flex-1 grid gap-6 items-end"
        style={{ gridTemplateColumns: "auto 1fr" }}
      >
        {/* Dual Limit Bars */}
        <div className="flex gap-2 h-full items-end">
          {/* Negative */}
          <div className="flex flex-col items-center gap-2 h-full justify-end">
            <div className="w-7 bg-background-2 rounded-sm overflow-hidden flex flex-col justify-end h-[85%]">
              <motion.div
                className="w-full"
                style={{
                  backgroundColor:
                    !isPositive && !isZero ? color : "transparent",
                }}
                initial={{ height: 0 }}
                animate={{ height: `${negHeight}%` }}
                transition={{ type: "spring", stiffness: 80, damping: 15 }}
              />
            </div>
            <span className="text-[10px] font-mono font-bold text-muted-foreground/60">
              -{limitVal}
            </span>
          </div>

          {/* Positive */}
          <div className="flex flex-col items-center gap-2 h-full justify-end">
            <div className="w-7 bg-background-2 rounded-sm overflow-hidden flex flex-col justify-end h-[85%]">
              <motion.div
                className="w-full"
                style={{
                  backgroundColor: isPositive ? color : "transparent",
                }}
                initial={{ height: 0 }}
                animate={{ height: `${posHeight}%` }}
                transition={{ type: "spring", stiffness: 80, damping: 15 }}
              />
            </div>
            <span className="text-[10px] font-mono font-bold text-muted-foreground/60">
              +{limitVal}
            </span>
          </div>
        </div>

        {/* Number + Sparkline */}
        <div className="flex flex-col items-end justify-end h-full">
          <div className="flex items-baseline gap-1 h-16 overflow-hidden">
            {!isZero && (
              <span
                className="text-5xl font-extralight"
                style={{ color }}
              >
                {isPositive ? "+" : "-"}
              </span>
            )}

            <motion.span
              className="text-5xl font-black tracking-tighter tabular-nums"
              style={{ color }}
              key={isPositive ? "pos" : "neg"}
              initial={{ opacity: 0.5, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {isZero ? "0.0" : percentage}
            </motion.span>

            <span className="text-xl text-muted-foreground font-medium">
              %
            </span>
          </div>

          {/* Sparkline */}
          <div className="flex gap-0.5 items-end justify-end h-4 w-24 opacity-40 mt-3 ml-auto">
            {[30, 50, 20, 70, 40, 90, 30, 60, 20, 50].map((h, i) => (
              <motion.div
                key={i}
                className="w-1 rounded-[1px]"
                style={{ backgroundColor: color }}
                initial={{ height: 2 }}
                animate={{
                  height: isZero ? 2 : Math.min(100, h * ratio + 10) + "%",
                }}
                transition={{ duration: 0.5 }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
