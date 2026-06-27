"use client";

import { useState } from "react";
import { ModuleShell, TheoryBlock, SandboxBlock, GoalBlock, ConceptChip, DefCard } from "@/components/learn/shell";
import { ACCENTS } from "@/components/learn/accents";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Activity, Layers, BarChart3, Shuffle } from "lucide-react";

type NormKind = "batch" | "layer" | "rms" | "group";

const NORM_META: Record<NormKind, { label: string; formula: string; axis: string; use: string }> = {
  batch: {
    label: "BatchNorm",
    formula: "y = γ·(x − μ_B)/σ_B + β",
    axis: "по [batch, spatial]",
    use: "Усреднение по батчу и пространственным осям. Зависит от размера батча, ломается при batch_size=1 (inference). Используется в CNN (ResNet, VGG).",
  },
  layer: {
    label: "LayerNorm",
    formula: "y = γ·(x − μ_L)/σ_L + β",
    axis: "по [features]",
    use: "Усреднение по feature-оси, независимо для каждого элемента батча. Не зависит от размера батча. Стандарт для трансформеров (BERT, GPT, Llama).",
  },
  rms: {
    label: "RMSNorm",
    formula: "y = γ·x / √(mean(x²) + ε)",
    axis: "по [features], без центрирования",
    use: "Упрощённый LayerNorm: убрали вычитание среднего (β). Только масштабирование по RMS. На 10-30% быстрее, точность та же. Стандарт для Llama 2/3, Qwen, Mistral.",
  },
  group: {
    label: "GroupNorm",
    formula: "y = γ·(x − μ_G)/σ_G + β",
    axis: "по [groups of channels]",
    use: "Усреднение по группам каналов. Не зависит от батча. Используется в diffusion models (Stable Diffusion) и small-batch CNN training.",
  },
};

