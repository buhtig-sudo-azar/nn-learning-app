"use client";

import { useState } from "react";
import { ModuleShell, TheoryBlock, SandboxBlock, GoalBlock, ConceptChip, DefCard } from "@/components/learn/shell";
import { ACCENTS } from "@/components/learn/accents";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TrendingUp, Activity, Calendar, Gauge } from "lucide-react";

type ScheduleKind = "constant" | "step" | "cosine" | "linear_warmup_cosine" | "cyclic";

const SCHEDULE_META: Record<ScheduleKind, { label: string; desc: string }> = {
  constant: { label: "Constant", desc: "LR не меняется. Просто, но обычно suboptimal — late training тратит время на большие шаги." },
  step: { label: "Step decay", desc: "Каждые N эпох делим LR на γ (обычно 0.1). Классика для ImageNet/resnet эпохи." },
  cosine: { label: "Cosine decay", desc: "Плавно уменьшаем LR по косинусу от η_max до η_min. Самый частый выбор в LLM pretraining." },
  linear_warmup_cosine: { label: "Warmup + Cosine", desc: "Сначала линейно растёт от 0 до η_max (warmup), потом косинус до η_min. Стандарт для всех LLM — без warmup первые шаги расходятся." },
  cyclic: { label: "Cyclic (triangular)", desc: "LR колеблется между min и max. Помогает выбираться из local minima. Сейчас почти не используется." },
};

function lrAt(kind: ScheduleKind, t: number, total: number, etaMax: number, etaMin: number, warmup: number): number {
  const progress = t / total;
  switch (kind) {
    case "constant":
      return etaMax;
    case "step":
      return etaMax * Math.pow(0.1, Math.floor(progress * 3));
    case "cosine": {
      const p = Math.min(1, Math.max(0, progress));
      return etaMin + 0.5 * (etaMax - etaMin) * (1 + Math.cos(Math.PI * p));
    }
    case "linear_warmup_cosine": {
      const warmupP = warmup / total;
      if (progress < warmupP) {
        return etaMax * (progress / warmupP);
      }
      const p = (progress - warmupP) / (1 - warmupP);
      return etaMin + 0.5 * (etaMax - etaMin) * (1 + Math.cos(Math.PI * p));
    }
    case "cyclic": {
      const cycle = 0.2; // 5 циклов за обучение
      const p = (progress % cycle) / cycle;
      return etaMin + (etaMax - etaMin) * (1 - Math.abs(2 * p - 1));
    }
  }
}

