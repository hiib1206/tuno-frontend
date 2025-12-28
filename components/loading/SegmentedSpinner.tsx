"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface SegmentedSpinnerProps {
  className?: string; // SVG 전체에 적용할 클래스 (크기 조절용)
  strokeClassName?: string; // stroke 색상 변경용
}

/**
 * Segmented Spinner - 3개의 호(arc)로 구성된 로딩 스피너
 */
export const SegmentedSpinner = ({
  className,
  strokeClassName = "stroke-accent/80",
}: SegmentedSpinnerProps) => (
  <motion.svg
    viewBox="0 0 40 40"
    className={cn("w-10 h-10", className)}
    animate={{ rotate: 360 }}
    transition={{ repeat: Infinity, duration: 1.7, ease: "linear" }}
  >
    {/* Arc 1: 20° ~ 100° */}
    <path
      d="M 25.47 4.96 A 16 16 0 0 1 35.76 22.78"
      className={strokeClassName}
      strokeWidth="4"
      strokeLinecap="round"
      fill="none"
    />
    {/* Arc 2: 140° ~ 220° */}
    <path
      d="M 30.29 32.26 A 16 16 0 0 1 9.71 32.26"
      className={strokeClassName}
      strokeWidth="4"
      strokeLinecap="round"
      fill="none"
    />
    {/* Arc 3: 260° ~ 340° */}
    <path
      d="M 4.24 22.78 A 16 16 0 0 1 14.53 4.96"
      className={strokeClassName}
      strokeWidth="4"
      strokeLinecap="round"
      fill="none"
    />
  </motion.svg>
);

export default SegmentedSpinner;
