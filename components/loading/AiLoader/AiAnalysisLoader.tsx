"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

// =================================================================
// Configuration & Variants
// =================================================================
const CYCLE_DURATION = 4800; // Time per slide (ms)

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.35,
      delayChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: "easeOut" } },
} as const;

// =================================================================
// Shared Skeleton Components
// =================================================================
const SkeletonBar = ({
  width = "w-full",
  height = "h-3",
  color = "bg-al-skeleton-1",
  className = "",
}) => (
  <motion.div
    variants={itemVariants}
    className={`${width} ${height} ${color} rounded-full ${className}`}
  />
);

const SkeletonCircle = ({ size = "w-8 h-8", color = "bg-al-skeleton-1" }) => (
  <motion.div
    variants={itemVariants}
    className={`${size} ${color} rounded-full flex-shrink-0`}
  />
);

// =================================================================
// 1. Line Chart Slide
// =================================================================
const LineChartSlide = () => (
  <motion.div
    variants={containerVariants}
    initial="hidden"
    whileInView="show"
    viewport={{ once: false, amount: 0.3 }}
    className="w-full h-full flex flex-col p-6 gap-3 bg-background-1"
  >
    <div className="flex items-center gap-3 mb-2">
      <SkeletonCircle size="w-8 h-8" color="bg-blue-100" />
      <div className="flex flex-col gap-2 flex-1">
        <SkeletonBar width="w-24" height="h-2.5" color="bg-blue-200/50" />
        <SkeletonBar width="w-40" height="h-2.5" color="bg-al-skeleton-1" />
      </div>
      <SkeletonBar
        width="w-16"
        height="h-6"
        color="bg-al-surface"
        className="rounded-lg"
      />
    </div>

    <motion.div
      variants={itemVariants}
      className="flex-1 bg-al-surface rounded-xl relative p-4 flex items-end overflow-hidden border border-al-border/50"
    >
      {/* Volume Bars */}
      <div className="absolute bottom-0 left-4 right-4 h-1/3 flex items-end justify-between gap-1 opacity-40">
        {[30, 50, 20, 60, 40, 70, 30, 50, 80, 40, 60, 30].map((h, i) => (
          <motion.div
            key={i}
            className="w-full bg-blue-200/50 rounded-t-sm"
            initial={{ height: 0 }}
            animate={{ height: `${h}%` }}
            transition={{ duration: 0.4, delay: 1.2 + i * 0.08 }}
          />
        ))}
      </div>

      {/* Main Price Line */}
      <svg className="w-full h-[75%] overflow-visible z-10 px-1 relative">
        <motion.path
          d="M 0 90 C 40 90, 60 30, 100 50 C 140 70, 170 20, 220 40 C 270 60, 300 10, 340 30"
          fill="none"
          stroke="#93c5fd"
          strokeWidth="3.5"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2.1, ease: "easeInOut", delay: 1.3 }}
        />

        {/* Float Tag 1 */}
        <motion.foreignObject
          x="40"
          y="20"
          width="60"
          height="24"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.1 }}
        >
          <div className="px-2 py-0.5 bg-background-1 shadow-sm rounded-full border border-blue-100 flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            <div className="h-1.5 w-6 bg-al-skeleton-2 rounded-full" />
          </div>
        </motion.foreignObject>

        {/* Float Tag 2 */}
        <motion.foreignObject
          x="280"
          y="-10"
          width="60"
          height="24"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.7 }}
        >
          <div className="px-2 py-0.5 bg-blue-500 shadow-md rounded-full flex items-center justify-center">
            <span className="text-[8px] font-bold text-white">MAX</span>
          </div>
        </motion.foreignObject>
      </svg>
    </motion.div>

    <div className="flex justify-between px-2">
      {[...Array(5)].map((_, i) => (
        <SkeletonBar key={i} width="w-8" height="h-2" color="bg-al-skeleton-1" />
      ))}
    </div>
  </motion.div>
);