export function Module05LrSchedules() {
  const accent = ACCENTS[5];
  const [kind, setKind] = useState<ScheduleKind>("linear_warmup_cosine");
  const [etaMax, setEtaMax] = useState(3e-4);
  const [etaMin, setEtaMin] = useState(3e-5);
  const [warmup, setWarmup] = useState(2000); // в шагах
  const [total, setTotal] = useState(20000);

  // Генерируем кривую LR
  const points: { t: number; lr: number }[] = [];
  const N = 200;
  for (let i = 0; i <= N; i++) {
    const t = (i / N) * total;
    points.push({ t, lr: lrAt(kind, t, total, etaMax, etaMin, warmup) });
  }

  // SVG
  const W = 600, H = 240, padding = 32;
  function px(t: number): number {
    return padding + (t / total) * (W - 2 * padding);
  }
  function py(lr: number): number {
    return H - padding - (lr / etaMax) * (H - 2 * padding);
  }

  const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${px(p.t).toFixed(1)},${py(p.lr).toFixed(1)}`).join(" ");

  return (
    <ModuleShell
      id={5}
      title="LR schedules — warmup, cosine decay, cyclic"
      subtitle="Learning rate — самый важный гиперпараметр. Но и его недостаточно зафиксировать: нужно ещё менять во время обучения. Стандарт современного LLM pretraining: linear warmup + cosine decay."
      accent={accent}
    >
      <GoalBlock accent={accent}>
        понять, зачем менять learning rate во время обучения, и какие 4 расписания используются на практике.
      </GoalBlock>

      <TheoryBlock accent={accent}>
        <p>
          Если держать LR постоянным, возникают две проблемы. В начале
          обучения веса случайные, градиенты большие — большой шаг может
          выбросить сеть в «плохую» область. В конце обучения мы уже
          близко к минимуму, но большие шаги не дают точно сойтись —
          сеть «топчется» вокруг минимума.
        </p>
        <p>
          <strong>Warmup</strong>: первые ~2000 шагов LR линейно растёт
          от 0 до η_max. Идея: первые шаги — самые опасные, лучше начать
          осторожно. Без warmup Adam часто расходится на больших моделях
          (&gt;1B параметров) — взрыв градиентов в первые 100 шагов. Это
          эмпирический факт, теоретического объяснения до сих пор нет.
        </p>
        <p>
          <strong>Cosine decay</strong>: после warmup LR плавно уменьшается
          по косинусоиде от η_max до η_min (обычно 10% от η_max). Это даёт
          «тонкую настройку» в конце — маленькие шаги позволяют сети
          точно попасть в минимум. Стандарт для Llama, GPT, Mistral,
          всех современных LLM.
        </p>
        <p>
          <strong>Step decay</strong> (классика ImageNet эпохи): каждые
          N эпох LR × 0.1. Резкие ступеньки. Сейчас почти не используется
          в LLM — cosine работает лучше и не требует подбора момента
          шага.
        </p>
        <p>
          <strong>Cyclic</strong>: LR колеблется между min и max,
          теоретически помогает выбираться из saddle points. На практике
          в LLM не прижился — не даёт заметного выигрыша, а усложняет
          checkpointing.
        </p>
      </TheoryBlock>

      <SandboxBlock accent={accent} title="LR schedule viewer — переключай расписания">
        <div className="grid lg:grid-cols-[1fr_280px] gap-4">
          {/* График */}
          <Card className={cn("p-3", accent.border)}>
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
              {/* Axes */}
              <line x1={padding} y1={H - padding} x2={W - padding} y2={H - padding} stroke="currentColor" strokeWidth={1} className="text-muted-foreground" />
              <line x1={padding} y1={padding} x2={padding} y2={H - padding} stroke="currentColor" strokeWidth={1} className="text-muted-foreground" />

              {/* Grid */}
              {[0.25, 0.5, 0.75, 1].map((g) => (
                <line
                  key={g}
                  x1={padding}
                  y1={py(g * etaMax)}
                  x2={W - padding}
                  y2={py(g * etaMax)}
                  stroke="currentColor"
                  strokeWidth={0.5}
                  className="text-muted-foreground/30"
                  strokeDasharray="2 4"
                />
              ))}

              {/* Curve */}
              <path d={path} fill="none" stroke="#f43f5e" strokeWidth={2.5} />

              {/* Warmup region */}
              {kind === "linear_warmup_cosine" && (
                <rect
                  x={padding}
                  y={padding}
                  width={px(warmup) - padding}
                  height={H - 2 * padding}
                  fill="#f43f5e"
                  opacity={0.08}
                />
              )}

              {/* Labels */}
              <text x={padding} y={H - padding + 16} className="fill-muted-foreground text-[10px] font-mono">0</text>
              <text x={W - padding} y={H - padding + 16} textAnchor="end" className="fill-muted-foreground text-[10px] font-mono">{total.toLocaleString()} steps</text>
              <text x={padding - 4} y={padding + 4} textAnchor="end" className="fill-muted-foreground text-[10px] font-mono">{etaMax.toExponential(1)}</text>
              <text x={padding - 4} y={H - padding} textAnchor="end" className="fill-muted-foreground text-[10px] font-mono">0</text>

              {kind === "linear_warmup_cosine" && warmup > 0 && (
                <text x={px(warmup)} y={padding + 12} textAnchor="middle" className="fill-rose-700 dark:fill-rose-300 text-[10px] font-mono">warmup end</text>
              )}
            </svg>
          </Card>

          {/* Controls */}
          <div className="space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Schedule
            </div>
            <div className="grid grid-cols-1 gap-1">
              {(Object.keys(SCHEDULE_META) as ScheduleKind[]).map((k) => (
                <button
                  key={k}
                  onClick={() => setKind(k)}
                  className={cn(
                    "p-2 rounded-md border-2 text-xs font-semibold text-left transition-all",
                    kind === k ? cn(accent.bg, accent.border) : "border-border hover:bg-muted/50"
                  )}
                >
                  {SCHEDULE_META[k].label}
                </button>
              ))}
            </div>

            <div className={cn("rounded-md p-3 border text-xs leading-relaxed", accent.border, accent.bgSoft)}>
              {SCHEDULE_META[kind].desc}
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-mono">η_max</span>
                <span className={cn("font-mono font-bold", accent.text)}>{etaMax.toExponential(1)}</span>
              </div>
              <input
                type="range"
                min="0.00001"
                max="0.001"
                step="0.00001"
                value={etaMax}
                onChange={(e) => setEtaMax(parseFloat(e.target.value))}
                className="w-full accent-rose-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-mono">η_min</span>
                <span className={cn("font-mono font-bold", accent.text)}>{etaMin.toExponential(1)}</span>
              </div>
              <input
                type="range"
                min="0.000001"
                max="0.0001"
                step="0.000001"
                value={etaMin}
                onChange={(e) => setEtaMin(parseFloat(e.target.value))}
                className="w-full accent-rose-500"
              />
            </div>

            {(kind === "linear_warmup_cosine") && (
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-mono">Warmup steps</span>
                  <span className={cn("font-mono font-bold", accent.text)}>{warmup}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10000"
                  step="500"
                  value={warmup}
                  onChange={(e) => setWarmup(parseInt(e.target.value))}
                  className="w-full accent-rose-500"
                />
              </div>
            )}

            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-mono">Total steps</span>
                <span className={cn("font-mono font-bold", accent.text)}>{total.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="5000"
                max="100000"
                step="5000"
                value={total}
                onChange={(e) => setTotal(parseInt(e.target.value))}
                className="w-full accent-rose-500"
              />
            </div>
          </div>
        </div>
      </SandboxBlock>

      <div className="grid sm:grid-cols-2 gap-3">
        <DefCard
          term="Warmup"
          definition="Первые N шагов LR линейно растёт от 0 до η_max. Стандарт для pretraining LLM — без warmup Adam часто расходится."
          example="GPT-3: 2000 warmup steps из 10⁵ total. Llama 2 7B: 2000 warmup из 2×10⁵ total. Большим моделям нужен больший warmup."
          accent={accent}
        />
        <DefCard
          term="Cosine decay"
          definition="После warmup LR уменьшается по косинусоиде: η(t) = η_min + ½(η_max − η_min)(1 + cos(πt/T)). Плавно, без рывков."
          example="Стандарт для всех современных LLM. η_min обычно = 10% от η_max."
          accent={accent}
        />
        <DefCard
          term="WSD (Warmup-Stable-Decay)"
          definition="Альтернатива cosine: warmup → stable (постоянный η_max) → decay. Позволяет «дешевле» продолжать обучение — можно отрезать от stable части."
          example="Используется в StableLM, Zephyr. Преимущество: можно переиспользовать чекпоинты из stable-фазы."
          accent={accent}
        />
        <DefCard
          term="LR finder"
          definition="Эвристика Лесли Смита: начинаем с крошечного LR, плавно увеличиваем, строим график loss. Оптимальный LR = там, где loss начинает быстро падать."
          example="В PyTorch: torch_lr_finder. Для LLM редко используется — дорого. Чаще берут lr=3e-4 и подбирают руками."
          accent={accent}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <ConceptChip className={accent.chip}>warmup</ConceptChip>
        <ConceptChip className={accent.chip}>cosine decay</ConceptChip>
        <ConceptChip className={accent.chip}>step decay</ConceptChip>
        <ConceptChip className={accent.chip}>constant LR</ConceptChip>
        <ConceptChip className={accent.chip}>cyclic</ConceptChip>
        <ConceptChip className={accent.chip}>WSD</ConceptChip>
        <ConceptChip className={accent.chip}>LR finder</ConceptChip>
      </div>
    </ModuleShell>
  );
}
