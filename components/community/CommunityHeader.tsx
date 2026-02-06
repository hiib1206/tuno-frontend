"use client";

import { CommunityMobileMenu } from "@/components/community/CommunityMobileMenu";
import { NotificationBell } from "@/components/community/NotificationBell";
import { BrandText } from "@/components/ui/BrandText";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/UserMenu";
import { withRedirect } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import { Menu, Search, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Input } from "../ui/input";

export function CommunityHeader() {
  const { user, isAuthLoading } = useAuthStore();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);

  // Next.js hook은 서버와 클라이언트에서 동일한 값을 보장합니다
  const currentUrl =
    pathname + (searchParams.toString() ? `?${searchParams.toString()}` : "");

  // 모바일 검색창 열릴 때 자동 포커스
  useEffect(() => {
    if (isSearchOpen && mobileSearchInputRef.current) {
      mobileSearchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  const handleSearch = (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/community/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <header className="">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-20">
          {/* 모바일 검색창 확장 모드 */}
          {isSearchOpen ? (
            <form
              onSubmit={handleSearch}
              className="sm:hidden flex items-center gap-2 w-full"
            >
              <div className="relative flex-1">
                <Input
                  ref={mobileSearchInputRef}
                  type="search"
                  placeholder="글, 뉴스 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-10 pl-4 pr-10 w-full rounded-full border-accent focus:ring-0"
                />
                <button
                  type="submit"
                  className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer hover:scale-110 transition-transform"
                >
                  <Search className="h-4 w-4 text-accent-text" />
                </button>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsSearchOpen(false);
                  setSearchQuery("");
                }}
                className="p-2 hover:bg-background-2 rounded-md transition-colors shrink-0"
              >
                <X className="h-5 w-5" />
              </button>
            </form>
          ) : (
            <>
              {/* 좌측: 햄버거 메뉴 (sm 미만) + Tuno 로고 */}
              <div className="flex items-center gap-2 flex-shrink-0 z-10">
                <button
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="p-2 hover:bg-background-2 rounded-md transition-colors sm:hidden"
                >
                  <Menu className="h-5 w-5" />
                </button>
                <Link href="/community">
                  <BrandText className="text-2xl">Tuno</BrandText>
                </Link>
              </div>

              {/* 검색창 - 절대 위치로 중앙 배치 (데스크톱) */}
              <form
                onSubmit={handleSearch}
                className="absolute left-1/2 -translate-x-1/2 w-full max-w-md px-4 hidden sm:block"
              >
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => handleSearch()}
                    className="absolute right-5 top-1/2 -translate-y-1/2 cursor-pointer hover:scale-110 transition-transform"
                  >
                    <Search className="h-4 w-4 text-accent-text" />
                  </button>
                  <Input
                    type="search"
                    placeholder="글, 뉴스 검색..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-9 pl-6 pr-10 w-full rounded-full border-accent focus:ring-0"
                  />
                </div>
              </form>

              {/* 모바일 검색 아이콘 */}
              <div className="sm:hidden">
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="p-2 hover:bg-background-2 rounded-md transition-colors"
                >
                  <Search className="h-5 w-5" />
                </button>
              </div>

              {/* 우측: 프로필 또는 로그인/회원가입 */}
              <div className="flex-shrink-0 z-10">
                {isAuthLoading ? (
                  <div className="w-10 h-10" /> // 마운트 전 또는 인증 로딩 중에는 공간만 유지
                ) : user ? (
                  <div className="flex items-center gap-3 ">
                    <NotificationBell />
                    <UserMenu />
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Button variant="ghost" asChild>
                      <Link
                        href={withRedirect("/login", currentUrl)}
                        className="hover:text-accent-text"
                      >
                        로그인
                      </Link>
                    </Button>
                    <div className="h-4 w-px bg-border" />
                    <Button variant="ghost" asChild>
                      <Link
                        href={withRedirect("/signup", currentUrl)}
                        className="hover:text-accent-text"
                      >
                        회원가입
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* 모바일 사이드 메뉴 */}
      <CommunityMobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
    </header>
  );
}
