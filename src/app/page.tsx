"use client";

import { ProgressProvider, useProgress } from "@/lib/use-progress";
import { MODULE_META, ACCENTS } from "@/components/learn/accents";
import { Module01Intro } from "@/components/learn/module-01-intro";
import { Module02Loss } from "@/components/learn/module-02-loss";
import { Module03Backprop } from "@/components/learn/module-03-backprop";
import { Module04Optimizers } from "@/components/learn/module-04-optimizers";
import { Module05LrSchedules } from "@/components/learn/module-05-lr-schedules";
import { Module06Normalization } from "@/components/learn/module-06-normalization";
import { Module07Regularization } from "@/components/learn/module-07-regularization";
import { Module08Gradients } from "@/components/learn/module-08-gradients";
import { Module09MixedPrecision } from "@/components/learn/module-09-mixed-precision";
import { Module10Next } from "@/components/learn/module-10-next";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Brain,
  Sparkles,
  ArrowDown,
  ArrowLeft,
  Heart,
  Trash2,
  CheckCircle2,
  FlaskConical,
  Network,
} from "lucide-react";

const TRANSFORMERS_URL = "https://transformers-architecture.vercel.app/";
const EMBEDDINGS_APP_URL = "https://embeddings-app.vercel.app/";
const TOKENIZATSIYA_URL = "https://tokenizatsiya-app.vercel.app/";
const ML_S_NULA_URL = "https://ml-s-nula.vercel.app/";
const LLM_APP_URL = "https://llms-app.vercel.app/";
const ALIGNMENT_URL = "https://alignment-safety.vercel.app/";

