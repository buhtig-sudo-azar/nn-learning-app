"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "nn-learning-theme-v1";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const current = document.documentElement.classList.contains("dark");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- синхронизация с тем, что уже применено inline-скриптом
    setIsDark(current);
    setMounted(true);
  }, []);

  function toggle() {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    try {
      window.localStorage.setItem(STORAGE_KEY, next ? "dark" : "light");
    } catch {
      /* ignore */
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Переключить на светлую тему" : "Переключить на тёмную тему"}
      title={isDark ? "Светлая тема" : "Тёмная тема"}
      className={cn(
        "fixed top-3 right-3 z-50",
        "h-10 w-10 rounded-full",
        "flex items-center justify-center",
        "border border-border bg-card/90 backdrop-blur shadow-sm",
        "hover:bg-accent hover:shadow-md",
        "transition-all duration-150",
        "text-foreground",
        !mounted && "opacity-0"
      )}
    >
      {mounted && isDark ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </button>
  );
}

export function ThemeScript() {
  const code = `(function(){try{var k='${STORAGE_KEY}';var v=window.localStorage.getItem(k);var m=window.matchMedia('(prefers-color-scheme: dark)').matches;var dark=v?v==='dark':m;if(dark){document.documentElement.classList.add('dark');}}catch(e){}})();`;
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
