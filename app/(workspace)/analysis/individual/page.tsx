"use client";

import { PageHeader } from "@/components/analysis/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { aiModels } from "@/lib/aiModels";
import { motion } from "framer-motion";
import { Check, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type StockCheckStatus = "idle" | "checking" | "verified" | "invalid";

export default function AnalysisPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  // 종목 확인 상태
  const [stockCheckStatus, setStockCheckStatus] =
    useState<StockCheckStatus>("idle");
  const [selectedModel, setSelectedModel] = useState<string>("prophet-v2");
  const [stock, setStock] = useState("");
  const [period, setPeriod] = useState("6m");
  // 한국/미국 선택
  const [marketType, setMarketType] = useState<"kr" | "us">("kr");

  // ticker 변경 시 상태 초기화
  useEffect(() => {
    if (stock.trim() && stockCheckStatus !== "checking") {
      setStockCheckStatus("idle");
    }
  }, [stock]);

  const handleCheckStock = () => {
    if (!stock.trim()) return;

    setStockCheckStatus("checking");
    // TODO: 실제 API 호출로 변경 - 종목 검증 및 정보 조회
    setTimeout(() => {
      // TODO: 종목 정보 표시 또는 토스트 메시지
      // Mock: 성공으로 가정 (실제로는 API 응답에 따라 verified/invalid 설정)
      setStockCheckStatus("verified");
      // alert(`${ticker} 종목 확인 완료`);
    }, 1500);
  };

  const handleAnalyze = () => {
    if (!stock || !period) return;

    setIsLoading(true);
    // TODO: 실제 API 호출로 변경
    setTimeout(() => {
      setIsLoading(false);
      // Mock analysis ID - 실제로는 API 응답에서 받아온 ID 사용
      const mockAnalysisId = "mock-" + Date.now();
      router.push(`/app/analysis/individual/${mockAnalysisId}`);
    }, 2000);
  };

  return (
    <div className="min-h-full p-4 max-w-[1000px] mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center justify-center mt-40 min-h-[70vh] space-y-6"
      >
        <PageHeader
          title="주가 분석을 시작해 볼까요?"
          description={`종목과 분석 기간을 선택하면 AI가 과거 데이터를 분석하여 미래 주가를 예측합니다.`}
        />

        <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* 주식 선택 및 기간 지정 */}
          <Card className="p-7 rounded-3xl border-none">
            <h2 className="text-xl font-semibold">분석 대상</h2>

            {/* 한국/미국 선택 */}
            <RadioGroup
              value={marketType}
              onValueChange={(value) => setMarketType(value as "kr" | "us")}
              className="flex gap-4"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="kr" id="kr" />
                <label
                  htmlFor="kr"
                  className="text-sm font-medium cursor-pointer"
                >
                  한국
                </label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="us" id="us" />
                <label
                  htmlFor="us"
                  className="text-sm font-medium cursor-pointer"
                >
                  미국
                </label>
              </div>
            </RadioGroup>

            <div className="space-y-4">
              <div className="space-y-2">
                <div>
                  <label className="text-sm font-medium ml-1">
                    {marketType === "kr"
                      ? "종목명 · 종목코드 입력"
                      : "티커 입력"}
                  </label>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder={
                      marketType === "kr" ? "예: 삼성전자, 005930" : "예: AAPL"
                    }
                    className="pl-10 rounded text-lg"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div>
                  <label className="text-sm font-medium ml-1">기간</label>
                </div>

                <Select value={period} onValueChange={setPeriod}>
                  <SelectTrigger className="rounded">
                    <SelectValue placeholder="기간 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1m">1개월</SelectItem>
                    <SelectItem value="3m">3개월</SelectItem>
                    <SelectItem value="6m">6개월</SelectItem>
                    <SelectItem value="1y">1년</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-center mt-auto pt-4">
              <Button
                variant="accent-rounded"
                size="default"
                className="w-full md:w-auto px-10 h-8"
                onClick={handleCheckStock}
                disabled={
                  stockCheckStatus === "checking" ||
                  stockCheckStatus === "verified" ||
                  !stock.trim()
                }
              >
                {stockCheckStatus === "checking" ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    확인 중...
                  </div>
                ) : stockCheckStatus === "verified" ? (
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    확인 완료
                  </div>
                ) : (
                  "종목 확인"
                )}
              </Button>
            </div>
          </Card>

          {/* AI 모델 선택 */}
          <Card className="col-span-2 p-7 rounded-3xl border-none flex flex-col">
            <h2 className="text-xl font-semibold">AI 모델 선택</h2>
            <div className="space-y-3">
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger className="rounded">
                  <SelectValue placeholder="모델 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="prophet-v2">
                    {aiModels["prophet-v2"].label}
                  </SelectItem>
                  <SelectItem value="lstm-turbo">
                    {aiModels["lstm-turbo"].label}
                  </SelectItem>
                  <SelectItem value="transformer-x">
                    {aiModels["transformer-x"].label}
                  </SelectItem>
                </SelectContent>
              </Select>

              <div className="p-1">
                <h3 className="font-semibold text-foreground mb-1">
                  {aiModels[selectedModel as keyof typeof aiModels].name}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {aiModels[selectedModel as keyof typeof aiModels].description}
                </p>
              </div>
            </div>

            {/* 분석 시작 버튼 */}
            <div className="flex justify-center mt-auto">
              <Button
                variant="accent-rounded"
                size="default"
                className="w-full md:w-auto px-10 h-8"
                onClick={handleAnalyze}
                disabled={
                  isLoading ||
                  stockCheckStatus !== "verified" ||
                  !stock ||
                  !period
                }
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    분석 중...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">분석 시작</div>
                )}
              </Button>
            </div>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}
