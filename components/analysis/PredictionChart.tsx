"use client";

import { Card } from "@/components/ui/card";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface ChartDataPoint {
  date: string;
  price: number | null;
  prediction: number | null;
}

interface PredictionChartProps {
  data?: ChartDataPoint[];
  height?: number;
}

const defaultData: ChartDataPoint[] = [
  { date: "2023-01", price: 150, prediction: null },
  { date: "2023-02", price: 158, prediction: null },
  { date: "2023-03", price: 152, prediction: null },
  { date: "2023-04", price: 165, prediction: null },
  { date: "2023-05", price: 172, prediction: null },
  { date: "2023-06", price: 180, prediction: null },
  { date: "2023-07", price: 185, prediction: 185 },
  { date: "2023-08", price: null, prediction: 192 },
  { date: "2023-09", price: null, prediction: 188 },
  { date: "2023-10", price: null, prediction: 195 },
  { date: "2023-11", price: null, prediction: 205 },
  { date: "2023-12", price: null, prediction: 210 },
];

export function PredictionChart({
  data = defaultData,
  height = 500,
}: PredictionChartProps) {
  return (
    <Card
      className="p-6 rounded-3xl flex flex-col"
      style={{ height: `${height}px` }}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">가격 예측</h3>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-muted-foreground">과거</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-accent" />
            <span className="text-muted-foreground">예측</span>
          </div>
        </div>
      </div>
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--primary)"
                  stopOpacity={0.1}
                />
                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorPred" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.2} />
                <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="var(--border)"
              opacity={0.5}
            />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
              dx={-10}
              domain={["auto", "auto"]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--popover)",
                borderColor: "var(--border)",
                borderRadius: "12px",
                boxShadow: "0 10px 30px -10px rgba(0,0,0,0.2)",
              }}
              itemStyle={{ color: "var(--foreground)" }}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke="var(--primary)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorPrice)"
            />
            <Area
              type="monotone"
              dataKey="prediction"
              stroke="var(--accent)"
              strokeWidth={2}
              strokeDasharray="5 5"
              fillOpacity={1}
              fill="url(#colorPred)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
