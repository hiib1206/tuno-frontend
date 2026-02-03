"use client";

import newsApi from "@/api/newsApi";
import stockApi from "@/api/stockApi";
import { toast } from "@/components/ToastProvider";
import { ErrorState } from "@/components/feedback";
import AsyncScanner from "@/components/loading/AiLoader/AsyncScanner";
import { IndexMiniChart } from "@/components/market/IndexMiniChart";
import { StockCommentChat } from "@/components/market/StockCommentChat";
import { WorkspaceFeedback } from "@/components/workspace/WorkspaceFeedback";
import { FinancialStatements } from "@/components/workspace/stock/FinancialStatements";
import { StockInfo as StockInfoComponent } from "@/components/workspace/stock/StockInfo";
import { StockNews } from "@/components/workspace/stock/StockNews";
import { useNews } from "@/hooks/useNews";
import { useStockComments } from "@/hooks/useStockComments";
import { useStockWebSocket } from "@/hooks/useStockWebSocket";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import {
  ExchangeCode,
  MarketCode,
  StockInfo as StockInfoType,
  StockQuote,
  StockRealtimeData,
  TR_ID,
} from "@/types/Stock";
import { Building2, FileWarning } from "lucide-react";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const PANELS_STORAGE_KEY = "market:stockPage:panels";
const PANELS_TTL_MS = 1000 * 60 * 60 * 24 * 30;

type PanelsPayload = {
  indexOpen: boolean;
  chatOpen: boolean;
  savedAt: number;
  version: 1;
};

function loadPanels(): { indexOpen: boolean; chatOpen: boolean } | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(PANELS_STORAGE_KEY);
    if (!raw) return null;

    const data = JSON.parse(raw) as PanelsPayload;
    if (Date.now() - data.savedAt > PANELS_TTL_MS) {
      localStorage.removeItem(PANELS_STORAGE_KEY);
      return null;
    }

    return { indexOpen: !!data.indexOpen, chatOpen: !!data.chatOpen };
  } catch {
    localStorage.removeItem(PANELS_STORAGE_KEY);
    return null;
  }
}

function savePanels(next: { indexOpen: boolean; chatOpen: boolean }) {
  if (typeof window === "undefined") return;

  const payload: PanelsPayload = {
    ...next,
    savedAt: Date.now(),
    version: 1,
  };
  localStorage.setItem(PANELS_STORAGE_KEY, JSON.stringify(payload));
}

