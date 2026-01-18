"use client";

import { Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-[70px] h-6" />; // 레이아웃 시프트 방지용 placeholder
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="flex items-center gap-1 cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-md p-1 -ml-1"
      aria-label="Toggle Dark Mode"
    >
      <Moon className={`h-5 w-5 text-muted-foreground`} />
      <div
        className={`border-accent relative w-10 h-5 rounded-full transition-colors duration-300
          ${isDark ? "bg-accent border-accent" : "bg-muted-3 border-accent"}
        `}
      >
        <span
          className={`
            absolute top-0.5 left-1 bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-300 ease-in-out
            ${isDark ? "translate-x-4" : "translate-x-0"}
          `}
        />
      </div>
    </button>
  );
}
