import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface WorkspaceFeedbackProps {
  children: ReactNode;
  className?: string;
}

export function WorkspaceFeedback({
  children,
  className,
}: WorkspaceFeedbackProps) {
  return <div className={cn("mt-80", className)}>{children}</div>;
}
