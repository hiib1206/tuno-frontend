"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  User,
  CreditCard,
  History,
  Bell,
  Shield,
  LogOut,
  Star,
  BarChart3,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { ProfileAvatar } from "@/components/ProfileAvatar";

export type MenuItem =
  | "dashboard"
  | "history"
  | "favorites"
  | "profile"
  | "notifications"
  | "subscription"
  | "security";

interface SidebarProps {
  activeMenu: MenuItem;
  setActiveMenu: (menu: MenuItem) => void;
}

export function Sidebar({ activeMenu, setActiveMenu }: SidebarProps) {
  const { user } = useAuthStore();
  const menuItems = [
    { id: "profile" as MenuItem, label: "내 정보 관리", icon: User },
    { id: "dashboard" as MenuItem, label: "대시보드 샘플", icon: BarChart3 },
    { id: "history" as MenuItem, label: "예측 내역 샘플", icon: History },
    { id: "favorites" as MenuItem, label: "즐겨찾기 샘플", icon: Star },
    { id: "notifications" as MenuItem, label: "알림 설정 샘플", icon: Bell },
    {
      id: "subscription" as MenuItem,
      label: "구독 관리 샘플",
      icon: CreditCard,
    },
    { id: "security" as MenuItem, label: "보안 설정 샘플", icon: Shield },
  ];

  return (
    <Card className="p-4">
      {/* User Profile Section */}
      <div className="mb-6 flex flex-col items-center border-b border-border pb-6 text-center">
        <ProfileAvatar size="lg" className="mb-3" textSize="2xl" />
        <h3 className="mb-1 font-semibold">{user?.nick || "사용자"}</h3>
        <p className="mb-2 text-xs text-muted-foreground">
          {user?.email || ""}
        </p>
        <Badge className="bg-accent/10 text-accent text-xs">프로 플랜</Badge>
      </div>

      {/* Mobile Dropdown Menu - visible on small screens */}
      <div className="mb-4 lg:hidden">
        <Select
          value={activeMenu}
          onValueChange={(value) => setActiveMenu(value as MenuItem)}
        >
          <SelectTrigger className="w-full">
            <SelectValue>
              {menuItems.find((item) => item.id === activeMenu)?.label}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <SelectItem key={item.id} value={item.id}>
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {/* Desktop Menu Items - visible on large screens */}
      <nav className="hidden space-y-1 lg:block">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveMenu(item.id)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                activeMenu === item.id
                  ? "bg-accent/10 text-accent"
                  : "text-muted-foreground hover:bg-accent/5 hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Logout Button */}
      <Button variant="destructive" className="w-full" size="sm">
        <LogOut className="mr-2 h-4 w-4 " />
        로그아웃
      </Button>
    </Card>
  );
}
