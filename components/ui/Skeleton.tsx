import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  variant?: "pulse" | "shimmer" | "shimmer-contrast" | "none";
}

const variantClasses = {
  pulse: "bg-skeleton-2 animate-pulse",
  shimmer: "skeleton-gradient-loading",
  "shimmer-contrast": "skeleton-gradient-contrast",
  none: "bg-skeleton-2",
};

export function Skeleton({ className, variant = "pulse" }: SkeletonProps) {
  return <div className={cn(variantClasses[variant], className)} />;
}
