"use client";

import { useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const STATS = [
  { label: "분석된 데이터", value: 50000000, suffix: "+", prefix: "" },
  { label: "예측 성공률", value: 94, suffix: "%", prefix: "" },
  { label: "누적 수익률", value: 320, suffix: "%", prefix: "+" },
  { label: "활성 사용자", value: 15000, suffix: "+", prefix: "" },
];

function Counter({
  from,
  to,
  duration,
  prefix,
  suffix,
}: {
  from: number;
  to: number;
  duration: number;
  prefix: string;
  suffix: string;
}) {
  const [count, setCount] = useState(from);
  const nodeRef = useRef(null);
  const isInView = useInView(nodeRef, { once: true, margin: "-50px" });

  useEffect(() => {
    if (!isInView) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);

      // Ease out quart
      const easeProgress = 1 - Math.pow(1 - progress, 4);

      setCount(Math.floor(from + (to - from) * easeProgress));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [isInView, from, to, duration]);

  return (
    <span
      ref={nodeRef}
      className="text-4xl md:text-6xl font-bold text-[var(--color-accent)]"
    >
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

export default function TrustStats() {
  return (
    <section id="trust" className="py-24 px-6 bg-background">
      <div className="container mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
          {STATS.map((stat) => (
            <div key={stat.label} className="flex flex-col gap-2">
              <Counter
                from={0}
                to={stat.value}
                duration={2}
                prefix={stat.prefix}
                suffix={stat.suffix}
              />
              <span className="text-muted-foreground font-medium">
                {stat.label}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-24 text-center">
          <h3 className="text-2xl font-bold mb-8">
            Trusted by Investors Worldwide
          </h3>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            {/* Logos placeholders - using text for now as per constraints */}
            {[
              "Goldman Sachs",
              "Morgan Stanley",
              "J.P. Morgan",
              "BlackRock",
            ].map((name) => (
              <span key={name} className="text-xl font-bold">
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
