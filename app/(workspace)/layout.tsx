"use client";

import { LoginRequestModal } from "@/components/modals/LoginRequestModal";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Sidebar } from "@/components/workspace/sidebar";
import StockSearchBar from "@/components/workspace/StockSearchBar";
import { WatchlistPanel } from "@/components/workspace/WatchlistPanel";
import { useAuthStore } from "@/stores/authStore";
import { useWatchlistStore } from "@/stores/watchlistStore";
import { Menu } from "lucide-react";
import { useEffect, useState } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuthStore();
  const { fetchWatchlist, reset: resetWatchlist } = useWatchlistStore();
  const isLoggedIn = !!user;

  const [isMobile, setIsMobile] = useState(false);
  // 사이드바 관련
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [userClosedSidebar, setUserClosedSidebar] = useState(false); // 사용자가 수동으로 닫았는지 추적

  // 로그인 요청 모달
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // 로그인 시 관심종목 초기 로드, 로그아웃 시 초기화
  useEffect(() => {
    if (isLoggedIn) {
      fetchWatchlist();
    } else {
      resetWatchlist();
    }
  }, [isLoggedIn, fetchWatchlist, resetWatchlist]);


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
      {/* 모바일 오버레이 - 사이드바 */}
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
          ${isMobile
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
      <main className="flex-1 flex flex-col overflow-hidden relative w-full lg:w-auto">
        {/* 헤더 */}
        <div className="flex-shrink-0 z-30 bg-background-2">
          <div className="flex items-center gap-2 px-4 py-3 lg:px-6">
            {/* 테마 토글 - 가장 왼쪽 (모바일에서 숨김) */}
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>

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

            {/* 검색창과 관심종목 */}
            <div className="flex items-center w-full max-w-md hidden sm:flex">
              <StockSearchBar />
              {isLoggedIn ? (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="default-accent"
                      className="shrink-0 hover:scale-100"
                      aria-label="관심종목"
                    >
                      관심종목
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-72 h-[438px] overflow-hidden p-0 animate-in slide-in-from-top-2 fade-in-0 duration-200"
                    align="end"
                    sideOffset={6}
                  >
                    <WatchlistPanel />
                  </PopoverContent>
                </Popover>
              ) : (
                <Button
                  variant="default-accent"
                  className="shrink-0 gap-1.5 hover:scale-100"
                  aria-label="관심종목"
                  onClick={() => setIsLoginModalOpen(true)}
                >
                  관심종목
                </Button>
              )}
            </div>

            {/* 우측 여백 (데스크톱에서 검색창 가운데 정렬을 위해) */}
            <div className="flex-1 hidden sm:flex justify-end"></div>

            {/* 모바일: 검색 입력란 */}
            <div className="sm:hidden flex items-center gap-2 flex-1">
              <StockSearchBar />
            </div>
          </div>
        </div>

        {/* 컨텐츠 영역 */}
        <div className="flex-1 min-h-0 overflow-y-auto px-4 lg:px-6 py-4 relative z-10">
          {children}
        </div>
      </main>

      {/* 로그인 요청 모달 */}
      <LoginRequestModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </div>
  );
}
