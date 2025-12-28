"use client";

import { subMenuConfig } from "@/lib/community";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";

const navItems = [
  { label: "투자 분석", href: "/analysis" },
  { label: "뉴스", href: "/community/news" },
  { label: "소통해요", href: "/community/posts" },
  { label: "고객 센터", href: "/community/support" },
  { label: "마이페이지", href: "/community/mypage/posts" },
];

export function CommunityNav() {
  const pathname = usePathname();
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);

  // navItems와 subMenuConfig를 연결하여 동적으로 allSubMenus 생성
  const allSubMenus = useMemo(() => {
    return navItems.map((item) => ({
      title: item.label,
      href: item.href,
      items: subMenuConfig[item.href],
    }));
  }, []);

  // 메가메뉴를 표시할지 여부 (하위 메뉴가 하나라도 있으면 표시)
  const shouldShowMegaMenu = useMemo(() => {
    return allSubMenus.some(
      (section) => section.items && section.items.length > 0
    );
  }, [allSubMenus]);

  return (
    <nav className="relative">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <div
                key={item.href}
                className="relative"
                onMouseEnter={() =>
                  shouldShowMegaMenu && setHoveredMenu(item.href)
                }
                onMouseLeave={() => setHoveredMenu(null)}
              >
                <Link
                  href={item.href}
                  className={cn(
                    "px-4 py-2 text-sm font-medium transition-colors relative block",
                    "hover:text-accent-text",
                    isActive ? "text-accent-text" : "text-muted-foreground"
                  )}
                >
                  {item.label}
                </Link>
              </div>
            );
          })}
        </div>

        {/* 메가메뉴 드롭다운 - 반복문 밖으로 이동, nav 컨테이너 기준으로 위치 지정  */}
        {shouldShowMegaMenu && hoveredMenu && (
          <div
            className="absolute top-full left-1/2 -translate-x-1/2 -translate-y-2 w-[500px] bg-background-1 border border-border rounded-lg shadow-lgz-50"
            onMouseEnter={() => setHoveredMenu(hoveredMenu)}
            onMouseLeave={() => setHoveredMenu(null)}
          >
            <div
              className="grid"
              style={{
                gridTemplateColumns: `repeat(${allSubMenus.length}, 1fr)`,
              }}
            >
              {allSubMenus.map((section, index) => {
                const isSectionActive =
                  pathname === section.href ||
                  pathname.startsWith(section.href + "/");

                return (
                  <div
                    key={section.title}
                    className={cn(
                      "transition-colors py-4 px-4 relative",
                      isSectionActive && "bg-background-2"
                    )}
                  >
                    {index < allSubMenus.length - 1 && (
                      <div className="absolute right-0 top-4 bottom-4 w-px border-r border-border" />
                    )}
                    <Link
                      href={section.href}
                      className={cn(
                        "text-sm font-semibold text-foreground mb-2 block transition-colors",
                        "hover:text-accent-text",
                        isSectionActive ? "text-accent-text" : "text-foreground"
                      )}
                    >
                      {section.title}
                    </Link>
                    {section.items && section.items.length > 0 ? (
                      <ul className="space-y-2">
                        {section.items.map((subItem) => {
                          const isSubActive =
                            pathname === subItem.href ||
                            pathname.startsWith(subItem.href + "/");

                          return (
                            <li key={subItem.href}>
                              <Link
                                href={subItem.href}
                                className={cn(
                                  "flex items-center gap-2 text-sm rounded-md transition-colors hover:text-accent-text",
                                  isSubActive
                                    ? "text-accent-text"
                                    : "text-muted-foreground"
                                )}
                              >
                                <span>{subItem.label}</span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
      <div className="mt-2 border-b border-border-2" />
    </nav>
  );
}
