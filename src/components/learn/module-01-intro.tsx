"use client";

import { useState } from "react";
import { ModuleShell, TheoryBlock, SandboxBlock, GoalBlock, ConceptChip, DefCard } from "@/components/learn/shell";
import { ACCENTS } from "@/components/learn/accents";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowRight, Brain, Boxes, Layers, Network, Sparkles, Zap, Target, RefreshCw } from "lucide-react";

type Stage = {
  id: number;
  label: string;
  short: string;
  shape: string;
  desc: string;
  formula?: string;
};

const STAGES: Stage[] = [
  {
    id: 1,
    label: "Forward pass",
    short: "fwd",
    shape: "x → ŷ",
    desc: "Прогоняем батч через сеть: входы проходят по всем слоям, на выходе — предсказание ŷ. В трансформере это то, что мы разобрали в прошлом курсе: embedding → N×(attention + FFN) → output head.",
    formula: "ŷ = f(x; θ)",
  },
  {
    id: 2,
    label: "Loss",
    short: "loss",
    shape: "scalar",
    desc: "Сравниваем предсказание ŷ с правильным ответом y. Loss — это одно число: чем меньше, тем лучше. Для классификации обычно cross-entropy, для регрессии — MSE. Это сигнал, который говорит сети «насколько ты ошибся».",
    formula: "L = ℓ(ŷ, y)",
  },
  {
    id: 3,
    label: "Backprop",
    short: "back",
    shape: "∇θ L",
    desc: "Chain rule в обратную сторону: считаем градиент потери по каждому параметру. От выхода сети — ко входу, слой за слоем. Это самый дорогой этап (после forward) — для трансформера он примерно равен forward по стоимости.",
    formula: "g = ∇θ L",
  },
  {
    id: 4,
    label: "Optimizer step",
    short: "opt",
    shape: "θ ← θ − η·g",
    desc: "Обновляем веса, двигаясь против градиента. Простейший вариант — SGD: θ ← θ − η·g. На практике почти всегда Adam/AdamW. Шаг обучения η (learning rate) — самый важный гиперпараметр.",
    formula: "θ ← θ − η · g",
  },
  {
    id: 5,
    label: "Repeat × N",
    short: "loop",
    shape: "× epochs",
    desc: "Повторяем для каждого батча, для каждой эпохи. За одну эпоху сеть видит весь датасет один раз. Обучение GPT-3 — 300B токенов, ~10⁵ шагов. Каждый шаг — один forward + один backward + один optimizer step.",
    formula: "for batch in dataset: forward; loss; backward; step",
  },
];

