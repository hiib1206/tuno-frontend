"use client";

import { BrandText } from "@/components/ui/BrandText";
import { motion, useMotionValueEvent, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

/* ── Grain Overlay ── */
const GrainOverlay = () => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 200;
    canvas.height = 200;
    const ctx = canvas.getContext("2d");
    if (!ctx || !ref.current) return;
    const imageData = ctx.createImageData(200, 200);
    for (let i = 0; i < imageData.data.length; i += 4) {
      const val = Math.random() * 255;
      imageData.data[i] = val;
      imageData.data[i + 1] = val;
      imageData.data[i + 2] = val;
      imageData.data[i + 3] = 255;
    }
    ctx.putImageData(imageData, 0, 0);
    ref.current.style.backgroundImage = `url(${canvas.toDataURL()})`;
  }, []);

  return (
    <div
      ref={ref}
      className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay"
      style={{ backgroundSize: "200px 200px" }}
    />
  );
};

// --- 6-MONTH DAILY CHART DATA GENERATION ---
const CHART_W = 1200;
const CHART_H = 600;
const PRICE_TOP = 60;
const PRICE_BOTTOM = 440;
const VOL_TOP = 480;
const VOL_BOTTOM = 580;
const NUM_DAYS = 125;

// Deterministic pseudo-random (seed-based)
const seededRandom = (seed: number) => {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
};

// Generate OHLCV data
const generateChartData = () => {
  let price = 50000; // starting price (KRW-style)
  const candles: {
    o: number;
    h: number;
    l: number;
    c: number;
    v: number;
  }[] = [];

  for (let i = 0; i < NUM_DAYS; i++) {
    const r1 = seededRandom(i * 3 + 1);
    const r2 = seededRandom(i * 3 + 2);
    const r3 = seededRandom(i * 3 + 3);

    // Trend: 6-month uptrend with sharp swings
    let drift = 0;
    if (i < 15) drift = 0.002;           // 초기 상승
    else if (i < 30) drift = 0.008;      // 급등
    else if (i < 42) drift = -0.006;     // 급락 조정
    else if (i < 60) drift = 0.005;      // 반등
    else if (i < 72) drift = -0.004;     // 눌림
    else if (i < 95) drift = 0.009;      // 강한 랠리
    else if (i < 108) drift = -0.005;    // 차익실현
    else drift = 0.007;                  // 재상승

    const volatility =
      0.02 +
      (i > 25 && i < 45 ? 0.02 : 0) +
      (i > 65 && i < 80 ? 0.018 : 0) +
      (i > 90 && i < 110 ? 0.022 : 0);

    // 간헐적 장대봉: r2 값 기반으로 일부 캔들에 큰 배율 적용 (최소 1.3배)
    const spike = r2 > 0.85 ? 2.5 : r2 > 0.7 ? 1.8 : r2 < 0.1 ? 2.2 : 1.3;
    // 마지막 2봉: 긴 양봉 강제
    const change = i >= NUM_DAYS - 2 ? 0.04 + r1 * 0.015 : (drift + (r1 - 0.48) * volatility) * spike;

    const open = price;
    const close = price * (1 + change);
    const wickUp = Math.abs(close - open) * (0.2 + r2 * 1.2);
    const wickDown = Math.abs(close - open) * (0.2 + r3 * 1.2);
    const high = Math.max(open, close) + wickUp;
    const low = Math.min(open, close) - wickDown;
    const changeAbs = Math.abs(change);
    const vol = 500000 + r1 * 800000 + changeAbs * 80000000;

    candles.push({ o: open, h: high, l: low, c: close, v: vol });
    price = close;
  }
  return candles;
};

const RAW_CANDLES = generateChartData();

// Map price/volume to SVG coordinates
const allPrices = RAW_CANDLES.flatMap((c) => [c.h, c.l]);
const minPrice = Math.min(...allPrices);
const maxPrice = Math.max(...allPrices);
const maxVol = Math.max(...RAW_CANDLES.map((c) => c.v));

const priceToY = (p: number) =>
  Math.round((PRICE_TOP + ((maxPrice - p) / (maxPrice - minPrice)) * (PRICE_BOTTOM - PRICE_TOP)) * 100) / 100;
const volToH = (v: number) =>
  Math.round((v / maxVol) * (VOL_BOTTOM - VOL_TOP) * 100) / 100;

const candleWidth = CHART_W / NUM_DAYS;

const CANDLES = RAW_CANDLES.map((c, i) => ({
  x: i * candleWidth + candleWidth / 2,
  o: priceToY(c.o),
  h: priceToY(c.h),
  l: priceToY(c.l),
  c: priceToY(c.c),
  v: volToH(c.v),
  bullish: c.c >= c.o,
}));


