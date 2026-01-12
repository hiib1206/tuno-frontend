"use client";

import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import StockSearchBar from "@/components/workspace/StockSearchBar";
import { Sidebar } from "@/components/workspace/sidebar";
import { Menu } from "lucide-react";
import { useEffect, useState } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobile, setIsMobile] = useState(false);
  // 사이드바 관련
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [userClosedSidebar, setUserClosedSidebar] = useState(false); // 사용자가 수동으로 닫았는지 추적

  // 화면 크기 감지 및 반응형 처리
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024; // lg breakpoint
      const wasMobile = isMobile;
      setIsMobile(mobile);
      // 모바일/데스크톱 전환 시에만 사이드바 상태 변경
      if (mobile && !wasMobile) {
        // 데스크톱 -> 모바일: 사이드바 닫기
        setIsSidebarOpen(false);
        setUserClosedSidebar(false);
      } else if (!mobile && wasMobile) {
        // 모바일 -> 데스크톱: 사용자가 닫지 않았다면 열기
        if (!userClosedSidebar) {
          setIsSidebarOpen(true);
        }
      }
    };

    // 초기 체크
    checkMobile();

    // 리사이즈 이벤트 리스너
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleOverlayClick = () => {
    if (isMobile && isSidebarOpen) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-background-2 overflow-hidden relative">
      {/* 모바일 오버레이 */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={handleOverlayClick}
        />
      )}

      {/* 사이드바 */}
      <div
        className={`
          fixed lg:static
          top-0 left-0
          h-full
          z-50 lg:z-auto
          transition-transform duration-300 ease-in-out
          ${
            isMobile
              ? isSidebarOpen
                ? "translate-x-0"
                : "-translate-x-full"
              : ""
          }
        `}
      >
        <Sidebar isOpen={isSidebarOpen} onToggle={handleToggle} />
      </div>

      {/* 메인 컨텐츠 */}
      <main className="flex-1 overflow-y-auto relative w-full lg:w-auto">
        {/* 헤더 */}
        <div className="sticky top-0 z-30 bg-background-2">
          <div className="flex items-center gap-2 px-4 py-3 lg:px-6">
            {/* 모바일: 햄버거 메뉴 */}
            {isMobile && !isSidebarOpen && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleToggle}
                className="lg:hidden [&_svg]:!w-5 [&_svg]:!h-5"
              >
                <Menu />
              </Button>
            )}

            {/* 좌측 여백 (데스크톱에서 검색창 가운데 정렬을 위해) */}
            <div className="flex-1 hidden sm:block"></div>

            {/* 검색창과 데스크톱 */}
            <div className="flex items-center gap-3 w-full max-w-md hidden sm:flex">
              <StockSearchBar />
              <ThemeToggle />
            </div>

            {/* 우측 여백 (데스크톱에서 검색창 가운데 정렬을 위해) */}
            <div className="flex-1 hidden sm:flex justify-end"></div>

            {/* 모바일: 검색 입력란과 관심 종목 버튼 */}
            <div className="sm:hidden flex items-center gap-2 flex-1">
              <StockSearchBar />
              <ThemeToggle />
            </div>
          </div>
        </div>

        <div className="relative z-10">{children}</div>
      </main>
    </div>
  );
}
