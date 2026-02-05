"use client";

import inferenceApi from "@/api/inferenceApi";
import { ErrorState } from "@/components/feedback";
import { LoginRequestModal } from "@/components/modals/LoginRequestModal";
import { Skeleton } from "@/components/ui/Skeleton";
import { useQuota } from "@/hooks/useQuota";
import { cn, formatTimeRemaining } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import { InferenceHistoryItem, InferenceModelType } from "@/types/Inference";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type PeriodType = 14 | 30;

export default function DashboardUsagePage() {
  const { user, isAuthLoading } = useAuthStore();
  const {
    data: quota,
    isLoading: isQuotaLoading,
    isError: isQuotaError,
    refetch: refetchQuota,
  } = useQuota();
  const [history, setHistory] = useState<InferenceHistoryItem[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [isHistoryError, setIsHistoryError] = useState(false);
  const [period, setPeriod] = useState<PeriodType>(30);
  const [historyTab, setHistoryTab] = useState<InferenceModelType>("QUANT_SIGNAL");
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // 이력 조회
  const fetchHistory = useCallback(async () => {
    if (!user) return;
    setIsHistoryLoading(true);
    setIsHistoryError(false);
    try {
      const response = await inferenceApi.getHistory({ days: 30, all: true });
      setHistory(response.data?.items || []);
    } catch {
      setIsHistoryError(true);
    } finally {
      setIsHistoryLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchHistory();
    }
  }, [user, fetchHistory]);

  // 일별 사용량 계산
  const dailyUsage = useMemo(() => {
    const usage: Record<string, number> = {};
    const now = new Date();

    // 선택된 기간의 모든 날짜를 0으로 초기화
    for (let i = period - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const key = date.toISOString().split("T")[0];
      usage[key] = 0;
    }

    // 이력에서 날짜별 카운트
    history.forEach((item) => {
      if (!item.requestedAt) return;
      const date = new Date(item.requestedAt);
      const key = date.toISOString().split("T")[0];
      if (usage[key] !== undefined) {
        usage[key]++;
      }
    });

    return Object.entries(usage).map(([date, count]) => ({
      date,
      count,
      label: formatDateLabel(date),
      fullLabel: formatFullDateLabel(date),
    }));
  }, [history, period]);

  // 총 사용량
  const totalUsage = dailyUsage.reduce((sum, d) => sum + d.count, 0);

  // 탭별 필터링된 이력
  const filteredHistory = useMemo(() => {
    return history.filter((item) => item.modelType === historyTab);
  }, [history, historyTab]);

  // 로그인 필요
  if (!isAuthLoading && !user) {
    return (
      <div className="flex flex-col items-center justify-center h-80 gap-4">
        <p className="text-muted-foreground">로그인이 필요합니다</p>
        <button
          onClick={() => setIsLoginModalOpen(true)}
          className="px-4 py-2 bg-accent text-accent-foreground rounded-md hover:bg-accent/90 transition-colors"
        >
          로그인
        </button>
        <LoginRequestModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
        />
      </div>
    );
  }

  // 에러 발생 시
  const isLoading = isQuotaLoading || isHistoryLoading;
  const isError = isQuotaError || isHistoryError;

  if (!isLoading && isError) {
    const handleRetry = () => {
      refetchQuota();
      fetchHistory();
    };

    return (
      <div className="flex items-center justify-center h-80">
        <ErrorState
          message="데이터를 불러오지 못했습니다"
        />
      </div>
    );
  }

  // 사용량 퍼센트
  const usagePercent = quota ? (quota.used / quota.limit) * 100 : 0;
  const isLow = quota && quota.remaining <= 3;
  const isExhausted = quota && quota.remaining === 0;

  return (
    <div className="space-y-6">
      {/* 페이지 제목 */}
      <h1 className="text-xl font-semibold">사용량</h1>

      {/* 현재 세션 - 진행률 바 */}
      {isQuotaLoading ? (
        <Skeleton variant="shimmer-contrast" className="h-28 rounded-lg" />
      ) : (
        <section className="bg-background-2 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-muted-foreground">
              오늘 사용량
            </h2>
            {quota && (
              <span className="text-xs text-muted-foreground">
                {formatTimeRemaining(quota.resetsAt * 1000 - Date.now())}
              </span>
            )}
          </div>
          {quota ? (
            <div className="space-y-3">
              {/* 진행률 바 */}
              <div className="relative h-2.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn(
                    "absolute inset-y-0 left-0 rounded-full transition-all duration-500",
                    isExhausted
                      ? "bg-destructive"
                      : isLow
                        ? "bg-orange-500"
                        : "bg-accent"
                  )}
                  style={{ width: `${Math.min(usagePercent, 100)}%` }}
                />
              </div>
              {/* 텍스트 정보 */}
              <div className="flex justify-between items-center">
                <span className="text-sm text-foreground">
                  <span className="font-semibold text-lg">{quota.used}</span>
                  <span className="text-muted-foreground"> / {quota.limit}회</span>
                </span>
                <span
                  className={cn(
                    "text-xs px-2 py-0.5 rounded-full",
                    isExhausted
                      ? "bg-destructive/10 text-destructive"
                      : isLow
                        ? "bg-warning text-warning-foreground"
                        : "bg-accent/10 text-accent-text"
                  )}
                >
                  {quota.remaining}회 남음
                </span>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">
              데이터를 불러올 수 없습니다
            </p>
          )}
        </section>
      )}

      {/* 통계 카드 */}
      <section className="grid grid-cols-2 gap-3">
        {isQuotaLoading ? (
          <Skeleton variant="shimmer-contrast" className="h-24 rounded-lg" />
        ) : (
          <div className="bg-background-2 rounded-lg p-4">
            <p className="text-xs text-muted-foreground mb-1">일일 한도</p>
            <p className="text-xl font-semibold">{quota?.limit ?? "-"}회</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {quota?.role ?? "FREE"} 플랜
            </p>
          </div>
        )}
        {isHistoryLoading ? (
          <Skeleton variant="shimmer-contrast" className="h-24 rounded-lg" />
        ) : (
          <div className="bg-background-2 rounded-lg p-4">
            <p className="text-xs text-muted-foreground mb-1">
              최근 {period}일 총 사용
            </p>
            <p className="text-xl font-semibold">{totalUsage}회</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              일 평균 {(totalUsage / period).toFixed(1)}회
            </p>
          </div>
        )}
      </section>

      {/* 일별 사용량 차트 */}
      {isHistoryLoading ? (
        <Skeleton variant="shimmer-contrast" className="h-80 rounded-lg" />
      ) : (
        <section className="bg-background-2 rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-medium text-muted-foreground">
              일별 사용량
            </h2>
            <div className="flex gap-1 bg-muted/50 rounded-md p-0.5">
              {([14, 30] as PeriodType[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={cn(
                    "px-2.5 py-1 text-xs rounded transition-colors",
                    period === p
                      ? "bg-background-1 text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {p}일
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={dailyUsage} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={(props: { x: number; y: number; payload: { value: string; index: number } }) => {
                  const { x, y, payload } = props;
                  const idx = payload.index;
                  // 14일: 모두 표시, 30일: 첫/마지막 + 5칸마다 표시
                  const shouldShow =
                    period === 14 ||
                    idx === 0 ||
                    idx === period - 1 ||
                    idx % 5 === 0;
                  return (
                    <text
                      x={x}
                      y={y + 10}
                      textAnchor="middle"
                      fontSize={10}
                      fill="var(--muted-foreground)"
                    >
                      {shouldShow ? payload.value : ""}
                    </text>
                  );
                }}
                interval={0}
              />
              <YAxis hide />
              <Tooltip
                cursor={{ fill: "color-mix(in oklch, var(--muted-foreground), transparent)" }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const data = payload[0].payload;
                  return (
                    <div className="bg-popover border border-border rounded-md px-3 py-2 shadow-md">
                      <p className="text-xs font-medium">{data.fullLabel}</p>
                      <p className="text-xs text-muted-foreground">{data.count}회 사용</p>
                    </div>
                  );
                }}
              />
              <Bar
                dataKey="count"
                fill="var(--accent)"
                radius={[4, 4, 0, 0]}
                maxBarSize={200}
              />
            </BarChart>
          </ResponsiveContainer>
        </section>
      )}

      {/* 분석 이력 */}
      {isHistoryLoading ? (
        <Skeleton variant="shimmer-contrast" className="h-100 rounded-lg" />
      ) : (
        <section className="bg-background-2 rounded-lg p-4">
          <div className="mb-4">
            <h2 className="text-sm font-medium text-muted-foreground mb-3">
              분석 이력
            </h2>
            <div className="flex gap-1 bg-muted/50 rounded-md p-0.5 w-fit">
              {(["QUANT_SIGNAL", "SNAPBACK"] as InferenceModelType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setHistoryTab(type)}
                  className={cn(
                    "px-3 py-1.5 text-xs rounded transition-colors",
                    historyTab === type
                      ? "bg-background-1 text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {type === "SNAPBACK" ? "스냅백 분석" : "퀀트 분석"}
                </button>
              ))}
            </div>
          </div>

          {filteredHistory.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              분석 이력이 없습니다
            </p>
          ) : (
            <div className="max-h-100 overflow-y-auto scrollbar-thin divide-y divide-border">
              {filteredHistory.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between px-3 py-2.5 hover:bg-background-1 transition-colors"
                >
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate">
                        {item.nameKo || item.ticker}
                      </span>
                      {item.nameKo && item.ticker && (
                        <span className="text-xs text-muted-foreground shrink-0">
                          {item.ticker}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatRelativeTime(item.requestedAt)}
                    </span>
                  </div>
                  <span
                    className={cn(
                      "text-xs px-1.5 py-0.5 rounded shrink-0 ml-2",
                      item.status === "COMPLETED"
                        ? "bg-accent/10 text-accent-text"
                        : item.status === "FAILED"
                          ? "bg-destructive/10 text-destructive"
                          : item.status === "PROCESSING"
                            ? "bg-yellow-500/20 text-yellow-500"
                            : "bg-muted text-muted-foreground"
                    )}
                  >
                    {item.status === "COMPLETED"
                      ? "완료"
                      : item.status === "FAILED"
                        ? "실패"
                        : item.status === "PROCESSING"
                          ? "처리중"
                          : item.status === "CANCELED"
                            ? "취소됨"
                            : "대기"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

/** 상대 시간 포맷팅 (예: 5분 전) */
function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const target = new Date(date);
  const diffMs = now.getTime() - target.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffMin < 1) return "방금 전";
  if (diffMin < 60) return `${diffMin}분 전`;
  if (diffHour < 24) return `${diffHour}시간 전`;
  return `${diffDay}일 전`;
}

/** 날짜를 M/D 형식으로 변환 */
function formatDateLabel(dateStr: string): string {
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

/** 날짜를 YYYY년 M월 D일 형식으로 변환 */
function formatFullDateLabel(dateStr: string): string {
  const date = new Date(dateStr);
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
}
