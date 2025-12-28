"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuItemDestructive,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/stores/authStore";
import { LogOut, Moon, Settings, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ProfileAvatar } from "./ProfileAvatar";
import { SettingsModal } from "./SettingsModal";

export function UserMenu() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    logout();
  };

  if (!user) {
    return null;
  }

  return (
    <>
      <DropdownMenu onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <button className="cursor-pointer flex items-center hover:opacity-80 rounded-full transition-colors ">
            <ProfileAvatar size="md" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-56"
          onCloseAutoFocus={(event) => {
            // Radix의 기본 포커스 복원 막기
            event.preventDefault();
          }}
        >
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.nick}</p>
              {user.email && (
                <p className="text-xs leading-none text-muted-foreground">
                  {user.email}
                </p>
              )}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              setIsDropdownOpen(false);
              // 드롭다운 닫힘 애니메이션이 완료된 후 모달 열기
              setTimeout(() => {
                setIsSettingsOpen(true);
              }, 200);
            }} // 애니메이션 시간에 맞춰 조정 (보통 100-200ms)}}
            className="flex items-center hover:text-accent"
          >
            <Settings className="mr-2 h-4 w-4" />
            <span>설정</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="flex items-center hover:text-accent"
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

      {isSettingsOpen && (
        <SettingsModal open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
      )}
    </>
  );
}