export function Module01Intro() {
  const accent = ACCENTS[1];
  const [active, setActive] = useState(1);

  return (
    <ModuleShell
      id={1}
      title="От архитектуры к обучению"
      subtitle="В прошлом курсе мы разобрали, как устроен transformer block. Но это статика. Сейчас — динамика: что значит «обучить» эту архитектуру, и из каких четырёх шагов состоит каждый iteration."
      accent={accent}
    >
      <GoalBlock accent={accent}>
        понять, из каких шагов состоит один iteration обучения, и почему без backprop современный deep learning не существует.
      </GoalBlock>

      <TheoryBlock accent={accent}>
        <p>
          В курсе про трансформеры мы прошли путь от attention до полной
          архитектуры. Но это была <strong>статика</strong>: вот формула
          softmax(QK<sup>T</sup>/√d)V, вот блок, вот residual, вот LayerNorm.
          Мы знали, <strong>что</strong> вычисляется, но не знали,{" "}
          <strong>как</strong> сеть узнаёт, какие веса должны быть в этих
          матрицах W<sub>Q</sub>, W<sub>K</sub>, W<sub>V</sub>, W<sub>O</sub>.
        </p>
        <p>
          Ответ: <strong>градиентный спуск</strong>. Мы определяем функцию
          потери L (loss), которая говорит «насколько сеть ошиблась на этом
          батче». Затем backpropagation считает градиент L по каждому
          параметру — вектор, показывающий, в какую сторону нужно чуть-чуть
          сдвинуть вес, чтобы L уменьшилась. Оптимизатор (SGD, Adam) делает
          этот сдвиг. И так тысячи раз.
        </p>
        <p>
          Четыре шага одного <strong>iteration</strong>:{" "}
          <ConceptChip className={accent.chip}>1. forward</ConceptChip>{" "}
          <ArrowRight className="inline h-3 w-3" />{" "}
          <ConceptChip className={accent.chip}>2. loss</ConceptChip>{" "}
          <ArrowRight className="inline h-3 w-3" />{" "}
          <ConceptChip className={accent.chip}>3. backward</ConceptChip>{" "}
          <ArrowRight className="inline h-3 w-3" />{" "}
          <ConceptChip className={accent.chip}>4. step</ConceptChip>. Этот
          цикл — фундамент всего deep learning, от MLP до GPT-4. Остальное —
          детали (какой loss, какой оптимизатор, какой LR schedule, как
          нормализовать, как регуляризовать).
        </p>
      </TheoryBlock>

      <SandboxBlock accent={accent} title="Карта цикла обучения — кликай на этапы">
        <div className="grid lg:grid-cols-[1fr_2fr] gap-4">
          {/* Список этапов */}
          <div className="space-y-2">
            {STAGES.map((s) => (
              <button
                key={s.id}
                onClick={() => setActive(s.id)}
                className={cn(
                  "w-full text-left p-3 rounded-lg border-2 transition-all",
                  active === s.id
                    ? cn(accent.bg, accent.border, "scale-[1.02]")
                    : "bg-card hover:bg-muted/50 border-border"
                )}
              >
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-md font-mono text-sm font-bold",
                    active === s.id ? "bg-white/40 dark:bg-black/30" : "bg-muted"
                  )}>
                    {s.id}
                  </span>
                  <div className="min-w-0">
                    <div className="font-semibold text-sm">{s.label}</div>
                    <div className="text-xs text-muted-foreground font-mono">{s.shape}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Детали активного этапа */}
          <Card className={cn("p-5", accent.border)}>
            {STAGES.filter((s) => s.id === active).map((s) => (
              <div key={s.id}>
                <div className="flex items-center gap-2 mb-3">
                  <span className={cn("flex h-10 w-10 items-center justify-center rounded-xl font-mono font-bold", accent.bg, accent.text)}>
                    {s.id}
                  </span>
                  <div>
                    <div className="text-xs text-muted-foreground font-mono uppercase tracking-wide">{s.short}</div>
                    <h3 className="text-lg font-bold">{s.label}</h3>
                  </div>
                </div>
                <p className="text-sm text-foreground/90 leading-relaxed mb-3">{s.desc}</p>
                {s.formula && (
                  <div className={cn("rounded-md p-3 font-mono text-sm", accent.bgSoft)}>
                    {s.formula}
                  </div>
                )}
              </div>
            ))}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/60">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setActive((p) => Math.max(1, p - 1))}
                disabled={active === 1}
              >
                ← Пред.
              </Button>
              <div className="text-xs text-muted-foreground font-mono">
                этап {active} / {STAGES.length}
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setActive((p) => Math.min(STAGES.length, p + 1))}
                disabled={active === STAGES.length}
              >
                След. →
              </Button>
            </div>
          </Card>
        </div>
      </SandboxBlock>

      <div className="grid sm:grid-cols-2 gap-3">
        <DefCard
          term="Epoch"
          definition="Один полный проход по всему датасету. Обычно обучение идёт несколько десятков или сотен эпох."
          example="GPT-3 обучался меньше одной эпохи на 300B токенов — но датасет был настолько большим, что этого хватило."
          accent={accent}
        />
        <DefCard
          term="Iteration / Step"
          definition="Один forward + backward + optimizer update на одном батче. В одной эпохе может быть тысячи iterations."
          example="При batch_size=32 и датасете 1M примеров: 31250 iterations в одной эпохе."
          accent={accent}
        />
        <DefCard
          term="Batch size"
          definition="Сколько примеров обрабатывается за один forward pass. Влияет на скорость, стабильность и качество градиента."
          example="GPT-3 использовал batch_size ~3.2M токенов (через gradient accumulation)."
          accent={accent}
        />
        <DefCard
          term="Learning rate (η)"
          definition="Размер шага в направлении антиградиента. Слишком большой — diverge, слишком маленький — недообучение."
          example="Типичный LR для Adam при pretraining: 3e-4. Для fine-tuning: 1e-5 до 5e-5."
          accent={accent}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <ConceptChip className={accent.chip}>forward pass</ConceptChip>
        <ConceptChip className={accent.chip}>loss</ConceptChip>
        <ConceptChip className={accent.chip}>backprop</ConceptChip>
        <ConceptChip className={accent.chip}>optimizer step</ConceptChip>
        <ConceptChip className={accent.chip}>epoch</ConceptChip>
        <ConceptChip className={accent.chip}>batch</ConceptChip>
        <ConceptChip className={accent.chip}>learning rate</ConceptChip>
        <ConceptChip className={accent.chip}>iteration</ConceptChip>
      </div>
    </ModuleShell>
  );
}
