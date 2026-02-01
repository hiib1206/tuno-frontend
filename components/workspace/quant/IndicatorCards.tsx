"use client";

import { cn } from "@/lib/utils";
import {
  QuantSignalIndicators,
  QuantSignalReason,
} from "@/types/Inference";
import { useCallback, useEffect, useRef, useState } from "react";
import { IndicatorVisual } from "./indicator/IndicatorVisual";
// 세로로 긴 chevron SVG
function TallChevron({ direction, height = 60 }: { direction: "left" | "right"; height?: number }) {
  return (
    <svg
      viewBox="0 0 10 40"
      width={height * 0.25}
      height={height}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline
        points={direction === "right" ? "2,2 8,20 2,38" : "8,2 2,20 8,38"}
      />
    </svg>
  );
}

interface IndicatorCardsProps {
  reasons: QuantSignalReason[];
  color: string;
  className?: string;
}

// reason에서 indicator 이름과 값 추출
function extractIndicator(
  reason: QuantSignalReason
): { name: keyof QuantSignalIndicators; value: number } | null {
  if (!reason.indicator) return null;
  const entries = Object.entries(reason.indicator);
  if (entries.length === 0) return null;
  const [name, value] = entries[0];
  return { name: name as keyof QuantSignalIndicators, value: value as number };
}

export function IndicatorCards({
  reasons,
  color,
  className,
}: IndicatorCardsProps) {
  // indicator가 있는 reason만 필터링
  const cards = reasons
    .map((reason, idx) => {
      const indicator = extractIndicator(reason);
      if (!indicator) return null;
      return { reason, indicator, originalIndex: idx };
    })
    .filter(Boolean) as {
      reason: QuantSignalReason;
      indicator: { name: keyof QuantSignalIndicators; value: number };
      originalIndex: number;
    }[];

  // stagger 애니메이션
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    if (visibleCount < cards.length) {
      const timer = setTimeout(
        () => setVisibleCount((prev) => prev + 1),
        100
      );
      return () => clearTimeout(timer);
    }
  }, [visibleCount, cards.length]);

  useEffect(() => {
    setVisibleCount(0);
    const timer = setTimeout(() => setVisibleCount(1), 200);
    return () => clearTimeout(timer);
  }, [reasons]);

  // 스크롤 네비게이션
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener("scroll", updateScrollState);
    const ro = new ResizeObserver(updateScrollState);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      ro.disconnect();
    };
  }, [updateScrollState]);

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = 280 + 16; // min-w + gap
    el.scrollBy({
      left: direction === "left" ? -cardWidth : cardWidth,
      behavior: "smooth",
    });
  };

  if (cards.length === 0) return null;

  return (
    <div className={cn("flex flex-col relative", className)}>
      {/* 카드 리스트 */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto flex-1 no-scrollbar"
      >
        {cards.map(({ reason, indicator, originalIndex }, idx) => {
          const isVisible = idx < visibleCount;
          const direction = reason.direction ?? "up";

          return (
            <div
              key={`${indicator.name}-${originalIndex}`}
              className={cn(
                "group relative bg-background-1 rounded-md overflow-hidden min-h-[180px] min-w-[280px] flex-1",
                "transition-all duration-500 ease-out",
                isVisible
                  ? "opacity-100 translate-y-0 scale-100"
                  : "opacity-0 translate-y-4 scale-95"
              )}
            >
              {isVisible && (
                <IndicatorVisual
                  indicatorName={indicator.name}
                  value={indicator.value}
                  direction={direction}
                  color={color}
                  className="w-full h-full"
                />
              )}
            </div>
          );
        })}
      </div>

      {/* 좌측 페이드 + 화살표 */}
      {canScrollLeft && (
        <div className="absolute left-0 top-0 bottom-0 w-20 z-10 flex items-center justify-start bg-gradient-to-r from-background-2 via-background-2/80 to-transparent backdrop-blur-[1.5px] pointer-events-none">
          <button
            onClick={() => scroll("left")}
            className="pointer-events-auto h-2/3 w-6 flex items-center justify-center text-muted-foreground/50 hover:text-muted-foreground transition-colors"
          >
            <TallChevron direction="left" />
          </button>
        </div>
      )}

      {/* 우측 페이드 + 화살표 */}
      {canScrollRight && (
        <div className="absolute right-0 top-0 bottom-0 w-20 z-10 flex items-center justify-end bg-gradient-to-l from-background-2 via-background-2/80 to-transparent backdrop-blur-[1.5px] pointer-events-none">
          <button
            onClick={() => scroll("right")}
            className="pointer-events-auto h-2/3 w-6 flex items-center justify-center text-muted-foreground/50 hover:text-muted-foreground transition-colors"
          >
            <TallChevron direction="right" />
          </button>
        </div>
      )}
    </div>
  );
}
