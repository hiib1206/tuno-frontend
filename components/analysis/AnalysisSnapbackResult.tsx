"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useChartOverlayStore } from "@/stores/chartOverlayStore";
import { SnapbackResult, SnapbackSupport } from "@/types/Inference";
import { format, parse } from "date-fns";
import { Eye, EyeOff, Info } from "lucide-react";
import { Button } from "../ui/button";

interface AnalysisSnapbackResultProps {
  result: SnapbackResult;
  stockName?: string;
  currentPrice?: number;
  className?: string;
}

// 지지선 색상 (차트와 동일)
const SUPPORT_COLORS = [
  {
    bg: "bg-blue-500/10",
    border: "border-blue-400/30",
    text: "text-blue-500",
    dot: "bg-blue-400",
  },
  {
    bg: "bg-violet-500/10",
    border: "border-violet-400/30",
    text: "text-violet-500",
    dot: "bg-violet-400",
  },
  {
    bg: "bg-pink-500/10",
    border: "border-pink-400/30",
    text: "text-pink-500",
    dot: "bg-pink-400",
  },
];

// 현재가 기준 상태 멘트
const getStatusMessage = (
  currentPrice: number | undefined,
  basePrice: number,
  supports: SnapbackSupport[]
): string => {
  if (!currentPrice) return "현재가 로딩 중";

  // 기준가 상회
  if (currentPrice > basePrice) {
    const pct = ((currentPrice - basePrice) / basePrice) * 100;
    return `기준점 대비 +${pct.toFixed(2)}%`;
  }

  // 기준가 ~ 1차 지지선 상단 사이
  if (supports.length > 0 && currentPrice > supports[0].upperPrice) {
    return "1차 지지선 도달 전";
  }

  // 지지선 구간 및 사이 구간 확인
  for (let i = 0; i < supports.length; i++) {
    const support = supports[i];
    const nextSupport = supports[i + 1];

    // 현재 지지선 밴드 내
    if (currentPrice >= support.lowerPrice && currentPrice <= support.upperPrice) {
      return `${support.level}차 지지 구간`;
    }

    // 현재 지지선 하단 ~ 다음 지지선 상단 사이
    if (nextSupport && currentPrice < support.lowerPrice && currentPrice > nextSupport.upperPrice) {
      return `${support.level}차 지지선 이탈 및 ${nextSupport.level}차 지지선 도달 전`;
    }
  }

  // 마지막 지지선 하단 미만 (전체 이탈)
  return "지지선 이탈";
};

// 유틸리티 함수
const formatDate = (dateStr: string) => {
  try {
    const date = parse(dateStr, "yyyyMMdd", new Date());
    return format(date, "yyyy.MM.dd");
  } catch {
    return dateStr;
  }
};

const formatNumber = (num: number) => num.toLocaleString("ko-KR");

const formatPercent = (num: number, showSign = true) => {
  const sign = showSign && num > 0 ? "+" : "";
  return `${sign}${num.toFixed(2)}%`;
};

