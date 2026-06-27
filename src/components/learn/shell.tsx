"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, Lightbulb, Target, FlaskConical } from "lucide-react";
import { useProgress } from "@/lib/use-progress";

type Accent = {
  text: string;
  bg: string;
  bgSoft: string;
  border: string;
  ring: string;
  chip: string;
};

type ModuleShellProps = {
  id: number;
  title: string;
  subtitle: string;
  accent: Accent;
  children: ReactNode;
};

const ACCENT_TITLES: Record<number, string> = {
  1: "От архитектуры к обучению",
  2: "Loss functions",
  3: "Backprop",
  4: "Оптимизаторы",
  5: "LR schedules",
  6: "Нормализация",
  7: "Регуляризация",
  8: "Градиенты",
  9: "Mixed precision",
  10: "Дальше",
};

export function ModuleShell({ id, title, subtitle, accent, children }: ModuleShellProps) {
  const { isCompleted, toggleCompleted, hydrated } = useProgress();
  const completed = hydrated && isCompleted(id);

  return (
    <section
      id={`module-${id}`}
      className="scroll-mt-24"
      aria-labelledby={`module-${id}-title`}
    >
      <Card
        className={cn(
          "border-2 overflow-hidden",
          accent.border,
          completed ? "ring-2 ring-offset-2 ring-rose-300 dark:ring-rose-700 dark:ring-offset-background" : ""
        )}
      >
        <CardHeader className={cn("pb-4", accent.bgSoft)}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-lg font-bold",
                  accent.bg,
                  accent.text
                )}
                aria-hidden
              >
                {id}
              </div>
              <div>
                <p className={cn("text-xs font-semibold uppercase tracking-wide", accent.text)}>
                  Модуль {id} · {ACCENT_TITLES[id]}
                </p>
                <CardTitle id={`module-${id}-title`} className="text-2xl mt-0.5">
                  {title}
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1 max-w-2xl">{subtitle}</p>
              </div>
            </div>
            <Button
              type="button"
              variant={completed ? "default" : "outline"}
              size="sm"
              onClick={() => toggleCompleted(id)}
              className={cn(
                "shrink-0",
                completed
                  ? "bg-rose-600 hover:bg-rose-700 text-white dark:bg-rose-700 dark:hover:bg-rose-800"
                  : "hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 dark:hover:bg-rose-950/50 dark:hover:text-rose-300 dark:hover:border-rose-800"
              )}
            >
              {completed ? (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-1.5" />
                  Пройдено
                </>
              ) : (
                <>
                  <Circle className="h-4 w-4 mr-1.5" />
                  Отметить
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-5 sm:p-6 space-y-6">{children}</CardContent>
      </Card>
    </section>
  );
}

export function TheoryBlock({
  children,
  accent,
}: {
  children: ReactNode;
  accent: Accent;
}) {
  return (
    <div className={cn("rounded-lg p-4 border", accent.bgSoft, accent.border)}>
      <div className="flex items-center gap-2 mb-2">
        <Lightbulb className={cn("h-4 w-4", accent.text)} />
        <span className={cn("text-xs font-semibold uppercase tracking-wide", accent.text)}>
          Теория
        </span>
      </div>
      <div className="prose prose-sm max-w-none text-foreground/90 leading-relaxed space-y-3">
        {children}
      </div>
    </div>
  );
}

export function SandboxBlock({
  children,
  accent,
  title = "Песочница",
}: {
  children: ReactNode;
  accent: Accent;
  title?: string;
}) {
  return (
    <div className="rounded-lg border-2 border-dashed bg-card p-4 sm:p-5 space-y-4">
      <div className="flex items-center gap-2">
        <FlaskConical className={cn("h-4 w-4", accent.text)} />
        <span className={cn("text-xs font-semibold uppercase tracking-wide", accent.text)}>
          {title}
        </span>
      </div>
      {children}
    </div>
  );
}

export function GoalBlock({
  children,
  accent,
}: {
  children: ReactNode;
  accent: Accent;
}) {
  return (
    <div className={cn("rounded-lg p-3 border flex gap-2.5", accent.bgSoft, accent.border)}>
      <Target className={cn("h-4 w-4 shrink-0 mt-0.5", accent.text)} />
      <div className="text-sm">
        <span className={cn("font-semibold", accent.text)}>Цель: </span>
        <span className="text-foreground/90">{children}</span>
      </div>
    </div>
  );
}

export function ConceptChip({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        "px-2.5 py-1 text-xs font-mono font-medium border",
        className
      )}
    >
      {children}
    </Badge>
  );
}

export function DefCard({
  term,
  definition,
  example,
  accent,
}: {
  term: string;
  definition: string;
  example?: string;
  accent: Accent;
}) {
  return (
    <div className={cn("rounded-lg border p-3 bg-card", accent.border)}>
      <div className={cn("text-xs font-mono uppercase tracking-wide", accent.text)}>
        {term}
      </div>
      <div className="text-sm mt-1 text-foreground/90">{definition}</div>
      {example && (
        <div className="text-xs text-muted-foreground mt-2 italic">
          Пример: {example}
        </div>
      )}
    </div>
  );
}

export type { Accent };
