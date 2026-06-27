"use client";

import { useState } from "react";
import { ModuleShell, TheoryBlock, SandboxBlock, GoalBlock, ConceptChip, DefCard } from "@/components/learn/shell";
import { ACCENTS } from "@/components/learn/accents";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Target, TrendingDown, Activity, GitCompare } from "lucide-react";

type LossKind = "mse" | "ce" | "hinge" | "contrastive";

const LOSS_META: Record<LossKind, { label: string; formula: string; use: string; color: string }> = {
  mse: {
    label: "MSE",
    formula: "L = (ŷ − y)²",
    use: "Регрессия: предсказываем число (цена, температура, координаты)",
    color: "text-rose-700 dark:text-rose-300",
  },
  ce: {
    label: "Cross-entropy",
    formula: "L = −Σ yᵢ · log(ŷᵢ)",
    use: "Классификация: предсказываем распределение вероятностей по классам. Language modeling — частный случай (классы = токены)",
    color: "text-orange-700 dark:text-orange-300",
  },
  hinge: {
    label: "Hinge",
    formula: "L = max(0, 1 − y·ŷ)",
    use: "SVM, binary classification с margin. Сейчас в deep learning встречается редко, но полезно знать",
    color: "text-amber-700 dark:text-amber-300",
  },
  contrastive: {
    label: "Contrastive",
    formula: "L = −log( exp(sim(q,k⁺)/τ) / Σ exp(sim(q,kᵢ)/τ) )",
    use: "Обучение эмбеддингов: sim(положительная пара) >> sim(отрицательные). CLIP, SimCLR, retrieval",
    color: "text-emerald-700 dark:text-emerald-300",
  },
};

// Toy dataset: предсказываем цену дома по площади (нормализованной 0..1)
const POINTS = [
  { x: 0.05, y: 0.10 },
  { x: 0.15, y: 0.18 },
  { x: 0.25, y: 0.32 },
  { x: 0.35, y: 0.38 },
  { x: 0.45, y: 0.55 },
  { x: 0.55, y: 0.62 },
  { x: 0.65, y: 0.78 },
  { x: 0.75, y: 0.85 },
  { x: 0.85, y: 0.92 },
  { x: 0.95, y: 0.97 },
];