export default function StockPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { isAuthLoading } = useAuthStore();

  const code = params.code as string;
  const market = searchParams.get("market") as MarketCode | null;
  const exchange = searchParams.get("exchange") as ExchangeCode | null;

  const [stockInfo, setStockInfo] = useState<StockInfoType | null>(null);
  const [stockQuote, setStockQuote] = useState<StockQuote | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showIndex, setShowIndex] = useState(true);
  const [showChat, setShowChat] = useState(true);
  const [panelsLoaded, setPanelsLoaded] = useState(false);

  useEffect(() => {
    const saved = loadPanels();
    if (saved) {
      setShowIndex(saved.indexOpen);
      setShowChat(saved.chatOpen);
    }
    setPanelsLoaded(true);
  }, []);

  useEffect(() => {
    if (!panelsLoaded) return;
    savePanels({ indexOpen: showIndex, chatOpen: showChat });
  }, [panelsLoaded, showIndex, showChat]);

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
        const rtData = data as StockRealtimeData;
        // 현재가가 0인 불완전한 데이터(시간외 등) 무시
        if (!rtData.STCK_PRPR) return;
        setRealtimeData(rtData);
      }
    },
  });

  // 종목 댓글 훅
  const {
    comments,
    isLoading: commentsLoading,
    error: commentsError,
    isSubmitting: commentsSubmitting,
    createComment,
    updateComment: updateStockComment,
    deleteComment: deleteStockComment,
    refreshComments,
  } = useStockComments(code, exchange || "");

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
    // 인증 로딩 중이면 기다림
    if (isAuthLoading) return;

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
  }, [code, market, exchange, isAuthLoading]);

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
        <div className="w-[440px] h-60 mx-auto">
          <AsyncScanner />
        </div>
      </WorkspaceFeedback>
    );
  }

  return (
    <div className="min-h-screen max-w-screen-2xl mx-auto">
      <div className="flex gap-2 justify-center">
        {/* 메인 콘텐츠 */}
        <div className="w-full max-w-5xl min-w-0 space-y-2">
          {/* 종목 기본 정보 및 차트 */}
          <StockInfoComponent
            stockQuote={stockQuote}
            stockInfo={stockInfo}
            realtimeData={realtimeData}
            showIndex={showIndex}
            onToggleIndex={() => setShowIndex((prev) => !prev)}
            showChat={showChat}
            onToggleChat={() => setShowChat((prev) => !prev)}
          />

          <div className="bg-background-1 rounded-sm p-6 min-h-[180px] flex flex-col">
            <div className="flex items-center gap-2 mb-6">
              <Building2 className="h-5 w-5 text-accent-text" />
              <h3 className="text-base font-semibold text-foreground">
                기업개요
              </h3>
            </div>
            {stockInfo.summary ? (
              <ul className="space-y-2 text-sm text-foreground leading-relaxed list-disc list-inside">
                {stockInfo.summary.split("\n").filter(Boolean).map((line, idx) => (
                  <li key={idx}>{line}</li>
                ))}
              </ul>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center gap-2">
                <FileWarning className="h-10 w-10 text-muted-foreground" />
                <p className="text-base text-muted-foreground">
                  해당 종목의 정보는 제공되지 않습니다.
                </p>
              </div>
            )}
          </div>

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

          {/* 모바일 종목 토론 (xl 미만에서만 표시) */}
          <div className="xl:hidden">
            <StockCommentChat
              comments={comments}
              isLoading={commentsLoading}
              error={commentsError}
              isSubmitting={commentsSubmitting}
              onCreateComment={createComment}
              onUpdateComment={updateStockComment}
              onDeleteComment={deleteStockComment}
              onRefresh={refreshComments}
              className="h-[500px]"
            />
          </div>
        </div>

        {/* 오른쪽 사이드: 지수 미니 차트 + 종목 토론 */}
        <div
          className={cn(
            "hidden xl:block shrink-0 overflow-hidden",
            panelsLoaded && "transition-all duration-300 ease-in-out",
            showIndex || showChat
              ? "w-120 opacity-100"
              : "w-0 opacity-0"
          )}
        >
          <div className="sticky top-0 w-full flex flex-col max-h-screen overflow-hidden">
            <div
              className={cn(
                "overflow-hidden",
                panelsLoaded &&
                  "transition-[max-height,opacity,transform] duration-300 ease-in-out",
                showIndex
                  ? "max-h-[360px] opacity-100 translate-y-0"
                  : "max-h-0 opacity-0 translate-y-0 pointer-events-none"
              )}
            >
              <IndexMiniChart className="h-[340px] shrink-0" />
            </div>
            <div
              className={cn(
                "overflow-hidden",
                panelsLoaded &&
                  "transition-[max-height,opacity,transform,padding] duration-300 ease-in-out",
                showChat
                  ? "max-h-[620px] opacity-100 translate-y-0"
                  : "max-h-0 opacity-0 translate-y-0 pointer-events-none"
                ,
                showIndex && showChat ? "pt-2" : "pt-0"
              )}
            >
              <StockCommentChat
                comments={comments}
                isLoading={commentsLoading}
                error={commentsError}
                isSubmitting={commentsSubmitting}
                onCreateComment={createComment}
                onUpdateComment={updateStockComment}
                onDeleteComment={deleteStockComment}
                onRefresh={refreshComments}
                className="h-[600px]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
