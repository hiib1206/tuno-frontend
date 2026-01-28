"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";

interface AnalysisTradingPanelProps {
  className?: string;
}

type TabType = "balance" | "history" | "orders" | "memo";

interface Tab {
  id: TabType;
  label: string;
}

const TABS: Tab[] = [
  { id: "balance", label: "잔고" },
  { id: "history", label: "매매이력" },
  { id: "orders", label: "미체결" },
  { id: "memo", label: "메모" },
];

export function AnalysisTradingPanel({ className }: AnalysisTradingPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>("balance");

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* 탭 헤더 */}
      <div className="flex border-b border-border-2">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-4 py-2 text-xs font-medium transition-colors",
              activeTab === tab.id
                ? "text-foreground border-b-2 border-accent"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 탭 콘텐츠 */}
      <div className="flex-1 overflow-auto min-h-0 p-3">
        {activeTab === "balance" && (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p className="text-xs">보유 종목이 없습니다</p>
          </div>
        )}

        {activeTab === "history" && (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p className="text-xs">매매 이력이 없습니다</p>
          </div>
        )}

        {activeTab === "orders" && (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p className="text-xs">미체결 주문이 없습니다</p>
          </div>
        )}

        {activeTab === "memo" && (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p className="text-xs">메모가 없습니다</p>
          </div>
        )}
      </div>
    </div>
  );
}
