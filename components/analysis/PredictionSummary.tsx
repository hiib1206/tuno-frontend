import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Sparkles, TrendingUp } from "lucide-react";

interface PredictionSummaryProps {
  companyName: string;
  ticker: string;
  period: string;
  currentPrice: string;
  predictedPrice: string;
  expectedReturn: string;
}

export function PredictionSummary({
  companyName,
  ticker,
  period,
  currentPrice,
  predictedPrice,
  expectedReturn,
}: PredictionSummaryProps) {
  return (
    <Card className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {companyName} ({ticker})
          </h2>
          <p className="text-sm text-muted-foreground">
            분석 기간: 최근 {period}
          </p>
        </div>
        <Badge className="bg-accent/10 text-accent">
          <Sparkles className="mr-1 h-3 w-3" />
          AI 생성
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-border p-4">
          <p className="mb-1 text-sm text-muted-foreground">현재 가격</p>
          <p className="text-2xl font-bold">{currentPrice}</p>
        </div>
        <div className="rounded-lg border border-accent bg-accent/5 p-4">
          <p className="mb-1 text-sm text-muted-foreground">
            예상 가격 (30일 후)
          </p>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-bold">{predictedPrice}</p>
            <TrendingUp className="h-5 w-5 text-accent" />
          </div>
        </div>
        <div className="rounded-lg border border-border p-4">
          <p className="mb-1 text-sm text-muted-foreground">예상 수익률</p>
          <p className="text-2xl font-bold text-accent">{expectedReturn}</p>
        </div>
      </div>
    </Card>
  );
}
