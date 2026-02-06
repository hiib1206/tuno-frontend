"use client";

import { subMenuConfig } from "@/lib/community";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import { ChevronDown, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";

const baseNavItems = [
  { label: "투자 분석", href: "/analysis" },
  { label: "뉴스", href: "/community/news" },
  { label: "소통해요", href: "/community/posts" },
  { label: "고객 센터", href: "/community/support" },
];

const authOnlyNavItems = [
  { label: "마이페이지", href: "/community/mypage/posts" },
];

interface CommunityMobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommunityMobileMenu({
  isOpen,
  onClose,
}: CommunityMobileMenuProps) {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const isAuthLoading = useAuthStore((state) => state.isAuthLoading);
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);

  // 로그인 상태에 따라 navItems 동적 생성
  const navItems = useMemo(() => {
    if (isAuthLoading) {
      return baseNavItems;
    }
    return user ? [...baseNavItems, ...authOnlyNavItems] : baseNavItems;
  }, [user, isAuthLoading]);

  const handleMenuClick = (href: string) => {
    const subItems = subMenuConfig[href];
    if (subItems && subItems.length > 0) {
      // 하위 메뉴가 있으면 토글
      setExpandedMenu(expandedMenu === href ? null : href);
    } else {
      // 하위 메뉴가 없으면 바로 닫기
      onClose();
    }
  };

  const handleSubMenuClick = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* 오버레이 */}
      <div
        className="fixed inset-0 bg-black/50 z-40 sm:hidden"
        onClick={onClose}
      />

      {/* 사이드바 */}
      <div className="fixed top-0 left-0 h-full w-64 bg-background-1 z-50 sm:hidden overflow-y-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <span className="text-lg font-semibold">메뉴</span>
          <button
            onClick={onClose}
            className="p-2 hover:bg-background-2 rounded transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 메뉴 리스트 */}
        <nav className="p-4">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            const subItems = subMenuConfig[item.href];
            const hasSubMenu = subItems && subItems.length > 0;
            const isExpanded = expandedMenu === item.href;

            return (
              <div key={item.href} className="mb-1">
                {/* 상위 메뉴 */}
                <div
                  className={cn(
                    "flex items-center rounded transition-colors",
                    isActive
                      ? "text-accent-text bg-background-2"
                      : "text-foreground hover:bg-background-2"
                  )}
                >
                  <Link
                    href={item.href}
                    onClick={() => handleMenuClick(item.href)}
                    className="flex-1 px-3 py-2.5 text-sm font-medium"
                  >
                    {item.label}
                  </Link>
                  {hasSubMenu && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setExpandedMenu(isExpanded ? null : item.href);
                      }}
                      className="p-2 pr-3"
                    >
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 transition-transform",
                          isExpanded && "rotate-180"
                        )}
                      />
                    </button>
                  )}
                </div>

                {/* 하위 메뉴 */}
                {hasSubMenu && isExpanded && (
                  <div className="ml-4 mt-1 space-y-1">
                    {subItems.map((subItem) => {
                      const isSubActive =
                        pathname === subItem.href ||
                        pathname.startsWith(subItem.href + "/");

                      return (
                        <Link
                          key={subItem.href}
                          href={subItem.href}
                          onClick={handleSubMenuClick}
                          className={cn(
                            "block px-3 py-2 text-sm rounded transition-colors",
                            isSubActive
                              ? "text-accent-text"
                              : "text-muted-foreground hover:text-foreground hover:bg-background-2"
                          )}
                        >
                          {subItem.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>
    </>
  );
}
