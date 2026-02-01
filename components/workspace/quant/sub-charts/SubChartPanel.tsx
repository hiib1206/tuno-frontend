"use client";

import { cn } from "@/lib/utils";
import { Candle } from "@/types/Stock";
import { motion } from "framer-motion";
import { useState } from "react";
import { SignalColors } from "../SignalInfoCard";
import { BollingerChart } from "./BollingerChart";
import { MacdChart } from "./MacdChart";
import { RsiChart } from "./RsiChart";

const TABS = [
  { key: "RSI", label: "RSI" },
  { key: "MACD", label: "MACD" },
  { key: "BB", label: "Bollinger" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

interface SubChartPanelProps {
  candles: Candle[];
  colors: SignalColors;
  className?: string;
}

export function SubChartPanel({ candles, colors, className }: SubChartPanelProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("RSI");

  return (
    <div
      className={cn(
        "w-full bg-background-1 rounded-md p-4 flex flex-col",
        className
      )}
    >
      {/* 헤더: 제목 + 탭 */}
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-base text-muted-foreground uppercase tracking-wide leading-none">
          미니 지표 차트
        </h3>
        <div className="inline-flex items-center bg-background-2 rounded-full p-1">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "relative px-4 py-1 rounded-full text-sm font-medium transition-colors z-10",
                activeTab === tab.key
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {activeTab === tab.key && (
                <motion.div
                  layoutId="subchart-tab-bg"
                  className="absolute inset-0 bg-background-1 rounded-full shadow-sm"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 활성 차트 */}
      <div className="flex-1 min-h-0 p-4 overflow-hidden">
        {activeTab === "RSI" && <RsiChart candles={candles} colors={colors} />}
        {activeTab === "MACD" && <MacdChart candles={candles} colors={colors} />}
        {activeTab === "BB" && <BollingerChart candles={candles} />}
      </div>
    </div>
  );
}
