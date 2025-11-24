"use client";

import { Button } from "@/components/ui/button";
import { AnalysisInsights } from "./AnalysisInsights";
import { ConfidenceScore } from "./ConfidenceScore";
import { PredictionChart } from "./PredictionChart";
import { PredictionSummary } from "./PredictionSummary";

interface AnalysisResultsProps {
  companyName: string;
  ticker: string;
  period: string;
  currentPrice: string;
  predictedPrice: string;
  expectedReturn: string;
  confidenceScore: number;
  positiveInsights: string[];
  warningInsights: string[];
  onNewAnalysis: () => void;
  onDownloadReport: () => void;
}

export function AnalysisResults({
  companyName,
  ticker,
  period,
  currentPrice,
  predictedPrice,
  expectedReturn,
  confidenceScore,
  positiveInsights,
  warningInsights,
  onNewAnalysis,
  onDownloadReport,
}: AnalysisResultsProps) {
  const insights = [
    {
      type: "positive" as const,
      title: "긍정적 신호",
      items: positiveInsights,
    },
    {
      type: "warning" as const,
      title: "주의 사항",
      items: warningInsights,
    },
  ];

  return (
    <div className="space-y-6">
      <PredictionSummary
        companyName={companyName}
        ticker={ticker}
        period={period}
        currentPrice={currentPrice}
        predictedPrice={predictedPrice}
        expectedReturn={expectedReturn}
      />

      <PredictionChart />

      <AnalysisInsights insights={insights} />

      <ConfidenceScore score={confidenceScore} />

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button
          className="flex-1"
          variant="outline"
          onClick={onNewAnalysis}
        >
          새로운 예측
        </Button>
        <Button
          className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90"
          onClick={onDownloadReport}
        >
          상세 리포트 다운로드
        </Button>
      </div>
    </div>
  );
}
