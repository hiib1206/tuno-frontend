import { cn } from "@/lib/utils";
import { Inbox, LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  iconClassName?: string;
  message?: string;
  messageClassName?: string;
  className?: string;
}

export function EmptyState({
  icon: Icon = Inbox,
  iconClassName,
  message = "데이터가 없습니다.",
  messageClassName,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4",
        className
      )}
    >
      <Icon className={cn("w-14 h-14 text-muted-foreground", iconClassName)} />
      <div className={cn("text-muted-foreground text-center", messageClassName)}>
        {message}
      </div>
    </div>
  );
}
