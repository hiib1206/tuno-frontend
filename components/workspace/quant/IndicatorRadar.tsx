"use client";

import { cn } from "@/lib/utils";
import { QuantSignalIndicators } from "@/types/Inference";
import { useEffect, useMemo, useRef, useState } from "react";

interface IndicatorRadarProps {
  indicators: QuantSignalIndicators;
  color?: string;
  className?: string;
  size?: number;
}

// 정규화 함수들 (0-100 스케일)
const normalizers = {
  rsi14: (v: number) => v,
  mfi: (v: number) => v,
  bbPosition: (v: number) => Math.min(100, Math.max(0, v * 100)),
  trendStrength: (v: number) => Math.min(100, Math.max(0, (v + 5) * 10)),
  relativeStrength20D: (v: number) =>
    Math.min(100, Math.max(0, ((v + 0.3) / 0.6) * 100)),
  amountRatio: (v: number) => Math.min(100, (v / 3) * 100),
};

// 레이더 차트 축 설정
const RADAR_AXES = [
  {
    key: "rsi14",
    label: "RSI",
    description: "14일 상대강도지수 (0-100). 70↑ 과매수, 30↓ 과매도",
  },
  {
    key: "mfi",
    label: "MFI",
    description: "14일 자금흐름지수 (0-100). 거래량 가중 RSI. 80↑ 과매수, 20↓ 과매도",
  },
  {
    key: "bbPosition",
    label: "변동성",
    description: "볼린저밴드 내 위치 (0-1). 1↑이면 상단돌파, 0↓이면 하단이탈",
  },
  {
    key: "trendStrength",
    label: "추세강도",
    description: "(현재가 - MA60) / ATR. 양수면 상승추세, 음수면 하락추세. 절대값이 클수록 강함",
  },
  {
    key: "relativeStrength20D",
    label: "시장대비",
    description: "종목 20일수익률 - 지수 20일수익률. 양수면 시장 대비 강세",
  },
  {
    key: "amountRatio",
    label: "거래대금 비율",
    description: "오늘거래대금 / 20일평균. 1↑이면 평소보다 활발",
  },
] as const;

// 극좌표 -> 직교좌표 변환
function polarToCartesian(
  cx: number,
  cy: number,
  radius: number,
  angleInDegrees: number
): { x: number; y: number } {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(angleInRadians),
    y: cy + radius * Math.sin(angleInRadians),
  };
}

// 다각형 포인트 생성
function generatePolygonPoints(
  cx: number,
  cy: number,
  radius: number,
  sides: number
): string {
  const points: string[] = [];
  for (let i = 0; i < sides; i++) {
    const angle = (360 / sides) * i;
    const { x, y } = polarToCartesian(cx, cy, radius, angle);
    points.push(`${x},${y}`);
  }
  return points.join(" ");
}

// 데이터 폴리곤 포인트 생성
function generateDataPoints(
  cx: number,
  cy: number,
  maxRadius: number,
  values: number[]
): { points: string; coords: { x: number; y: number }[] } {
  const coords: { x: number; y: number }[] = [];
  const sides = values.length;

  for (let i = 0; i < sides; i++) {
    const angle = (360 / sides) * i;
    const radius = (values[i] / 100) * maxRadius;
    const coord = polarToCartesian(cx, cy, radius, angle);
    coords.push(coord);
  }

  return {
    points: coords.map((c) => `${c.x},${c.y}`).join(" "),
    coords,
  };
}