// =================================================================
// 2. Pie Chart Slide
// =================================================================
const PieChartSlide = () => {
  const radius = 32;
  const circumference = 2 * Math.PI * radius;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: false, amount: 0.3 }}
      className="w-full h-full flex flex-col p-6 gap-2 bg-background-1"
    >
      <div className="flex justify-between items-center mb-2">
        <div className="space-y-2 flex-1">
          <SkeletonBar width="w-28" height="h-2.5" color="bg-violet-200/50" />
          <SkeletonBar width="w-20" height="h-2.5" color="bg-al-skeleton-1" />
        </div>
        <SkeletonBar
          width="w-14"
          height="h-6"
          color="bg-violet-50"
          className="rounded-lg"
        />
      </div>

      <div className="flex-1 flex items-center justify-center gap-3">
        {/* Chart */}
        <motion.div
          variants={itemVariants}
          className="relative w-44 h-44 flex-shrink-0"
        >
          <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
            <circle
              cx="64"
              cy="64"
              r={radius}
              fill="none"
              className="stroke-al-ring"
              strokeWidth="24"
            />

            {/* Segments */}
            {/* 1. Light Violet (40%) - Main base */}
            <motion.circle
              cx="64"
              cy="64"
              r={radius}
              fill="none"
              stroke="#ddd6fe"
              strokeWidth="24"
              strokeDasharray={`${circumference} ${circumference}`}
              initial={{ strokeDashoffset: circumference }}
              animate={{
                strokeDashoffset: circumference - circumference * 0.4,
              }}
              transition={{ duration: 0.7, delay: 1.2, ease: "linear" }}
            />
            {/* 2. Medium Violet (30%) - Starts after 1st finishes (1.4 + 0.8 = 2.2s) */}
            <motion.circle
              cx="64"
              cy="64"
              r={radius}
              fill="none"
              stroke="#c4b5fd"
              strokeWidth="24"
              strokeDasharray={`${circumference} ${circumference}`}
              initial={{ strokeDashoffset: circumference }}
              animate={{
                strokeDashoffset: circumference - circumference * 0.3,
              }}
              transition={{ duration: 0.5, delay: 1.9, ease: "linear" }}
              style={{ rotate: 144, transformOrigin: "center" }}
            />
            {/* 3. Dark Violet (30%) - Starts after 2nd finishes (2.2 + 0.6 = 2.8s) */}
            <motion.circle
              cx="64"
              cy="64"
              r={radius}
              fill="none"
              stroke="#a78bfa"
              strokeWidth="24"
              strokeDasharray={`${circumference} ${circumference}`}
              initial={{ strokeDashoffset: circumference }}
              animate={{
                strokeDashoffset: circumference - circumference * 0.3,
              }}
              transition={{ duration: 0.5, delay: 2.4, ease: "linear" }}
              style={{ rotate: 252, transformOrigin: "center" }}
            />
          </svg>
        </motion.div>

        {/* Dense List */}
        <div className="flex flex-col gap-2.5 flex-1 min-w-0 justify-center">
          <motion.div
            variants={itemVariants}
            className="flex items-center gap-2"
          >
            <div className="w-3 h-3 rounded bg-violet-400 flex-shrink-0" />
            <SkeletonBar width="flex-1" height="h-2.5" color="bg-al-skeleton-2" />
            <SkeletonBar
              width="w-8"
              height="h-4"
              color="bg-violet-100"
              className="rounded-md"
            />
          </motion.div>
          <motion.div
            variants={itemVariants}
            className="flex items-center gap-1.5"
          >
            <SkeletonBar width="w-10" height="h-2" color="bg-al-skeleton-1" />
            <div className="flex gap-1">
              <SkeletonBar
                width="w-6"
                height="h-4"
                color="bg-al-surface"
                className="rounded-md border border-al-border"
              />
              <SkeletonBar
                width="w-8"
                height="h-4"
                color="bg-al-surface"
                className="rounded-md border border-al-border"
              />
              <SkeletonBar
                width="w-5"
                height="h-4"
                color="bg-al-surface"
                className="rounded-md border border-al-border"
              />
            </div>
          </motion.div>
          <motion.div
            variants={itemVariants}
            className="flex items-center gap-2"
          >
            <SkeletonBar width="w-8" height="h-2" color="bg-al-skeleton-1" />
            <div className="flex-1 h-1.5 bg-al-surface rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-violet-300"
                initial={{ width: 0 }}
                animate={{ width: "70%" }}
                transition={{ duration: 0.85, delay: 1.35 }}
              />
            </div>
          </motion.div>
          <motion.div
            variants={itemVariants}
            className="flex items-center gap-2"
          >
            <div className="w-2 h-2 rounded-full bg-al-skeleton-3 flex-shrink-0" />
            <SkeletonBar width="w-4/5" height="h-2" color="bg-al-skeleton-1" />
          </motion.div>
          <motion.div
            variants={itemVariants}
            className="flex items-center justify-between"
          >
            <SkeletonBar width="w-1/2" height="h-2" color="bg-al-skeleton-1" />
            <div className="flex gap-1.5">
              <div className="w-4 h-4 rounded-full bg-al-skeleton-2" />
              <div className="w-4 h-4 rounded-full bg-violet-200" />
              <div className="w-4 h-4 rounded-full bg-al-skeleton-1" />
            </div>
          </motion.div>
          <motion.div
            variants={itemVariants}
            className="flex items-center justify-between"
          >
            <SkeletonBar width="w-1/2" height="h-2" color="bg-al-skeleton-1" />
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />
              <SkeletonBar width="w-6" height="h-2" color="bg-al-skeleton-1" />
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

