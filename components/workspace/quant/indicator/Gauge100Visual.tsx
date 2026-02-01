"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { Sector } from "recharts";
import { IndicatorMeta } from "./indicatorMeta";

interface Gauge100VisualProps {
  value: number;
  meta: IndicatorMeta;
  direction: "up" | "down";
  color: string;
  progress: number;
  showStatusText?: boolean;
}

export function Gauge100Visual({
  value,
  meta,
  color,
  progress,
  showStatusText = true,
}: Gauge100VisualProps) {
  const zones = meta.zones ?? { low: 30, high: 70 };
  const clampedValue = Math.max(0, Math.min(100, value));
  const animatedValue = clampedValue * progress;

  let statusState: "overbought" | "neutral" | "oversold" = "neutral";

  if (clampedValue >= zones.high) {
    statusState = "overbought";
  } else if (clampedValue <= zones.low) {
    statusState = "oversold";
  }

  const width = 300;
  const height = 165;
  const cx = width / 2;
  const cy = height - 15;

  const padding = 8;
  const outerRadius = width / 2 - padding;
  const thickness = 50;
  const innerRadius = outerRadius - thickness;
  const cornerRadius = 5;

  const startAngle = 180;
  const endAngle = 0;
  const currentEndAngle =
    startAngle - (startAngle - endAngle) * (animatedValue / 100);

  const valueTextRef = useRef<SVGTextElement | null>(null);
  const arrowTextRef = useRef<SVGTextElement | null>(null);
  const [groupX, setGroupX] = useState(cx);
  const [arrowGap, setArrowGap] = useState(8);
  const [textReady, setTextReady] = useState(false);

  useLayoutEffect(() => {
    if (!valueTextRef.current) return;
    const valueBox = valueTextRef.current.getBBox();
    const arrowBox =
      showStatusText && statusState !== "neutral" && arrowTextRef.current
        ? arrowTextRef.current.getBBox()
        : { width: 0 };
    const gap = 8;
    setArrowGap(gap);
    const totalWidth = valueBox.width + (arrowBox.width ? gap + arrowBox.width : 0);
    setGroupX(cx - totalWidth / 2);
    setTextReady(true);
  }, [animatedValue, showStatusText, statusState, cx]);

  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-4">
      <p className="text-sm font-bold tracking-widest text-muted-foreground uppercase mb-2 self-start">
        {meta.label}
      </p>
      <div className="relative w-full flex-1 min-h-0">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full"
          preserveAspectRatio="xMidYMax meet"
        >
          {/* 배경 눈금 */}
          <path
            d={`M ${cx - (outerRadius + innerRadius) / 2} ${cy} A ${(outerRadius + innerRadius) / 2} ${(outerRadius + innerRadius) / 2} 0 0 1 ${cx + (outerRadius + innerRadius) / 2} ${cy}`}
            fill="none"
            stroke={color}
            strokeWidth={outerRadius - innerRadius - 4}
            strokeDasharray="4 8"
            strokeLinecap="butt"
            opacity={0.15}
          />

          {/* 진행 바 */}
          <Sector
            cx={cx}
            cy={cy}
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            startAngle={startAngle}
            endAngle={currentEndAngle}
            cornerRadius={cornerRadius}
            fill={color}
            stroke="none"
          />

          {/* 숫자 + 화살표 */}
          <g
            transform={`translate(${groupX}, ${cy - 10})`}
            opacity={textReady ? 1 : 0}
          >
            <text
              x={0}
              y={0}
              textAnchor="start"
              fill={color}
              fontSize={40}
              fontWeight={700}
              dominantBaseline="middle"
              ref={valueTextRef}
            >
              {Math.round(animatedValue)}%
            </text>
            {showStatusText && statusState !== "neutral" && (
              <text
                x={(valueTextRef.current?.getBBox().width ?? 0) + arrowGap}
                y={0}
                textAnchor="start"
                fill={color}
                fontSize={30}
                fontWeight={700}
                dominantBaseline="middle"
                ref={arrowTextRef}
              >
                {statusState === "overbought" ? "↑" : "↓"}
              </text>
            )}
          </g>
        </svg>
      </div>
    </div>
  );
}
