"use client";

import { getCssVar } from "@/lib/chartUtils";
import { cn } from "@/lib/utils";
import { Candle } from "@/types/Stock";
import { useTheme } from "next-themes";
import { useEffect, useMemo, useRef, useState } from "react";

const DISPLAY_BARS = 250; // 1Y

interface BenchmarkChartProps {
  stockCandles: Candle[];
  indexCandles: Candle[];
  stockName?: string;
  indexName?: string;
  className?: string;
}

/** 첫 데이터 기준 누적 수익률(%) 계산 */
function calcReturns(candles: Candle[]): { time: number; value: number }[] {
  if (candles.length === 0) return [];
  const base = candles[0].close;
  return candles.map((c) => ({
    time: c.time,
    value: ((c.close - base) / base) * 100,
  }));
}

export function BenchmarkChart({
  stockCandles,
  indexCandles,
  stockName = "Stock",
  indexName = "KOSPI",
  className,
}: BenchmarkChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const { resolvedTheme } = useTheme();

  // 컨테이너 크기 관찰
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setDimensions({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // 매칭된 수익률 계산
  const { stockReturns, indexReturns, yMin, yMax, yTicks, xLabels } =
    useMemo(() => {
      const empty = {
        stockReturns: [] as { time: number; value: number }[],
        indexReturns: [] as { time: number; value: number }[],
        yMin: 0,
        yMax: 0,
        yTicks: [] as number[],
        xLabels: [] as { label: string; index: number }[],
      };

      if (stockCandles.length === 0 || indexCandles.length === 0) return empty;

      // 지수 time → candle 매핑
      const indexMap = new Map(indexCandles.map((c) => [c.time, c]));

      // 매칭되는 날짜만 추출
      const matchedStock: Candle[] = [];
      const matchedIndex: Candle[] = [];
      for (const sc of stockCandles) {
        const ic = indexMap.get(sc.time);
        if (ic) {
          matchedStock.push(sc);
          matchedIndex.push(ic);
        }
      }

      if (matchedStock.length === 0) return empty;

      // 최근 250봉(1Y)만 사용
      const sliceStart = Math.max(0, matchedStock.length - DISPLAY_BARS);
      const slicedStock = matchedStock.slice(sliceStart);
      const slicedIndex = matchedIndex.slice(sliceStart);

      const sr = calcReturns(slicedStock);
      const ir = calcReturns(slicedIndex);

      // Y축 범위
      const allVals = [...sr.map((d) => d.value), ...ir.map((d) => d.value)];
      const rawMin = Math.min(...allVals);
      const rawMax = Math.max(...allVals);
      const pad = Math.max((rawMax - rawMin) * 0.15, 5);
      const yMin = Math.floor((rawMin - pad) / 10) * 10;
      const yMax = Math.ceil((rawMax + pad) / 10) * 10;

      // Y축 눈금
      const step = Math.max(10, Math.ceil((yMax - yMin) / 5 / 10) * 10);
      const ticks: number[] = [];
      for (let v = yMin; v <= yMax; v += step) {
        ticks.push(v);
      }

      // X축 월 라벨
      const months = [
        "1월", "2월", "3월", "4월", "5월", "6월",
        "7월", "8월", "9월", "10월", "11월", "12월",
      ];
      const seen = new Set<string>();
      const labels: { label: string; index: number }[] = [];
      sr.forEach((d, i) => {
        const date = new Date(d.time * 1000);
        const key = `${date.getFullYear()}-${date.getMonth()}`;
        if (!seen.has(key)) {
          seen.add(key);
          labels.push({ label: months[date.getMonth()], index: i });
        }
      });

      return {
        stockReturns: sr,
        indexReturns: ir,
        yMin,
        yMax,
        yTicks: ticks,
        xLabels: labels,
      };
    }, [stockCandles, indexCandles]);

  // 차트 그리기 유틸
  const { width, height } = dimensions;
  const pad = { top: 20, right: 48, bottom: 28, left: 16 };
  const chartW = width - pad.left - pad.right;
  const chartH = height - pad.top - pad.bottom;

  const toX = (i: number) => {
    if (stockReturns.length <= 1) return pad.left;
    return pad.left + (i / (stockReturns.length - 1)) * chartW;
  };

  const toY = (v: number) => {
    if (yMax === yMin) return pad.top + chartH / 2;
    return pad.top + ((yMax - v) / (yMax - yMin)) * chartH;
  };

  const toPath = (data: { time: number; value: number }[]) => {
    if (data.length === 0) return "";
    return data
      .map((d, i) => `${i === 0 ? "M" : "L"} ${toX(i).toFixed(1)} ${toY(d.value).toFixed(1)}`)
      .join(" ");
  };

  // X축 라벨 겹침 방지 (간단한 폭 추정으로 필터링)
  const visibleXLabels = (() => {
    const approxCharWidth = 7; // 11px 폰트 기준 대략값
    const padding = 6;
    const result: { label: string; index: number; x: number; left: number; right: number }[] = [];
    for (const item of xLabels) {
      const x = toX(item.index);
      const labelWidth = item.label.length * approxCharWidth;
      const left = x - labelWidth / 2;
      const right = x + labelWidth / 2;
      const last = result[result.length - 1];
      if (!last) {
        result.push({ ...item, x, left, right });
        continue;
      }
      if (left <= last.right + padding) {
        // 겹치면 이전 라벨을 제거하고 현재 라벨로 교체
        result.pop();
        result.push({ ...item, x, left, right });
      } else {
        result.push({ ...item, x, left, right });
      }
    }
    return result;
  })();

  // 테마 기반 색상
  const strokeColor = useMemo(() => {
    return getCssVar("--chart-text") || (resolvedTheme === "dark" ? "#e5e5e5" : "#1a1a2e");
  }, [resolvedTheme]);

  return (
    <div className={cn("bg-background-1 rounded-md p-4 flex flex-col", className)}>
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-6">
          <h3 className="text-base text-muted-foreground uppercase tracking-wider">
            vs {indexName}
          </h3>
          {/* 범례 */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-0.5 rounded-full" style={{ backgroundColor: strokeColor, opacity: 0.85 }} />
              <span className="text-xs text-muted-foreground">{stockName}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-0.5 rounded-full" style={{ backgroundColor: strokeColor, opacity: 0.25 }} />
              <span className="text-xs text-muted-foreground">{indexName}</span>
            </div>
          </div>
        </div>

      </div>

      {/* SVG 차트 */}
      <div ref={containerRef} className="flex-1 min-h-[200px]">
        {width > 0 && height > 0 && stockReturns.length > 0 && (
          <svg width={width} height={height}>
            {/* Y축 그리드 + 라벨 */}
            {yTicks.map((tick) => (
              <g key={tick}>
                <line
                  x1={pad.left}
                  y1={toY(tick)}
                  x2={width - pad.right}
                  y2={toY(tick)}
                  stroke={strokeColor}
                  strokeOpacity={0.15}
                />
                <text
                  x={width - pad.right + 8}
                  y={toY(tick)}
                  textAnchor="start"
                  dominantBaseline="middle"
                  fill={strokeColor}
                  fillOpacity={1}
                  fontSize={11}
                >
                  {tick}%
                </text>
              </g>
            ))}

            {/* 0% 기준선 강조 */}
            {yMin <= 0 && yMax >= 0 && (
              <line
                x1={pad.left}
                y1={toY(0)}
                x2={width - pad.right}
                y2={toY(0)}
                stroke={strokeColor}
                strokeOpacity={0.25}
                strokeDasharray="4 3"
              />
            )}

            {/* X축 라벨 */}
            {visibleXLabels.map((label) => (
              <text
                key={`${label.label}-${label.index}`}
                x={label.x}
                y={height - 6}
                textAnchor="middle"
                fill={strokeColor}
                fillOpacity={1}
                fontSize={11}
              >
                {label.label}
              </text>
            ))}

            {/* 지수 라인 (뒤쪽, 얇고 연한) */}
            <path
              d={toPath(indexReturns)}
              fill="none"
              stroke={strokeColor}
              strokeOpacity={0.2}
              strokeWidth={2}
              strokeLinejoin="round"
            />

            {/* 종목 라인 (앞쪽, 두껍고 진한) */}
            <path
              d={toPath(stockReturns)}
              fill="none"
              stroke={strokeColor}
              strokeOpacity={0.85}
              strokeWidth={2.5}
              strokeLinejoin="round"
            />
          </svg>
        )}

        {/* 데이터 없을 때 */}
        {stockReturns.length === 0 && (
          <div className="h-full flex items-center justify-center">
            <p className="text-sm text-muted-foreground/50">
              비교 데이터가 없습니다
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
