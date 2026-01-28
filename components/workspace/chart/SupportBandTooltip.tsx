"use client";

import { BandHoverInfo } from "./primitives/PriceBandPrimitive";

interface SupportBandTooltipProps {
  hoverInfo: BandHoverInfo | null;
  mouseX: number;
  mouseY: number;
}

// 숫자 포맷
const formatNumber = (num: number) => {
  return num.toLocaleString("ko-KR");
};

// 지지선 라벨 매핑
const SUPPORT_LABEL_MAP: Record<string, string> = {
  S1: "1차 지지선",
  S2: "2차 지지선",
  S3: "3차 지지선",
};

export function SupportBandTooltip({
  hoverInfo,
  mouseX,
  mouseY,
}: SupportBandTooltipProps) {
  if (!hoverInfo) return null;

  // 색상에서 RGB 추출
  const rgbaMatch = hoverInfo.color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  const r = rgbaMatch ? rgbaMatch[1] : "96";
  const g = rgbaMatch ? rgbaMatch[2] : "165";
  const b = rgbaMatch ? rgbaMatch[3] : "250";
  const accentColor = `rgb(${r}, ${g}, ${b})`;

  return (
    <div
      className="absolute pointer-events-none z-50"
      style={{
        left: mouseX + 12,
        top: mouseY - 8,
      }}
    >
      <div className="bg-background-1/95 backdrop-blur-sm border border-border-2 rounded-md shadow-lg px-2.5 py-2 min-w-[120px]">
        {/* 헤더: 지지선 이름 */}
        <div
          className="text-[11px] font-semibold mb-1.5 pb-1 border-b border-border-2"
          style={{ color: accentColor }}
        >
          {hoverInfo.label} : {SUPPORT_LABEL_MAP[hoverInfo.label]}
        </div>

        {/* 가격 정보 */}
        <div className="space-y-0.5 text-[10px]">
          <div className="flex justify-between gap-3">
            <span className="text-muted-foreground">상한</span>
            <span className="text-foreground font-medium">
              {formatNumber(Math.round(hoverInfo.upperPrice))}
            </span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-muted-foreground">지지선</span>
            <span className="font-semibold" style={{ color: accentColor }}>
              {formatNumber(Math.round(hoverInfo.centerPrice))}
            </span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-muted-foreground">하한</span>
            <span className="text-foreground font-medium">
              {formatNumber(Math.round(hoverInfo.lowerPrice))}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