// =================================================================
// 3. Document/Table Slide
// =================================================================
const TableSlide = () => (
  <motion.div
    variants={containerVariants}
    initial="hidden"
    whileInView="show"
    viewport={{ once: false, amount: 0.3 }}
    className="w-full h-full flex flex-col p-6 gap-4 bg-background-1"
  >
    <div className="flex justify-between items-center pb-2 border-b border-al-border">
      <div className="flex gap-2">
        <SkeletonBar width="w-20" height="h-3" color="bg-al-skeleton-3" />
        <SkeletonBar width="w-12" height="h-3" color="bg-al-skeleton-2" />
      </div>
      <SkeletonCircle size="w-6 h-6" color="bg-al-skeleton-1" />
    </div>

    <div className="flex-1 flex flex-col gap-3 justify-center">
      {/* Summary Card */}
      <motion.div
        variants={itemVariants}
        className="p-3 bg-al-surface rounded-xl border border-al-border/50"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-background-1 border border-al-border flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-blue-100" />
            </div>
            <div className="space-y-1.5">
              <SkeletonBar width="w-24" height="h-2.5" color="bg-al-skeleton-3" />
              <SkeletonBar width="w-16" height="h-2" color="bg-al-skeleton-2" />
            </div>
          </div>
          <SkeletonBar
            width="w-12"
            height="h-6"
            color="bg-blue-50"
            className="rounded-md"
          />
        </div>
        <SkeletonBar width="w-full" height="h-1.5" color="bg-al-skeleton-2" />
      </motion.div>

      {/* Trend Row */}
      <motion.div
        variants={itemVariants}
        className="flex items-center justify-between px-1 py-1"
      >
        <div className="space-y-2">
          <SkeletonBar width="w-16" height="h-2" color="bg-al-skeleton-3" />
          <SkeletonBar width="w-24" height="h-1.5" color="bg-al-skeleton-1" />
        </div>
        <div className="h-6 flex items-end gap-1">
          {[30, 50, 40, 70, 50, 80, 60].map((h, i) => (
            <motion.div
              key={i}
              className="w-1.5 bg-blue-200 rounded-sm"
              initial={{ height: 0 }}
              animate={{ height: `${h}%` }}
              transition={{ duration: 0.5, delay: 1.0 + i * 0.08 }}
            />
          ))}
        </div>
      </motion.div>

      {/* Grid Metrics */}
      <div className="grid grid-cols-2 gap-3">
        <motion.div
          variants={itemVariants}
          className="p-2.5 border border-al-border rounded-lg flex flex-col gap-2"
        >
          <SkeletonBar width="w-8" height="h-1.5" color="bg-al-skeleton-2" />
          <div className="flex items-end justify-between">
            <div className="w-6 h-6 rounded bg-al-surface" />
            <SkeletonBar width="w-10" height="h-3" color="bg-al-skeleton-3" />
          </div>
        </motion.div>
        <motion.div
          variants={itemVariants}
          className="p-2.5 border border-al-border rounded-lg flex flex-col gap-2"
        >
          <SkeletonBar width="w-8" height="h-1.5" color="bg-al-skeleton-2" />
          <div className="flex items-end justify-between">
            <div className="w-6 h-6 rounded bg-al-surface" />
            <SkeletonBar width="w-10" height="h-3" color="bg-al-skeleton-3" />
          </div>
        </motion.div>
      </div>

      {/* Footer List */}
      <motion.div variants={itemVariants} className="space-y-2 px-1 pt-1">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-al-skeleton-3" />
          <SkeletonBar width="flex-1" height="h-1.5" color="bg-al-skeleton-1" />
        </div>
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-al-skeleton-3" />
          <SkeletonBar width="w-4/5" height="h-1.5" color="bg-al-skeleton-1" />
        </div>
      </motion.div>
    </div>
  </motion.div>
);

