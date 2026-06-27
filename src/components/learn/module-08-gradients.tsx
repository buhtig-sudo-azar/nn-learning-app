"use client";

import { useState } from "react";
import { ModuleShell, TheoryBlock, SandboxBlock, GoalBlock, ConceptChip, DefCard } from "@/components/learn/shell";
import { ACCENTS } from "@/components/learn/accents";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Activity, AlertTriangle, TrendingUp, Scissors } from "lucide-react";

type Issue = "vanishing" | "exploding" | "healthy";

export function Module08Gradients() {
  const accent = ACCENTS[8];
  const [depth, setDepth] = useState(24);
  const [hasResidual, setHasResidual] = useState(true);
  const [activation, setActivation] = useState<"relu" | "sigmoid" | "tanh">("relu");
  const [clipNorm, setClipNorm] = useState(0); // 0 = off

  // Симулируем gradient magnitude по слоям (типичный паттерн)
  // Без residual: magnitude затухает/растёт в зависимости от activation
  // С residual: держится ~1
  function gradientAt(layer: number): number {
    const t = layer / depth;
    if (hasResidual) {
      // Стабильно около 1, небольшие колебания
      return 1.0 + 0.1 * Math.sin(layer) + (1 - t) * 0.2;
    }
    // Без residual: зависит от activation
    let factor = 1;
    if (activation === "sigmoid") factor = 0.25; // max derivative
    else if (activation === "tanh") factor = 1.0;
    else if (activation === "relu") factor = 0.7; // средняя производная

    // Vanishing: экспоненциальное затухание
    return Math.pow(factor, layer);
  }

  const gradValues: number[] = [];
  for (let i = 0; i <= depth; i++) {
    let v = gradientAt(i);
    // Gradient clipping
    if (clipNorm > 0) {
      v = Math.min(v, clipNorm);
    }
    gradValues.push(v);
  }

  // Классификация
  let issue: Issue = "healthy";
  const first = gradValues[0];
  const last = gradValues[gradValues.length - 1];
  if (last < 0.01) issue = "vanishing";
  else if (last > 100 || first > 100) issue = "exploding";
  else if (Math.max(...gradValues) / Math.min(...gradValues) > 50) issue = "vanishing";

  const issueColor: Record<Issue, string> = {
    vanishing: "text-amber-700 dark:text-amber-300",
    exploding: "text-red-700 dark:text-red-300",
    healthy: "text-emerald-700 dark:text-emerald-300",
  };

  const issueLabel: Record<Issue, string> = {
    vanishing: "Vanishing gradients — ранние слои не обучаются",
    exploding: "Exploding gradients — обучение расходится",
    healthy: "Здоровый gradient flow",
  };

  // SVG
  const W = 600, H = 240, padding = 32;
  const maxV = Math.max(...gradValues, 2);
  const minV = Math.max(0.001, Math.min(...gradValues));
  const logMax = Math.log10(maxV + 0.01);
  const logMin = Math.log10(minV);

  function px(layer: number): number {
    return padding + (layer / depth) * (W - 2 * padding);
  }
  function py(v: number): number {
    const logV = Math.log10(Math.max(v, 0.001));
    const t = (logV - logMin) / (logMax - logMin || 1);
    return H - padding - t * (H - 2 * padding);
  }

  const path = gradValues.map((v, i) => `${i === 0 ? "M" : "L"}${px(i).toFixed(1)},${py(v).toFixed(1)}`).join(" ");

  return (
    <ModuleShell
      id={8}
      title="Градиенты — vanishing, exploding, clipping"
      subtitle="Через 50 слоёв chain rule умножает 50 производных. Если каждая ≤ 0.9 — получаем 0.9⁵⁰ ≈ 0.005. Если каждая ≥ 1.1 — получаем 1.1⁵⁰ ≈ 117. Градиенты либо исчезают, либо взрываются. Решение: residual connections, правильные активации, gradient clipping."
      accent={accent}
    >
      <GoalBlock accent={accent}>
        понять, почему глубокие сети без residual не обучаются, и как gradient clipping спасает LLM от divergence.
      </GoalBlock>

      <TheoryBlock accent={accent}>
        <p>
          Backprop — это цепочка умножений. Для слоя L градиент по
          параметрам слоя 1 равен произведению производных всех слоёв
          между ними. Если каждая производная ≤ 0.9, то через 50 слоёв
          получаем 0.9⁵⁰ ≈ 0.005 — градиент по ранним слоям практически
          нулевой, они не обучаются. Это{" "}
          <strong>vanishing gradients</strong>.
        </p>
        <p>
          Обратная ситуация: если каждая производная ≥ 1.1, то 1.1⁵⁰ ≈ 117.
          Градиент взрывается, веса получают огромные обновления, loss
          уходит в NaN. Это <strong>exploding gradients</strong>. Особенно
          часто встречается в RNN (длинные последовательности) и в
          pretraining больших LLM (первые сотни шагов).
        </p>
        <p>
          <strong>Решение 1: Residual connections</strong>. С residual
          градиент может идти «в обход» через сложение:{" "}
          <code className="font-mono text-xs px-1 py-0.5 rounded bg-muted">∂(x + f(x))/∂x = 1 + f'(x)</code>.
          Эта «1» гарантирует, что градиент не зануляется, даже если f'
          мало. Без residual трансформеры глубже 12 слоёв не обучались;
          с residual — 100+ слоёв (GPT-3 = 96).
        </p>
        <p>
          <strong>Решение 2: Правильные активации</strong>. Sigmoid:
          производная ≤ 0.25 — худший выбор. Tanh: ≤ 1, но часто &lt; 1.
          ReLU: 0 или 1, не затухает для положительных. GELU, SiLU —
          современные аналоги. В LLM везде ReLU/GELU/SiLU, sigmoid только
          в gating механизмах (LSTM, GRU, SwiGLU).
        </p>
        <p>
          <strong>Решение 3: Gradient clipping</strong>. Если норма
          градиента &gt; τ, масштабируем его вниз:{" "}
          <code className="font-mono text-xs px-1 py-0.5 rounded bg-muted">g ← g · τ/‖g‖</code>.
          Не лечит причину, но не даёт NaN убить обучение. Стандарт для
          всех LLM pretraining: τ ≈ 1.0 (clip by global norm).
        </p>
      </TheoryBlock>

      <SandboxBlock accent={accent} title="Gradient flow analyzer — глубина, residual, clipping">
        <div className="grid lg:grid-cols-[1fr_280px] gap-4">
          <Card className={cn("p-5", accent.border)}>
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Gradient magnitude по слоям (log scale)
              </div>
              <Badge variant="outline" className={cn("font-mono text-xs", issueColor[issue])}>
                {issueLabel[issue]}
              </Badge>
            </div>

            <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
              {/* Axes */}
              <line x1={padding} y1={H - padding} x2={W - padding} y2={H - padding} stroke="currentColor" strokeWidth={1} className="text-muted-foreground" />
              <line x1={padding} y1={padding} x2={padding} y2={H - padding} stroke="currentColor" strokeWidth={1} className="text-muted-foreground" />

              {/* Healthy zone */}
              <rect x={padding} y={py(2)} width={W - 2 * padding} height={py(0.5) - py(2)} fill="#10b981" opacity={0.08} />
              <line x1={padding} y1={py(1)} x2={W - padding} y2={py(1)} stroke="#10b981" strokeWidth={1} strokeDasharray="4 4" opacity={0.5} />

              {/* Clipping line */}
              {clipNorm > 0 && (
                <>
                  <line x1={padding} y1={py(clipNorm)} x2={W - padding} y2={py(clipNorm)} stroke="#ef4444" strokeWidth={1.5} strokeDasharray="2 2" />
                  <text x={W - padding} y={py(clipNorm) - 4} textAnchor="end" className="fill-red-600 text-[10px] font-mono">clip={clipNorm}</text>
                </>
              )}

              {/* Curve */}
              <path d={path} fill="none" stroke="#f43f5e" strokeWidth={2.5} />
              {gradValues.map((v, i) => (
                <circle key={i} cx={px(i)} cy={py(v)} r={2.5} fill="#f43f5e" />
              ))}

              {/* Labels */}
              <text x={padding} y={H - padding + 16} className="fill-muted-foreground text-[10px] font-mono">layer 0</text>
              <text x={W - padding} y={H - padding + 16} textAnchor="end" className="fill-muted-foreground text-[10px] font-mono">layer {depth}</text>
              <text x={padding - 4} y={padding + 4} textAnchor="end" className="fill-muted-foreground text-[10px] font-mono">{maxV.toFixed(2)}</text>
              <text x={padding - 4} y={H - padding} textAnchor="end" className="fill-muted-foreground text-[10px] font-mono">{minV.toFixed(4)}</text>
            </svg>
            <p className="text-xs text-muted-foreground mt-2">
              Зелёная зона — здоровый диапазон (0.5–2.0). Красная пунктирная — порог clipping. Точки — gradient magnitude на каждом слое.
            </p>
          </Card>

          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-mono">Глубина сети</span>
                <span className={cn("font-mono font-bold", accent.text)}>{depth}</span>
              </div>
              <input
                type="range"
                min="4"
                max="120"
                step="4"
                value={depth}
                onChange={(e) => setDepth(parseInt(e.target.value))}
                className="w-full accent-rose-500"
              />
              <p className="text-xs text-muted-foreground mt-1">GPT-2 small = 12, GPT-3 = 96, Llama 3 405B = 126</p>
            </div>

            <div>
              <div className="text-xs font-mono mb-1">Активация</div>
              <div className="grid grid-cols-3 gap-1">
                {(["relu", "sigmoid", "tanh"] as const).map((a) => (
                  <button
                    key={a}
                    onClick={() => setActivation(a)}
                    className={cn(
                      "p-2 rounded-md border-2 text-xs font-mono transition-all",
                      activation === a ? cn(accent.bg, accent.border) : "border-border hover:bg-muted/50"
                    )}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-xs font-mono mb-1">Residual connections</div>
              <div className="grid grid-cols-2 gap-1">
                <button
                  onClick={() => setHasResidual(true)}
                  className={cn(
                    "p-2 rounded-md border-2 text-xs transition-all",
                    hasResidual ? cn(accent.bg, accent.border) : "border-border hover:bg-muted/50"
                  )}
                >
                  ON
                </button>
                <button
                  onClick={() => setHasResidual(false)}
                  className={cn(
                    "p-2 rounded-md border-2 text-xs transition-all",
                    !hasResidual ? cn(accent.bg, accent.border) : "border-border hover:bg-muted/50"
                  )}
                >
                  OFF
                </button>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-mono">Clip norm (0=off)</span>
                <span className={cn("font-mono font-bold", accent.text)}>{clipNorm.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="5"
                step="0.5"
                value={clipNorm}
                onChange={(e) => setClipNorm(parseFloat(e.target.value))}
                className="w-full accent-rose-500"
              />
            </div>

            <div className={cn("rounded-md p-3 border text-xs leading-relaxed", accent.border, accent.bgSoft)}>
              <strong>Попробуй:</strong> выключи residual, поставь sigmoid, глубину 60 — увидишь классический vanishing gradients (gradient на ранних слоях ≈ 0). Включи residual — проблема исчезнет.
            </div>
          </div>
        </div>
      </SandboxBlock>

      <div className="grid sm:grid-cols-2 gap-3">
        <DefCard
          term="Global norm clipping"
          definition="Считаем норму всего градиента (по всем параметрам сразу), если > τ — масштабируем. Стандарт для LLM. τ ≈ 1.0 для pretraining."
          example="В PyTorch: torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0). GPT-3 использовал τ=1.0."
          accent={accent}
        />
        <DefCard
          term="Value clipping"
          definition="Альтернатива: клипаем каждый элемент градиента к [-τ, +τ]. Менее популярно — нарушает направление градиента."
          example="В PyTorch: torch.nn.utils.clip_grad_value_(model.parameters(), clip_value=0.5)."
          accent={accent}
        />
        <DefCard
          term="Gradient noise injection"
          definition="Добавляем шум к градиенту: g ← g + ε·ξ, ξ ~ N(0, σ²). Помогает выбираться из saddle points. Использовалось в некоторых ранних LLM."
          example="Neelakantan et al. 2015. Сейчас почти не используется — слишком дорого."
          accent={accent}
        />
        <DefCard
          term="Xavier / He init"
          definition="Правильная инициализация весов: Xavier для tanh/sigmoid, He для ReLU. Дисперсия весов подбирается так, чтобы дисперсия активаций сохранялась по слоям. Без этого взрыв/затухание гарантированы."
          example="В PyTorch: nn.init.xavier_uniform_, nn.init.kaiming_normal_. Для LLM обычно truncated normal с std=0.02."
          accent={accent}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <ConceptChip className={accent.chip}>vanishing gradients</ConceptChip>
        <ConceptChip className={accent.chip}>exploding gradients</ConceptChip>
        <ConceptChip className={accent.chip}>residual connections</ConceptChip>
        <ConceptChip className={accent.chip}>gradient clipping</ConceptChip>
        <ConceptChip className={accent.chip}>global norm clipping</ConceptChip>
        <ConceptChip className={accent.chip}>Xavier init</ConceptChip>
        <ConceptChip className={accent.chip}>He init</ConceptChip>
        <ConceptChip className={accent.chip}>chain rule</ConceptChip>
      </div>
    </ModuleShell>
  );
}
