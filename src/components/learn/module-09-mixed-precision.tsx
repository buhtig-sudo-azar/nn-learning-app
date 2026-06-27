"use client";

import { useState } from "react";
import { ModuleShell, TheoryBlock, SandboxBlock, GoalBlock, ConceptChip, DefCard } from "@/components/learn/shell";
import { ACCENTS } from "@/components/learn/accents";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Cpu, Zap, Activity, Layers } from "lucide-react";

type Precision = "fp32" | "fp16" | "bf16" | "fp8";

const PREC_META: Record<Precision, { label: string; bits: string; range: string; precision: string; use: string }> = {
  fp32: {
    label: "FP32",
    bits: "32 bit (1+8+23)",
    range: "±3.4e38",
    precision: "~7 decimal digits",
    use: "Эталон. Используется для master weights, loss, optimizer state. Медленный и жрёт память — для forward/backward слишком дорого.",
  },
  fp16: {
    label: "FP16",
    bits: "16 bit (1+5+10)",
    range: "±65504",
    precision: "~3 decimal digits",
    use: "В 2× быстрее FP32, в 2× меньше памяти. Но узкий range → underflow/overflow. Требует loss scaling. На старых GPU (V100) — единственная альтернатива FP32.",
  },
  bf16: {
    label: "BF16",
    bits: "16 bit (1+8+7)",
    range: "±3.4e38 (как FP32)",
    precision: "~2 decimal digits",
    use: "Тот же range что у FP32, но меньше точность. Не требует loss scaling! Стандарт для всех современных LLM на A100/H100. Google придумал.",
  },
  fp8: {
    label: "FP8",
    bits: "8 bit (варианты)",
    range: "±448 (E4M3) или ±57344 (E5M2)",
    precision: "~1-2 decimal digits",
    use: "Современный стандарт для inference и некоторых pretraining. На H100 поддерживается аппаратно. В 2× быстрее BF16. Требует аккуратной настройки scaling factor.",
  },
};

