"use client";

import newsApi from "@/api/newsApi";
import stockApi from "@/api/stockApi";
import { toast } from "@/components/ToastProvider";
import { ErrorState } from "@/components/feedback";
import { WorkspaceFeedback } from "@/components/workspace/WorkspaceFeedback";
import { FinancialStatements } from "@/components/workspace/stock/FinancialStatements";
import { StockInfo as StockInfoComponent } from "@/components/workspace/stock/StockInfo";
import { StockNews } from "@/components/workspace/stock/StockNews";
import { useNews } from "@/hooks/useNews";
import { useStockWebSocket } from "@/hooks/useStockWebSocket";
import {
  ExchangeCode,
  MarketCode,
  StockInfo as StockInfoType,
  StockQuote,
  StockRealtimeData,
  TR_ID,
} from "@/types/Stock";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function StockPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const code = params.code as string;
  const market = searchParams.get("market") as MarketCode | null;
  const exchange = searchParams.get("exchange") as ExchangeCode | null;

  const [stockInfo, setStockInfo] = useState<StockInfoType | null>(null);
  const [stockQuote, setStockQuote] = useState<StockQuote | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 실시간 주가 데이터
  const [realtimeData, setRealtimeData] = useState<StockRealtimeData | null>(
    null
  );

  // WebSocket 연결 및 실시간 데이터 수신
  const { realtimeData: wsData, isConnected } = useStockWebSocket(code, {
    enabled: !!stockInfo && market === "KR",
    // isNxtInMaster 여부에 따라 구독할 TR 코드 선택
    trCodes: stockInfo?.isNxtInMaster ? [TR_ID.H0UNCNT0] : [TR_ID.H0STCNT0],
    onData: (trId, data) => {
      if (trId === TR_ID.H0UNCNT0 || trId === TR_ID.H0STCNT0) {
        setRealtimeData(data as StockRealtimeData);
      }
      // 다른 TR 코드 처리는 여기에 추가
    },
  });

  // 뉴스 훅 사용
  const {
    news,
    loading: loadingNews,
    error: newsError,
    failedImageUrls,
    enableImageExtraction,
  } = useNews(() => newsApi.searchNews({ q: stockInfo!.nameKo, limit: 10 }), {
    enablePagination: false,
    enableImageExtraction: true,
    autoFetch: !!stockInfo?.nameKo,
  });

  useEffect(() => {
    const fetchStockInfo = async () => {
      if (!market || !exchange) {
        setError("잘못된 접근입니다. 올바른 링크로 접근해주세요.");
        return;
      }

      if (market === "US") {
        setError("해외 종목의 상세정보는 아직 지원되지 않습니다.");
        return;
      }

      try {
        const response = await stockApi.getStockInfo(code, {
          market,
          exchange,
        });
        if (response.success) {
          setStockInfo(response.data);
        } else {
          setError(`종목 정보를 불러오는 중 오류가 발생했습니다`);
        }
      } catch (error) {
        setError(`종목 정보를 불러오는 중 오류가 발생했습니다`);
      }
    };

    fetchStockInfo();
  }, [code, market, exchange]);

  useEffect(() => {
    const fetchStockQuote = async () => {
      if (!market || !exchange || !stockInfo) {
        return;
      }

      if (market === "US") {
        return;
      }

      try {
        const response = await stockApi.getStockQuote(code, {
          // isNxtInMaster가 true면 넥스트레이드에 포함된 종목이라서 UN, false면 J(KRX)로 조회해야함
          market_division_code: stockInfo?.isNxtInMaster ? "UN" : "J",
          period_type: "D",
        });

        if (response.success && response.data) {
          setStockQuote(response.data);
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "종목 시세 정보 조회 실패",
          description: "종목 시세 정보를 조회하는 중 오류가 발생했습니다",
        });
      }
    };

    fetchStockQuote();
  }, [code, market, exchange, stockInfo]);

  if (error) {
    return (
      <WorkspaceFeedback>
        <ErrorState message={error} />
      </WorkspaceFeedback>
    );
  }

  if (!stockInfo) {
    return (
      <WorkspaceFeedback>
        <div></div>
        {/* <LoadingState
          lottieFile="/lottie/search-loading.json"
          lottieClassName="h-80 w-80"
        /> */}
      </WorkspaceFeedback>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-5xl mx-auto space-y-2">
        {/* 종목 기본 정보 및 차트 */}
        <StockInfoComponent
          stockQuote={stockQuote}
          stockInfo={stockInfo}
          realtimeData={realtimeData}
        />

        {/* 재무재표와 뉴스 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 h-auto lg:h-[850px] min-h-0">
          <div className="lg:col-span-2 h-full min-h-0">
            <FinancialStatements stockInfo={stockInfo} />
          </div>
          <div className="lg:col-span-1 min-h-0 h-[800px] lg:h-full">
            <StockNews
              news={news}
              failedImageUrls={failedImageUrls}
              loading={loadingNews}
              error={newsError}
              enableImageExtraction={enableImageExtraction}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
