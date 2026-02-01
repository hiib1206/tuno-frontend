"use client";

import { cn } from "@/lib/utils";
import { QuantSignalIndicators } from "@/types/Inference";
import { useEffect, useState } from "react";
import { BaseOneVisual } from "./BaseOneVisual";
import { BinaryVisual } from "./BinaryVisual";
import { CenterZeroVisual } from "./CenterZeroVisual";
import { Gauge100Visual } from "./Gauge100Visual";
import { SimpleVisual } from "./SimpleVisual";
import { INDICATOR_META } from "./indicatorMeta";

// ─── Props ───
interface IndicatorVisualProps {
  indicatorName: keyof QuantSignalIndicators;
  value: number;
  direction: "up" | "down";
  color: string;
  className?: string;
}

export function IndicatorVisual({
  indicatorName,
  value,
  direction,
  color,
  className,
}: IndicatorVisualProps) {
  const meta = INDICATOR_META[indicatorName];

  // 알 수 없는 지표명이면 렌더링하지 않음
  if (!meta) return null;

  const [progress, setProgress] = useState(0);
  useEffect(() => {
    let rafId = 0;
    const duration = 900;
    const delay = 60;
    const start = performance.now();

    const step = (now: number) => {
      const elapsed = now - start;
      if (elapsed < delay) {
        setProgress(0);
        rafId = requestAnimationFrame(step);
        return;
      }
      const t = Math.min(1, (elapsed - delay) / duration);
      const eased = t * t * (3 - 2 * t);
      const next = eased;
      setProgress(next);
      if (next < 1) rafId = requestAnimationFrame(step);
    };

    setProgress(0);
    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [value]);

  return (
    <div className={cn("bg-background-1 rounded-lg w-full h-full", className)}>
      {meta.visualType === "binary" && (
        <BinaryVisual
          value={value}
          meta={meta}
          direction={direction}
          color={color}
          indicatorName={indicatorName}
        />
      )}
      {meta.visualType === "gauge100" && (
        <Gauge100Visual
          value={value}
          meta={meta}
          direction={direction}
          color={color}
          progress={progress}
        />
      )}
      {meta.visualType === "centerZero" && (
        <CenterZeroVisual
          value={value}
          meta={meta}
          direction={direction}
          color={color}
          progress={progress}
          indicatorName={indicatorName}
        />
      )}
      {meta.visualType === "baseOne" && (
        <BaseOneVisual
          value={value}
          meta={meta}
          direction={direction}
          color={color}
          progress={progress}
        />
      )}
      {meta.visualType === "simple" && (
        <SimpleVisual
          value={value}
          meta={meta}
          direction={direction}
          color={color}
        />
      )}
    </div>
  );
}
