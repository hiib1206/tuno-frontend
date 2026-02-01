"use client";

import { motion } from "framer-motion";
import { IndicatorMeta } from "./indicatorMeta";

interface BaseOneVisualProps {
  value: number;
  meta: IndicatorMeta;
  direction: "up" | "down";
  color: string;
  progress: number;
}

export function BaseOneVisual({
  value,
  meta,
  color,
  progress,
}: BaseOneVisualProps) {
  const maxRange = meta.maxRange ?? 3;
  const formatted = meta.format ? meta.format(value) : value.toFixed(2);

  // 1) Step/Scale
  let step = 0.1;
  let majorStep = 0.5;
  let anglePerUnit = 40;

  if (maxRange > 5) {
    step = 0.5;
    majorStep = 2.0;
  }
  if (maxRange > 20) {
    step = 1.0;
    majorStep = 5.0;
  }
  if (maxRange > 10) anglePerUnit = 10;

  // 2) Rotation
  const rotation = -((value - 1.0) * anglePerUnit);
  const animatedRotation = rotation * progress;

  // 3) Ticks
  const rangeLimit = maxRange * 1.2;
  const tickCount = Math.floor(rangeLimit / step);
  const ticks = Array.from({ length: tickCount + 1 }).map((_, i) => i * step);

  const toRgba = (hex: string, alpha: number) => {
    const cleaned = hex.replace("#", "");
    if (cleaned.length !== 6) return `rgba(16,185,129,${alpha})`;
    const r = parseInt(cleaned.slice(0, 2), 16);
    const g = parseInt(cleaned.slice(2, 4), 16);
    const b = parseInt(cleaned.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  return (
    <div className="w-full h-full bg-background-1 rounded-md overflow-hidden flex flex-col relative">
      {/* Header */}
      <div className="relative h-16 px-4 pt-4 pb-0 z-20 flex justify-between items-start">
        <div className="flex flex-col">
          <span className="text-sm font-bold tracking-widest text-muted-foreground uppercase truncate">
            {meta.label}
          </span>
          <span className="text-[10px] text-muted-foreground/60 font-mono mt-0.5">
            MAX {maxRange.toFixed(1)}
          </span>
        </div>
        <div className="flex flex-col items-end">
          <span
            className="text-5xl font-black tracking-tighter leading-none"
            style={{ color }}
          >
            {formatted}
          </span>
        </div>
      </div>

      {/* Visual */}
      <div className="flex-1 relative overflow-hidden">
        {/* Needle */}
        <div className=" absolute top-0 bottom-0 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center justify-end pointer-events-none">
          <div
            className="w-1 h-18 rounded-full shadow-sm bg-white/90"
          />
        </div>

        {/* Disk */}
        <motion.div
          className="absolute left-1/2 -translate-x-1/2 w-[140%] aspect-square rounded-full origin-center overflow-hidden"
          style={{
            backgroundColor: color,
            boxShadow: `0 -4px 20px ${toRgba(color, 0.15)}`,
          }}
          initial={{ rotate: 0 }}
          animate={{ rotate: animatedRotation }}
          transition={{ type: "spring", stiffness: 45, damping: 18 }}
        >
          {ticks.map((tickVal, i) => {
            const deg = (tickVal - 1.0) * anglePerUnit;
            const isMajor =
              Math.abs(tickVal % majorStep) < 0.001 ||
              Math.abs((tickVal % majorStep) - majorStep) < 0.001;
            const isBase = Math.abs(tickVal - 1.0) < 0.001;

            return (
              <div
                key={`${tickVal}-${i}`}
                className="absolute top-0 left-1/2 h-full w-px origin-center pt-2"
                style={{ transform: `translateX(-50%) rotate(${deg}deg)` }}
              >
                <div
                  className={`w-px ${isMajor ? "h-4 bg-white" : "h-2 bg-white/40"
                    } mx-auto`}
                />

                {isMajor && (
                  <div className="absolute top-7 left-1/2 -translate-x-1/2 flex flex-col items-center">
                    <span className="text-[9px] font-mono font-bold text-white">
                      {Number.isInteger(tickVal)
                        ? tickVal
                        : tickVal.toFixed(1)}
                    </span>
                    {isBase && (
                      <div className="text-[7px] font-bold text-white/90 mt-px scale-[0.8] bg-white/20 px-1 rounded-sm">
                        STD
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