// =================================================================
// 4. Bar Chart Slide
// =================================================================
const BarChartSlide = () => (
  <motion.div
    variants={containerVariants}
    initial="hidden"
    whileInView="show"
    viewport={{ once: false, amount: 0.3 }}
    className="w-full h-full flex flex-col p-6 gap-3 bg-background-1"
  >
    <div className="flex justify-between items-end mb-2">
      <div className="space-y-2">
        <SkeletonBar width="w-36" height="h-2.5" color="bg-al-skeleton-1" />
        <SkeletonBar width="w-24" height="h-2.5" color="bg-emerald-200/50" />
        <SkeletonBar width="w-48" height="h-2.5" color="bg-al-skeleton-1" />
      </div>
      <SkeletonBar
        width="w-12"
        height="h-12"
        color="bg-al-surface"
        className="rounded-lg"
      />
    </div>

    <motion.div
      variants={itemVariants}
      className="flex-1 flex items-end justify-between px-1 gap-1"
    >
      {[
        20, 35, 25, 45, 30, 55, 40, 65, 50, 75, 60, 85, 55, 90, 70, 50, 40, 60,
        35, 45,
      ].map((h, i) => (
        <div
          key={i}
          className="flex-1 flex flex-col items-center gap-1 h-full justify-end group"
        >
          <motion.div
            className={`w-full rounded-sm ${i % 3 === 0 ? "bg-emerald-300" : "bg-emerald-100"}`}
            initial={{ height: 0 }}
            animate={{ height: `${h}%` }}
            transition={{
              duration: 1.3,
              delay: 1.2 + i * 0.08,
              type: "spring",
              stiffness: 50,
              damping: 18,
            }}
          />
        </div>
      ))}
    </motion.div>

    <div className="flex items-center justify-between border-t border-al-border pt-3 mt-1">
      <div className="flex gap-2">
        <SkeletonBar width="w-16" height="h-2.5" color="bg-al-skeleton-1" />
        <SkeletonBar width="w-16" height="h-2.5" color="bg-al-skeleton-1" />
      </div>
      <SkeletonBar width="w-10" height="h-2.5" color="bg-emerald-100" />
    </div>
  </motion.div>
);

// =================================================================
// MAIN EXPORT COMPONENT: AiAnalysisLoader
// =================================================================
export default function AiAnalysisLoader() {
  const [page, setPage] = useState(0);

  // Auto-advance logic
  useEffect(() => {
    const timer = setInterval(() => {
      setPage((prev) => (prev + 1) % 4);
    }, CYCLE_DURATION);
    return () => clearInterval(timer);
  }, []);

  const slides = [
    <LineChartSlide key="line" />,
    <PieChartSlide key="pie" />,
    <TableSlide key="table" />,
    <BarChartSlide key="bar" />,
  ];

  return (
    // The container is flexible (100% width/height).
    // It relies on the parent element to define its size.
    <div className="w-full h-full min-w-[320px] min-h-[280px] bg-background-1 rounded-[24px] overflow-hidden relative dark:opacity-70">
      <AnimatePresence mode="wait">
        <motion.div
          key={page}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          {slides[page]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