export function IndicatorRadar({
  indicators,
  color = "#8b5cf6",
  className,
  size = 400,
}: IndicatorRadarProps) {
  const cx = size / 2;
  const cy = size / 2;
  const maxRadius = size * 0.35;
  const labelRadius = size * 0.40;
  const gridLevels = 5;

  // viewBox: 좌우 대칭(라벨 중 가장 긴 쪽 기준), 상하 최소
  const padX = 55;        // 좌우 대칭: "거래대금 비율" 라벨+아이콘(x≈-47) + 마진
  const padY = 20;        // 상하 대칭: RSI/추세강도 텍스트 + 마진
  const viewMinX = -padX;                    // -55
  const viewMinY = padY;                     // 20
  const viewWidth = size + padX * 2;         // 510
  const viewHeight = size - padY * 2;        // 360

  // 애니메이션 진행도 (0 -> 1)
  const [animationProgress, setAnimationProgress] = useState(0);
  // 호버된 포인트 인덱스
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  // 호버된 도움말 아이콘 인덱스
  const [hoveredHelpIndex, setHoveredHelpIndex] = useState<number | null>(null);

  // 컨테이너 ref + scale 추적
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setScale(entry.contentRect.width / viewWidth);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [viewWidth]);

  // 컴포넌트 마운트 시 부드러운 애니메이션
  useEffect(() => {
    const duration = 2000; // ms
    const startTime = performance.now();

    // easeOutBack easing function (약간 튀어나갔다 돌아오는 효과)
    const easeOutBack = (t: number): number => {
      const c1 = 1;
      const c3 = c1 + 1;
      return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
    };

    let animationFrame: number;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutBack(progress);

      setAnimationProgress(easedProgress);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    // 약간의 딜레이 후 애니메이션 시작
    const timer = setTimeout(() => {
      animationFrame = requestAnimationFrame(animate);
    }, 150);

    return () => {
      clearTimeout(timer);
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, []);

  // 원본 값 (툴팁용)
  const rawValues = useMemo(
    () => RADAR_AXES.map(({ key }) => indicators[key]),
    [indicators]
  );

  // 데이터 정규화
  const values = useMemo(
    () => RADAR_AXES.map(({ key }) => normalizers[key](indicators[key])),
    [indicators]
  );

  // 애니메이션 적용된 값 (0에서 실제 값으로)
  const animatedValues = useMemo(
    () => values.map((v) => v * animationProgress),
    [values, animationProgress]
  );

  // 데이터 포인트 계산 (애니메이션 적용)
  const { points: dataPoints, coords: dataCoords } = useMemo(
    () => generateDataPoints(cx, cy, maxRadius, animatedValues),
    [cx, cy, maxRadius, animatedValues]
  );

  // 라벨 위치 계산
  const labelPositions = useMemo(
    () =>
      RADAR_AXES.map((_, i) => {
        const angle = (360 / RADAR_AXES.length) * i;
        return polarToCartesian(cx, cy, labelRadius, angle);
      }),
    [cx, cy, labelRadius]
  );

  return (
    <div className={cn("bg-background-1 rounded-md p-4 flex flex-col overflow-visible min-w-0", className)}>
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-base text-muted-foreground uppercase tracking-wider">
          기술 지표 레이더
        </h3>
      </div>
      <div className="flex-1 flex items-center overflow-visible">
      <div ref={containerRef} className="relative w-full" style={{ aspectRatio: `${viewWidth}/${viewHeight}` }}>
        <svg
          viewBox={`${viewMinX} ${viewMinY} ${viewWidth} ${viewHeight}`}
          className="w-full h-full block"
        >
          {/* 배경 그리드 (동심 다각형) */}
          {Array.from({ length: gridLevels }, (_, i) => {
            const radius = (maxRadius / gridLevels) * (i + 1);
            return (
              <polygon
                key={i}
                points={generatePolygonPoints(cx, cy, radius, RADAR_AXES.length)}
                fill="none"
                stroke="currentColor"
                strokeOpacity={0.1}
                strokeWidth={1}
                className="text-foreground"
              />
            );
          })}

          {/* 축 라인 (중심에서 각 꼭짓점으로) */}
          {RADAR_AXES.map((_, i) => {
            const angle = (360 / RADAR_AXES.length) * i;
            const { x, y } = polarToCartesian(cx, cy, maxRadius, angle);
            return (
              <line
                key={i}
                x1={cx}
                y1={cy}
                x2={x}
                y2={y}
                stroke="currentColor"
                strokeOpacity={0.1}
                strokeWidth={1}
                className="text-foreground"
              />
            );
          })}

          {/* 데이터 영역 (단색 fill) */}
          <polygon
            points={dataPoints}
            fill={color}
            fillOpacity={animationProgress * 0.5}
            stroke={color}
            strokeWidth={2}
          />

          {/* 데이터 포인트 (순차적 등장) */}
          {dataCoords.map((coord, i) => {
            // 각 포인트가 순차적으로 나타나도록 stagger 적용
            const staggerDelay = i * 0.1;
            const pointProgress = Math.max(0, Math.min(1, (animationProgress - staggerDelay) / (1 - staggerDelay)));
            const isHovered = hoveredIndex === i;
            return (
              <circle
                key={i}
                cx={coord.x}
                cy={coord.y}
                r={(isHovered ? 4 : 3) * pointProgress}
                fill={color}
                opacity={pointProgress}
                className="cursor-pointer"
                style={{ transition: "r 150ms ease-out" }}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
            );
          })}

          {/* 라벨 + 도움말 아이콘 */}
          {RADAR_AXES.map((axis, i) => {
            const pos = labelPositions[i];
            // 라벨 위치에 따른 text-anchor 결정
            let textAnchor: "start" | "middle" | "end" = "middle";
            if (pos.x < cx - 10) textAnchor = "end";
            else if (pos.x > cx + 10) textAnchor = "start";

            // 텍스트 너비 추정 (한글 ~14px, 영문 ~9px, 공백 ~4px at fontSize 16)
            const textWidth = [...axis.label].reduce((sum, char) => {
              if (/[가-힣]/.test(char)) return sum + 14;
              if (char === " ") return sum + 4;
              return sum + 9;
            }, 0);

            // 도움말 아이콘 위치 계산
            let helpIconX: number;
            if (textAnchor === "end") {
              // 왼쪽 라벨: 텍스트 왼쪽 - 14px
              helpIconX = pos.x - textWidth - 14;
            } else if (textAnchor === "start") {
              // 오른쪽 라벨: 텍스트 오른쪽 + 14px
              helpIconX = pos.x + textWidth + 14;
            } else {
              // 중앙 라벨: 텍스트 오른쪽 + 14px
              helpIconX = pos.x + textWidth / 2 + 14;
            }

            return (
              <g key={axis.key}>
                <text
                  x={pos.x}
                  y={pos.y}
                  textAnchor={textAnchor}
                  dominantBaseline="central"
                  className="fill-foreground text-sm font-medium"
                  style={{ fontSize: 16 }}
                >
                  {axis.label}
                </text>
                {/* 도움말 아이콘 */}
                <g
                  transform={`translate(${helpIconX}, ${pos.y})`}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredHelpIndex(i)}
                  onMouseLeave={() => setHoveredHelpIndex(null)}
                >
                  <circle
                    r={6}
                    fill="transparent"
                    stroke="currentColor"
                    strokeOpacity={0.3}
                    strokeWidth={1}
                    className="text-muted-foreground"
                  />
                  <text
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="fill-muted-foreground"
                    style={{ fontSize: 10, fontWeight: 500 }}
                  >
                    ?
                  </text>
                </g>
              </g>
            );
          })}
        </svg>

        {/* 데이터 포인트 툴팁 */}
        {hoveredIndex !== null && dataCoords[hoveredIndex] && (
          <div
            className="absolute bg-background-1 border border-border rounded-md px-3 py-2 shadow-md pointer-events-none z-10"
            style={{
              left: `${(dataCoords[hoveredIndex].x - viewMinX) * scale + 12}px`,
              top: `${(dataCoords[hoveredIndex].y - viewMinY) * scale - 36}px`,
            }}
          >
            <p className="text-[11px] text-muted-foreground">
              {RADAR_AXES[hoveredIndex].label}
            </p>
            <p className="text-sm font-semibold text-foreground mt-1">
              {typeof rawValues[hoveredIndex] === "number"
                ? rawValues[hoveredIndex].toFixed(2)
                : rawValues[hoveredIndex]}
            </p>
          </div>
        )}

        {/* 도움말 툴팁 */}
        {hoveredHelpIndex !== null && labelPositions[hoveredHelpIndex] && (() => {
          const pos = labelPositions[hoveredHelpIndex];
          const axis = RADAR_AXES[hoveredHelpIndex];

          // 라벨 위치 판단 및 아이콘 위치 계산 (위와 동일한 로직)
          const isLeftLabel = pos.x < cx - 10;
          const textWidth = [...axis.label].reduce((sum, char) => {
            if (/[가-힣]/.test(char)) return sum + 14;
            if (char === " ") return sum + 4;
            return sum + 9;
          }, 0);

          let helpIconX: number;
          if (isLeftLabel) {
            helpIconX = pos.x - textWidth - 14;
          } else if (pos.x > cx + 10) {
            helpIconX = pos.x + textWidth + 14;
          } else {
            helpIconX = pos.x + textWidth / 2 + 14;
          }

          // 툴팁은 안쪽 방향으로 표시 (왼쪽 라벨→오른쪽, 오른쪽 라벨→왼쪽)
          const isRightLabel = pos.x > cx + 10;
          const tooltipLeft = isRightLabel
            ? helpIconX - 200 - 12  // 오른쪽 라벨: 툴팁을 왼쪽(안쪽)으로
            : helpIconX + 12;       // 왼쪽/중앙 라벨: 툴팁을 오른쪽(안쪽)으로

          return (
            <div
              className="absolute bg-background-1 border border-border rounded-md px-3 py-2 shadow-md pointer-events-none z-20 w-[200px]"
              style={{
                left: `${(tooltipLeft - viewMinX) * scale}px`,
                top: `${(pos.y - 10 - viewMinY) * scale}px`,
              }}
            >
              <p className="text-xs font-medium text-foreground mb-1">
                {axis.label}
              </p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {axis.description}
              </p>
            </div>
          );
        })()}
      </div>
      </div>
    </div>
  );
}