export function Module06Normalization() {
  const accent = ACCENTS[6];
  const [kind, setKind] = useState<NormKind>("layer");
  const meta = NORM_META[kind];

  // Визуализация: какие оси усредняются для тензора [B, C, H, W] или [B, T, D]
  // Для трансформеров: [B, T, D], нормировка по D
  // Покажем матрицу 4×6 (B=4 batch, D=6 features), подсветим вдоль чего усредняется
  const B = 4, D = 6;
  const cells: { b: number; d: number; active: boolean }[] = [];
  for (let b = 0; b < B; b++) {
    for (let d = 0; d < D; d++) {
      let active = false;
      switch (kind) {
        case "batch":
          // усредняем по всем b (фиксированный d) — то есть столбец
          active = true;
          break;
        case "layer":
        case "rms":
          // усредняем по всем d (фиксированный b) — то есть строка
          active = true;
          break;
        case "group":
          // усредняем по группам d, фиксированный b
          active = true;
          break;
      }
      cells.push({ b, d, active });
    }
  }

  return (
    <ModuleShell
      id={6}
      title="Нормализация — BatchNorm, LayerNorm, RMSNorm"
      subtitle="Нормализация держит активации в разумном диапазоне, без неё глубокие сети не обучаются. В трансформерах стандарт — LayerNorm или RMSNorm. В CNN — BatchNorm. От выбора зависит и стабильность, и скорость."
      accent={accent}
    >
      <GoalBlock accent={accent}>
        понять, зачем нормировать активации, и почему RMSNorm вытесняет LayerNorm в современных LLM.
      </GoalBlock>

      <TheoryBlock accent={accent}>
        <p>
          Без нормализации глубокие сети страдают от <strong>internal
          covariate shift</strong>: распределение активаций каждого слоя
          меняется при обновлении весов предыдущего, что замедляет
          обучение. Нормализация фиксирует это: для каждого слоя
          приводим активации к нулевому среднему и единичной дисперсии,
          затем масштабируем и сдвигаем обучаемыми γ и β.
        </p>
        <p>
          <strong>BatchNorm</strong> (2015) усредняет по батчу: для каждого
          признака считает среднее и дисперсию по всем примерам в батче.
          Проблема: при batch_size=1 (inference) или очень маленьком
          батче статистика шумная. Поэтому BatchNorm требует running
          statistics и плохо работает в NLP, где батчи часто маленькие
          и переменной длины.
        </p>
        <p>
          <strong>LayerNorm</strong> (2016) усредняет по признакам,
          независимо для каждого примера: для каждого токена в каждом
          примере считаем среднее и дисперсию его d-мерного вектора.
          Не зависит от размера батча, работает одинаково на train и
          inference. Стандарт для всех трансформеров (BERT, GPT-2,
          T5, ранние Llama).
        </p>
        <p>
          <strong>RMSNorm</strong> (2019) — упрощённый LayerNorm. Заметили,
          что вычитание среднего не так важно — основная польза от
          деления на RMS (root mean square). Убрали μ и β, оставили
          только масштабирование. На 10-30% быстрее, точность в LLM
          не падает. <strong>Стандарт для Llama 2/3, Mistral, Qwen,
          DeepSeek</strong> — всех современных open-source LLM.
        </p>
        <p>
          <strong>Pre-LN vs Post-LN</strong>: в оригинальном трансформере
          LayerNorm стоял после residual (post-LN). Оказалось, что
          pre-LN (LayerNorm до sublayer) стабильнее обучается на
          большой глубине. Все современные LLM используют pre-LN
          (или вариант Sandwich-LN).
        </p>
      </TheoryBlock>

      <SandboxBlock accent={accent} title="Сравнение нормализаций — какие оси усредняются">
        <div className="grid lg:grid-cols-[1fr_280px] gap-4">
          {/* Визуализация */}
          <Card className={cn("p-5", accent.border)}>
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
              Тензор [B=4, D=6] — какие оси усредняются
            </div>
            <div className="inline-block">
              {/* Заголовок столбцов (D) */}
              <div className="flex">
                <div className="w-12" />
                {Array.from({ length: D }).map((_, d) => (
                  <div key={d} className="w-12 text-center text-xs font-mono text-muted-foreground">
                    d{d}
                  </div>
                ))}
              </div>
              {/* Строки (B) */}
              {Array.from({ length: B }).map((_, b) => (
                <div key={b} className="flex items-center">
                  <div className="w-12 text-xs font-mono text-muted-foreground text-right pr-2">
                    B{b}
                  </div>
                  {Array.from({ length: D }).map((_, d) => {
                    const cell = cells.find((c) => c.b === b && c.d === d)!;
                    // подсветка строки / столбца
                    let highlighted = false;
                    let highlightColor = "";
                    if (kind === "batch") {
                      // выделим весь столбец d=2 (условно)
                      highlighted = d === 2 && cell.active;
                      highlightColor = "bg-rose-500/40 border-rose-500";
                    } else if (kind === "layer" || kind === "rms") {
                      highlighted = b === 1 && cell.active;
                      highlightColor = "bg-emerald-500/40 border-emerald-500";
                    } else if (kind === "group") {
                      // group по 2 фичи: группа d∈{2,3} для b=1
                      highlighted = b === 1 && (d === 2 || d === 3) && cell.active;
                      highlightColor = "bg-amber-500/40 border-amber-500";
                    }
                    return (
                      <div
                        key={d}
                        className={cn(
                          "w-12 h-12 border m-0.5 rounded flex items-center justify-center text-xs",
                          highlighted
                            ? highlightColor
                            : "border-border bg-muted/30"
                        )}
                      >
                        {highlighted ? "●" : ""}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
            <div className="text-xs text-muted-foreground mt-3 leading-relaxed">
              {kind === "batch" && "Подсвечен столбец d=2 — для BatchNorm среднее и дисперсия считаются по всем примерам батча для этого признака."}
              {kind === "layer" && "Подсвечена строка B=1 — для LayerNorm среднее и дисперсия считаются по всем признакам для этого примера."}
              {kind === "rms" && "Аналогично LayerNorm, но без вычитания среднего — только делим на RMS. Подсвечена строка B=1."}
              {kind === "group" && "Подсвечена пара (B=1, d∈{2,3}) — для GroupNorm признаки разбиваются на группы, статистика считается по группе."}
            </div>
          </Card>

          {/* Controls */}
          <div className="space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Нормализация
            </div>
            {(Object.keys(NORM_META) as NormKind[]).map((k) => (
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
                <div className="font-semibold text-sm">{NORM_META[k].label}</div>
                <div className="text-xs font-mono text-muted-foreground mt-0.5">{NORM_META[k].axis}</div>
              </button>
            ))}

            <div className={cn("rounded-md p-3 border mt-3", accent.border, accent.bgSoft)}>
              <div className="text-xs font-mono mb-2">{meta.formula}</div>
              <p className="text-xs leading-relaxed text-foreground/90">{meta.use}</p>
            </div>
          </div>
        </div>
      </SandboxBlock>

      <div className="grid sm:grid-cols-2 gap-3">
        <DefCard
          term="γ и β (learnable)"
          definition="Параметры нормализации: γ масштабирует, β сдвигает. Без них нормализация была бы слишком жёсткой — сеть не могла бы «откатить» нормализацию, если это нужно."
          example="В Llama 2 7B: γ и β = 2×4096 = 8192 параметра на слой (для RMSNorm только γ)."
          accent={accent}
        />
        <DefCard
          term="Pre-LN vs Post-LN"
          definition="Pre-LN: нормализация перед sublayer (x + sublayer(LN(x))). Post-LN: после (LN(x + sublayer(x))). Pre-LN стабильнее, все современные LLM используют pre-LN."
          example="Оригинальный трансформер (Vaswani 2017) использовал post-LN. BERT, GPT-2, GPT-3, Llama — pre-LN."
          accent={accent}
        />
        <DefCard
          term="QK-Norm"
          definition="Дополнительная RMSNorm над Q и K перед attention (не над всем блоком). Стабилизирует attention при очень большой размерности. Используется в некоторых последних моделях."
          example="См.论文 «Understanding and Improving Large Language Model Stability» (2024)."
          accent={accent}
        />
        <DefCard
          term="Running statistics"
          definition="В BatchNorm на inference нельзя использовать батч-статистику — её может не быть (batch=1). Поэтому храним running average μ и σ, обновляемые на train. LayerNorm/RMSNorm этого не требуют."
          example="В PyTorch: BatchNorm имеет parameters running_mean, running_var. LayerNorm — нет."
          accent={accent}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <ConceptChip className={accent.chip}>BatchNorm</ConceptChip>
        <ConceptChip className={accent.chip}>LayerNorm</ConceptChip>
        <ConceptChip className={accent.chip}>RMSNorm</ConceptChip>
        <ConceptChip className={accent.chip}>GroupNorm</ConceptChip>
        <ConceptChip className={accent.chip}>γ β</ConceptChip>
        <ConceptChip className={accent.chip}>pre-LN</ConceptChip>
        <ConceptChip className={accent.chip}>post-LN</ConceptChip>
        <ConceptChip className={accent.chip}>QK-Norm</ConceptChip>
      </div>
    </ModuleShell>
  );
}
