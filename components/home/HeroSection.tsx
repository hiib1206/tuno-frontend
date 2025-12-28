"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Content */}
      <div className="container mx-auto relative z-10 grid gap-12 items-center">
        <div className="text-left">
          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="text-5xl md:text-6xl font-bold leading-snug mb-6"
          >
            앞서가는 투자의 길
            <br />
            <span className="text-[var(--color-accent)]">앱 이름 </span>이
            함께합니다
          </motion.h1>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Link href="/analysis" className="inline-block">
              <motion.div
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
                  boxShadow: {
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  },
                }}
                className="cursor-pointer px-8 py-2.5 rounded-full text-lg font-bold bg-[var(--color-accent)] text-[var(--color-accent-foreground)]"
              >
                투자 분석 하기
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