export function Module09MixedPrecision() {
  const accent = ACCENTS[9];
  const [active, setActive] = useState<Precision>("bf16");
  const meta = PREC_META[active];

  // Визуализация: 8x8 сетка значений и какие теряются при quantization
  const N = 8;
  const values: number[] = [];
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      // Сгенерируем значения от 0.001 до 1000 с разной точностью
      values.push(0.001 * Math.pow(10, (i * N + j) / 4));
    }
  }

  function quantize(v: number, prec: Precision): { value: number; error: number } {
    if (prec === "fp32") return { value: v, error: 0 };
    // Упрощённая модель
    const mantissaBits = prec === "fp16" ? 10 : prec === "bf16" ? 7 : prec === "fp8" ? 3 : 23;
    const expBits = prec === "fp16" ? 5 : prec === "bf16" ? 8 : prec === "fp8" ? 4 : 8;
    const maxVal = prec === "fp16" ? 65504 : prec === "fp8" ? 448 : 3.4e38;
    const minVal = prec === "fp16" ? 6e-5 : prec === "fp8" ? 0.001 : 1e-38;

    if (v > maxVal) return { value: Infinity, error: Infinity };
    if (v < minVal) return { value: 0, error: v };
    // Погрешность ~ 2^(-mantissaBits)
    const relErr = Math.pow(2, -mantissaBits);
    const err = v * relErr;
    return { value: v, error: err };
  }

  return (
    <ModuleShell
      id={9}
      title="Mixed precision — FP16, BF16, gradient accumulation"
      subtitle="Pretraining GPT-3 175B в FP32 занял бы годы и сотни GPU-кластеров. Решение — mixed precision: master weights в FP32, forward/backward в FP16 или BF16. В 2-4× быстрее, в 2× меньше памяти, без потери качества."
      accent={accent}
    >
      <GoalBlock accent={accent}>
        понять разницу между FP32, FP16, BF16, FP8 и почему BF16 — современный стандарт для LLM pretraining.
      </GoalBlock>

      <TheoryBlock accent={accent}>
        <p>
          Floating point число состоит из 3 полей: sign (1 бит),
          exponent (порядок), mantissa (мантисса). Exponent определяет
          <strong> range</strong> (какие числа можно представить — от
          крошечных до огромных), mantissa — <strong>precision</strong>
          (сколько значащих цифр).
        </p>
        <p>
          <strong>FP32</strong> (1+8+23): range ±3.4e38, ~7 значащих цифр.
          Эталон. Но для forward/backward слишком дорого — 4 байта на
          число, 175B параметров × 4 = 700GB только для весов.
        </p>
        <p>
          <strong>FP16</strong> (1+5+10): range ±65504, ~3 цифры. В 2×
          быстрее FP32 на GPU. Но range узкий — градиенты часто
          underflow (стали &lt; 6e-5 → 0) или activations overflow
          (&gt; 65504 → inf). Решение: <strong>loss scaling</strong> —
          умножаем loss на большое число (1024), градиенты масштабируются
          вверх, не зануляются. Перед optimizer step масштабируем
          обратно.
        </p>
        <p>
          <strong>BF16</strong> (1+8+7): range ±3.4e38 (как FP32!), ~2
          цифры. Идея Google: сохранить range FP32, пожертвовать
          precision. Не требует loss scaling — gradient не может
          underflow. Минус: меньше precision, иногда медленнее сходится
          на маленьких моделях. <strong>Стандарт для всех LLM на
          A100/H100</strong> — Llama 2/3, Mistral, Qwen, GPT-4.
        </p>
        <p>
          <strong>FP8</strong>: два варианта (E4M3 для forward, E5M2 для
          backward). На H100 поддерживается аппаратно, в 2× быстрее
          BF16. Сложность: нужно динамически подбирать scaling factor
          для каждого тензора. Используется в inference (Llama 3 405B
          inference в FP8), для pretraining пока экспериментально.
        </p>
        <p>
          <strong>Gradient accumulation</strong>: если физический batch
          не помещается в GPU, делаем несколько micro-batches и
          накапливаем градиенты, потом делаем один optimizer step.
          Эквивалентно большему batch_size, но медленнее. Llama 3 405B:
          effective batch 16M токенов через 8 micro-batches на 8 GPU.
        </p>
      </TheoryBlock>

      <SandboxBlock accent={accent} title="Precision comparison — range vs precision">
        <div className="grid lg:grid-cols-[1fr_280px] gap-4">
          <Card className={cn("p-5", accent.border)}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-xs text-muted-foreground font-mono uppercase tracking-wide">{meta.bits}</div>
                <h3 className="text-lg font-bold">{meta.label}</h3>
              </div>
              <Badge variant="outline" className="font-mono text-xs">
                {active === "fp32" && "Эталон"}
                {active === "fp16" && "Старый стандарт"}
                {active === "bf16" && "Современный стандарт"}
                {active === "fp8" && "Frontier"}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className={cn("rounded-md p-3", accent.bgSoft)}>
                <div className="text-xs text-muted-foreground font-mono uppercase">Range</div>
                <div className="font-mono font-bold text-sm">{meta.range}</div>
              </div>
              <div className={cn("rounded-md p-3", accent.bgSoft)}>
                <div className="text-xs text-muted-foreground font-mono uppercase">Precision</div>
                <div className="font-mono font-bold text-sm">{meta.precision}</div>
              </div>
            </div>

            <p className="text-sm text-foreground/90 leading-relaxed mb-4">{meta.use}</p>

            {/* Bit layout visualization */}
            <div className="text-xs font-mono text-muted-foreground mb-2">Bit layout:</div>
            <div className="flex gap-1">
              {active === "fp32" && (
                <>
                  <div className="bg-amber-300 dark:bg-amber-700 h-6 w-3 rounded-sm" title="sign" />
                  {Array.from({ length: 8 }).map((_, i) => <div key={i} className="bg-rose-400 dark:bg-rose-600 h-6 w-3 rounded-sm" title="exponent" />)}
                  {Array.from({ length: 23 }).map((_, i) => <div key={i} className="bg-emerald-400 dark:bg-emerald-600 h-6 w-3 rounded-sm" title="mantissa" />)}
                </>
              )}
              {active === "fp16" && (
                <>
                  <div className="bg-amber-300 dark:bg-amber-700 h-6 w-3 rounded-sm" />
                  {Array.from({ length: 5 }).map((_, i) => <div key={i} className="bg-rose-400 dark:bg-rose-600 h-6 w-3 rounded-sm" />)}
                  {Array.from({ length: 10 }).map((_, i) => <div key={i} className="bg-emerald-400 dark:bg-emerald-600 h-6 w-3 rounded-sm" />)}
                </>
              )}
              {active === "bf16" && (
                <>
                  <div className="bg-amber-300 dark:bg-amber-700 h-6 w-3 rounded-sm" />
                  {Array.from({ length: 8 }).map((_, i) => <div key={i} className="bg-rose-400 dark:bg-rose-600 h-6 w-3 rounded-sm" />)}
                  {Array.from({ length: 7 }).map((_, i) => <div key={i} className="bg-emerald-400 dark:bg-emerald-600 h-6 w-3 rounded-sm" />)}
                </>
              )}
              {active === "fp8" && (
                <>
                  <div className="bg-amber-300 dark:bg-amber-700 h-6 w-3 rounded-sm" />
                  {Array.from({ length: 4 }).map((_, i) => <div key={i} className="bg-rose-400 dark:bg-rose-600 h-6 w-3 rounded-sm" />)}
                  {Array.from({ length: 3 }).map((_, i) => <div key={i} className="bg-emerald-400 dark:bg-emerald-600 h-6 w-3 rounded-sm" />)}
                </>
              )}
            </div>
            <div className="flex gap-3 text-xs text-muted-foreground mt-2 font-mono">
              <span><span className="inline-block w-2 h-2 bg-amber-400 dark:bg-amber-700 rounded-sm mr-1" />sign</span>
              <span><span className="inline-block w-2 h-2 bg-rose-500 rounded-sm mr-1" />exponent (range)</span>
              <span><span className="inline-block w-2 h-2 bg-emerald-500 rounded-sm mr-1" />mantissa (precision)</span>
            </div>
          </Card>

          <div className="space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Precision
            </div>
            {(Object.keys(PREC_META) as Precision[]).map((p) => (
              <button
                key={p}
                onClick={() => setActive(p)}
                className={cn(
                  "w-full text-left p-3 rounded-lg border-2 transition-all",
                  active === p
                    ? cn(accent.bg, accent.border, "scale-[1.02]")
                    : "bg-card hover:bg-muted/50 border-border"
                )}
              >
                <div className="font-semibold text-sm">{PREC_META[p].label}</div>
                <div className="text-xs font-mono text-muted-foreground mt-0.5">{PREC_META[p].bits}</div>
              </button>
            ))}
          </div>
        </div>
      </SandboxBlock>

      <div className="grid sm:grid-cols-2 gap-3">
        <DefCard
          term="Loss scaling (FP16)"
          definition="Умножаем loss на большой коэффициент (1024-65536), чтобы градиенты не занулялись. Перед optimizer step — делим обратно. Если всё равно NaN — уменьшаем scale. Автоматически в PyTorch AMP."
          example="В PyTorch: torch.cuda.amp.GradScaler(init_scale=65536). Динамически подстраивается."
          accent={accent}
        />
        <DefCard
          term="Gradient accumulation"
          definition="Несколько micro-batches прогоняем без optimizer step, градиенты накапливаются. После N micro-batches делаем step. Эквивалентно batch_size = micro_batch × N."
          example="Llama 3 405B: micro_batch=2M tokens × 8 accumulation = 16M effective batch."
          accent={accent}
        />
        <DefCard
          term="Gradient checkpointing"
          definition="Не храним intermediate activations для backward, пересчитываем их на лету. В 4× меньше памяти, на 30% медленнее. Обязательно для больших моделей."
          example="В PyTorch: torch.utils.checkpoint.checkpoint(module, x). Llama 3 405B использует для всех слоёв."
          accent={accent}
        />
        <DefCard
          term="EMA (Exponential Moving Average)"
          definition="Держим скользящее среднее весов: θ_ema ← α·θ_ema + (1−α)θ. На inference используем θ_ema вместо θ — стабильнее, лучше качество."
          example="Используется в GPT-3, Llama 2. α ≈ 0.999. Часто даёт +0.5pp на benchmarks."
          accent={accent}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <ConceptChip className={accent.chip}>FP32</ConceptChip>
        <ConceptChip className={accent.chip}>FP16</ConceptChip>
        <ConceptChip className={accent.chip}>BF16</ConceptChip>
        <ConceptChip className={accent.chip}>FP8</ConceptChip>
        <ConceptChip className={accent.chip}>loss scaling</ConceptChip>
        <ConceptChip className={accent.chip}>gradient accumulation</ConceptChip>
        <ConceptChip className={accent.chip}>gradient checkpointing</ConceptChip>
        <ConceptChip className={accent.chip}>AMP</ConceptChip>
        <ConceptChip className={accent.chip}>EMA</ConceptChip>
      </div>
    </ModuleShell>
  );
}
