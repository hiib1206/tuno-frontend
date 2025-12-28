"use client";

import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/workspace/sidebar";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { Menu } from "lucide-react";
import { useEffect, useState } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useRequireAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // 화면 크기 감지 및 반응형 처리
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024; // lg breakpoint
      setIsMobile(mobile);
      // 모바일에서는 기본적으로 사이드바 닫기
      if (mobile) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
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
    <div className="flex h-screen w-full bg-background-1 overflow-hidden relative">
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
        {/* 모바일 햄버거 메뉴 버튼 */}
        {isMobile && !isSidebarOpen && (
          <div className="sticky top-0 z-30 lg:hidden bg-background border-b border-border">
            <div className="flex items-center gap-2 px-4 py-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleToggle}
                className="lg:hidden [&_svg]:!w-5 [&_svg]:!h-5"
              >
                <Menu />
              </Button>
              <h2 className="text-lg font-semibold">Prophet AI</h2>
            </div>
          </div>
        )}
        <div className="relative z-10 h-full">{children}</div>
      </main>
    </div>
  );
}