const SlidingDoorsHero = () => {
  const containerRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile (sm breakpoint = 640px)
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  // --- TIMELINE CONTROLS ---
  // Phase 1: Unlock Mechanism (search/calibrate)
  const dialRotate = useTransform(scrollYProgress, [0, 0.2], [0, 720]);

  // Status LED
  const statusColor = useTransform(
    scrollYProgress,
    [0.19, 0.2],
    ["#1a1a1a", "#00AE43"],
  );
  const statusGlow = useTransform(
    scrollYProgress,
    [0.19, 0.2],
    ["inset 0 1px 2px rgba(0,0,0,0.5)", "0 0 10px #00AE43"],
  );

  // Phase 2: Vertical Latch Retract (20% -> 25%)
  // Bars physically move up and down, clearing the screen
  const latchUp = useTransform(scrollYProgress, [0.2, 0.25], ["0%", "-120%"]);
  const latchDown = useTransform(scrollYProgress, [0.2, 0.25], ["0%", "120%"]);
  const latchOpacity = useTransform(scrollYProgress, [0.22, 0.25], [1, 0]); // Fade out at the end

  // Lock UI fades out
  const lockOpacity = useTransform(scrollYProgress, [0.22, 0.25], [1, 0]);

  // Phase 3: Doors Opening
  const xLeft = useTransform(scrollYProgress, [0.25, 0.55], ["0%", "-100%"]);
  const xRight = useTransform(scrollYProgress, [0.25, 0.55], ["0%", "100%"]);

  // Visual Effects
  const lightOpacity = useTransform(scrollYProgress, [0.25, 0.4], [0, 1]);
  const contentScale = useTransform(scrollYProgress, [0.25, 0.6], [0.8, 1]);
  const contentOpacity = useTransform(scrollYProgress, [0.25, 0.35], [0, 1]);

  // Background visibility (triggers when doors ~80% open)
  const [isBackgroundVisible, setIsBackgroundVisible] = useState(false);
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    setIsBackgroundVisible(latest >= 0.49);
  });

  // Door Chart Animation — left-to-right reveal (synced with Phase 1: 0 → 20%)
  const chartRevealW = useTransform(scrollYProgress, [0, 0.18], [0, CHART_W]);

  return (
    <section ref={containerRef} className={`relative ${isMobile ? "h-screen" : "h-[300vh]"}`}>
      <div className={`${isMobile ? "" : "sticky"} top-0 h-screen w-full overflow-hidden flex items-center justify-center`}>
        {/* 1. REVEALED CONTENT */}
        {/* Base background - always visible */}
        <div className="absolute inset-0 z-0 bg-randing-background-1" />

        {/* Green overlay - fades in after doors fully open (immediate on mobile) */}
        <motion.div
          initial={{ opacity: isMobile ? 1 : 0 }}
          animate={{ opacity: isMobile || isBackgroundVisible ? 1 : 0 }}
          transition={{ duration: isMobile ? 0 : 0.5, ease: "easeInOut" }}
          className="absolute inset-0 z-[1] bg-[radial-gradient(circle_at_center,#00AE43_0%,#006B54_100%)]"
        >
          {/* Film grain texture */}
          <GrainOverlay />
          {/* 상승 추세 모양 배경 - 차트처럼 꺾이는 띠 */}
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 1920 1080"
            preserveAspectRatio="xMidYMid slice"
            fill="none"
          >
            <polygon
              points="0,658 960,203 1267,350 1920,20
              1920,362 1267,692 960,545 0,1000"
              className="fill-randing-background-1"
            />
          </svg>
        </motion.div>

        {/* Content - visible as doors open (immediate on mobile) */}
        <motion.div
          style={isMobile ? { opacity: 1, scale: 1 } : { scale: contentScale, opacity: contentOpacity }}
          className="absolute inset-0 z-10"
        >
          {/* Text - absolute, positioned from top */}
          <div className="absolute top-[26%] mobile:top-[25%] sm:top-[26%] left-1/2 -translate-x-1/2 text-center px-4 w-full">
            <div className="text-black/70 font-medium tracking-[0.2em] uppercase mb-4 text-[10px] mobile:text-xs md:text-sm">
              AI Investment Analysis Platform
            </div>
            <h1 className="text-2xl mobile:text-4xl sm:text-6xl font-bold text-black tracking-tight leading-[1.35] break-keep">
              앞서가는 투자의 길, <br />
              <BrandText
                className="text-2xl mobile:text-4xl sm:text-6xl"
                style={{ WebkitTextStroke: "4px currentColor" }}
              >
                Tuno
              </BrandText>
              가 함께합니다.
            </h1>
            <div className="mt-8 max-w-2xl mx-auto text-randing-accent font-medium text-lg md:text-xl leading-relaxed break-keep">
              퀀트 시그널부터 매수 타이밍까지
              <br />
              새로운 투자 분석을 경험해 보세요.
            </div>
          </div>

          {/* Button - absolute, positioned from bottom */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="absolute bottom-168 sm:bottom-130 left-1/2 -translate-x-1/2"
          >
            <Link
              href="/analysis/quant"
              className="inline-block px-4 py-2 sm:px-6 sm:py-3 bg-white text-randing-accent rounded-full font-bold text-sm mobile:text-base sm:text-lg transition-colors shadow-[0_3px_15px_rgba(0,0,0,0.3)] sm:shadow-[0_6px_25px_rgba(0,0,0,0.5)]"
            >
              무료로 시작하기
            </Link>
          </motion.div>
        </motion.div>

        {/* 2. THE DOORS & LOCK UI (hidden on mobile via CSS) */}
        <div className="hidden sm:contents">
          <motion.div
            style={{ x: xLeft }}
            className="absolute top-0 left-0 w-1/2 h-full bg-randing-door z-20 flex items-center justify-end border-r border-[#333] overflow-hidden"
          >
            {/* Continuous Chart — Left Half */}
            <div className="absolute inset-y-0 left-0 w-[200%] z-0 opacity-30 pointer-events-none">
              <svg
                className="w-full h-full"
                viewBox={`0 0 ${CHART_W} ${CHART_H}`}
                preserveAspectRatio="none"
                fill="none"
              >
                <defs>
                  <clipPath id="chart-reveal">
                    <motion.rect x="0" y="0" height={CHART_H} style={{ width: chartRevealW }} />
                  </clipPath>
                </defs>
                <g clipPath="url(#chart-reveal)">
                  {/* Grid */}
                  <g>
                    {Array.from({ length: 12 }, (_, i) => (CHART_W / 12) * (i + 1)).map((x) => (
                      <line key={`v-${x}`} x1={x} y1={PRICE_TOP} x2={x} y2={VOL_BOTTOM} stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" strokeDasharray="2 6" />
                    ))}
                  </g>
                  {/* Volume */}
                  <g>
                    {CANDLES.map((c, i) => (
                      <rect key={`vol-${i}`} x={c.x - candleWidth * 0.35} y={VOL_BOTTOM - c.v} width={candleWidth * 0.7} height={c.v} fill="rgba(255,255,255,0.06)" rx="0.5" />
                    ))}
                  </g>
                  {/* Candles */}
                  <g>
                    {CANDLES.map((c, i) => {
                      const top = Math.min(c.o, c.c);
                      const h = Math.max(Math.abs(c.o - c.c), 0.5);
                      const bw = candleWidth * 0.6;
                      return (
                        <g key={i}>
                          <line x1={c.x} y1={c.h} x2={c.x} y2={top} stroke={c.bullish ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.2)"} strokeWidth="0.8" />
                          <line x1={c.x} y1={top + h} x2={c.x} y2={c.l} stroke={c.bullish ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.2)"} strokeWidth="0.8" />
                          <rect x={c.x - bw / 2} y={top} width={bw} height={h} fill={c.bullish ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.12)"} rx="0.3" />
                        </g>
                      );
                    })}
                  </g>
                </g>
              </svg>
            </div>

            <div className="relative z-10 mr-15 md:mr-26 text-right opacity-80">
              <p className="text-xs md:text-sm font-medium text-white/50 tracking-widest mb-1">투자의</p>
              <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter">
                TU
              </h2>
            </div>
          </motion.div>

          <motion.div
            style={{ x: xRight }}
            className="absolute top-0 right-0 w-1/2 h-full bg-randing-door z-20 flex items-center justify-start border-l border-[#333] overflow-hidden"
          >
            {/* Continuous Chart — Right Half */}
            <div className="absolute inset-y-0 right-0 w-[200%] z-0 opacity-30 pointer-events-none">
              <svg
                className="w-full h-full"
                viewBox={`0 0 ${CHART_W} ${CHART_H}`}
                preserveAspectRatio="none"
                fill="none"
              >
                <defs>
                  <clipPath id="chart-reveal">
                    <motion.rect x="0" y="0" height={CHART_H} style={{ width: chartRevealW }} />
                  </clipPath>
                </defs>
                <g clipPath="url(#chart-reveal)">
                  {/* Grid */}
                  <g>
                    {Array.from({ length: 12 }, (_, i) => (CHART_W / 12) * (i + 1)).map((x) => (
                      <line key={`v-${x}`} x1={x} y1={PRICE_TOP} x2={x} y2={VOL_BOTTOM} stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" strokeDasharray="2 6" />
                    ))}
                  </g>
                  {/* Volume */}
                  <g>
                    {CANDLES.map((c, i) => (
                      <rect key={`vol-${i}`} x={c.x - candleWidth * 0.35} y={VOL_BOTTOM - c.v} width={candleWidth * 0.7} height={c.v} fill="rgba(255,255,255,0.06)" rx="0.5" />
                    ))}
                  </g>
                  {/* Candles */}
                  <g>
                    {CANDLES.map((c, i) => {
                      const top = Math.min(c.o, c.c);
                      const h = Math.max(Math.abs(c.o - c.c), 0.5);
                      const bw = candleWidth * 0.6;
                      return (
                        <g key={i}>
                          <line x1={c.x} y1={c.h} x2={c.x} y2={top} stroke={c.bullish ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.2)"} strokeWidth="0.8" />
                          <line x1={c.x} y1={top + h} x2={c.x} y2={c.l} stroke={c.bullish ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.2)"} strokeWidth="0.8" />
                          <rect x={c.x - bw / 2} y={top} width={bw} height={h} fill={c.bullish ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.12)"} rx="0.3" />
                        </g>
                      );
                    })}
                  </g>
                </g>
              </svg>
            </div>

            <div className="relative z-10 ml-14 md:ml-24 text-left opacity-80">
              <p className="text-xs md:text-sm font-medium text-white/50 tracking-widest mb-1">노하우</p>
              <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter">
                NO
              </h2>
            </div>
          </motion.div>

          {/* 3. CENTER LOCK UI */}
          <div className="absolute top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
            {/* === A. VERTICAL LATCH BARS (Mechanical Split) === */}
            {/* Top Latch - Moves UP */}
            <motion.div
              style={{ y: latchUp, opacity: latchOpacity }}
              className="absolute bottom-1/2 left-1/2 -translate-x-1/2 w-[2px] h-[50vh] bg-[#444] origin-bottom z-10 flex flex-col justify-end items-center"
            >
              {/* Connection Joint */}
              <div className="w-1.5 h-4 bg-[#666] mb-0 rounded-full" />
            </motion.div>

            {/* Bottom Latch - Moves DOWN */}
            <motion.div
              style={{ y: latchDown, opacity: latchOpacity }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 w-[2px] h-[50vh] bg-[#444] origin-top z-10 flex flex-col justify-start items-center"
            >
              {/* Connection Joint */}
              <div className="w-1.5 h-4 bg-[#666] mt-0 rounded-full" />
            </motion.div>

            {/* === B. THE LUXURY KNOB === */}
            <motion.div
              style={{ opacity: lockOpacity }}
              className="relative w-24 h-24 md:w-36 md:h-36 flex items-center justify-center z-20"
            >
              {/* Outer Bezel & Ticks (Fixed) */}
              <div className="absolute inset-0 rounded-full border border-[#444] bg-[#222]" />
              <div className="absolute inset-2 rounded-full flex items-center justify-center">
                <svg
                  className="absolute inset-0 w-full h-full"
                  viewBox="0 0 100 100"
                >
                  {[...Array(60)].map((_, i) => (
                    <line
                      key={i}
                      x1="50"
                      y1="4"
                      x2="50"
                      y2="7"
                      stroke={i % 5 === 0 ? "#888" : "#444"}
                      strokeWidth={i % 5 === 0 ? "1.5" : "0.5"}
                      transform={`rotate(${i * 6} 50 50)`}
                    />
                  ))}
                </svg>
              </div>

              {/* Indicator */}
              <div className="absolute top-[-1px] md:top-[-2px] z-20">
                <div className="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-t-[4px] border-t-randing-accent md:border-l-[5px] md:border-r-[5px] md:border-t-[6px]" />
              </div>

              {/* Rotating Knob */}
              <motion.div
                style={{ rotate: dialRotate }}
                className="relative z-10 w-16 h-16 md:w-24 md:h-24 rounded-full shadow-[0_5px_15px_rgba(0,0,0,0.8)] flex items-center justify-center bg-[#181818]"
              >
                <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_45deg,#111,#333,#111,#333,#111)] opacity-80" />
                <div className="absolute inset-[1px] rounded-full border border-[#ffffff10]" />
                <div className="absolute inset-0 rounded-full border-[1px] border-dashed border-[#444] opacity-30" />
                <div className="absolute inset-1 rounded-full bg-[linear-gradient(135deg,rgba(255,255,255,0.03)_0%,rgba(0,0,0,0.1)_50%,rgba(255,255,255,0.02)_100%)]" />
                <div className="absolute w-8 h-8 md:w-12 md:h-12 rounded-full bg-gradient-to-b from-[#111] to-[#000] shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)] border border-[#222]" />

                <motion.div
                  style={{ backgroundColor: statusColor, boxShadow: statusGlow }}
                  className="relative z-20 w-1.5 h-1.5 rounded-full"
                />
                <div className="absolute top-1 md:top-2 w-[2px] h-2 md:h-3 bg-[#444] rounded-full shadow-[inset_0_1px_2px_rgba(0,0,0,1)] z-20">
                  <div className="w-full h-full bg-randing-accent opacity-80" />
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SlidingDoorsHero;
