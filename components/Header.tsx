"use client";
import { useAuthStore } from "@/stores/authStore";
import Link from "next/link";

export function Header() {
  const { user } = useAuthStore();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <svg
              className="h-5 w-5 text-primary-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
            </svg>
          </div>
          <span className="text-xl font-semibold">InvestAI</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link
            href="/analysis"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            AI 투자 분석
          </Link>
        </nav>
      </div>
    </header>
  );
}
