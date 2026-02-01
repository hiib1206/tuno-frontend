"use client";

import { QuantSignalIndicators } from "@/types/Inference";
import { Activity, ArrowDownRight, ArrowUpRight, Shield, ShieldOff, Zap } from "lucide-react";
import { IndicatorMeta } from "./indicatorMeta";

interface BinaryVisualProps {
  value: number;
  meta: IndicatorMeta;
  direction: "up" | "down";
  color: string;
  indicatorName: keyof QuantSignalIndicators;
}

export function BinaryVisual({
  value,
  meta,
  color,
  indicatorName,
}: BinaryVisualProps) {
  const isActive = value === 1;
  const bgColor = `color-mix(in oklab, ${color} 98%, transparent)`;

  // 디자인 설정 (CONCEPT X: PRECISION WHITE COMPONENT 스타일 매핑)
  let config = {
    label: meta.label.toUpperCase(),
    mainText: isActive ? "UP" : "DOWN",
    subLabel: isActive ? meta.onLabel : meta.offLabel,
    Icon: Activity,
  };

  if (indicatorName === "trendMa60120") {
    // ① 추세 방향: Emerald
    config = {
      label: "추세 방향",
      mainText: isActive ? "UP" : "DOWN",
      subLabel: isActive ? "상승 추세" : "하락 추세",
      Icon: isActive ? ArrowUpRight : ArrowDownRight,
    };
  } else if (indicatorName === "defensiveStrength") {
    // ② 방어력: Blue
    config = {
      label: "방어력",
      mainText: isActive ? "UP" : "DOWN",
      subLabel: isActive ? "하락 방어 성공" : "일반 상태",
      Icon: isActive ? Shield : ShieldOff,
    };
  } else if (indicatorName === "marketStress") {
    // ③ 시장 위험: Rose
    config = {
      label: "시장 위험",
      mainText: isActive ? "UP" : "DOWN",
      subLabel: isActive ? "급락 위험 감지" : "시장 안정권",
      Icon: isActive ? Zap : Activity,
    };
  }

  return (
    <div
      className="relative w-full h-full flex flex-col justify-between overflow-hidden p-4"
      style={{ backgroundColor: bgColor }}
    >
      {/* 1. 배경 그리드 (Subtle Technical Grid) */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
          backgroundSize: "30px 30px",
        }}
      />

      {/* 3. 상단: 라벨 및 상태 점 */}
      <div className="relative z-10 flex justify-between items-start">
        <span className="text-sm font-bold tracking-widest text-white uppercase">
          {config.label}
        </span>
      </div>

      {/* 4. 하단: 메인 텍스트 및 아이콘 */}
      <div className="relative z-10 flex items-end justify-between mt-auto">
        <div>
          <h3
            className="text-5xl text-white font-black tracking-tighter leading-none"
          >
            {config.mainText}
          </h3>
          <span className="text-[11px] font-bold tracking-widest text-white uppercase mt-2 block">
            {config.subLabel}
          </span>
        </div>

        <div className="opacity-90 text-white">
          <config.Icon size={42} strokeWidth={1.5} />
        </div>
      </div>

    </div>
  );
}
