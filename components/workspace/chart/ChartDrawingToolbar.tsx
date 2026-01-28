"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { LucideIcon, Minus, MousePointer2, Slash, Trash2 } from "lucide-react";

export type DrawingTool = "cursor" | "hline" | "trendline";

type Tool = {
  id: DrawingTool;
  icon: LucideIcon;
  label: string;
};

const tools: Tool[] = [
  { id: "cursor", icon: MousePointer2, label: "선택" },
  { id: "hline", icon: Minus, label: "수평선" },
  { id: "trendline", icon: Slash, label: "추세선" },
];

interface ChartDrawingToolbarProps {
  activeTool: DrawingTool;
  onToolSelect: (tool: DrawingTool) => void;
  onClear?: () => void;
  className?: string;
}

export function ChartDrawingToolbar({
  activeTool,
  onToolSelect,
  onClear,
  className,
}: ChartDrawingToolbarProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-1 px-1 py-2 border-r border-border-2",
        className
      )}
    >
      <TooltipProvider delayDuration={300}>
        {tools.map((tool) => {
          const Icon = tool.icon;
          const isActive = activeTool === tool.id;

          return (
            <Tooltip key={tool.id}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onToolSelect(tool.id)}
                  className={cn(
                    "p-1.5 rounded transition-colors",
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-4 h-4",
                      tool.id === "hline" && "scale-x-175"
                    )}
                  />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={8}>
                {tool.label}
              </TooltipContent>
            </Tooltip>
          );
        })}

        {/* 구분선 */}
        <div className="w-full h-px bg-border-2 my-1" />

        {/* 초기화 버튼 */}
        {onClear && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onClear}
                className="p-1.5 rounded transition-colors text-muted-foreground hover:text-destructive hover:bg-muted"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={8}>
              초기화
            </TooltipContent>
          </Tooltip>
        )}
      </TooltipProvider>
    </div>
  );
}
