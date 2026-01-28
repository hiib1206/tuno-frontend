"use client";

import inferenceApi from "@/api/inferenceApi";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";
import {
  InferenceHistoryItem,
  InferenceStatus,
  parseSnapbackResult,
  SnapbackResult,
} from "@/types/Inference";
import { ExchangeCode } from "@/types/Stock";
import { useAuthStore } from "@/stores/authStore";
import { formatDistanceToNowStrict } from "date-fns";
import { ko } from "date-fns/locale";
import {
  ChevronDown,
  Clock,
  History,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from "react";

interface AnalysisInferenceHistoryProps {
  onSelect?: (result: SnapbackResult) => void;
  onSelectHistory?: (ticker: string, exchange: ExchangeCode, historyId: string) => void;
  className?: string;
}

export interface AnalysisInferenceHistoryRef {
  refresh: () => void;
}

export const AnalysisInferenceHistory = forwardRef<
  AnalysisInferenceHistoryRef,
  AnalysisInferenceHistoryProps
>(({ onSelect, onSelectHistory, className }, ref) => {
  const { isAuthLoading } = useAuthStore();
  const [history, setHistory] = useState<InferenceHistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasNext, setHasNext] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 이력 조회
  const fetchHistory = useCallback(async (cursor?: string) => {
    setIsLoadingHistory(true);
    setError(null);
    try {
      const response = await inferenceApi.getHistory({
        model_type: "SNAPBACK",
        limit: 10,
        cursor,
        days: 30,
      });
      if (response.success && response.data) {
        if (cursor) {
          setHistory((prev) => [...prev, ...response.data!.items]);
        } else {
          setHistory(response.data.items);
        }
        setNextCursor(response.data.nextCursor);
        setHasNext(response.data.hasNext);
      }
    } catch {
      setError("이력 조회 실패");
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  // ref를 통해 외부에서 refresh 호출 가능하도록
  useImperativeHandle(ref, () => ({
    refresh: () => fetchHistory(),
  }));

  // 초기 이력 로드
  useEffect(() => {
    // 인증 로딩 중이면 기다림
    if (isAuthLoading) return;
    fetchHistory();
  }, [fetchHistory, isAuthLoading]);

  // 더보기
  const handleLoadMore = () => {
    if (nextCursor && !isLoadingHistory) {
      fetchHistory(nextCursor);
    }
  };

  // 이력 아이템 클릭 (결과 보기)
  const handleHistoryClick = (item: InferenceHistoryItem) => {
    if (item.status === ("COMPLETED" as InferenceStatus) && item.responseData) {
      // onSelectHistory가 있으면 URL 기반 네비게이션, 없으면 기존 방식
      if (onSelectHistory && item.ticker && item.exchange) {
        onSelectHistory(item.ticker, item.exchange, item.id);
      } else {
        onSelect?.(parseSnapbackResult(item.responseData));
      }
    }
  };

  // 상태 배지
  const getStatusBadge = (status: InferenceHistoryItem["status"]) => {
    switch (status) {
      case "COMPLETED" as InferenceStatus:
        return (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent/10 text-accent">
            완료
          </span>
        );
      case "FAILED" as InferenceStatus:
        return (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-destructive/20 text-destructive">
            실패
          </span>
        );
      case "PROCESSING" as InferenceStatus:
        return (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-500">
            처리중
          </span>
        );
      case "CANCELED" as InferenceStatus:
        return (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
            취소됨
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

  if (isLoadingHistory && history.length === 0) {
    return (
      <div className={cn("flex flex-col h-full", className)}>
        <Skeleton variant="shimmer-contrast" className="flex-1 rounded-b-sm md:rounded-sm" />
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* 이력 헤더 */}
      <div className="px-3 py-2 border-b border-border-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <History className="w-3 h-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">분석 이력</span>
        </div>
        <button
          onClick={() => fetchHistory()}
          disabled={isLoadingHistory}
          className="p-1 rounded hover:bg-background-2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
        >
          <RefreshCw className={cn("w-3 h-3", isLoadingHistory && "animate-spin")} />
        </button>
      </div>

      {/* 이력 목록 */}
      <div className="flex-1 overflow-y-auto min-h-0 scrollbar-thin">
        {error ? (
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-xs text-destructive">{error}</p>
          </div>
        ) : history.length === 0 && !isLoadingHistory ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <Clock className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-xs">분석 이력이 없습니다</p>
          </div>
        ) : (
          <div>
            {history.map((item) => (
              <button
                key={item.id}
                onClick={() => handleHistoryClick(item)}
                disabled={item.status !== "COMPLETED" as InferenceStatus}
                className={cn(
                  "w-full px-3 py-1.5 text-left transition-colors",
                  item.status === "COMPLETED" as InferenceStatus
                    ? "hover:bg-accent/10 cursor-pointer"
                    : "cursor-default opacity-60"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-xs font-medium text-foreground truncate">
                      {item.nameKo || item.ticker || "-"}
                    </span>
                    {item.nameKo && item.ticker && (
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {item.ticker}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <span className="text-[10px] text-muted-foreground">
                      {formatDistanceToNowStrict(item.requestedAt, {
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
});

AnalysisInferenceHistory.displayName = "AnalysisInferenceHistory";
