"use client";

import { createContext, useCallback, useContext, useMemo, ReactNode } from "react";
import { useLocalStorage } from "@/lib/use-local-storage";

export type ProgressState = {
  /** Какие модули (1..10) пользователь отметил как пройденными */
  completed: Record<number, boolean>;
};

const DEFAULT: ProgressState = {
  completed: {},
};

type ProgressContextValue = {
  state: ProgressState;
  hydrated: boolean;
  toggleCompleted: (moduleId: number) => void;
  isCompleted: (moduleId: number) => boolean;
  resetAll: () => void;
  completedCount: number;
  totalCount: number;
};

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [state, setState, reset, hydrated] = useLocalStorage<ProgressState>(
    "nn-learning-progress-v1",
    DEFAULT
  );

  const toggleCompleted = useCallback(
    (moduleId: number) => {
      setState((prev) => ({
        ...prev,
        completed: { ...prev.completed, [moduleId]: !prev.completed[moduleId] },
      }));
    },
    [setState]
  );

  const isCompleted = useCallback(
    (moduleId: number) => Boolean(state.completed[moduleId]),
    [state.completed]
  );

  const value = useMemo<ProgressContextValue>(
    () => ({
      state,
      hydrated,
      toggleCompleted,
      isCompleted,
      resetAll: reset,
      completedCount: Object.values(state.completed).filter(Boolean).length,
      totalCount: 10,
    }),
    [state, hydrated, toggleCompleted, isCompleted, reset]
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error("useProgress must be used inside ProgressProvider");
  return ctx;
}
