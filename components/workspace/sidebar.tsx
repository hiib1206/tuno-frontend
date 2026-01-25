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
  Layers,
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
      label: "테마",
      icon: Layers,
      href: "/market/theme",
      active: pathname === "/market/theme",
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
        "flex flex-col h-full bg-background-1 transition-all duration-300",
        isOpen ? "w-64" : "w-16"
      )}
    >
      {/* 상단 영역 - 로고 + 토글 버튼 */}
      <div
        className={cn(
          "flex-shrink-0 h-16 pl-4 pr-2 flex items-center",
          isOpen ? "justify-between" : "justify-center"
        )}
      >
        {isOpen && (
          <Link href="/analysis" className="px-1">
            <BrandText className="text-2xl cursor-pointer">Tuno</BrandText>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="w-10 h-10 flex-shrink-0 rounded-md hover:bg-background-1 [&_svg]:!w-5 [&_svg]:!h-5"
        >
          {isOpen ? <ArrowLeft /> : <Menu />}
        </Button>
      </div>

      {/* 네비게이션 메뉴 - 단일 구조 */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="px-3 pb-2">
          <nav className="space-y-1">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                title={!isOpen ? route.label : undefined}
                className={cn(
                  "flex items-center text-sm font-medium transition-all duration-200 h-10 rounded",
                  route.active
                    ? "text-accent-text bg-background-2"
                    : "text-foreground/60 hover:text-foreground hover:bg-background-2"
                )}
              >
                <route.icon className="w-5 h-5 flex-shrink-0 ml-[10px]" />
                <span
                  className={cn(
                    "whitespace-nowrap transition-all duration-300 overflow-hidden",
                    isOpen ? "opacity-100 ml-3 max-w-[200px]" : "opacity-0 ml-0 max-w-0"
                  )}
                >
                  {route.label}
                </span>
              </Link>
            ))}
          </nav>
        </div>
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
