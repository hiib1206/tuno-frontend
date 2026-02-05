"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import { Activity, CreditCard, LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

interface MenuItem {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  disabled?: boolean;
}

const menuItems: MenuItem[] = [
  {
    id: "usage",
    label: "사용량",
    href: "/dashboard/usage",
    icon: Activity,
  },
  {
    id: "plan",
    label: "내 플랜",
    href: "/dashboard/plan",
    icon: CreditCard,
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthLoading } = useAuthStore();
  const activeItem = menuItems.find((item) => pathname === item.href);
  const activeId = activeItem?.id || "usage";

  // 비로그인 시 로그인 페이지로 리다이렉트
  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [user, isAuthLoading, router, pathname]);

  // 로딩 중이거나 비로그인이면 아무것도 렌더링하지 않음
  if (isAuthLoading || !user) {
    return null;
  }

  return (
    <div className="w-full max-w-5xl mx-auto min-h-full flex flex-col">
      {/* 메인 컨테이너 */}
      <div className="flex-1 bg-background-1 rounded-sm overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] h-full">
          {/* 좌측 메뉴 - lg 이상에서만 표시 */}
          <nav className="hidden lg:block py-4 px-2 space-y-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return item.disabled ? (
                <span
                  key={item.id}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm text-muted-foreground/50 cursor-not-allowed"
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </span>
              ) : (
                <Link
                  key={item.id}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-1.5 text-sm font-medium transition-colors rounded",
                    isActive
                      ? "bg-accent/10 text-accent-text"
                      : "text-foreground hover:bg-muted/50"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* 우측 컨텐츠 */}
          <div className="flex flex-col overflow-y-auto">
            {/* 모바일 셀렉트 메뉴 */}
            <div className="lg:hidden p-4 border-b border-border-2">
              <Select
                value={activeId}
                onValueChange={(value) => {
                  const item = menuItems.find((m) => m.id === value);
                  if (item) router.push(item.href);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {activeItem && (
                      <div className="flex items-center gap-2">
                        <activeItem.icon className="w-4 h-4" />
                        {activeItem.label}
                      </div>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {menuItems.map((item) => (
                    <SelectItem key={item.id} value={item.id} disabled={item.disabled}>
                      <div className="flex items-center gap-2">
                        <item.icon className="w-4 h-4" />
                        {item.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 페이지 컨텐츠 */}
            <div className="flex-1 p-6">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
