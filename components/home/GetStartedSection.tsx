"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";

const headingText = "지금, 시작하세요.";
const subText =
  "복잡한 투자 분석은 Tuno에게 맡기고\n당신은 결정만 하세요.";

/* ── Character stagger variants ── */
const charVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.045,
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  }),
};

/* ── CTA Button ── */
const CTAButton = ({ children }: { children: React.ReactNode }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Link
        href="/analysis/quant"
        className="group relative inline-flex items-center gap-2 px-10 py-4 bg-white text-randing-accent rounded-full font-bold text-lg cursor-pointer transition-shadow duration-500 hover:shadow-[0_0_50px_rgba(255,255,255,0.25)]"
      >
        {children}
        <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform duration-300" />
      </Link>
    </motion.div>
  );
};

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
      className="absolute inset-0 pointer-events-none opacity-[0.08] mix-blend-overlay"
      style={{ backgroundSize: "200px 200px" }}
    />
  );
};

/* ── Main Section ── */
const GetStartedSection = () => {
  return (
    <section
      className="relative py-36 md:py-48 bg-randing-accent overflow-hidden"
    >
      {/* Dot grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, white 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Film grain texture */}
      <GrainOverlay />

      {/* Depth gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/[0.04] via-transparent to-black/[0.08] pointer-events-none" />

      {/* Soft top-center glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[50%] bg-white/[0.06] rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 sm:px-8 text-center">
        {/* Staggered heading */}
        <motion.h2
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="text-4xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight mb-8 break-keep"
        >
          {headingText.split("").map((char, i) => (
            <motion.span
              key={i}
              custom={i}
              variants={charVariants}
              className="inline-block"
              style={char === " " ? { width: "0.3em" } : undefined}
            >
              {char}
            </motion.span>
          ))}
        </motion.h2>

        {/* Sub copy */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          viewport={{ once: true }}
          className="text-white/75 text-base md:text-xl leading-relaxed mb-14 whitespace-pre-line break-keep"
        >
          {subText}
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          viewport={{ once: true }}
          className="inline-block relative"
        >
          {/* Idle breathing glow */}
          <motion.span
            className="absolute inset-0 rounded-full pointer-events-none"
            animate={{
              boxShadow: [
                "0 0 20px 4px rgba(255,255,255,0)",
                "0 0 40px 12px rgba(255,255,255,0.50)",
                "0 0 20px 4px rgba(255,255,255,0)",
              ],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <CTAButton>무료로 시작하기</CTAButton>
        </motion.div>

        {/* Bottom note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          viewport={{ once: true }}
          className="mt-8 text-sm text-white/70"
        >
          가입비 무료 · 간편한 시작
        </motion.p>
      </div>
    </section>
  );
};

export default GetStartedSection;
