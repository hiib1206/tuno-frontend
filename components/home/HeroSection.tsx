"use client";

import { motion } from "framer-motion";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 bg-background">
      {/* Content */}
      <div className="container mx-auto px-6 relative z-10 grid md:grid-cols-2 gap-12 items-center">
        <div className="text-left">
          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="text-5xl md:text-7xl font-bold leading-tight mb-6"
          >
            과거의 데이터로,
            <br />
            <span className="text-[var(--color-accent)]">미래의 부</span>를
            예측하다.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
            className="text-xl text-muted-foreground mb-8 max-w-lg"
          >
            Prophet AI는 과거 투자 데이터를 학습해 다음 수익 기회를 예측합니다.
            지금 바로 AI가 분석한 시장의 흐름을 확인하세요.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <motion.button
              whileHover={{
                scale: 1.05,
                boxShadow: "0 0 30px var(--color-primary-glow)",
              }}
              whileTap={{ scale: 0.95 }}
              animate={{
                boxShadow: [
                  "0 0 0px var(--color-primary-glow)",
                  "0 0 20px var(--color-primary-glow)",
                  "0 0 0px var(--color-primary-glow)",
                ],
              }}
              transition={{
                boxShadow: { duration: 2, repeat: Infinity, ease: "easeInOut" },
              }}
              className="px-8 py-4 rounded-full text-lg font-bold bg-[var(--color-accent)] text-[var(--color-accent-foreground)]"
            >
              무료로 예측하기
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* Gradient Overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent z-0 pointer-events-none" />
    </section>
  );
}
