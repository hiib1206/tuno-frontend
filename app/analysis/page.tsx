"use client";

import { AIStatusBanner } from "@/components/analysis/AIStatusBanner";
import { AnalysisForm } from "@/components/analysis/AnalysisForm";
import { AnalysisResults } from "@/components/analysis/AnalysisResults";
import { EmptyState } from "@/components/analysis/EmptyState";
import { useState } from "react";

export default function AnalysisPage() {
  const [ticker, setTicker] = useState("");
  const [period, setPeriod] = useState("");
  const [predicting, setPredicting] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handlePredict = () => {
    setPredicting(true);
    // Simulate AI prediction
    setTimeout(() => {
      setPredicting(false);
      setShowResults(true);
    }, 2000);
  };

  const handleNewAnalysis = () => {
    setShowResults(false);
    setTicker("");
    setPeriod("");
  };

  const handleDownloadReport = () => {
    // TODO: Implement report download
    console.log("Download report");
  };

  // Mock data - 나중에 API에서 가져올 데이터
  const getPeriodLabel = (period: string) => {
    const periodMap: Record<string, string> = {
      "1m": "1개월",
      "3m": "3개월",
      "6m": "6개월",
      "1y": "1년",
      "3y": "3년",
      "5y": "5년",
    };
    return periodMap[period] || period;
  };

  const getCompanyName = (ticker: string) => {
    const companyMap: Record<string, string> = {
      AAPL: "Apple Inc.",
      TSLA: "Tesla Inc.",
      NVDA: "NVIDIA Corporation",
      "005930": "삼성전자",
    };
    return companyMap[ticker] || ticker;
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">AI 종목 분석</h1>
          <p className="text-muted-foreground">
            종목과 기간등의 정보를 입력하면 AI가 과거 데이터를 분석하여 미래
            주가를 예측합니다.
          </p>
        </div>

        <AIStatusBanner />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <AnalysisForm
              ticker={ticker}
              period={period}
              predicting={predicting}
              onTickerChange={setTicker}
              onPeriodChange={setPeriod}
              onPredict={handlePredict}
            />
          </div>

          <div className="lg:col-span-2">
            {!showResults ? (
              <EmptyState />
            ) : (
              <AnalysisResults
                companyName={getCompanyName(ticker)}
                ticker={ticker}
                period={getPeriodLabel(period)}
                currentPrice="$185.43"
                predictedPrice="$198.50"
                expectedReturn="+7.05%"
                confidenceScore={89}
                positiveInsights={[
                  "과거 1년간 안정적인 상승 추세를 보이고 있습니다",
                  "거래량이 지속적으로 증가하고 있어 시장 관심이 높습니다",
                  "계절적 패턴 분석 결과 향후 30일간 상승 가능성이 높습니다",
                ]}
                warningInsights={[
                  "단기 변동성이 있을 수 있으며, 외부 시장 요인에 영향을 받을 수 있습니다",
                  "AI 예측은 과거 데이터 기반이며 미래를 보장하지 않습니다",
                ]}
                onNewAnalysis={handleNewAnalysis}
                onDownloadReport={handleDownloadReport}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
