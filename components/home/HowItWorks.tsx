"use client";

import { motion } from "framer-motion";
import { Cpu, Database, TrendingUp } from "lucide-react";

const STEPS = [
  {
    id: 1,
    title: "데이터 수집",
    description:
      "전 세계 주식, 뉴스, 경제 지표 등 방대한 데이터를 실시간으로 수집합니다.",
    icon: Database,
  },
  {
    id: 2,
    title: "AI 분석",
    description:
      "독자적인 딥러닝 알고리즘이 과거 데이터와 현재 흐름을 정밀 분석합니다.",
    icon: Cpu,
  },
  {
    id: 3,
    title: "예측 결과 도출",
    description: "가장 높은 확률의 미래 주가 흐름과 매매 타이밍을 제시합니다.",
    icon: TrendingUp,
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-6 bg-background/50">
      <div className="container mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">How It Works</h2>
          <p className="text-muted-foreground text-lg">
            복잡한 시장 분석, Prophet AI가 대신합니다.
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          {/* Connecting Line */}
          <div className="absolute left-[50%] top-0 bottom-0 w-1 bg-border -translate-x-1/2 hidden md:block" />

          <div className="space-y-24">
            {STEPS.map((step, idx) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
                className={`flex flex-col md:flex-row items-center gap-8 md:gap-16 relative ${
                  idx % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                {/* Center Dot */}
                <div className="absolute left-[50%] top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[var(--color-accent)] shadow-[0_0_10px_var(--color-accent)] hidden md:block z-10" />

                {/* Content */}
                <div
                  className={`flex-1 text-center ${
                    idx % 2 === 0 ? "md:text-right" : "md:text-left"
                  }`}
                >
                  <div
                    className={`inline-flex p-4 rounded-2xl bg-[var(--color-accent-10)] text-[var(--color-accent)] mb-4
                                  ${
                                    idx % 2 === 0 ? "md:ml-auto" : "md:mr-auto"
                                  }`}
                  >
                    <step.icon size={40} />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">
                    <span className="text-[var(--color-accent)] mr-2">
                      0{step.id}.
                    </span>
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>

                {/* Empty side for layout balance */}
                <div className="flex-1 hidden md:block" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
