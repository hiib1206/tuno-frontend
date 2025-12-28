"use client";

import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";

interface BackLinkProps {
  href?: string;
  children?: ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

export function BackLink({
  href,
  children,
  className,
  onClick,
}: BackLinkProps) {
  const router = useRouter();

  // href가 있으면 "목록으로", 없으면 "뒤로가기"가 기본값
  const defaultText = href ? "목록으로" : "뒤로가기";
  const displayText = children ?? defaultText;

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // 커스텀 onClick이 있으면 먼저 실행
    if (onClick) {
      onClick(e);
      // preventDefault가 호출되었으면 기본 동작 중단
      if (e.defaultPrevented) {
        return;
      }
    }

    if (!href) {
      e.preventDefault();
      router.back();
    }
  };

  return (
    <Link
      href={href || "#"}
      onClick={handleClick}
      className={cn(
        "inline-flex items-center gap-2 text-xs sm:text-sm text-muted-foreground hover:text-accent-text mb-3 sm:mb-4 transition-colors",
        className
      )}
    >
      <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
      {displayText}
    </Link>
  );
}
