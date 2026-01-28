"use client";

import inferenceApi from "@/api/inferenceApi";
import { toast } from "@/components/ToastProvider";
import { cn } from "@/lib/utils";
import { InferenceHistoryItem, SnapbackResult } from "@/types/Inference";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import {
  ChevronDown,
  Clock,
  History,
  Loader2,
  Sparkles,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

interface AnalysisSnapbackPanelProps {
  ticker: string;
  stockName?: string;
  onResult?: (result: SnapbackResult) => void;
  className?: string;
}

export function AnalysisSnapbackPanel({
  ticker,
  stockName,
  onResult,
  className,
}: AnalysisSnapbackPanelProps) {
  const [isInferring, setIsInferring] = useState(false);
  const [history, setHistory] = useState<InferenceHistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasNext, setHasNext] = useState(false);

  // 이력 조회
  const fetchHistory = useCallback(async (cursor?: string) => {
    setIsLoadingHistory(true);
    try {
      const response = await inferenceApi.getHistory({
        model_type: "SNAPBACK",
        limit: 10,
        cursor,
      });
      if (response.success && response.data) {
        console.log(response.data);
        if (cursor) {
          setHistory((prev) => [...prev, ...response.data!.items]);
        } else {
          setHistory(response.data.items);
        }
        setNextCursor(response.data.nextCursor);
        setHasNext(response.data.hasNext);
      }
    } catch {
      toast({
        variant: "destructive",
        title: "이력 조회 실패",
      });
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  // 초기 이력 로드
  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // AI 추론 실행
  const handleInference = async () => {
    if (!ticker || isInferring) return;

    setIsInferring(true);
    try {
      const response = await inferenceApi.snapback({ ticker });
      if (response.success && response.data) {
        onResult?.(response.data);
        toast({
          title: "AI 분석 완료",
          description: `${stockName || ticker} 분석이 완료되었습니다.`,
        });
        // 이력 새로고침
        fetchHistory();
      } else {
        toast({
          variant: "destructive",
          title: "AI 분석 실패",
          description: response.message,
        });
      }
    } catch {
      toast({
        variant: "destructive",
        title: "AI 분석 실패",
        description: "분석 중 오류가 발생했습니다.",
      });
    } finally {
      setIsInferring(false);
    }
  };

  // 더보기
  const handleLoadMore = () => {
    if (nextCursor && !isLoadingHistory) {
      fetchHistory(nextCursor);
    }
  };

  // 이력 아이템 클릭 (결과 보기)
  const handleHistoryClick = (item: InferenceHistoryItem) => {
    if (item.status === "COMPLETED" && item.responseData) {
      onResult?.(item.responseData as unknown as SnapbackResult);
    }
  };

  // 상태 배지
  const getStatusBadge = (status: InferenceHistoryItem["status"]) => {
    switch (status) {
      case "COMPLETED":
        return (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-chart-up/20 text-chart-up">
            완료
          </span>
        );
      case "FAILED":
        return (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-chart-down/20 text-chart-down">
            실패
          </span>
        );
      case "PROCESSING":
        return (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-500">
            처리중
          </span>
        );
      default:
        return (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
            대기
          </span>
        );
    }
  };

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* 추론 버튼 */}
      <div className="p-3">
        <button
          onClick={handleInference}
          disabled={!ticker || isInferring}
          className={cn(
            "w-full flex items-center justify-center gap-2 py-1.5 rounded text-sm font-medium transition-colors",
            isInferring
              ? "bg-accent/50 text-accent-foreground cursor-not-allowed"
              : "bg-accent hover:bg-accent/90 text-accent-foreground"
          )}
        >
          {isInferring ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              분석 중...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              {stockName} 분석하기
            </>
          )}
        </button>
      </div>

      {/* 이력 헤더 */}
      <div className="px-3 pb-1 border-b border-border-2 flex items-center gap-1.5">
        <History className="w-3 h-3 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">분석 이력</span>
      </div>

      {/* 이력 목록 */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {history.length === 0 && !isLoadingHistory ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <Clock className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-xs">분석 이력이 없습니다</p>
          </div>
        ) : (
          <div className="divide-y divide-border-2">
            {history.map((item) => (
              <button
                key={item.id}
                onClick={() => handleHistoryClick(item)}
                disabled={item.status !== "COMPLETED"}
                className={cn(
                  "w-full px-3 py-2.5 text-left transition-colors",
                  item.status === "COMPLETED"
                    ? "hover:bg-background-2 cursor-pointer"
                    : "cursor-default opacity-60"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-foreground">
                    {(item.requestParams?.ticker as string) || "-"}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground">
                      {formatDistanceToNow(item.requestedAt, {
                        addSuffix: true,
                        locale: ko,
                      })}
                    </span>
                    {getStatusBadge(item.status)}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* 더보기 버튼 */}
        {hasNext && (
          <button
            onClick={handleLoadMore}
            disabled={isLoadingHistory}
            className="w-full py-2 flex items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {isLoadingHistory ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <>
                <ChevronDown className="w-3 h-3" />
                더보기
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