function Hero() {
  const { completedCount, totalCount, hydrated, resetAll } = useProgress();
  const progressPct = hydrated ? (completedCount / totalCount) * 100 : 0;

  return (
    <section className="relative overflow-hidden border-b">
      {/* Декоративный фон */}
      <div className="hero-decoration absolute inset-0 opacity-[0.04] pointer-events-none">
        <div className="absolute top-10 left-10 text-[200px] font-bold font-mono text-rose-900 dark:text-rose-400">
          ∇
        </div>
        <div className="absolute bottom-10 right-10 text-[150px] font-bold font-mono text-red-900 dark:text-red-400">
          ∂L/∂θ
        </div>
        <div className="absolute top-1/2 left-1/3 text-[120px] font-bold font-mono text-orange-900 dark:text-orange-400">
          η·g
        </div>
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="max-w-2xl">
            <a
              href={TRANSFORMERS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 mb-3 text-xs text-muted-foreground hover:text-rose-700 dark:hover:text-rose-300 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Назад к курсу «Трансформеры — архитектура целиком»
            </a>
            <a
              href={LLM_APP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex mb-3"
            >
              <Badge
                variant="outline"
                className="bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/50 dark:border-blue-700 dark:text-blue-300 transition-colors"
              >
                <Sparkles className="h-3 w-3 mr-1" />
                Продолжение: большие языковые модели →
              </Badge>
            </a>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
              Как нейросети учатся — backprop, Adam, регуляризация
            </h1>
            <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
              10 модулей о том, как именно нейросеть обучается после того,
              как понятна архитектура: loss functions, backprop и chain
              rule, оптимизаторы (SGD → Momentum → Adam → AdamW), LR
              schedules (warmup, cosine decay), dropout и регуляризация,
              batch/layer/RMSNorm, vanishing/exploding gradients,
              gradient clipping, mixed precision (FP16/BF16/FP8). С живыми
              песочницами: backprop visualizer, optimizer playground на
              2D loss surface, LR schedule viewer, gradient flow analyzer
              — прямо в браузере.
            </p>

            <div className="flex flex-wrap gap-3 mt-6">
              <a href="#module-1">
                <Button
                  size="lg"
                  className="bg-rose-600 hover:bg-rose-700 text-white dark:bg-rose-700 dark:hover:bg-rose-600"
                >
                  Начать с первого модуля
                  <ArrowDown className="h-4 w-4 ml-1.5" />
                </Button>
              </a>
              <a href="#module-4">
                <Button size="lg" variant="outline">
                  <FlaskConical className="h-4 w-4 mr-1.5" />
                  Сразу к оптимизаторам
                </Button>
              </a>
            </div>
          </div>

          {/* Карточка прогресса */}
          <Card className="p-4 w-full sm:w-64 bg-card/95">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">
                Твой прогресс
              </span>
              {hydrated && completedCount === totalCount && (
                <CheckCircle2 className="h-4 w-4 text-rose-600 dark:text-rose-400" />
              )}
            </div>
            <div className="text-2xl font-bold font-mono">
              {hydrated ? completedCount : 0}
              <span className="text-base text-muted-foreground font-normal">
                {" "}
                / {totalCount}
              </span>
            </div>
            <Progress value={progressPct} className="h-2 mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              модулей отмечено как пройденные
            </p>
            {hydrated && completedCount > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full mt-2 h-7 text-xs text-muted-foreground"
                onClick={resetAll}
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Сбросить прогресс
              </Button>
            )}
          </Card>
        </div>

        {/* Бейджи характеристик */}
        <div className="flex flex-wrap gap-2 mt-8">
          <Badge variant="secondary" className="bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/50 dark:border-rose-800/60 dark:text-rose-300">
            <FlaskConical className="h-3 w-3 mr-1" />
            Живые песочницы: backprop, optimizers, LR, gradients
          </Badge>
          <Badge variant="secondary" className="bg-orange-50 border-orange-200 text-orange-800 dark:bg-orange-950/50 dark:border-orange-800/60 dark:text-orange-300">
            <Brain className="h-3 w-3 mr-1" />
            От loss до mixed precision
          </Badge>
          <Badge variant="secondary" className="bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/50 dark:border-emerald-800/60 dark:text-emerald-300">
            <Network className="h-3 w-3 mr-1" />
            Прогресс сохраняется
          </Badge>
        </div>
      </div>
    </section>
  );
}

function ModuleNav() {
  const { isCompleted, hydrated } = useProgress();
  return (
    <nav
      className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b"
      aria-label="Навигация по модулям"
    >
      <div className="max-w-6xl mx-auto px-2 sm:px-6">
        <div className="flex items-center gap-1 overflow-x-auto py-2 scrollbar-thin">
          {MODULE_META.map((m) => {
            const done = hydrated && isCompleted(m.id);
            const accent = ACCENTS[m.id];
            return (
              <a
                key={m.id}
                href={`#module-${m.id}`}
                className={cn(
                  "shrink-0 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors border",
                  done
                    ? "bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/50 dark:border-rose-800/60 dark:text-rose-300"
                    : cn("border-transparent hover:bg-muted", accent.text)
                )}
              >
                <span className="font-mono mr-1">{m.id}.</span>
                {m.short}
                {done && <CheckCircle2 className="inline h-3 w-3 ml-1" />}
              </a>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

function MainContent() {
  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <Module01Intro />
      <Module02Loss />
      <Module03Backprop />
      <Module04Optimizers />
      <Module05LrSchedules />
      <Module06Normalization />
      <Module07Regularization />
      <Module08Gradients />
      <Module09MixedPrecision />
      <Module10Next />
    </main>
  );
}

function SiteFooter() {
  return (
    <footer className="mt-auto border-t bg-muted/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 text-sm text-muted-foreground">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Network className="h-4 w-4 text-rose-600 dark:text-rose-400" />
            <span>
              <strong className="text-foreground">Как нейросети учатся</strong> —
              интерактивный курс об обучении нейросетей
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            Сделано с <Heart className="h-3 w-3 fill-rose-500 text-rose-500 dark:fill-rose-400 dark:text-rose-400" /> для
            разработчиков, изучающих NLP
          </div>
        </div>
        <p className="text-xs mt-3 max-w-3xl">
          Все песочницы работают прямо в браузере на чистом React + TypeScript.
          Прогресс сохраняется локально в localStorage — твои ответы и метки
          не уходят на сервер. Это приложение — пятый курс в серии из десяти:{" "}
          <a href={ML_S_NULA_URL} target="_blank" rel="noopener noreferrer" className="underline hover:text-rose-700 dark:hover:text-rose-300">«ML с нуля»</a>
          {" → "}<a href={TOKENIZATSIYA_URL} target="_blank" rel="noopener noreferrer" className="underline hover:text-rose-700 dark:hover:text-rose-300">«Токенизация»</a>
          {" → "}<a href={EMBEDDINGS_APP_URL} target="_blank" rel="noopener noreferrer" className="underline hover:text-rose-700 dark:hover:text-rose-300">«Эмбеддинги и attention»</a>
          {" → "}<a href={TRANSFORMERS_URL} target="_blank" rel="noopener noreferrer" className="underline hover:text-rose-700 dark:hover:text-rose-300">«Трансформеры»</a>
          {" → "}<strong className="text-foreground">«Как нейросети учатся»</strong>
          {" → "}<a href={LLM_APP_URL} target="_blank" rel="noopener noreferrer" className="underline hover:text-rose-700 dark:hover:text-rose-300">«Большие языковые модели»</a>
          {" → "}<a href={ALIGNMENT_URL} target="_blank" rel="noopener noreferrer" className="underline hover:text-rose-700 dark:hover:text-rose-300">«Адаптация и alignment»</a>
          .
        </p>

        <div className="mt-6 pt-4 border-t border-border/60 text-center">
          <span className="text-sm font-medium text-muted-foreground">
            создатель{" "}
            <span className="font-bold tracking-wide text-foreground">AZAR</span>
          </span>
        </div>
      </div>
    </footer>
  );
}

export default function Home() {
  return (
    <ProgressProvider>
      <div className="min-h-screen flex flex-col bg-background">
        <Hero />
        <ModuleNav />
        <MainContent />
        <SiteFooter />
      </div>
    </ProgressProvider>
  );
}
