"use client";

import { DemoPopover } from "@/components/ui/DemoPopover";
import { planFeatureGroups } from "@/lib/plan-features";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import Link from "next/link";

/* ── Check / Value cell ── */
const FeatureValue = ({ value }: { value: boolean | string }) => {
  if (typeof value === "string") {
    return <span className="font-bold text-slate-800">{value}</span>;
  }
  return value ? (
    <Check className="w-4.5 h-4.5 text-[#00AE43] ml-auto" strokeWidth={2.5} />
  ) : (
    <X className="w-4.5 h-4.5 text-slate-300 ml-auto" strokeWidth={2} />
  );
};

/* ── Main Section ── */
export default function PricingSection() {
  return (
    <section className="py-28 md:py-40 md:pb-80 bg-[#f8f8f8]">
      <div className="max-w-4xl mx-auto px-6 sm:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="text-center mb-16 md:mb-20"
        >
          <span className="text-[#00AE43] font-bold tracking-widest uppercase text-sm mb-4 block">
            Pricing
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight break-keep">
            합리적인 요금제
          </h2>
        </motion.div>

        {/* Cards */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6"
        >
          {/* ── FREE Card ── */}
          <div className="relative bg-white rounded-2xl border border-slate-200 p-8 md:p-10 flex flex-col">
            <div className="mb-8">
              <h3 className="text-lg font-bold text-slate-900 mb-1">Free</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
                  ₩ 0
                </span>
                <span className="text-slate-400 text-sm">/월</span>
              </div>
              <p className="text-slate-500 text-sm mt-3">
                기본적인 투자 분석을 무료로 시작하세요.
              </p>
            </div>

            <Link
              href="/analysis/quant"
              className="block w-full py-3 rounded-full border-2 border-slate-200 text-slate-700 font-bold text-sm text-center hover:border-slate-300 hover:bg-slate-50 transition-colors duration-200 cursor-pointer mb-8"
            >
              무료로 시작하기
            </Link>

            {/* Feature groups */}
            <div className="flex-1 space-y-6">
              {planFeatureGroups.map((group) => (
                <div key={group.category}>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                    {group.category}
                  </p>
                  <ul className="space-y-2.5">
                    {group.features.map((f) => (
                      <li
                        key={f.label}
                        className="flex items-center justify-between text-sm text-slate-600"
                      >
                        <span>{f.label}</span>
                        <FeatureValue value={f.free} />
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* ── PRO Card ── */}
          <div className="relative bg-white rounded-2xl border-2 border-[#00AE43] p-8 md:p-10 flex flex-col shadow-[0_8px_40px_rgba(0,174,67,0.08)]">
            {/* Recommend badge */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <span className="bg-[#00AE43] text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-sm">
                추천
              </span>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-bold text-[#00AE43] mb-1">Pro</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
                  ₩ 9,900
                </span>
                <span className="text-slate-400 text-sm">/월</span>
              </div>
              <p className="text-slate-500 text-sm mt-3">
                더 많은 AI 분석으로 투자 판단력을 높이세요.
              </p>
            </div>

            <DemoPopover>
              <button className="w-full py-3 rounded-full bg-[#00AE43] text-white font-bold text-sm hover:bg-[#009438] transition-colors duration-200 cursor-pointer mb-8">
                Pro 시작하기
              </button>
            </DemoPopover>

            {/* Feature groups */}
            <div className="flex-1 space-y-6">
              {planFeatureGroups.map((group) => (
                <div key={group.category}>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                    {group.category}
                  </p>
                  <ul className="space-y-2.5">
                    {group.features.map((f) => (
                      <li
                        key={f.label}
                        className="flex items-center justify-between text-sm text-slate-600"
                      >
                        <span>{f.label}</span>
                        <FeatureValue value={f.pro} />
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
