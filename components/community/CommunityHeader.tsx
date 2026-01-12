"use client";

import { BrandText } from "@/components/ui/BrandText";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/UserMenu";
import { withRedirect } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import { Search } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Input } from "../ui/input";

export function CommunityHeader() {
  const { user, isAuthLoading } = useAuthStore();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");

  // Next.js hook은 서버와 클라이언트에서 동일한 값을 보장합니다
  const currentUrl =
    pathname + (searchParams.toString() ? `?${searchParams.toString()}` : "");

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  return (
    <header className="">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-20">
          {/* 좌측: Tuno 로고 */}
          <Link href="/community" className="flex-shrink-0 z-10">
            <BrandText className="text-2xl">Tuno</BrandText>
          </Link>

          {/* 검색창 - 절대 위치로 중앙 배치 */}
          <form
            onSubmit={handleSearch}
            className="absolute left-1/2 -translate-x-1/2 w-full max-w-md px-4 hidden sm:block"
          >
            <div className="relative">
              <Search className="absolute right-5 top-1/2 -translate-y-1/2 h-4 w-4 text-accent-text" />
              <Input
                type="search"
                placeholder="게시글, 뉴스 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 pl-6 pr-10 w-full rounded-full border-accent focus:ring-0"
              />
            </div>
          </form>

          {/* 모바일 검색 아이콘 */}
          <div className="sm:hidden">
            <button className="p-2 hover:bg-background-2 rounded-md transition-colors">
              <Search className="h-5 w-5" />
            </button>
          </div>

          {/* 우측: 프로필 또는 로그인/회원가입 */}
          <div className="flex-shrink-0 z-10">
            {isAuthLoading ? (
              <div className="w-10 h-10" /> // 마운트 전 또는 인증 로딩 중에는 공간만 유지
            ) : user ? (
              <UserMenu />
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
        </div>
      </div>
    </header>
  );
}
