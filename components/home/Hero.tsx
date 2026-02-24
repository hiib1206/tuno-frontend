"use client";

import { BrandText } from "@/components/ui/BrandText";
import { motion } from "framer-motion";
import Link from "next/link";

const Hero = () => {
  return (
    <section className="relative h-screen">
      <div className="h-full w-full overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 z-0 bg-randing-background-1" />

        <div className="absolute inset-0 z-10 flex items-center">
          <div className="w-full max-w-7xl mx-auto px-2 mobile:px-20 flex flex-col lg:flex-row items-center gap-20">
            {/* Left: Text + Button */}
            <div className="flex-1 text-center lg:text-left">
              <div className="text-black/50 font-medium tracking-[0.2em] uppercase mb-4 text-[10px] mobile:text-xs md:text-sm">
                AI Investment Analysis Platform
              </div>
              <h1 className="text-2xl mobile:text-4xl sm:text-5xl lg:text-5xl font-bold text-black tracking-tight leading-[1.35] break-keep">
                앞서가는 투자의 길 <br />
                <BrandText className="text-2xl mobile:text-4xl sm:text-5xl lg:text-5xl">
                  Tuno
                </BrandText>
                가 함께합니다.
              </h1>
              <div className="mt-6 md:mt-8 text-black/70 font-medium text-sm mobile:text-base md:text-lg lg:text-xl leading-relaxed break-keep">
                퀀트 시그널부터 매수 타이밍까지
                <br />
                새로운 투자 분석을 경험해 보세요.
              </div>
              {/* Button */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="mt-8 md:mt-10 inline-block"
              >
                <Link
                  href="/analysis/quant"
                  className="inline-block px-4 py-2 sm:px-6 sm:py-3 bg-randing-accent text-white rounded-full font-bold text-xs mobile:text-base sm:text-lg transition-colors shadow-[0_4px_20px_rgba(0,174,67,0.3)] hover:shadow-[0_6px_30px_rgba(0,174,67,0.4)]"
                >
                  무료로 시작하기
                </Link>
              </motion.div>
            </div>

            {/* Right: Screenshot */}
            <div className="flex-1 flex justify-center md:justify-end">
              <div className="relative">
                {/* Gradient glow behind image */}
                <div className="absolute -inset-8 rounded-2xl blur-2xl bg-[#00AE43]/20" />
                <img
                  src="/randing/quant-entry-screen.png"
                  alt="Tuno 퀀트 분석 화면"
                  className="relative w-full max-w-md md:max-w-lg lg:max-w-xl rounded-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
