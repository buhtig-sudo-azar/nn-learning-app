import type { Accent } from "@/components/learn/shell";

/**
 * Палитра акцентов для 10 модулей о том, как нейросети учатся.
 *
 * Избегаем янтаря (фирменный transformers-app), изумруда (embeddings-app),
 * пурпура (tokenizatsiya-app), бирюзы (ml-s-nula), blue/indigo (зарезервирован
 * для llm-app — Курс 6). Палитра построена вокруг тёплых розово-красных
 * тонов с переходом в холодные к концу.
 */
export const ACCENTS: Record<number, Accent> = {
  1: {
    text: "text-rose-700 dark:text-rose-300",
    bg: "bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-200",
    bgSoft: "bg-rose-50 dark:bg-rose-950/40",
    border: "border-rose-200 dark:border-rose-800/60",
    ring: "ring-rose-300 dark:ring-rose-700",
    chip: "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/50 dark:text-rose-200 dark:border-rose-800/60",
  },
  2: {
    text: "text-red-700 dark:text-red-300",
    bg: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-200",
    bgSoft: "bg-red-50 dark:bg-red-950/40",
    border: "border-red-200 dark:border-red-800/60",
    ring: "ring-red-300 dark:ring-red-700",
    chip: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/50 dark:text-red-200 dark:border-red-800/60",
  },
  3: {
    text: "text-orange-700 dark:text-orange-300",
    bg: "bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-200",
    bgSoft: "bg-orange-50 dark:bg-orange-950/40",
    border: "border-orange-200 dark:border-orange-800/60",
    ring: "ring-orange-300 dark:ring-orange-700",
    chip: "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/50 dark:text-orange-200 dark:border-orange-800/60",
  },
  4: {
    text: "text-amber-700 dark:text-amber-300",
    bg: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-200",
    bgSoft: "bg-amber-50 dark:bg-amber-950/40",
    border: "border-amber-200 dark:border-amber-800/60",
    ring: "ring-amber-300 dark:ring-amber-700",
    chip: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/50 dark:text-amber-200 dark:border-amber-800/60",
  },
  5: {
    text: "text-yellow-700 dark:text-yellow-300",
    bg: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-200",
    bgSoft: "bg-yellow-50 dark:bg-yellow-950/40",
    border: "border-yellow-200 dark:border-yellow-800/60",
    ring: "ring-yellow-300 dark:ring-yellow-700",
    chip: "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-200 dark:border-yellow-800/60",
  },
  6: {
    text: "text-lime-700 dark:text-lime-300",
    bg: "bg-lime-100 text-lime-700 dark:bg-lime-900/50 dark:text-lime-200",
    bgSoft: "bg-lime-50 dark:bg-lime-950/40",
    border: "border-lime-200 dark:border-lime-800/60",
    ring: "ring-lime-300 dark:ring-lime-700",
    chip: "bg-lime-100 text-lime-700 border-lime-200 dark:bg-lime-900/50 dark:text-lime-200 dark:border-lime-800/60",
  },
  7: {
    text: "text-emerald-700 dark:text-emerald-300",
    bg: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-200",
    bgSoft: "bg-emerald-50 dark:bg-emerald-950/40",
    border: "border-emerald-200 dark:border-emerald-800/60",
    ring: "ring-emerald-300 dark:ring-emerald-700",
    chip: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/50 dark:text-emerald-200 dark:border-emerald-800/60",
  },
  8: {
    text: "text-teal-700 dark:text-teal-300",
    bg: "bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-200",
    bgSoft: "bg-teal-50 dark:bg-teal-950/40",
    border: "border-teal-200 dark:border-teal-800/60",
    ring: "ring-teal-300 dark:ring-teal-700",
    chip: "bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-900/50 dark:text-teal-200 dark:border-teal-800/60",
  },
  9: {
    text: "text-cyan-700 dark:text-cyan-300",
    bg: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/50 dark:text-cyan-200",
    bgSoft: "bg-cyan-50 dark:bg-cyan-950/40",
    border: "border-cyan-200 dark:border-cyan-800/60",
    ring: "ring-cyan-300 dark:ring-cyan-700",
    chip: "bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-900/50 dark:text-cyan-200 dark:border-cyan-800/60",
  },
  10: {
    text: "text-fuchsia-700 dark:text-fuchsia-300",
    bg: "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/50 dark:text-fuchsia-200",
    bgSoft: "bg-fuchsia-50 dark:bg-fuchsia-950/40",
    border: "border-fuchsia-200 dark:border-fuchsia-800/60",
    ring: "ring-fuchsia-300 dark:ring-fuchsia-700",
    chip: "bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200 dark:bg-fuchsia-900/50 dark:text-fuchsia-200 dark:border-fuchsia-800/60",
  },
};

export const MODULE_META: Array<{
  id: number;
  short: string;
  title: string;
}> = [
  { id: 1, short: "Введение", title: "От архитектуры к обучению" },
  { id: 2, short: "Loss", title: "Loss functions" },
  { id: 3, short: "Backprop", title: "Backpropagation и chain rule" },
  { id: 4, short: "Оптимизаторы", title: "SGD → Momentum → Adam → AdamW" },
  { id: 5, short: "LR schedules", title: "Warmup, cosine decay, cyclic" },
  { id: 6, short: "Нормализация", title: "BatchNorm, LayerNorm, RMSNorm" },
  { id: 7, short: "Регуляризация", title: "Dropout, weight decay, label smoothing" },
  { id: 8, short: "Градиенты", title: "Vanishing/exploding и clipping" },
  { id: 9, short: "Mixed precision", title: "FP16, BF16, gradient accumulation" },
  { id: 10, short: "Дальше", title: "Что изучать дальше" },
];