export function AnalysisSnapbackResult({
  result,
  stockName,
  currentPrice,
  className,
}: AnalysisSnapbackResultProps) {
  const { showAnalysisOverlay, toggleAnalysisOverlay } = useChartOverlayStore();
  const displayName = stockName || result.ticker;
  const displayTicker = stockName ? result.ticker : null;
  const statusMessage = getStatusMessage(currentPrice, result.basePoint.price, result.supports);

  return (
    <div className={cn("h-full overflow-auto px-6 py-3", className)}>
      <div className="flex flex-col gap-6">
        <section className="space-y-5">
          <header className="space-y-2">
            {/* 상단 헤더: 차트 표시 | 분석 결과 (가운데) */}
            <div className="grid grid-cols-3 items-center">
              <Button
                variant="ghost"
                size="none"
                onClick={toggleAnalysisOverlay}
                className={cn(
                  "justify-self-start flex items-center gap-1 rounded-full border pl-2 pr-3 py-1 text-[10px] transition-colors",
                )}
              >
                {showAnalysisOverlay ? (
                  <Eye className="w-2 h-2" />
                ) : (
                  <EyeOff className="w-2 h-2" />
                )}
                차트 표시
              </Button>
              <p className="justify-self-center text-sm text-foreground">분석 결과</p>
              <div />
            </div>

            {/* 종목명 */}
            <div className="flex flex-row gap-2 items-baseline">
              <h2 className="text-lg font-semibold tracking-tight text-foreground">
                {displayName}
              </h2>
              {displayTicker && (
                <p className="text-xs text-muted-foreground">{displayTicker}</p>
              )}
            </div>

            {/* 상태 문구 */}
            <p className="text-xs text-muted-foreground">
              {statusMessage}
            </p>
          </header>

          <div className="rounded-md border border-border">
            <div className="grid grid-cols-4">
              {/* 기준 가격 */}
              <div className="p-4 border-r border-border">
                <div className="text-xs sm:text-sm text-muted-foreground">기준 가격</div>
                <div className="mt-2">
                  <span className="text-sm sm:text-md font-semibold text-foreground tabular-nums">
                    {formatNumber(result.basePoint.price)}원
                  </span>
                </div>
              </div>

              {/* 기준일 */}
              <div className="p-4 border-r border-border">
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm text-muted-foreground">기준일</span>
                  <span className="text-xs text-muted-foreground/70">
                    ({result.daysSinceBase}일 전)
                  </span>
                </div>
                <div className="mt-2">
                  <span className="text-sm sm:text-md font-semibold text-foreground">
                    {formatDate(result.basePoint.date)}
                  </span>
                </div>
              </div>

              {/* ATR */}
              <div className="p-4 border-r border-border">
                <div className="flex items-center gap-1">
                  <span className="text-xs sm:text-sm text-muted-foreground">ATR</span>
                  <TooltipProvider>
                    <Tooltip delayDuration={200}>
                      <TooltipTrigger asChild>
                        <Info className="w-3 h-3 text-muted-foreground/70 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>14일 평균 변동폭</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <span className="text-xs text-muted-foreground/70">
                    ({formatPercent(result.atr.pct, false)})
                  </span>
                </div>
                <div className="mt-2">
                  <span className="text-sm sm:text-md font-semibold text-foreground tabular-nums">
                    {formatNumber(Math.round(result.atr.value))}원
                  </span>
                </div>
              </div>

              {/* 반등 기준 */}
              <div className="p-4">
                <div className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1">
                  반등 기준
                  <TooltipProvider>
                    <Tooltip delayDuration={200}>
                      <TooltipTrigger asChild>
                        <Info className="w-3 h-3 text-muted-foreground/70 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>ATR × 1.2</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="mt-2">
                  <span className="text-sm sm:text-md font-semibold text-foreground tabular-nums">
                    +{formatNumber(Math.round(result.atr.bounceAmount))}원
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {result.supports.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-end justify-between">
              <div>
                <h3 className="text-sm font-semibold text-foreground">지지선 밴드</h3>
                <p className="mt-2 text-xs text-muted-foreground">
                  구간별 지지 가격을 분리해서 표시합니다.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {result.supports.map((support, index) => {
                const colorSet =
                  SUPPORT_COLORS[index] ||
                  SUPPORT_COLORS[SUPPORT_COLORS.length - 1];

                const targetPrice = support.price + result.atr.bounceAmount;
                const targetGainPct = (result.atr.bounceAmount / support.price) * 100;

                return (
                  <div
                    key={`${support.level}-${support.price}`}
                    className="rounded-2xl border border-border bg-background-1 p-4"
                  >
                    <div className="flex items-start gap-4">
                      <span
                        className={cn("h-14 w-1 rounded-full shrink-0", colorSet.dot)}
                      />
                      <div className="flex-1">
                        {/* 지지선 가격 + 목표가 (좌우 분리) */}
                        <div className="flex justify-between items-start">
                          {/* 왼쪽: 지지선 가격 */}
                          <div>
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-muted-foreground">
                                {support.level}차 지지선
                              </span>
                              <TooltipProvider>
                                <Tooltip delayDuration={200}>
                                  <TooltipTrigger asChild>
                                    <Info className="w-3 h-3 text-muted-foreground/70 cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    기준가 대비 -{support.dropPct.toFixed(2)}%
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                            <div className="py-1.5 flex items-center gap-2">
                              <span className="text-base sm:text-lg font-semibold text-foreground tabular-nums">
                                {formatNumber(support.price)}원
                              </span>
                              <span
                                className={cn(
                                  "rounded-full px-2 py-0.5 text-xs font-medium",
                                  colorSet.bg,
                                  colorSet.text
                                )}
                              >
                                -{support.dropPct.toFixed(2)}%
                              </span>
                            </div>
                          </div>

                          {/* 오른쪽: 반등 목표가 */}
                          <div>
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-muted-foreground">반등 목표가</span>
                            </div>
                            <div className="py-1.5 flex items-center gap-2">
                              <span className="text-base sm:text-lg font-semibold text-chart-up tabular-nums">
                                {formatNumber(Math.round(targetPrice))}원
                              </span>
                              <span className="px-2 py-0.5 rounded-full text-xs text-chart-up bg-chart-up/10 tabular-nums">
                                +{targetGainPct.toFixed(2)}%
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* 지지 밴드 */}
                        <div>

                          <div className="mt-1 flex items-center justify-between text-xs tabular-nums">
                            <span className={cn("px-2 py-0.5 rounded-full", colorSet.bg, colorSet.text)}>
                              {formatNumber(support.lowerPrice)}원
                            </span>
                            <span className={cn("px-2 py-0.5 rounded-full", colorSet.bg, colorSet.text)}>
                              {formatNumber(support.upperPrice)}원
                            </span>
                          </div>
                        </div>

                        {/* 프로그레스 바 */}
                        <div className="mt-3 h-2 rounded-full bg-border/50">
                          <div
                            className={cn(
                              "h-full rounded-full opacity-70",
                              colorSet.dot
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
