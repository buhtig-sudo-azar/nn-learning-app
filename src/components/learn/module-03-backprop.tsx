"use client";

import { useState } from "react";
import { ModuleShell, TheoryBlock, SandboxBlock, GoalBlock, ConceptChip, DefCard } from "@/components/learn/shell";
import { ACCENTS } from "@/components/learn/accents";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowDown, ArrowUp, Network, Calculator, Zap } from "lucide-react";

/**
 * Песочница: маленький вычислительный граф
 *   x₁ ──┐
 *        ├─→ w₁·x₁ + w₂·x₂ + b = z ──→ σ(z) = ŷ ──→ L = (ŷ − y)²
 *   x₂ ──┘
 *
 * Forward: задаём x₁, x₂, w₁, w₂, b, y → считаем z, ŷ, L
 * Backward: пошагово показываем ∂L/∂ŷ → ∂L/∂z → ∂L/∂w₁, ∂L/∂w₂, ∂L/∂b
 */

type Step = {
  id: number;
  label: string;
  formula: string;
  value: string;
  desc: string;
};

export function Module03Backprop() {
  const accent = ACCENTS[3];
  const [x1, setX1] = useState(2);
  const [x2, setX2] = useState(3);
  const [w1, setW1] = useState(0.5);
  const [w2, setW2] = useState(-0.8);
  const [b, setB] = useState(0.1);
  const [y, setY] = useState(1);
  const [step, setStep] = useState(0);

  // Forward
  const z = w1 * x1 + w2 * x2 + b;
  const yhat = 1 / (1 + Math.exp(-z)); // sigmoid
  const L = 0.5 * Math.pow(yhat - y, 2);

  // Backward (derivatives)
  const dL_dyhat = yhat - y;
  const dyhat_dz = yhat * (1 - yhat); // sigmoid derivative
  const dL_dz = dL_dyhat * dyhat_dz;
  const dL_dw1 = dL_dz * x1;
  const dL_dw2 = dL_dz * x2;
  const dL_db = dL_dz * 1;

  const steps: Step[] = [
    {
      id: 0,
      label: "Шаг 1: ∂L/∂ŷ",
      formula: "∂L/∂ŷ = (ŷ − y)",
      value: `= ${yhat.toFixed(4)} − ${y} = ${dL_dyhat.toFixed(4)}`,
      desc: "Начинаем с выхода loss function. L = ½(ŷ − y)², поэтому производная по ŷ равна (ŷ − y). Это сигнал ошибки: насколько сеть отклонилась от правильного ответа.",
    },
    {
      id: 1,
      label: "Шаг 2: ∂L/∂z",
      formula: "∂L/∂z = ∂L/∂ŷ · ∂ŷ/∂z = (ŷ − y) · σ(z)·(1 − σ(z))",
      value: `= ${dL_dyhat.toFixed(4)} · ${dyhat_dz.toFixed(4)} = ${dL_dz.toFixed(4)}`,
      desc: "Chain rule: умножаем градиент по выходу на производную активации по её входу. Для sigmoid производная σ(z)·(1−σ(z)) максимальна при z=0 (=0.25) и стремится к нулю при |z| → ∞ — отсюда vanishing gradients.",
    },
    {
      id: 2,
      label: "Шаг 3: ∂L/∂w₁",
      formula: "∂L/∂w₁ = ∂L/∂z · ∂z/∂w₁ = ∂L/∂z · x₁",
      value: `= ${dL_dz.toFixed(4)} · ${x1} = ${dL_dw1.toFixed(4)}`,
      desc: "z = w₁·x₁ + w₂·x₂ + b, поэтому ∂z/∂w₁ = x₁. Градиент по весу = восходящий градиент × локальный вход. Если x₁ большой — градиент по w₁ тоже большой.",
    },
    {
      id: 3,
      label: "Шаг 4: ∂L/∂w₂",
      formula: "∂L/∂w₂ = ∂L/∂z · x₂",
      value: `= ${dL_dz.toFixed(4)} · ${x2} = ${dL_dw2.toFixed(4)}`,
      desc: "Аналогично для w₂. Заметим: градиент «делится» по всем входам, но взвешивается значениями этих входов. Это и есть backpropagation в его простейшем виде.",
    },
    {
      id: 4,
      label: "Шаг 5: ∂L/∂b",
      formula: "∂L/∂b = ∂L/∂z · 1",
      value: `= ${dL_dz.toFixed(4)}`,
      desc: "Производная z по b равна 1 (z = w₁x₁ + w₂x₂ + b, db = 1). Bias всегда получает «чистый» восходящий градиент, без модуляции входом.",
    },
    {
      id: 5,
      label: "Готово — все градиенты посчитаны",
      formula: "∇θ L = [∂L/∂w₁, ∂L/∂w₂, ∂L/∂b]",
      value: `= [${dL_dw1.toFixed(4)}, ${dL_dw2.toFixed(4)}, ${dL_db.toFixed(4)}]`,
      desc: "Это вектор градиента. Оптимизатор (например, SGD) сделает шаг: θ ← θ − η · ∇θ L. Готово — один iteration завершён. В трансформере так же, но производных в 100 раз больше (миллиарды параметров).",
    },
  ];

  const currentStep = steps[step];

  return (
    <ModuleShell
      id={3}
      title="Backpropagation и chain rule"
      subtitle="Как сеть узнаёт, в какую сторону сдвинуть каждый из миллиардов весов? Через chain rule в обратную сторону — от loss ко всем параметрам. Это самый дорогой (после forward) и самый важный шаг обучения."
      accent={accent}
    >
      <GoalBlock accent={accent}>
        понять, как backprop применяет chain rule по слоям в обратном порядке — от loss ко входу, и почему он в 100 раз быстрее «наивного» подсчёта градиентов.
      </GoalBlock>

      <TheoryBlock accent={accent}>
        <p>
          Если бы мы считали градиент loss по каждому параметру «в лоб»
          (численно, через <code className="font-mono text-xs px-1 py-0.5 rounded bg-muted">(L(θ+ε) − L(θ))/ε</code>),
          это потребовало бы <strong>двух forward passes на каждый параметр</strong>.
          Для GPT-3 (175B параметров) — 350B forward passes на одну итерацию.
          Совершенно невозможно.
        </p>
        <p>
          <strong>Backpropagation</strong> — алгоритм, который считает все
          градиенты за <strong>один проход от выхода ко входу</strong>,
          используя chain rule. Сложность — примерно 2× forward pass. Секрет
          в том, что chain rule даёт <strong>рекурсивную формулу</strong>:{" "}
          <code className="font-mono text-xs px-1 py-0.5 rounded bg-muted">∂L/∂θ = ∂L/∂output · ∂output/∂θ</code>,
          где <code className="font-mono text-xs px-1 py-0.5 rounded bg-muted">∂L/∂output</code> уже посчитан
          на следующем слое — его можно переиспользовать.
        </p>
        <p>
          В трансформере backprop идёт от loss (cross-entropy на последнем
          токене) → output head → final LayerNorm → N × (attention block +
          FFN block, каждый с residual) → embedding layer. На каждом блоке
          градиенты «размножаются» по residual connections и собираются
          обратно. PyTorch/TensorFlow делают это автоматически — разработчик
          пишет только forward.
        </p>
      </TheoryBlock>

      <SandboxBlock accent={accent} title="Backprop визуализатор — пошаговый reverse pass">
        <div className="grid lg:grid-cols-2 gap-4">
          {/* Слева: параметры графа */}
          <Card className={cn("p-4 space-y-3", accent.border)}>
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
              Параметры вычислительного графа
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <ParamSlider label="x₁" value={x1} onChange={setX1} min={-5} max={5} step={0.1} accent={accent} />
              <ParamSlider label="x₂" value={x2} onChange={setX2} min={-5} max={5} step={0.1} accent={accent} />
              <ParamSlider label="w₁" value={w1} onChange={setW1} min={-2} max={2} step={0.05} accent={accent} />
              <ParamSlider label="w₂" value={w2} onChange={setW2} min={-2} max={2} step={0.05} accent={accent} />
              <ParamSlider label="b" value={b} onChange={setB} min={-2} max={2} step={0.05} accent={accent} />
              <ParamSlider label="y (target)" value={y} onChange={setY} min={0} max={1} step={0.05} accent={accent} />
            </div>

            <div className={cn("rounded-md p-3 font-mono text-xs space-y-1", accent.bgSoft)}>
              <div>z = w₁·x₁ + w₂·x₂ + b = {z.toFixed(4)}</div>
              <div>ŷ = σ(z) = {yhat.toFixed(4)}</div>
              <div>L = ½(ŷ − y)² = {L.toFixed(4)}</div>
            </div>

            <div className="text-xs text-muted-foreground leading-relaxed">
              Граф: <code className="font-mono">x₁,x₂ → z=w₁x₁+w₂x₂+b → ŷ=σ(z) → L=½(ŷ−y)²</code>
            </div>
          </Card>

          {/* Справа: пошаговый backward pass */}
          <Card className={cn("p-4", accent.border)}>
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Backward pass — шаг {step + 1} / {steps.length}
              </div>
              <Badge variant="outline" className="font-mono text-xs">
                {currentStep.label}
              </Badge>
            </div>

            <div className={cn("rounded-md p-3 mb-3 font-mono text-sm", accent.bgSoft)}>
              {currentStep.formula}
            </div>

            <div className={cn("rounded-md p-3 mb-3 font-mono text-lg font-bold", accent.bg, accent.text)}>
              {currentStep.value}
            </div>

            <p className="text-sm text-foreground/90 leading-relaxed">{currentStep.desc}</p>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/60">
              <Button size="sm" variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
                ← Назад
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setStep(0)}>
                ↺ Заново
              </Button>
              <Button
                size="sm"
                onClick={() => setStep((s) => Math.min(steps.length - 1, s + 1))}
                disabled={step === steps.length - 1}
                className={cn(accent.bg, accent.text)}
              >
                Дальше →
              </Button>
            </div>
          </Card>
        </div>

        {/* Все градиенты в одной таблице */}
        <Card className={cn("p-4 mt-3", accent.border)}>
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
            Все градиенты (финал reverse pass)
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-sm">
            <GradRow label="∂L/∂w₁" value={dL_dw1} accent={accent} />
            <GradRow label="∂L/∂w₂" value={dL_dw2} accent={accent} />
            <GradRow label="∂L/∂b" value={dL_db} accent={accent} />
          </div>
        </Card>
      </SandboxBlock>

      <div className="grid sm:grid-cols-2 gap-3">
        <DefCard
          term="Chain rule"
          definition="Если y = f(g(x)), то ∂L/∂x = ∂L/∂y · ∂y/∂g · ∂g/∂x. Backprop применяет это рекурсивно от выхода ко входу."
          example="В трансформере: L → softmax → logits → output_proj → final_LN → N×(block) → embedding. Каждый шаг — умножение матриц Якоби."
          accent={accent}
        />
        <DefCard
          term="Computational graph"
          definition="DAG (направленный ациклический граф), где узлы = операции, рёбра = тензоры. PyTorch строит его автоматически во время forward, затем topologically сортирует для backward."
          example="При backward PyTorch идёт от L (корень) ко входам (листья), вызывая .backward() для каждого узла."
          accent={accent}
        />
        <DefCard
          term="Autograd"
          definition="Подсистема PyTorch/TF, которая автоматически строит граф и считает backward. Разработчик пишет только forward — градиенты получаются «бесплатно»."
          example="В PyTorch: loss.backward() — и все .grad поля заполняются. Никакого ручного chain rule."
          accent={accent}
        />
        <DefCard
          term="Vanishing gradients"
          definition="Когда chain rule проходит через sigmoid/tanh, градиент умножается на σ'(z) ≤ 0.25. Через 10 слоёв — 0.25¹⁰ ≈ 10⁻⁶. Глубокая сеть перестаёт обучаться."
          example="Поэтому в трансформерах используют ReLU/GELU/SiLU (производная ≤ 1, но не < 1 везде) и residual connections (градиент идёт в обход)."
          accent={accent}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <ConceptChip className={accent.chip}>chain rule</ConceptChip>
        <ConceptChip className={accent.chip}>computational graph</ConceptChip>
        <ConceptChip className={accent.chip}>autograd</ConceptChip>
        <ConceptChip className={accent.chip}>Jacobian</ConceptChip>
        <ConceptChip className={accent.chip}>topological sort</ConceptChip>
        <ConceptChip className={accent.chip}>leaf vs root</ConceptChip>
        <ConceptChip className={accent.chip}>gradient checkpointing</ConceptChip>
      </div>
    </ModuleShell>
  );
}

function ParamSlider({
  label,
  value,
  onChange,
  min,
  max,
  step,
  accent,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  accent: { text: string };
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="font-mono">{label}</span>
        <span className={cn("font-mono font-bold", accent.text)}>{value.toFixed(2)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-rose-500 h-1"
      />
    </div>
  );
}

function GradRow({ label, value, accent }: { label: string; value: number; accent: { text: string } }) {
  return (
    <div className="flex items-center justify-between p-2 rounded bg-muted/50">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={cn("font-bold", accent.text)}>{value.toFixed(4)}</span>
    </div>
  );
}
