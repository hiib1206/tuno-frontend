"use client";

import { cn } from "@/lib/utils";
import { useMemo } from "react";
import {
  Area,
  AreaChart,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export interface LineChartDataPoint {
  date: string;
  value: number;
}

interface SimpleLineChartProps {
  data: LineChartDataPoint[];
  color?: string;
  height?: number;
  showMinMax?: boolean;
  showGrid?: boolean;
  showAxis?: boolean;
  showTooltip?: boolean;
  strokeOpacity?: number;
  areaOpacityTop?: number;
  areaOpacityBottom?: number;
  tooltipBgColor?: string;
  xAxisTickCount?: number;
  className?: string;
  dateFormatter?: (date: string) => string;
  valueFormatter?: (value: number) => string;
}

export function SimpleLineChart({
  data,
  color = "#8b5cf6",
  height,
  showMinMax = false,
  showGrid = false,
  showAxis = true,
  showTooltip = true,
  strokeOpacity = 0.8,
  areaOpacityTop = 0.7,
  areaOpacityBottom = 0.05,
  tooltipBgColor,
  xAxisTickCount = 5,
  className,
  dateFormatter = (date) => date,
  valueFormatter = (value) => value.toLocaleString(),
}: SimpleLineChartProps) {
  // 최저/최고 포인트 계산
  const { minPoint, maxPoint, yDomain } = useMemo(() => {
    if (data.length === 0) {
      return { minPoint: null, maxPoint: null, yDomain: [0, 100] as [number, number] };
    }

    let min = { date: data[0].date, value: data[0].value, index: 0 };
    let max = { date: data[0].date, value: data[0].value, index: 0 };

    data.forEach((point, index) => {
      if (point.value < min.value) {
        min = { ...point, index };
      }
      if (point.value > max.value) {
        max = { ...point, index };
      }
    });

    // Y축 범위 계산 (여유 5%)
    const range = max.value - min.value;
    const padding = range * 0.05 || min.value * 0.05;
    const yDomain: [number, number] = [
      Math.floor(min.value - padding),
      Math.ceil(max.value + padding),
    ];

    return { minPoint: min, maxPoint: max, yDomain };
  }, [data]);

  // X축에 표시할 날짜들 계산 (시작, 끝 포함 + 균등 분배)
  const xAxisTicks = useMemo(() => {
    if (data.length <= xAxisTickCount) {
      return data.map((d) => d.date);
    }
    const ticks: string[] = [];
    const step = (data.length - 1) / (xAxisTickCount - 1);
    for (let i = 0; i < xAxisTickCount; i++) {
      const index = Math.round(i * step);
      ticks.push(data[index].date);
    }
    return ticks;
  }, [data, xAxisTickCount]);

  if (data.length === 0) {
    return (
      <div
        className={cn("flex items-center justify-center text-muted-foreground text-sm", !height && "h-full", className)}
        style={height ? { height } : undefined}
      >
        데이터가 없습니다
      </div>
    );
  }

  return (
    <div className={cn("w-full", !height && "h-full", className)} style={height ? { height } : undefined}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={showAxis ? { top: 20, right: 10, bottom: 5, left: 20 } : { top: 10, right: 0, bottom: 0, left: 0 }}>
          {showGrid && (
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e5e7eb" strokeWidth="0.5" />
              </pattern>
            </defs>
          )}

          {/* 그라데이션 정의 */}
          <defs>
            <linearGradient id={`gradient-${color.replace("#", "")}-${areaOpacityTop}-${areaOpacityBottom}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={areaOpacityTop} />
              <stop offset="100%" stopColor={color} stopOpacity={areaOpacityBottom} />
            </linearGradient>
          </defs>

          {showAxis && (
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#9ca3af", dy: 8 }}
              tickFormatter={dateFormatter}
              ticks={xAxisTicks}
              interval={0}
            />
          )}

          <YAxis
            domain={yDomain}
            hide={!showAxis}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: "#9ca3af", dx: 8 }}
            tickFormatter={valueFormatter}
            width={showAxis ? 50 : 0}
            orientation="right"
          />

          {showTooltip && (
            <Tooltip
              cursor={{ stroke: color, strokeOpacity: 0.3, strokeWidth: 2 }}
              content={({ active, payload }) => {
                if (!active || !payload?.[0]) return null;
                const point = payload[0].payload as LineChartDataPoint;
                return (
                  <div
                    className={cn(
                      "border border-border rounded-lg px-3 py-2 shadow-lg space-y-1",
                      tooltipBgColor ?? "bg-background"
                    )}
                  >
                    <p className="text-xs text-muted-foreground">{dateFormatter(point.date)}</p>
                    <p className="text-sm font-medium" style={{ color }}>
                      {valueFormatter(point.value)}
                    </p>
                  </div>
                );
              }}
            />
          )}

          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeOpacity={strokeOpacity}
            strokeWidth={2}
            fill={`url(#gradient-${color.replace("#", "")}-${areaOpacityTop}-${areaOpacityBottom})`}
            activeDot={{ r: 3, fill: color, stroke: color, strokeOpacity: 0.3, strokeWidth: 5 }}
          />

          {/* 최저점 마커 */}
          {showMinMax && minPoint && (
            <ReferenceDot
              x={minPoint.date}
              y={minPoint.value}
              r={4}
              fill={color}
              stroke={color}
              strokeOpacity={0.3}
              strokeWidth={6}
            />
          )}

          {/* 최고점 마커 */}
          {showMinMax && maxPoint && (
            <ReferenceDot
              x={maxPoint.date}
              y={maxPoint.value}
              r={4}
              fill={color}
              stroke={color}
              strokeOpacity={0.3}
              strokeWidth={6}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
