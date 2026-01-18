"use client";

import { ProfileAvatar } from "@/components/ProfileAvatar";
import { SettingsModal } from "@/components/SettingsModal";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuItemDestructive,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import {
  ArrowLeft,
  BarChart3,
  ChevronDown,
  ChevronUp,
  LayoutDashboard,
  LineChart,
  LogIn,
  LogOut,
  Menu,
  Moon,
  Newspaper,
  Settings,
  Sun,
  User2,
  Users,
} from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { BrandText } from "../ui/BrandText";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    await logout();
    // 로그아웃 후 현재 페이지에 그대로 유지
  };

  const currentTab = searchParams?.get("tab") || "news";

  const routes = [
    {
      label: "대시보드",
      icon: LayoutDashboard,
      href: "/dashboard",
      active: pathname === "/dashboard",
    },
    {
      label: "퀀트 분석",
      icon: BarChart3,
      href: "/analysis/quant",
      active: pathname === "/analysis/quant",
    },
    {
      label: "주가 분석",
      icon: LineChart,
      href: "/analysis/individual",
      active: pathname === "/analysis/individual",
    },
    {
      label: "My",
      icon: User2,
      href: "/my",
      active: pathname === "/my",
    },
    {
      label: "뉴스",
      icon: Newspaper,
      href: "/community/news",
    },
    {
      label: "커뮤니티",
      icon: Users,
      href: "/community",
    },
  ];

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-background-1 transition-all duration-300 relative",
        isOpen ? "w-64" : "w-16"
      )}
    >
      {/* 열린 상태 - 상단 고정 영역 (로고 + 닫기 버튼) */}
      <div
        className={cn(
          "flex-shrink-0 transition-all duration-300 relative",
          isOpen
            ? "opacity-100 translate-x-0 pointer-events-auto"
            : "opacity-0 -translate-x-2 pointer-events-none absolute"
        )}
      >
        <div className="py-5 px-2 relative">
          {/* 닫기 버튼 - 열린 상태일 때만 우측 상단에 표시 */}
          {isOpen && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              className="absolute top-2 right-2 z-10 hover:bg-background-1 [&_svg]:!w-5 [&_svg]:!h-5"
            >
              <ArrowLeft />
            </Button>
          )}

          {/* 로고 영역 (클릭 시 분석 페이지로 이동) */}
          <Link href="/analysis" className="px-3 inline-block">
            <BrandText className="text-2xl cursor-pointer">Tuno</BrandText>
          </Link>
        </div>
      </div>

      {/* 열린 상태 - 스크롤 가능한 메뉴 영역 */}
      <div
        className={cn(
          "flex-1 overflow-y-auto overflow-x-hidden transition-all duration-300",
          isOpen
            ? "opacity-100 translate-x-0 pointer-events-auto"
            : "opacity-0 -translate-x-2 pointer-events-none absolute"
        )}
      >
        <div className="px-2 pb-2 mt-1">
          {/* 네비게이션 메뉴 */}
          <nav className="space-y-1">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 text-sm font-medium transition-all duration-200 whitespace-nowrap",
                  route.active
                    ? "bg-background-2 text-accent-text"
                    : "text-foreground/60 hover:text-foreground hover:bg-background-2"
                )}
              >
                <route.icon className="w-5 h-5 flex-shrink-0" />
                <span
                  className={cn(
                    "transition-all duration-300 overflow-hidden",
                    isOpen ? "opacity-100 max-w-full" : "opacity-0 max-w-0"
                  )}
                >
                  {route.label}
                </span>
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* 축소된 상태 - 토글 버튼과 아이콘만 표시 */}
      <div
        className={cn(
          "px-2 pt-2 transition-all duration-300",
          !isOpen
            ? "opacity-100 translate-x-0 pointer-events-auto"
            : "opacity-0 translate-x-2 pointer-events-none absolute"
        )}
      >
        <nav className="space-y-1 flex flex-col items-center">
          {/* 토글 버튼을 네비게이션 아이콘들과 같은 레이아웃에 포함 */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="w-10 h-10 rounded-md hover:bg-background-1 [&_svg]:!w-5 [&_svg]:!h-5"
          >
            <Menu />
          </Button>
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center justify-center w-10 h-10 rounded-md text-sm font-medium transition-all duration-200",
                route.active
                  ? "bg-background-1 text-accent-text"
                  : "text-foreground/60 hover:text-foreground hover:bg-background-1"
              )}
              title={route.label}
            >
              <route.icon className="w-5 h-5" />
            </Link>
          ))}
        </nav>
      </div>

      {/* User 프로필 영역 - 열린 상태일 때만 표시 (하단 고정, 스크롤되지 않음) */}
      {isOpen && (
        <div className="flex-shrink-0 py-1 px-2 border-t border-border-2">
          {user ? (
            <DropdownMenu
              open={isDropdownOpen}
              onOpenChange={setIsDropdownOpen}
            >
              {/* 프로필 아바타 및 닉네임 */}
              <DropdownMenuTrigger asChild>
                <button className="w-full px-2 py-2 rounded-md hover:bg-background-1 transition-colors focus:outline-none focus:ring-1 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <ProfileAvatar size="md" />
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-sm font-medium text-sidebar-foreground truncate">
                        {user.nick}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        test
                      </p>
                    </div>
                    {isDropdownOpen ? (
                      <ChevronDown className="w-4 h-4 text-sidebar-foreground/60 flex-shrink-0" />
                    ) : (
                      <ChevronUp className="w-4 h-4 text-sidebar-foreground/60 flex-shrink-0" />
                    )}
                  </div>
                </button>
              </DropdownMenuTrigger>
              {/* 드롭다운 메뉴 - 설정, 테마 변경, 로그아웃 */}
              <DropdownMenuContent
                align="end"
                side="top"
                className="w-60"
                onCloseAutoFocus={(event) => {
                  // Radix의 기본 포커스 복원 막기
                  event.preventDefault();
                }}
              >
                <DropdownMenuItem
                  onClick={() => {
                    setIsDropdownOpen(false);
                    // 드롭다운 닫힘 애니메이션이 완료된 후 모달 열기
                    setTimeout(() => {
                      setIsSettingsOpen(true);
                    }, 200); // 애니메이션 시간에 맞춰 조정 (보통 100-200ms)
                  }}
                  className="flex items-center hover:text-accent-text"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  <span>설정</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="flex items-center hover:text-accent-text"
                >
                  {mounted && theme === "dark" ? (
                    <>
                      <Sun className="mr-2 h-4 w-4" />
                      <span>라이트 모드</span>
                    </>
                  ) : (
                    <>
                      <Moon className="mr-2 h-4 w-4" />
                      <span>다크 모드</span>
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItemDestructive
                  onClick={handleLogout}
                  className="flex items-center"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>로그아웃</span>
                </DropdownMenuItemDestructive>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="py-4">
              <Link
                href={`/login?redirect=${encodeURIComponent(
                  searchParams.toString()
                    ? `${pathname}?${searchParams.toString()}`
                    : pathname
                )}`}
                className="w-full"
              >
                <Button
                  variant="default-accent"
                  className="w-full flex items-center gap-2 justify-center"
                >
                  <LogIn className="w-4 h-4" />
                  <span>로그인</span>
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}

      {/* 설정 모달 - 프로필 드롭다운에서 설정 클릭 시 표시 */}
      {isSettingsOpen && (
        <SettingsModal open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
      )}
    </div>
  );
}
