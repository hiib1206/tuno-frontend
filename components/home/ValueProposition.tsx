"use client";

import { motion } from "framer-motion";

export default function ValueProposition() {

  return (
    <section className="relative py-28 md:py-60 bg-randing-background-1 overflow-hidden">
      <div className="max-w-6xl mx-auto px-8 md:px-16">
        {/* ── Top: Headline + Decorative line ── */}
        <div>
          <div className="max-w-2xl mx-auto text-center">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: false }}
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-black tracking-tight leading-[1.35] mb-10 break-keep"
            >
              투자는{" "}
              <span className="text-randing-accent">노동</span>이
              되어서는 안 됩니다.
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              viewport={{ once: false }}
              className="text-slate-500 text-base md:text-lg leading-[1.9] break-keep"
            >
              매일 아침 쏟아지는 뉴스, 흔들리는 차트, 수십 장의 리포트...
              <br />
              우리는 당신이 이 모든 것을 감당하기 위해
              <br />
              소중한 일상을 포기하지 않기를 바랍니다.
            </motion.p>
          </div>
        </div>
      </div>

      {/* ── Bottom: Description ── */}
      <div className="max-w-6xl mx-auto px-8 md:px-16 mt-40 md:mt-80">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: false }}
          className="md:ml-auto"
        >
          <p className="text-center text-xl md:text-2xl font-bold text-slate-800 leading-relaxed break-keep">
            Tuno는 복잡한 분석을 대신하는 AI 기반의 {" "}
            <span className="text-randing-accent">
              투자 분석 플랫폼
            </span>
            입니다.
            <br />
            이제, 투자도 여유롭게.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
