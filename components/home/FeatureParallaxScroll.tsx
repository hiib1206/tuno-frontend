"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const features = [
  {
    id: 1,
    category: "Quant Signal",
    title: "AI 기반 퀀트 분석 제공",
    desc: "다양한 기술적 지표와 시장 흐름을 AI가 상황에 맞는\nBUY · HOLD · SELL 신호를 제공합니다.\n빠르고 직관적인 투자 판단을 경험하세요.",
    image: "/randing/quant-result-screen.png",
    subImage: "/randing/quant-entry-screen.png",
    subPosition: "-bottom-15 left-0 w-[55%]",
  },
  {
    id: 2,
    category: "Chart Analysis",
    title: "차트 분석, AI가 대신합니다",
    desc: "복잡한 기술적 지표를 일일이 확인할 필요 없이\nAI가 차트 패턴과 매수·매도 타이밍을 분석합니다.\n반등 신호부터 추세 전환까지, 한눈에 파악하세요.",
    image: "/randing/snapback-screen.png",
    subImage: "/randing/snapback-result-screen.png",
    subPosition: "-bottom-20 right-0 w-[40%]",
  },
  {
    id: 3,
    category: "Market Data",
    title: "편리한 접근 환경 제공",
    desc: "별도의 인증서 없이 모든 기기에서 실시간 종목 데이터와 관련 정보를 편리하게 확인할 수 있습니다.",
    image: "/randing/stock-search-screen.png",
    imageClass: "max-w-2xl",
  },
  {
    id: 4,
    category: "Community",
    title: "자유로운 커뮤니티 경험",
    desc: "종목별 토론부터 투자 인사이트 공유까지. 투자에 관심 있는 사용자들과 소통하세요.",
    image: "/randing/community-screen.png",
    imageClass: "max-w-2xl",
  },
];

export default function FeatureParallaxScroll() {
  return (
    <div className="relative bg-white py-150">
      <div className="flex flex-col gap-150">
        {features.map((feature, i) => (
          <FeatureSection key={i} i={i} feature={feature} />
        ))}
      </div>
    </div>
  );
}

interface Feature {
  id: number;
  category: string;
  title: string;
  desc: string;
  image: string;
  subImage?: string;
  subPosition?: string;
  imageClass?: string;
}

const FeatureSection = ({
  i,
  feature,
}: {
  i: number;
  feature: Feature;
}) => {
  const container = useRef(null);
  // SSR에서는 null로 시작하여 hydration mismatch 방지
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);

  useEffect(() => {
    const mql = window.matchMedia("(min-width: 1024px)");
    setIsDesktop(mql.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start end", "start start"],
  });

  // 패럴랙스: 데스크탑에서만 활성화 (SSR/모바일에서는 비활성화)
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    isDesktop === true ? ["-15%", "15%"] : ["0%", "0%"],
  );
  const isReversed = i % 2 !== 0;

  return (
    <section ref={container}>
      <div className="mx-auto max-w-[1800px] px-6 sm:px-8 lg:px-16">
        <div
          className={`flex flex-col items-center gap-20 lg:gap-40 ${isReversed ? "lg:flex-row-reverse" : "lg:flex-row"
            }`}
        >
          {/* ── Text Column: 4/12 ── */}
          <div className={`w-full lg:w-6/12 flex ${isReversed ? "lg:justify-start" : "lg:justify-end"}`}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: false }}
              className="max-w-lg"
            >
              <span className="text-[#00AE43] font-bold tracking-widest uppercase text-[10px] mobile:text-sm mb-4 block">
                0{i + 1} — {feature.category}
              </span>
              <h2 className="text-xl mobile:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight mb-6 break-keep whitespace-nowrap">
                {feature.title}
              </h2>
              <p className="text-xs mobile:text-sm sm:text-lg lg:text-xl text-slate-500 leading-relaxed break-keep whitespace-pre-line">
                {feature.desc}
              </p>
            </motion.div>
          </div>

          {/* ── Image Column: 8/12 ── */}
          <div className="w-full lg:w-8/12">
            {feature.subImage ? (
              <motion.div style={{ y }} className="pb-10">
                {/* Wrapper - relative container with padding for sub image overflow */}
                <div className="relative px-[6%]">
                  {/* Main image */}
                  <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.3 }}
                    viewport={{ once: false }}
                    className="rounded-2xl overflow-hidden shadow-2xl shadow-[#00AE43]/20"
                  >
                    <img
                      src={feature.image}
                      alt={feature.title}
                      className="w-full h-auto block"
                    />
                  </motion.div>
                  {/* Sub image - relative to main image wrapper */}
                  <motion.div
                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.55 }}
                    viewport={{ once: false }}
                    className={`absolute rounded-2xl overflow-hidden shadow-xl shadow-[#00AE43]/15 ring-4 ring-white z-10 ${feature.subPosition}`}
                  >
                    <img
                      src={feature.subImage}
                      alt={`${feature.title} detail`}
                      className="w-full h-auto block"
                    />
                  </motion.div>
                </div>
              </motion.div>
            ) : (
              <motion.div style={{ y }} className={feature.imageClass}>
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.3 }}
                  viewport={{ once: false }}
                  className="relative rounded-2xl overflow-hidden shadow-2xl shadow-[#00AE43]/20"
                >
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="w-full h-auto block"
                  />
                </motion.div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
