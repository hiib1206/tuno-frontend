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
import { Bot, Search } from "lucide-react";

interface AnalysisFormProps {
  ticker: string;
  period: string;
  aiModel: string;
  analyzing: boolean;
  onTickerChange: (ticker: string) => void;
  onPeriodChange: (period: string) => void;
  onAnalyze: () => void;
}

export function AnalysisForm({
  ticker,
  period,
  aiModel,
  analyzing,
  onTickerChange,
  onPeriodChange,
  onAnalyze,
}: AnalysisFormProps) {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h3 className="text-4xl font-bold mb-2 leading-tight">
            환영합니다. <br />
            분석을 시작해 볼까요?
          </h3>
          <p className="text-muted-foreground">
            종목과 분석 기간을 선택하면 AI가 과거 데이터를 분석하여 미래를
            예측합니다.
          </p>
        </div>

        <Card className="p-6">
          <div className="space-y-6">
            <div>
              <Label htmlFor="ticker" className="text-sm mb-2 block">
                종목 코드
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="ticker"
                  placeholder="AAPL, 삼성전자, 005930..."
                  value={ticker}
                  onChange={(e) => onTickerChange(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="period" className="text-sm mb-2 block">
                분석 기간
              </Label>
              <Select value={period} onValueChange={onPeriodChange}>
                <SelectTrigger id="period">
                  <SelectValue placeholder="기간을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6m">6개월</SelectItem>
                  <SelectItem value="1y">1년</SelectItem>
                  <SelectItem value="3y">3년</SelectItem>
                  <SelectItem value="5y">5년</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              className="w-full"
              size="lg"
              onClick={onAnalyze}
              disabled={!ticker || !period || analyzing}
            >
              {analyzing ? <>분석 중...</> : <>AI 분석 시작</>}
            </Button>

            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground pt-2">
              <Bot className="h-4 w-4" />
              <span>현재 모델: {aiModel.toUpperCase()}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
