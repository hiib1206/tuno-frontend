import { cn } from "@/lib/utils";
import { Playwrite_NO } from "next/font/google";

const playwrite = Playwrite_NO({
  weight: ["400"], // 원하는 두께
  display: "swap", // FOUT 방지
});

interface BrandTextProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function BrandText({ children, className, style }: BrandTextProps) {
  return (
    <span
      className={cn(
        "text-[var(--color-accent)]",
        "selection:bg-[var(--color-accent)] selection:text-[var(--color-accent-foreground)]",
        playwrite.className,
        className
      )}
      style={{
        textShadow: "1px 0 0 currentColor, -1px 0 0 currentColor",
        ...style,
      }}
    >
      {children}
    </span>
  );
}
