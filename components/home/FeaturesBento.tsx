"use client";

import { motion } from "framer-motion";
import { Bell, BrainCircuit, ShieldCheck, Target } from "lucide-react";

const FEATURES = [
  {
    title: "Deep Learning Analysis",
    description:
      "수백만 건의 과거 데이터를 딥러닝 모델이 분석하여 숨겨진 패턴을 찾아냅니다.",
    icon: BrainCircuit,
    colSpan: "md:col-span-2",
  },
  {
    title: "94% High Accuracy",
    description: "업계 최고 수준의 예측 정확도로 투자의 불확실성을 줄여줍니다.",
    icon: Target,
    colSpan: "md:col-span-1",
  },
  {
    title: "Real-time Alerts",
    description: "매수/매도 타이밍을 놓치지 않도록 실시간 알림을 제공합니다.",
    icon: Bell,
    colSpan: "md:col-span-1",
  },
  {
    title: "Risk Management",
    description:
      "변동성을 예측하여 리스크를 최소화하는 포트폴리오를 제안합니다.",
    icon: ShieldCheck,
    colSpan: "md:col-span-2",
  },
];

export default function FeaturesBento() {
  return (
    <section id="features" className="py-24 px-6 bg-background">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            왜 <span className="text-[var(--color-accent)]">Prophet AI</span>
            인가?
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            최첨단 AI 기술로 당신의 투자를 한 단계 업그레이드하세요.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map((feature, idx) => (
            <motion.div
              key={feature.title}
              className={`p-8 rounded-3xl bg-[var(--color-card)] border border-border
                        ${feature.colSpan} relative overflow-hidden group`}
              whileHover={{
                y: -10,
                boxShadow: "0 0 20px var(--color-primary-glow)",
                borderColor: "var(--color-accent)",
              }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
            >
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <feature.icon size={120} />
              </div>

              <div className="relative z-10">
                <div className="w-12 h-12 rounded-full bg-[var(--color-accent-20)] flex items-center justify-center mb-6 text-[var(--color-accent)]">
                  <feature.icon size={24} />
                </div>
                <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
