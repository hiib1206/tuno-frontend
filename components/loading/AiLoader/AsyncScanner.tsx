"use client";

import { motion, useAnimation } from "framer-motion";
import { BarChart2, FileText, Image as ImageIcon } from "lucide-react";
import { useEffect, useState } from "react";

// =================================================================
// 1. Medium Magnifier Component (Slate Gray)
// =================================================================
function MediumMagnifier({ className = "" }: { className?: string }) {
  return (
    <div className={`relative w-12 h-12 ${className}`}>
      <div className="absolute inset-0 rounded-full border-[4px] border-muted-foreground bg-white/10 dark:bg-white/5 backdrop-blur-[2px] shadow-lg dark:shadow-none z-10 overflow-hidden">
      </div>
      <div className="absolute top-[78%] left-[78%] w-[5px] h-10 bg-muted-foreground rounded-full -rotate-45 origin-top z-0" />
    </div>
  );
}

// =================================================================
// 2. Main Async Scanner Component (Reverted to Original Logic)
// =================================================================
export default function AsyncScanner() {
  // 문서 상태
  const [docs, setDocs] = useState([
    {
      id: 1,
      type: "text",
      color: "bg-background-1",
      icon: FileText,
      accent: "bg-indigo-100 dark:bg-indigo-900/50",
      text: "text-indigo-500 dark:text-indigo-400",
    },
    {
      id: 2,
      type: "image",
      color: "bg-background-1",
      icon: ImageIcon,
      accent: "bg-rose-100 dark:bg-rose-900/50",
      text: "text-rose-500 dark:text-rose-400",
    },
    {
      id: 3,
      type: "chart",
      color: "bg-background-1",
      icon: BarChart2,
      accent: "bg-emerald-100 dark:bg-emerald-900/50",
      text: "text-emerald-500 dark:text-emerald-400",
    },
    {
      id: 4,
      type: "text2",
      color: "bg-background-1",
      icon: FileText,
      accent: "bg-amber-100 dark:bg-amber-900/50",
      text: "text-amber-500 dark:text-amber-400",
    },
    {
      id: 5,
      type: "text",
      color: "bg-background-1",
      icon: FileText,
      accent: "bg-sky-100 dark:bg-sky-900/50",
      text: "text-sky-500 dark:text-sky-400",
    },
  ]);

  // 애니메이션 컨트롤러 (수동 제어용)
  const glassControls = useAnimation();

  // 이 상태값으로 문서들의 위치 애니메이션을 트리거합니다.
  // 하지만 Framer Motion의 layout prop과는 다르게, 직접 제어하기 위해
  // 여기서는 단순히 '상태 변화'만 일으키고, 실제 타이밍은 useEffect Loop에서 관리합니다.

  useEffect(() => {
    let isCancelled = false;

    const runSequence = async () => {
      while (!isCancelled) {
        // ----------------------------------------------------
        // STEP 1: 문서 이동 (Move)
        // ----------------------------------------------------
        // 문서를 한 칸 이동시킵니다.
        setDocs((prev) => {
          const newDocs = [...prev];
          const last = newDocs.pop();
          if (last) newDocs.unshift(last);
          return newDocs;
        });

        // 문서가 이동하는 애니메이션 시간(0.5s) + 안정화 시간(0.1s) 대기
        await new Promise((resolve) => setTimeout(resolve, 600));
        if (isCancelled) break;

        // ----------------------------------------------------
        // STEP 2: 스캔 시작 (Scan) - 돋보기 애니메이션
        // ----------------------------------------------------
        // 돋보기가 Z자로 움직이는 애니메이션 실행
        // await controls.start(...)를 하면 애니메이션이 끝날 때까지 기다려줍니다. (가장 정확함)
        await glassControls.start({
          x: [-24, 24, -24, 24, -24],
          y: [-45, -45, 55, 55, -45],
          transition: { duration: 1.5, ease: "easeInOut" },
        });
        if (isCancelled) break;

        // ----------------------------------------------------
        // STEP 3: 복귀 (Return) - 이미 마지막 좌표가 시작점이므로 불필요
        // ----------------------------------------------------
        // 하지만 잠시 대기(Idle)하는 시간을 주어 여유를 줍니다.
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    };

    runSequence();

    return () => {
      isCancelled = true;
    };
  }, [glassControls]);

  return (
    <div className="relative w-[440px] h-60 flex flex-col items-center justify-center overflow-hidden rounded-2xl">
      {/* 문서 컨테이너 */}
      <div className="relative w-full h-full flex items-center justify-center">
        <div
          className="flex gap-4 items-center absolute"
          style={{ left: "50%", transform: "translateX(-50%)" }}
        >
          {/* AnimatePresence 제거: layout animation이 자동으로 처리하므로 불필요하거나 충돌 가능성 배제 */}
          {docs.map((doc, index) => {
            const isCenter = index === 2;
            const isVisible = index >= 1 && index <= 3;

            return (
              <motion.div
                layout // 자동으로 위치 변경을 애니메이션화 (0.5초 디폴트 혹은 설정 가능)
                transition={{ duration: 0.5, ease: "easeInOut" }} // 이동 시간 명시
                key={doc.id}
                initial={false} // 초기 렌더링 시 애니메이션 생략
                animate={{
                  opacity: isVisible ? (isCenter ? 1 : 0.6) : 0,
                  scale: isCenter ? 1.05 : 0.9,
                  filter: isCenter ? "blur(0px)" : "blur(1.5px)",
                  x: 0, // layout prop이 좌표 계산하므로 항상 0 유지하면 됨
                }}
                className={`relative flex-shrink-0 w-32 h-44 border border-border-2 rounded-xl shadow-md p-4 flex flex-col gap-3 ${doc.color}`}
              >
                {/* 문서 헤더 */}
                <div className="flex justify-between items-start">
                  <div
                    className={`w-8 h-8 rounded-lg ${doc.accent} flex items-center justify-center`}
                  >
                    <doc.icon className={`w-4 h-4 ${doc.text}`} />
                  </div>
                  <div className="w-8 h-2 rounded-full bg-skeleton-3" />
                </div>

                {/* 문서 내용 */}
                {(doc.type === "text" || doc.type === "text2") && (
                  <div className="space-y-2 mt-1">
                    <div className="w-full h-2 bg-skeleton-3 rounded-sm" />
                    <div className="w-full h-2 bg-skeleton-3 rounded-sm" />
                    <div className="w-2/3 h-2 bg-skeleton-3 rounded-sm" />
                    <div className="w-full h-10 bg-background-2 border border-border-2 rounded-md mt-1" />
                  </div>
                )}
                {doc.type === "chart" && (
                  <div className="flex items-end gap-1.5 h-16 mt-auto border-b border-border-2 pb-1">
                    <div className="w-3 h-7 bg-skeleton-3 rounded-t-sm" />
                    <div className="w-3 h-11 bg-emerald-100 dark:bg-emerald-800/50 rounded-t-sm" />
                    <div className="w-3 h-5 bg-skeleton-3 rounded-t-sm" />
                    <div className="w-3 h-13 bg-emerald-200 dark:bg-emerald-700/50 rounded-t-sm" />
                    <div className="w-3 h-9 bg-skeleton-3 rounded-t-sm" />
                  </div>
                )}
                {doc.type === "image" && (
                  <div className="w-full h-full bg-rose-50 dark:bg-rose-900/30 rounded-lg flex items-center justify-center border border-rose-100 dark:border-rose-800/30 overflow-hidden">
                    <div className="w-8 h-8 rounded-full bg-rose-200/50 dark:bg-rose-700/30" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* 돋보기 (컨트롤러로 제어) */}
        <div className="absolute z-30 pointer-events-none">
          <motion.div
            initial={{ x: -24, y: -45 }} // 시작 위치 고정
            animate={glassControls} // 컨트롤러 연결
          >
            <MediumMagnifier className="drop-shadow-2xl" />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
