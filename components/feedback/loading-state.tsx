import { SegmentedSpinner } from "@/components/loading";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface LoadingStateProps {
  icon?: LucideIcon;
  iconClassName?: string;
  message?: string;
  messageClassName?: string;
  className?: string;
}

export function LoadingState({
  icon: Icon,
  iconClassName,
  message = "조금만 기다려 주세요..!",
  messageClassName,
  className,
}: LoadingStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4",
        className
      )}
    >
      {Icon ? (
        <Icon
          className={cn("w-14 h-14 text-muted-foreground", iconClassName)}
        />
      ) : (
        <SegmentedSpinner
          className={cn("w-14 h-14", iconClassName)}
          strokeClassName="stroke-muted-foreground"
        />
      )}
      <div className={cn("text-muted-foreground", messageClassName)}>
        {message}
      </div>
    </div>
  );
}
