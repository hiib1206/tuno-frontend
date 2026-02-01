"use client";

import { IndicatorMeta } from "./indicatorMeta";

interface SimpleVisualProps {
  value: number;
  meta: IndicatorMeta;
  direction: "up" | "down";
  color: string;
}

export function SimpleVisual({
  value,
  meta,
  direction,
  color,
}: SimpleVisualProps) {
  const formatted = meta.format ? meta.format(value) : value.toFixed(2);
  const isPositive = direction === "up";

  return (
    <div className="h-full rounded-md overflow-hidden relative">
      {/* Background split */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-background-1" />
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: color,
            clipPath: "polygon(0 0, 60% 0, 30% 100%, 0% 100%)",
          }}
        />
      </div>

      {/* Content */}
      <div className="absolute inset-0 p-4 flex flex-col justify-between z-10">
        <div className="flex justify-between items-start">
          <span className="text-sm font-bold text-white uppercase tracking-widest break-words w-1/2 leading-snug">
            {meta.label}
          </span>
          <span
            className="text-sm font-bold tracking-widest uppercase"
            style={{ color }}
          >
            {isPositive ? "상승 영향" : "하락 영향"}
          </span>
        </div>

        <div className="h-full flex items-center justify-end">
          <span
            className="text-5xl font-black tracking-tighter leading-none tabular-nums"
            style={{ color }}
          >
            {formatted}
          </span>
        </div>
      </div>
    </div>
  );
}
