"use client";

import { cn } from "@/lib/utils";
import Lottie from "lottie-react";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const navItems = [
  {
    href: "/analysis/individual/snapback",
    label: "지지선 예측",
    aiName: "Snapback AI",
    description:
      "상승 종목이 조정받는 구간에서 반등 가능성이 높은 가격대를 예측하는 회귀(Regression) 기반 AI 모델입니다. \n과거 가격 흐름, 변동성, 거래 패턴을 종합적으로 학습해 '몇 % 하락에서 반등이 나올지'를 1~3개의 지지선(하락률/가격)으로 제시합니다. \n 종목 성향을 분류하는 방식이 아니라, 실제 투자 판단에 유용한 지점 중심으로 신호를 제공해 리스크 관리와 타점 선정에 도움을 줍니다.",
  },
  {
    href: "/analysis/individual/breakthrough",
    label: "돌파 예측",
    aiName: "Breakthrough AI",
    description: "준비 중입니다.",
    disabled: true,
  },
];

export default function AnalysisIndividualLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [animationData, setAnimationData] = useState<any>(null);
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(true);

  // 현재 선택된 탭 정보
  const activeItem = navItems.find((item) => pathname === item.href);

  useEffect(() => {
    const fetchLottie = async () => {
      try {
        const res = await fetch("/lottie/ai-logo.json");
        const data = await res.json();
        setAnimationData(data);
      } catch {
        // 로드 실패 시 무시
      }
    };
    fetchLottie();
  }, []);

  return (
    <div className="w-full xl:w-[70vw] mx-auto min-h-full flex flex-col gap-1">
      {/* 헤더 */}
      <header className="w-full rounded-sm bg-background-1 p-2 flex flex-col">
        {/* 상단: 로고 + 네비게이션 */}
        <div className="flex items-center gap-4">
          {animationData && (
            <Lottie
              animationData={animationData}
              loop={true}
              className="w-12 h-12"
            />
          )}
          <nav className="flex gap-6">
            {navItems.map((item) =>
              item.disabled ? (
                <span
                  key={item.href}
                  className="py-1.5 rounded-md text-base font-medium text-muted-foreground/50 cursor-not-allowed"
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "py-1.5 rounded-md text-base font-medium transition-colors gap-2",
                    pathname === item.href
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {item.label}
                </Link>
              )
            )}
          </nav>
        </div>

        {/* AI 설명 영역 */}
        {activeItem && (
          <div className="w-full overflow-hidden p-2 hover:bg-muted/50 transition-colors rounded-md">
            <button
              onClick={() => setIsDescriptionOpen(!isDescriptionOpen)}
              className="w-full py-1 flex items-center gap-2 text-left cursor-pointer"
            >
              <ChevronDown
                className={cn(
                  "w-4 h-4 text-muted-foreground transition-transform",
                  isDescriptionOpen && "rotate-180"
                )}
              />
              <span className="text-sm font-semibold text-foreground">
                {activeItem.aiName}
              </span>
            </button>
            <div
              className={cn(
                "grid transition-all duration-300 ease-in-out",
                isDescriptionOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              )}
            >
              <div className="overflow-hidden">
                <p className="pt-1 text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {activeItem.description}
                </p>
              </div>
            </div>
          </div>
        )}
      </header>



      {/* 콘텐츠 */}
      {children}
    </div>
  );
}
