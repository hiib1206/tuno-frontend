"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Bell, CreditCard, Shield, User } from "lucide-react";

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
  const menuItems = [
    { id: "profile" as MenuItem, label: "내 정보 관리", icon: User },
    { id: "notifications" as MenuItem, label: "알림 설정 샘플", icon: Bell },
    {
      id: "subscription" as MenuItem,
      label: "구독 관리 샘플",
      icon: CreditCard,
    },
    { id: "security" as MenuItem, label: "보안 설정 샘플", icon: Shield },
  ];

  return (
    <div className="py-4 px-2">
      {/* Mobile Dropdown Menu - visible on small screens */}
      <div className="lg:hidden">
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
      <nav className="hidden lg:block">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveMenu(item.id)}
              className={`cursor-pointer flex w-full items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors ${
                activeMenu === item.id
                  ? "bg-background-subtle text-accent"
                  : "text-foreground hover:bg-background-subtle"
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
