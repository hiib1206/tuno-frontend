"use client";

import { WaveAnimation } from "@/components/ui/wave-animation";
import { cn } from "@/lib/utils";
import { QuantSignalType } from "@/types/Inference";

interface SignalWaveCardProps {
  signal: QuantSignalType;
  confidence: number;
  color: string;
  className?: string;
}

export function SignalWaveCard({
  signal,
  confidence,
  color,
  className,
}: SignalWaveCardProps) {
  const isLow = confidence < 0.4;

  return (
    <div
      className={cn(
        "bg-background-1 relative w-[300px] h-[220px] flex-shrink-0 rounded-md overflow-hidden",
        className
      )}
    >
      <WaveAnimation confidence={confidence} color={color} />
      <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between z-10">
        <div>
          <p className={cn("text-sm mb-1", isLow ? "text-foreground/50" : "text-white/70")}>
            Confidence
          </p>
          <p className={cn("text-4xl font-bold tabular-nums", isLow ? "text-foreground" : "text-white")}>
            {(confidence * 100).toFixed(0)}
            <span className={cn("text-xl font-normal", isLow ? "text-foreground/50" : "text-white/70")}>
              {" "}%
            </span>
          </p>
        </div>
        <p className={cn("text-4xl font-bold", isLow ? "text-foreground" : "text-white")}>
          {signal}
        </p>
      </div>
    </div>
  );
}
