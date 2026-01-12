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
    <div className="flex items-center gap-1">
      <Moon className={`h-5 w-5 text-muted-foreground`} />
      <button
        onClick={() => setTheme(isDark ? "light" : "dark")}
        className={`border-accent relative w-10 h-5 rounded-full transition-colors duration-300 focus:outline-none focus:ring-1 focus:ring-ring
          ${isDark ? "bg-accent border-accent" : "bg-muted-3 border-accent"}
        `}
        aria-label="Toggle Dark Mode"
      >
        <span
          className={`
            absolute top-0.5 left-1 bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-300 ease-in-out
            ${isDark ? "translate-x-4" : "translate-x-0"}
          `}
        />
      </button>
    </div>
  );
}
