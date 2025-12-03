"use client";

import { PredictionChart } from "@/components/analysis/PredictionChart";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  Share2,
  TrendingUp,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";

// Mock Data for the Chart
const mockData = [
  { date: "2023-01", price: 150, prediction: null },
  { date: "2023-02", price: 158, prediction: null },
  { date: "2023-03", price: 152, prediction: null },
  { date: "2023-04", price: 165, prediction: null },
  { date: "2023-05", price: 172, prediction: null },
  { date: "2023-06", price: 180, prediction: null },
  { date: "2023-07", price: 185, prediction: 185 },
  { date: "2023-08", price: null, prediction: 192 },
  { date: "2023-09", price: null, prediction: 188 },
  { date: "2023-10", price: null, prediction: 195 },
  { date: "2023-11", price: null, prediction: 205 },
  { date: "2023-12", price: null, prediction: 210 },
];

export default function AnalysisResultPage() {
  const router = useRouter();
  const params = useParams();
  const analysisId = params.id as string;

  // TODO: 실제 API에서 analysisId로 분석 데이터 로드
  // const { data, isLoading } = useAnalysis(analysisId);

  const handleNewAnalysis = () => {
    router.push("/app/analysis");
  };

  return (
    <div className="min-h-full p-4 max-w-[1400px] mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">AAPL 분석</h2>
            <p className="text-muted-foreground mt-2">
              2025년 11월 29일까지의 과거 데이터 기반 예측
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="gap-2 rounded-full border-border/50"
            >
              <Share2 className="w-4 h-4" /> 공유
            </Button>
            <Button className="gap-2 rounded-full bg-accent hover:bg-accent-hover text-accent-foreground">
              <Download className="w-4 h-4" /> 보고서
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Chart */}
          <div className="lg:col-span-2">
            <PredictionChart data={mockData} height={500} />
          </div>

          {/* Stats Cards */}
          <div className="space-y-6">
            <Card className="p-6 rounded-3xl">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">
                    예상 성장률
                  </p>
                  <h4 className="text-3xl font-bold mt-1 text-green-500">
                    +14.2%
                  </h4>
                </div>
                <div className="p-3 rounded-2xl bg-green-500/10 text-green-500">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                2023년 12월까지{" "}
                <span className="text-foreground font-semibold">$210.00</span>에
                도달할 것으로 예상됩니다
              </p>
            </Card>

            <Card className="p-6 rounded-3xl">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">
                    신뢰도 점수
                  </p>
                  <h4 className="text-3xl font-bold mt-1 text-accent">87%</h4>
                </div>
                <div className="p-3 rounded-2xl bg-accent/10 text-accent">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
              <div className="w-full bg-secondary h-2 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-accent h-full rounded-full"
                  style={{ width: "87%" }}
                />
              </div>
            </Card>

            <Card className="p-6 rounded-3xl">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">
                    위험 수준
                  </p>
                  <h4 className="text-3xl font-bold mt-1 text-orange-500">
                    보통
                  </h4>
                </div>
                <div className="p-3 rounded-2xl bg-orange-500/10 text-orange-500">
                  <AlertTriangle className="w-5 h-5" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                변동성 지수는 표준 시장 변동을 나타냅니다.
              </p>
            </Card>
          </div>
        </div>

        {/* 새 분석 시작 버튼 */}
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            className="gap-2 rounded-full"
            onClick={handleNewAnalysis}
          >
            새 분석 시작
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
