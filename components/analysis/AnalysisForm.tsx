"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, Search, Sparkles } from "lucide-react";

interface AnalysisFormProps {
  ticker: string;
  period: string;
  predicting: boolean;
  onTickerChange: (ticker: string) => void;
  onPeriodChange: (period: string) => void;
  onPredict: () => void;
}

export function AnalysisForm({
  ticker,
  period,
  predicting,
  onTickerChange,
  onPeriodChange,
  onPredict,
}: AnalysisFormProps) {
  const popularStocks = [
    { ticker: "AAPL", label: "AAPL" },
    { ticker: "TSLA", label: "TSLA" },
    { ticker: "NVDA", label: "NVDA" },
    { ticker: "005930", label: "삼성전자" },
  ];

  return (
    <Card className="p-6 sticky top-24">
      <h2 className="mb-6 text-xl font-semibold">종목 설정</h2>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="ticker">종목 코드</Label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="ticker"
              placeholder="예: AAPL, TSLA, 005930"
              className="pl-9 border-ring"
              value={ticker}
              onChange={(e) => onTickerChange(e.target.value)}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            미국 주식은 티커, 한국 주식은 종목 코드를 입력하세요
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="period">분석 기간</Label>
          <Select value={period} onValueChange={onPeriodChange}>
            <SelectTrigger id="period" className="border-ring">
              <SelectValue placeholder="기간 선택" />
            </SelectTrigger>
            <SelectContent className="border-ring">
              <SelectItem value="6m">6개월</SelectItem>
              <SelectItem value="1y">1년</SelectItem>
              <SelectItem value="3y">3년</SelectItem>
              <SelectItem value="5y">5년</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            AI가 이 기간의 데이터를 학습합니다
          </p>
        </div>

        <Button
          className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
          onClick={onPredict}
          disabled={!ticker || !period || predicting}
        >
          {predicting ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-accent-foreground border-t-transparent"></div>
              AI 분석 중...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              분석 시작
            </>
          )}
        </Button>

        {/* Popular Stocks */}
        <div className="border-t border-border pt-6">
          <p className="mb-3 text-sm font-medium">인기 종목</p>
          <div className="flex flex-wrap gap-2">
            {popularStocks.map((stock) => (
              <Button
                key={stock.ticker}
                size="sm"
                variant="outline"
                onClick={() => onTickerChange(stock.ticker)}
              >
                {stock.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Info Box */}
        <Card className="border-accent/20 bg-accent/5 p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground">
              AI 예측은 참고용이며, 실제 투자 결정은 본인의 판단과 책임하에
              이루어져야 합니다.
            </p>
          </div>
        </Card>
      </div>
    </Card>
  );
}
