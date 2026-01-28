"use client";

import { cn } from "@/lib/utils";
import { StockOrderbookData, StockQuote, StockRealtimeData } from "@/types/Stock";
import { useMemo } from "react";
import { Skeleton } from "../ui/Skeleton";

interface AnalysisOrderbookProps {
  orderbookData: StockOrderbookData | null;
  stockQuote: StockQuote | null;
  realtimeData?: StockRealtimeData | null;
  isLoading?: boolean;
}

export function AnalysisOrderbook({
  orderbookData,
  stockQuote,
  realtimeData,
  isLoading,
}: AnalysisOrderbookProps) {
  // 현재가 (실시간 데이터 우선)
  const currentPrice = realtimeData?.STCK_PRPR ?? stockQuote?.currentPrice ?? 0;
  const prevClose = stockQuote?.previousClose ?? 0;
  const priceChange = currentPrice - prevClose;
  const isUp = priceChange >= 0;

  // 매도호가 배열 (10호가 → 1호가, 높은 가격 → 낮은 가격)
  const askOrders = useMemo(() => {
    if (!orderbookData) return [];
    return [
      { price: orderbookData.ASKP10, quantity: orderbookData.ASKP_RSQN10 },
      { price: orderbookData.ASKP9, quantity: orderbookData.ASKP_RSQN9 },
      { price: orderbookData.ASKP8, quantity: orderbookData.ASKP_RSQN8 },
      { price: orderbookData.ASKP7, quantity: orderbookData.ASKP_RSQN7 },
      { price: orderbookData.ASKP6, quantity: orderbookData.ASKP_RSQN6 },
      { price: orderbookData.ASKP5, quantity: orderbookData.ASKP_RSQN5 },
      { price: orderbookData.ASKP4, quantity: orderbookData.ASKP_RSQN4 },
      { price: orderbookData.ASKP3, quantity: orderbookData.ASKP_RSQN3 },
      { price: orderbookData.ASKP2, quantity: orderbookData.ASKP_RSQN2 },
      { price: orderbookData.ASKP1, quantity: orderbookData.ASKP_RSQN1 },
    ].filter((order) => order.price > 0);
  }, [orderbookData]);

  // 매수호가 배열 (1호가 → 10호가, 높은 가격 → 낮은 가격)
  const bidOrders = useMemo(() => {
    if (!orderbookData) return [];
    return [
      { price: orderbookData.BIDP1, quantity: orderbookData.BIDP_RSQN1 },
      { price: orderbookData.BIDP2, quantity: orderbookData.BIDP_RSQN2 },
      { price: orderbookData.BIDP3, quantity: orderbookData.BIDP_RSQN3 },
      { price: orderbookData.BIDP4, quantity: orderbookData.BIDP_RSQN4 },
      { price: orderbookData.BIDP5, quantity: orderbookData.BIDP_RSQN5 },
      { price: orderbookData.BIDP6, quantity: orderbookData.BIDP_RSQN6 },
      { price: orderbookData.BIDP7, quantity: orderbookData.BIDP_RSQN7 },
      { price: orderbookData.BIDP8, quantity: orderbookData.BIDP_RSQN8 },
      { price: orderbookData.BIDP9, quantity: orderbookData.BIDP_RSQN9 },
      { price: orderbookData.BIDP10, quantity: orderbookData.BIDP_RSQN10 },
    ].filter((order) => order.price > 0);
  }, [orderbookData]);

  // 최대 잔량 (바 너비 계산용)
  const maxQuantity = useMemo(() => {
    const allQuantities = [...askOrders, ...bidOrders].map((o) => o.quantity);
    return Math.max(...allQuantities, 1);
  }, [askOrders, bidOrders]);

  // 총 잔량
  const totalAskQuantity = orderbookData?.TOTAL_ASKP_RSQN ?? 0;
  const totalBidQuantity = orderbookData?.TOTAL_BIDP_RSQN ?? 0;

  const formatPrice = (price: number) => price.toLocaleString();
  const formatQuantity = (quantity: number) => quantity.toLocaleString();

  // 등락률 계산
  const getChangeRate = (price: number) => {
    if (!prevClose || prevClose === 0) return 0;
    return ((price - prevClose) / prevClose) * 100;
  };

  // 등락률 포맷 (+0.91%, -0.36%)
  const formatChangeRate = (price: number) => {
    const rate = getChangeRate(price);
    const sign = rate >= 0 ? "+" : "";
    return `${sign}${rate.toFixed(2)}%`;
  };

  if (isLoading) {
    return <Skeleton variant="shimmer-contrast" className="h-full rounded-b-sm md:rounded-sm" />;
  }

  if (!orderbookData) {
    return (
      <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
        호가 데이터 없음
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col text-xs">
      {/* 헤더 */}
      <div className="px-3 py-1.5 border-b border-border-2 grid grid-cols-3 text-xs text-muted-foreground">
        <span>호가</span>
        <span className="text-center">등락률</span>
        <span className="text-right">잔량</span>
      </div>

      {/* 매도호가 (위쪽) */}
      <div className="flex-1 flex flex-col justify-end overflow-hidden">
        {askOrders.map((order, index) => (
          <div
            key={`ask-${index}`}
            className="relative grid grid-cols-3 items-center px-3 py-0.5 hover:bg-chart-down/5"
          >
            {/* 잔량 바 (오른쪽 정렬) */}
            <div
              className="absolute right-0 top-0 bottom-0 bg-chart-down/15"
              style={{ width: `${(order.quantity / maxQuantity) * 100}%` }}
            />
            {/* 가격 */}
            <span className="relative z-10 text-chart-down tabular-nums">
              {formatPrice(order.price)}
            </span>
            {/* 등락률 */}
            <span className="relative z-10 text-center text-chart-down tabular-nums">
              {formatChangeRate(order.price)}
            </span>
            {/* 잔량 */}
            <span className="relative z-10 text-right tabular-nums text-muted-foreground">
              {formatQuantity(order.quantity)}
            </span>
          </div>
        ))}
      </div>

      {/* 현재가 (중간) */}
      <div className="px-3 text-sm py-1.5 border-y border-border-2 grid grid-cols-3 items-center font-medium">
        <span className={cn("tabular-nums", isUp ? "text-chart-up" : "text-chart-down")}>
          {formatPrice(currentPrice)}
        </span>
        <span className={cn("text-center tabular-nums", isUp ? "text-chart-up" : "text-chart-down")}>
          {formatChangeRate(currentPrice)}
        </span>
        <span />
      </div>

      {/* 매수호가 (아래쪽) */}
      <div className="flex-1 flex flex-col overflow-hidden border-b border-border-2">
        {bidOrders.map((order, index) => (
          <div
            key={`bid-${index}`}
            className="relative grid grid-cols-3 items-center px-3 py-0.5 hover:bg-chart-up/5"
          >
            {/* 잔량 바 (오른쪽 정렬) */}
            <div
              className="absolute right-0 top-0 bottom-0 bg-chart-up/15"
              style={{ width: `${(order.quantity / maxQuantity) * 100}%` }}
            />
            {/* 가격 */}
            <span className="relative z-10 text-chart-up tabular-nums">
              {formatPrice(order.price)}
            </span>
            {/* 등락률 */}
            <span className="relative z-10 text-center text-chart-up tabular-nums">
              {formatChangeRate(order.price)}
            </span>
            {/* 잔량 */}
            <span className="relative z-10 text-right tabular-nums text-muted-foreground">
              {formatQuantity(order.quantity)}
            </span>
          </div>
        ))}
      </div>

      {/* 잔량 비율 막대 */}
      <div className="mx-3 mt-2 h-1.5 flex rounded-full overflow-hidden ">
        <div
          className="bg-chart-down"
          style={{
            width: `${totalAskQuantity + totalBidQuantity > 0 ? (totalAskQuantity / (totalAskQuantity + totalBidQuantity)) * 100 : 50}%`,
          }}
        />
        <div
          className="bg-chart-up"
          style={{
            width: `${totalAskQuantity + totalBidQuantity > 0 ? (totalBidQuantity / (totalAskQuantity + totalBidQuantity)) * 100 : 50}%`,
          }}
        />
      </div>

      {/* 총 잔량 */}
      <div className="px-3 py-1 flex justify-between text-xs mt-1">
        <div className="flex gap-2">
          <span className="text-muted-foreground">매도</span>
          <span className="text-chart-down tabular-nums">{formatQuantity(totalAskQuantity)}</span>
        </div>
        <div className="flex gap-2">
          <span className="text-chart-up tabular-nums">{formatQuantity(totalBidQuantity)}</span>
          <span className="text-muted-foreground">매수</span>
        </div>
      </div>
    </div>
  );
}
