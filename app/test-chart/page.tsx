"use client";

import { StockRealtimeData } from "@/types/Stock";
import { useCallback, useState } from "react";

export default function TestChartPage() {
  const [realtimeData, setRealtimeData] = useState<StockRealtimeData | null>(
    null
  );

  const handleRealtimeData = useCallback((data: StockRealtimeData) => {
    setRealtimeData(data);
  }, []);

  return (
    <div className="flex flex-col h-full w-full bg-background">
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              차트 테스트
            </h1>
            <p className="text-sm text-muted-foreground">
              삼성전자(005930) 차트 테스트 페이지입니다.
            </p>
            {realtimeData && (
              <div className="mt-2 text-sm">
                <span className="text-muted-foreground">현재가: </span>
                <span className="font-medium">
                  {realtimeData.STCK_PRPR.toLocaleString()}원
                </span>
                <span className="text-muted-foreground ml-4">체결시간: </span>
                <span className="font-medium">
                  {realtimeData.STCK_CNTG_HOUR}
                </span>
              </div>
            )}
          </div>
          <div className="bg-background-1 rounded-lg p-6 h-[500px] w-full">
            {/* <CandleChart
              code="005930"
              market="KR"
              exchange="KP"
              onRealtimeData={handleRealtimeData}
            /> */}
          </div>
        </div>
      </div>
    </div>
  );
}
