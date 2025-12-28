import { cn } from "@/lib/utils";
import { AlertTriangle, LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface ErrorStateProps {
  icon?: LucideIcon;
  iconClassName?: string;
  message?: string;
  messageClassName?: string;
  action?: ReactNode;
  className?: string;
}

export function ErrorState({
  icon: Icon = AlertTriangle,
  iconClassName,
  message = "오류가 발생했습니다.",
  messageClassName,
  action,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4",
        className
      )}
    >
      <Icon className={cn("w-14 h-14 text-destructive", iconClassName)} />
      <div className={cn("text-destructive text-center", messageClassName)}>
        {message}
      </div>
      {action}
    </div>
  );
}
