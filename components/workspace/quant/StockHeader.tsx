"use client";

import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface StockHeaderProps {
  summary?: string | null;
  className?: string;
}

export function StockHeader({ summary, className }: StockHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col justify-between bg-background-1 rounded-md p-5 h-[220px]",
        className
      )}
    >
      <h3 className="text-base text-muted-foreground uppercase tracking-wider mb-3">
        기업 개요
      </h3>
      {summary ? (
        <TooltipProvider>
          <Tooltip delayDuration={200}>
            <TooltipTrigger asChild>
              <div className="text-sm text-muted-foreground leading-relaxed cursor-help">
                <p className="line-clamp-6">{summary}</p>
              </div>
            </TooltipTrigger>
            <TooltipContent
              side="bottom"
              className="max-w-md p-3 text-sm leading-relaxed"
            >
              {summary}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        <p className="text-sm text-muted-foreground/50">
          기업 개요 정보가 없습니다
        </p>
      )}
    </div>
  );
}
