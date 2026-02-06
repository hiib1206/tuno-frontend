"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Shield, User } from "lucide-react";

export type MenuItem =
  | "profile"
  | "security";

interface SidebarProps {
  activeMenu: MenuItem;
  setActiveMenu: (menu: MenuItem) => void;
}

export function Sidebar({ activeMenu, setActiveMenu }: SidebarProps) {
  const menuItems = [
    { id: "profile" as MenuItem, label: "내 정보 관리", icon: User },
    { id: "security" as MenuItem, label: "보안 설정", icon: Shield },
  ];

  return (
    <div className="py-4 px-2 mt-6 lg:mt-0">
      {/* Mobile Dropdown Menu - visible on small screens */}
      <div className="lg:hidden">
        <Select
          value={activeMenu}
          onValueChange={(value) => setActiveMenu(value as MenuItem)}
        >
          <SelectTrigger className="w-full rounded">
            <SelectValue>
              {menuItems.find((item) => item.id === activeMenu)?.label}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="rounded">
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
              className={`cursor-pointer flex w-full items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors ${activeMenu === item.id
                ? "bg-background-1 text-accent"
                : "text-foreground hover:bg-background-1"
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
