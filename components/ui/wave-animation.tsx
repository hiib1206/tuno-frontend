"use client";

import { cn } from "@/lib/utils";
import "./wave-animation.css";

interface WaveAnimationProps {
  /** 채울 비율 (0~1) */
  confidence: number;
  /** 메인 색상 (hex) */
  color: string;
  /** 추가 className */
  className?: string;
}

// hex 색상을 밝게 만드는 함수
function lightenColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, Math.floor((num >> 16) + (255 - (num >> 16)) * percent));
  const g = Math.min(255, Math.floor(((num >> 8) & 0x00ff) + (255 - ((num >> 8) & 0x00ff)) * percent));
  const b = Math.min(255, Math.floor((num & 0x0000ff) + (255 - (num & 0x0000ff)) * percent));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

export function WaveAnimation({ confidence, color, className }: WaveAnimationProps) {
  const lightColor = lightenColor(color, 0.3);
  const gradientId = `waveGrad-${color.replace("#", "")}`;

  // 100%일 때는 완전 채움 (파도 숨김), 그 외에는 기본 비율
  const isFull = confidence >= 0.995;
  const heightPercent = isFull ? 120 : confidence * 100;

  return (
    <div className={cn("absolute inset-0 overflow-hidden", className)}>
      {/* 뒤 레이어 - 왼쪽으로 이동 */}
      <svg
        className="absolute bottom-0 left-0 wave-back"
        style={{ height: `${heightPercent}%`, width: "200%" }}
        viewBox="0 0 200 10"
        preserveAspectRatio="none"
      >
        <path
          d="M0,1 C16.67,0.5 33.33,0.5 50,1 C66.67,1.5 83.33,1.5 100,1 C116.67,0.5 133.33,0.5 150,1 C166.67,1.5 183.33,1.5 200,1 L200,10 L0,10 Z"
          fill={color}
          fillOpacity={0.35}
        />
      </svg>

      {/* 앞 레이어 - 오른쪽으로 이동 (반대 위상) */}
      <svg
        className="absolute bottom-0 left-0 wave-front"
        style={{ height: `${heightPercent}%`, width: "200%" }}
        viewBox="0 0 200 10"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={lightColor} />
            <stop offset="100%" stopColor={color} />
          </linearGradient>
        </defs>
        <path
          d="M0,1 C16.67,1.5 33.33,1.5 50,1 C66.67,0.5 83.33,0.5 100,1 C116.67,1.5 133.33,1.5 150,1 C166.67,0.5 183.33,0.5 200,1 L200,10 L0,10 Z"
          fill={`url(#${gradientId})`}
        />
      </svg>
    </div>
  );
}