export function Module02Loss() {
  const accent = ACCENTS[2];
  const [kind, setKind] = useState<LossKind>("ce");
  const [prediction, setPrediction] = useState(0.7); // для MSE
  const [confidence, setConfidence] = useState(0.8); // для CE: предсказанная вероятность правильного класса

  const meta = LOSS_META[kind];

  // Считаем loss для конкретного примера
  function computeLoss(): number {
    switch (kind) {
      case "mse":
        return Math.pow(prediction - 0.85, 2);
      case "ce":
        return -Math.log(Math.max(1e-9, confidence));
      case "hinge": {
        // y = +1 (правильный класс), ŷ ∈ [−1, +1]
        const yhat = confidence * 2 - 1;
        return Math.max(0, 1 - yhat);
      }
      case "contrastive": {
        // sim_pos = confidence, sim_neg = 0.2, τ = 0.5
        const tau = 0.5;
        const pos = Math.exp(confidence / tau);
        const neg = Math.exp(0.2 / tau) + Math.exp(0.1 / tau) + Math.exp(-0.1 / tau);
        return -Math.log(pos / (pos + neg));
      }
    }
  }

  const currentLoss = computeLoss();

  return (
    <ModuleShell
      id={2}
      title="Loss functions — как сеть понимает, что ошиблась"
      subtitle="Loss — это одно число, которое говорит «насколько плохо сеть предсказала». Без loss нет градиента, без градиента нет обучения. Выбор loss function определяет, что именно сеть будет оптимизировать."
      accent={accent}
    >
      <GoalBlock accent={accent}>
        понять, какие loss functions бывают, когда какую использовать, и почему cross-entropy — самый частый выбор в современных LLM.
      </GoalBlock>

      <TheoryBlock accent={accent}>
        <p>
          Loss function <strong>L(ŷ, y)</strong> берёт предсказание сети ŷ и
          правильный ответ y, возвращает одно число. Чем меньше — тем лучше.
          Это «компас» для обучения: backprop считает градиент{" "}
          <code className="font-mono text-xs px-1 py-0.5 rounded bg-muted">∇θ L</code>,
          и оптимизатор двигает θ против этого градиента.
        </p>
        <p>
          Выбор loss function зависит от <strong>типа задачи</strong>.
          Регрессия (предсказываем число) → MSE. Классификация
          (предсказываем класс) → cross-entropy. Языковое моделирование
          (следующий токен) — это тоже классификация, где классы = токены
          словаря, поэтому LLM используют cross-entropy. Обучение
          эмбеддингов → contrastive loss (CLIP, SimCLR).
        </p>
        <p>
          Важная интуиция: <strong>gradient magnitude</strong> зависит от
          loss function. MSE даёт линейно убывающий градиент по мере
          приближения к ответу — сеть «замедляется» у цели. Cross-entropy
          даёт логарифмически растущий градиент при уверенной ошибке —
          сеть «ускоряется», когда очень уверена в неправильном ответе.
          Это одна из причин, почему CE вытеснил MSE в классификации.
        </p>
      </TheoryBlock>

      <SandboxBlock accent={accent} title="Loss playground — переключай функцию и смотри значение">
        <div className="grid lg:grid-cols-[260px_1fr] gap-4">
          {/* Селектор loss */}
          <div className="space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
              Loss function
            </div>
            {(Object.keys(LOSS_META) as LossKind[]).map((k) => {
              const m = LOSS_META[k];
              return (
                <button
                  key={k}
                  onClick={() => setKind(k)}
                  className={cn(
                    "w-full text-left p-3 rounded-lg border-2 transition-all",
                    kind === k
                      ? cn(accent.bg, accent.border, "scale-[1.02]")
                      : "bg-card hover:bg-muted/50 border-border"
                  )}
                >
                  <div className="font-semibold text-sm">{m.label}</div>
                  <div className="text-xs font-mono text-muted-foreground mt-0.5">{m.formula}</div>
                </button>
              );
            })}
          </div>

          {/* Визуализация */}
          <Card className={cn("p-5", accent.border)}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-xs text-muted-foreground font-mono uppercase tracking-wide">{meta.label}</div>
                <h3 className="text-lg font-bold">Когда использовать</h3>
              </div>
              <Badge variant="outline" className="font-mono text-xs">
                L = {currentLoss.toFixed(4)}
              </Badge>
            </div>
            <p className="text-sm text-foreground/90 mb-4 leading-relaxed">{meta.use}</p>

            {/* Слайдер предсказания */}
            {kind === "mse" && (
              <div className="space-y-3">
                <div className="text-xs font-mono text-muted-foreground">
                  ŷ (предсказание сети): {prediction.toFixed(2)}, y (истина): 0.85
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={prediction}
                  onChange={(e) => setPrediction(parseFloat(e.target.value))}
                  className="w-full accent-rose-500"
                />
                <div className="text-sm">
                  L = ({prediction.toFixed(2)} − 0.85)² = {Math.pow(prediction - 0.85, 2).toFixed(4)}
                </div>
              </div>
            )}

            {kind === "ce" && (
              <div className="space-y-3">
                <div className="text-xs font-mono text-muted-foreground">
                  ŷ (предсказанная вероятность правильного класса): {confidence.toFixed(2)}
                </div>
                <input
                  type="range"
                  min="0.01"
                  max="0.99"
                  step="0.01"
                  value={confidence}
                  onChange={(e) => setConfidence(parseFloat(e.target.value))}
                  className="w-full accent-rose-500"
                />
                <div className="text-sm">
                  L = −log({confidence.toFixed(2)}) = {(-Math.log(confidence)).toFixed(4)}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Когда сеть уверена и права (ŷ → 1), loss → 0.
                  Когда сеть уверена и ошибается (ŷ → 0), loss → ∞. Это делает CE «жёстким» учителем.
                </p>
              </div>
            )}

            {kind === "hinge" && (
              <div className="space-y-3">
                <div className="text-xs font-mono text-muted-foreground">
                  ŷ ∈ [−1, +1] (y = +1, правильный класс)
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={confidence}
                  onChange={(e) => setConfidence(parseFloat(e.target.value))}
                  className="w-full accent-rose-500"
                />
                <div className="text-sm">
                  y·ŷ = {(confidence * 2 - 1).toFixed(2)}, L = max(0, 1 − {(confidence * 2 - 1).toFixed(2)}) = {Math.max(0, 1 - (confidence * 2 - 1)).toFixed(4)}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Hinge требует margin ≥ 1. Пока y·ŷ &lt; 1, loss &gt; 0. Когда y·ŷ ≥ 1, loss = 0 — сеть перестаёт учиться.
                </p>
              </div>
            )}

            {kind === "contrastive" && (
              <div className="space-y-3">
                <div className="text-xs font-mono text-muted-foreground">
                  sim(q, k⁺) — похожесть query с позитивным key
                </div>
                <input
                  type="range"
                  min="-0.5"
                  max="1"
                  step="0.01"
                  value={confidence}
                  onChange={(e) => setConfidence(parseFloat(e.target.value))}
                  className="w-full accent-rose-500"
                />
                <div className="text-sm">
                  L = −log( exp({confidence.toFixed(2)}/0.5) / (exp({confidence.toFixed(2)}/0.5) + 3·neg) ) = {currentLoss.toFixed(4)}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  contrastive учитывает не только позитив, но и негативы. Это основа CLIP, SimCLR, DPO.
                </p>
              </div>
            )}
          </Card>
        </div>
      </SandboxBlock>

      <div className="grid sm:grid-cols-2 gap-3">
        <DefCard
          term="Cross-entropy"
          definition="L = −Σ yᵢ log(ŷᵢ). Минимизируется, когда предсказанное распределение совпадает с истинным. Используется везде, где сеть предсказывает вероятности классов."
          example="Language modeling: 50257 токенов в словаре GPT-2, для каждой позиции сеть предсказывает распределение вероятностей, loss = CE с one-hot правильным токеном."
          accent={accent}
        />
        <DefCard
          term="Softmax + CE = LogSumExp"
          definition="На практике softmax и cross-entropy объединяют в одну функцию (LogSoftmax + NLL в PyTorch) ради численной стабильности. Без этого exp() может переполниться."
          example="В PyTorch: F.cross_entropy(logits, targets) — принимает сырые logits, не пропущенные через softmax."
          accent={accent}
        />
        <DefCard
          term="Label smoothing"
          definition="Вместо one-hot [0, 1, 0] используем [0.033, 0.934, 0.033] — немного «размазываем» правильный класс. Делает сеть менее самоуверенной, повышает calibration."
          example="GPT-3 использовал label smoothing 0.1. В Llama 2 от него отказались — оказалось, что hurts downstream performance."
          accent={accent}
        />
        <DefCard
          term="Perplexity"
          definition="exp(CE loss). Для language modeling: «на сколько токенов сеть в среднем не уверена». PP=1 — идеальная модель, PP=vocab_size — случайная."
          example="GPT-2 small на WikiText-103: perplexity ~30. GPT-3 175B: ~6. Человек: ~5-10."
          accent={accent}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <ConceptChip className={accent.chip}>MSE</ConceptChip>
        <ConceptChip className={accent.chip}>cross-entropy</ConceptChip>
        <ConceptChip className={accent.chip}>softmax</ConceptChip>
        <ConceptChip className={accent.chip}>logits</ConceptChip>
        <ConceptChip className={accent.chip}>label smoothing</ConceptChip>
        <ConceptChip className={accent.chip}>perplexity</ConceptChip>
        <ConceptChip className={accent.chip}>hinge</ConceptChip>
        <ConceptChip className={accent.chip}>contrastive</ConceptChip>
      </div>
    </ModuleShell>
  );
}
