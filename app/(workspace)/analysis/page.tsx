"use client";

import { PageHeader } from "@/components/analysis/PageHeader";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ArrowRight, BarChart3, LineChart, LucideIcon } from "lucide-react";
import { useRouter } from "next/navigation";

interface AnalysisOption {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  tags: string[];
  route: string;
}

const analysisOptions: AnalysisOption[] = [
  {
    id: "quant",
    title: "퀀트 분석 결과 보기",
    description:
      "다수의 종목을 대상으로 한 퀀트 분석 결과를 확인하고, 포트폴리오 최적화 전략을 살펴보세요.",
    icon: BarChart3,
    tags: ["포트폴리오", "다중 종목", "최적화"],
    route: "/analysis/quant",
  },
  {
    id: "individual",
    title: "개별 분석",
    description:
      "특정 종목을 선택하여 AI 모델 기반의 상세한 주가 예측 분석을 진행하세요.",
    icon: LineChart,
    tags: ["단일 종목", "AI 예측", "상세 분석"],
    route: "/analysis/individual",
  },
];

function AnalysisCard({
  option,
  index,
}: {
  option: AnalysisOption;
  index: number;
}) {
  const router = useRouter();
  const Icon = option.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: index === 0 ? -10 : 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.1 * (index + 1) }}
    >
      <Card
        className="h-full p-8 rounded-3xl cursor-pointer hover:shadow-lg hover:scale-102 transition-all duration-100 border-2 border-transparent group"
        onClick={() => router.push(option.route)}
      >
        <div className="flex flex-col h-full space-y-5">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-2xl bg-accent/10 text-accent group-hover:scale-110 transition-transform">
              <Icon className="w-7 h-7" />
            </div>
            <ArrowRight className="self-start w-5 h-5 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground">
              {option.title}
            </h2>
            <p className="text-muted-foreground leading-relaxed text-sm">
              {option.description}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 mt-auto">
            {option.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 text-xs font-medium rounded-full bg-accent/10 text-accent"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

export default function AnalysisPage() {
  return (
    <div className="min-h-full p-4 max-w-[1400px] mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center justify-center mt-40 min-h-[70vh] space-y-8"
      >
        <PageHeader
          title="환영합니다. 투자 분석을 시작해 볼까요?"
          description="원하시는 분석 방식을 선택하여 시작하세요"
        />

        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-4">
          {analysisOptions.map((option, index) => (
            <AnalysisCard key={option.id} option={option} index={index} />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
