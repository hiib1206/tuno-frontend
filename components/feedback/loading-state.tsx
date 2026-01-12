"use client";

import { cn } from "@/lib/utils";
import Lottie from "lottie-react";
import { LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";

interface LoadingStateProps {
  icon?: LucideIcon;
  iconClassName?: string;
  message?: string;
  messageClassName?: string;
  className?: string;
  lottieFile?: string;
  lottieClassName?: string;
}

export function LoadingState({
  icon: Icon,
  iconClassName,
  message,
  messageClassName,
  className,
  lottieFile = "/lottie/paper-plane.json",
  lottieClassName,
}: LoadingStateProps) {
  const [animationData, setAnimationData] = useState<any>(null);

  useEffect(() => {
    fetch(lottieFile)
      .then((res) => res.json())
      .then((data) => setAnimationData(data))
      .catch();
  }, [lottieFile]);

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
        <Lottie
          animationData={animationData}
          loop={true}
          className={cn("w-50 h-50", lottieClassName)}
        />
      )}
      <div className={cn("text-muted-foreground", messageClassName)}>
        {message}
      </div>
    </div>
  );
}
