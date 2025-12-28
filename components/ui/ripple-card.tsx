"use client";

import { motion } from "framer-motion";
import { ReactNode, useEffect, useRef, useState } from "react";

interface RippleCardProps {
  children: ReactNode;
  rippleColor?: string;
  className?: string;
  rippleDuration?: number;
  scale?: number;
}

export default function RippleCard({
  children,
  rippleColor = "bg-background-2",
  className = "",
  rippleDuration = 1.2,
  scale = 2.5,
}: RippleCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rippleSize, setRippleSize] = useState(500);

  useEffect(() => {
    const updateRippleSize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        // 대각선 길이 계산: √(width² + height²)
        const diagonal = Math.sqrt(width * width + height * height);
        // 대각선보다 약간 크게 설정 (1.5배 정도면 충분)
        setRippleSize(diagonal * 1.5);
      }
    };

    updateRippleSize();

    // 리사이즈 이벤트 리스너 추가
    const resizeObserver = new ResizeObserver(updateRippleSize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <motion.div
      ref={containerRef}
      initial="rest"
      whileHover="hover"
      animate="rest"
      className={`relative overflow-hidden ${className}`}
    >
      {/* 내용 (children) */}
      <div className="relative z-20 h-full">{children}</div>

      {/* 중앙에서 퍼지는 물결(Ripple) 레이어 - 배경색도 함께 처리 */}
      <motion.div
        variants={{
          rest: {
            scale: 0,
            opacity: 0,
            x: "-50%",
            y: "-50%",
          },
          hover: {
            scale: scale,
            opacity: 1,
            transition: {
              duration: rippleDuration,
              ease: [0.2, 0, 0.2, 1],
            },
          },
        }}
        className={`absolute left-1/2 top-1/2 z-10 rounded-full ${rippleColor}`}
        style={{
          originX: 0.5,
          originY: 0.5,
          width: `${rippleSize}px`,
          height: `${rippleSize}px`,
        }}
      />
    </motion.div>
  );
}
