"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Кнопка «прокрутить страницу вверх».
 * Иконка — мозг, пульсирует мягкой анимацией.
 * Цвет — розвый (соответствует теме «как сети учатся»).
 */
export function ScrollToTopBrain() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      if (window.scrollY > window.innerHeight * 0.8) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Прокрутить страницу наверх"
      title="Наверх"
      tabIndex={visible ? 0 : -1}
      className={cn(
        "fixed bottom-5 right-5 z-50",
        "h-14 w-14 rounded-full",
        "flex items-center justify-center",
        "transition-all duration-300 ease-out",
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-400/50",
        visible
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 translate-y-4 pointer-events-none"
      )}
    >
      <span
        aria-hidden
        className="absolute inset-0 rounded-full bg-rose-500/30 animate-brain-pulse-ring"
      />
      <span
        aria-hidden
        className="absolute inset-1 rounded-full bg-rose-500/20 animate-brain-pulse-ring-delayed"
      />
      <span
        aria-hidden
        className="absolute inset-2 rounded-full bg-gradient-to-br from-rose-500 to-red-600 shadow-lg shadow-rose-500/40 animate-brain-pulse-core"
      />
      <BrainIcon className="relative h-7 w-7 text-white drop-shadow" />
    </button>
  );
}

function BrainIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M12 5a3 3 0 0 0-3 3v0a2.5 2.5 0 0 0-2.5 2.5v0A2.5 2.5 0 0 0 4 13v0a2.5 2.5 0 0 0 1.5 2.3v0A2.5 2.5 0 0 0 7 19v0a2.5 2.5 0 0 0 5 .5V5z" />
      <path d="M12 5a3 3 0 0 1 3 3v0a2.5 2.5 0 0 1 2.5 2.5v0A2.5 2.5 0 0 1 20 13v0a2.5 2.5 0 0 1-1.5 2.3v0A2.5 2.5 0 0 1 17 19v0a2.5 2.5 0 0 1-5 .5V5z" />
      <path d="M9.5 8.5c.7.5 1.5.5 2.5 0" opacity={0.7} />
      <path d="M14.5 8.5c-.7.5-1.5.5-2.5 0" opacity={0.7} />
      <path d="M6.5 13c.8.6 1.7.6 2.5 0" opacity={0.7} />
      <path d="M17.5 13c-.8.6-1.7.6-2.5 0" opacity={0.7} />
    </svg>
  );
}
