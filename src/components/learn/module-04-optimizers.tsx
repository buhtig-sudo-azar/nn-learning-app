"use client";

import { useState, useEffect, useRef } from "react";
import { ModuleShell, TheoryBlock, SandboxBlock, GoalBlock, ConceptChip, DefCard } from "@/components/learn/shell";
import { ACCENTS } from "@/components/learn/accents";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowDown, Zap, Activity, Gauge, TrendingDown } from "lucide-react";

type OptKind = "sgd" | "momentum" | "rmsprop" | "adam";

const OPT_META: Record<OptKind, { label: string; formula: string; desc: string; color: string }> = {
  sgd: {
    label: "SGD",
    formula: "θ ← θ − η · g",
    desc: "Простейший: шаг в сторону антиградиента. Чувствителен к learning rate, плохо работает в «оврагах» (узких долинах loss surface).",
    color: "#9ca3af",
  },
  momentum: {
    label: "Momentum",
    formula: "v ← β·v + g;  θ ← θ − η·v",
    desc: "Накапливает «скорость» в направлении градиента. Помогает пройти овраги: даже если градиент маленький, накопленная скорость тащит дальше. β ≈ 0.9.",
    color: "#f97316",
  },
  rmsprop: {
    label: "RMSprop",
    formula: "s ← β·s + (1−β)·g²;  θ ← θ − η·g/√(s+ε)",
    desc: "Адаптирует шаг: делим на скользящее среднее квадратов градиентов. Большие градиенты → меньший шаг. Хорошо для non-stationary целей.",
    color: "#10b981",
  },
  adam: {
    label: "Adam",
    formula: "m, v ← β₁m+(1−β₁)g, β₂v+(1−β₂)g²;  θ ← θ − η·m̂/√(v̂+ε)",
    desc: "Momentum + RMSprop вместе. Самый популярный оптимизатор в deep learning. β₁=0.9, β₂=0.999, ε=1e-8. AdamW = Adam + правильный weight decay.",
    color: "#f43f5e",
  },
};

/**
 * Песочница: 2D loss surface (функция Больцмана-Розенброка-стиля), 4 оптимизатора
 * делают шаги одновременно. Видно траектории.
 */
function lossSurface(x: number, y: number): number {
  // Двойная яма с узким оврагом
  const a = (x - 2) * (x - 2) + 0.5 * (y - 1) * (y - 1);
  const b = (x + 2) * (x + 2) + 0.5 * (y + 1) * (y + 1);
  return Math.log(1 + Math.exp(-5 * (a - b))) + 0.1 * (x * x + y * y);
}

function gradLoss(x: number, y: number): [number, number] {
  const eps = 1e-4;
  const dx = (lossSurface(x + eps, y) - lossSurface(x - eps, y)) / (2 * eps);
  const dy = (lossSurface(x, y + eps) - lossSurface(x, y - eps)) / (2 * eps);
  return [dx, dy];
}

type Trajectory = { x: number; y: number }[];

function simulate(kind: OptKind, start: [number, number], lr: number, steps: number): Trajectory {
  const traj: Trajectory = [{ x: start[0], y: start[1] }];
  let [x, y] = start;
  let vx = 0, vy = 0; // momentum
  let sx = 0, sy = 0; // rmsprop (squared)
  let mx = 0, my = 0; // adam m
  let vrx = 0, vry = 0; // adam v
  const beta1 = 0.9, beta2 = 0.999, eps = 1e-8;

  for (let t = 1; t <= steps; t++) {
    const [gx, gy] = gradLoss(x, y);
    let dx = 0, dy = 0;
    switch (kind) {
      case "sgd":
        dx = lr * gx;
        dy = lr * gy;
        break;
      case "momentum": {
        vx = 0.9 * vx + gx;
        vy = 0.9 * vy + gy;
        dx = lr * vx;
        dy = lr * vy;
        break;
      }
      case "rmsprop": {
        sx = 0.9 * sx + 0.1 * gx * gx;
        sy = 0.9 * sy + 0.1 * gy * gy;
        dx = lr * gx / (Math.sqrt(sx) + eps);
        dy = lr * gy / (Math.sqrt(sy) + eps);
        break;
      }
      case "adam": {
        mx = beta1 * mx + (1 - beta1) * gx;
        my = beta1 * my + (1 - beta1) * gy;
        vrx = beta2 * vrx + (1 - beta2) * gx * gx;
        vry = beta2 * vry + (1 - beta2) * gy * gy;
        const mhatx = mx / (1 - Math.pow(beta1, t));
        const mhaty = my / (1 - Math.pow(beta1, t));
        const vhatx = vrx / (1 - Math.pow(beta2, t));
        const vhaty = vry / (1 - Math.pow(beta2, t));
        dx = lr * mhatx / (Math.sqrt(vhatx) + eps);
        dy = lr * mhaty / (Math.sqrt(vhaty) + eps);
        break;
      }
    }
    x -= dx;
    y -= dy;
    // ограничение
    x = Math.max(-4, Math.min(4, x));
    y = Math.max(-3, Math.min(3, y));
    traj.push({ x, y });
  }
  return traj;
}

export function Module04Optimizers() {
  const accent = ACCENTS[4];
  const [active, setActive] = useState<OptKind>("adam");
  const [lr, setLr] = useState(0.05);
  const [steps, setSteps] = useState(80);
  const [start] = useState<[number, number]>([-3, 2]);
  const [trajs, setTrajs] = useState<Record<OptKind, Trajectory>>({
    sgd: [],
    momentum: [],
    rmsprop: [],
    adam: [],
  });

  useEffect(() => {
    setTrajs({
      sgd: simulate("sgd", start, lr, steps),
      momentum: simulate("momentum", start, lr, steps),
      rmsprop: simulate("rmsprop", start, lr, steps),
      adam: simulate("adam", start, lr, steps),
    });
  }, [lr, steps, start]);

  // SVG viewport: x ∈ [-4, 4], y ∈ [-3, 3], width 480, height 360
  const W = 480, H = 360;
  function project(x: number, y: number): [number, number] {
    return [(x + 4) / 8 * W, (3 - y) / 6 * H];
  }

  // Background contour: сетка значений loss
  const grid: { x: number; y: number; v: number }[] = [];
  for (let i = 0; i <= 32; i++) {
    for (let j = 0; j <= 24; j++) {
      const x = -4 + i * 0.25;
      const y = -3 + j * 0.25;
      grid.push({ x, y, v: lossSurface(x, y) });
    }
  }
  const maxV = Math.max(...grid.map((g) => g.v));
  const minV = Math.min(...grid.map((g) => g.v));

  return (
    <ModuleShell
      id={4}
      title="Оптимизаторы — SGD → Momentum → Adam → AdamW"
      subtitle="Градиент говорит «куда», но не «как быстро». Оптимизатор решает, какой именно шаг сделать. Эволюция: SGD → Momentum → RMSprop → Adam → AdamW. В современном deep learning 90% обучений используют AdamW."
      accent={accent}
    >
      <GoalBlock accent={accent}>
        понять, чем отличаются четыре главных оптимизатора, и почему AdamW стал стандартом для LLM.
      </GoalBlock>

      <TheoryBlock accent={accent}>
        <p>
          Backprop дал нам градиент <code className="font-mono text-xs px-1 py-0.5 rounded bg-muted">g = ∇θ L</code>.
          Самый простой способ его использовать — SGD:{" "}
          <code className="font-mono text-xs px-1 py-0.5 rounded bg-muted">θ ← θ − η·g</code>.
          Шаг в сторону антиградиента, длина = η (learning rate). Просто,
          но имеет проблемы: в «оврагах» (узких долинах loss surface)
          начинает колебаться, медленно сходится на пологих участках,
          чувствителен к масштабу признаков.
        </p>
        <p>
          <strong>Momentum</strong>: добавляем «инерцию». Накапливаем
          скользящее среднее градиентов <code className="font-mono text-xs px-1 py-0.5 rounded bg-muted">v ← β·v + g</code>,
          шаг делаем по v. Помогает пройти овраги — даже если текущий градиент
          маленький, накопленная скорость тащит дальше. β ≈ 0.9 (как в
          физике: тяжёлая масса по инерции проходит ямы).
        </p>
        <p>
          <strong>RMSprop</strong>: вместо инерции — адаптивный шаг. Делим
          градиент на скользящее среднее его квадратов:{" "}
          <code className="font-mono text-xs px-1 py-0.5 rounded bg-muted">θ ← θ − η·g/√(s+ε)</code>.
          Где градиент стабильно большой — шаг уменьшается. Где маленький —
          увеличивается. Хорошо работает в non-stationary среде (RL,
          RNN).
        </p>
        <p>
          <strong>Adam</strong> = Momentum + RMSprop. Два состояния: m
          (первый момент, как momentum) и v (второй момент, как RMSprop).
          Bias-correction для первых шагов. Был стандартом с 2015 по 2019.
          Затем обнаружили проблему: weight decay в Adam реализован неправильно
          (он применяется к градиенту, а не к параметру).{" "}
          <strong>AdamW</strong> исправил это — теперь это стандарт для всех
          современных LLM (Llama, Mistral, Qwen, GPT-4).
        </p>
      </TheoryBlock>

      <SandboxBlock accent={accent} title="Optimizer playground — траектории на 2D loss surface">
        <div className="grid lg:grid-cols-[1fr_280px] gap-4">
          {/* SVG с траекториями */}
          <Card className={cn("p-3", accent.border)}>
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
              {/* Contour background */}
              {grid.map((g, i) => {
                const [px, py] = project(g.x, g.y);
                const t = (g.v - minV) / (maxV - minV);
                return (
                  <rect
                    key={i}
                    x={px - 8}
                    y={py - 8}
                    width={16}
                    height={16}
                    fill={`rgba(244, 63, 94, ${0.05 + t * 0.35})`}
                  />
                );
              })}

              {/* Trajectories */}
              {(Object.keys(trajs) as OptKind[]).map((k) => {
                const traj = trajs[k];
                if (traj.length < 2) return null;
                const meta = OPT_META[k];
                const isActive = k === active;
                const path = traj
                  .map((p, i) => {
                    const [px, py] = project(p.x, p.y);
                    return `${i === 0 ? "M" : "L"}${px.toFixed(1)},${py.toFixed(1)}`;
                  })
                  .join(" ");
                return (
                  <g key={k} opacity={isActive ? 1 : 0.25}>
                    <path d={path} stroke={meta.color} strokeWidth={isActive ? 2.5 : 1.5} fill="none" />
                    {traj.map((p, i) => {
                      if (i % 5 !== 0 && i !== traj.length - 1) return null;
                      const [px, py] = project(p.x, p.y);
                      return (
                        <circle key={i} cx={px} cy={py} r={isActive ? 3 : 2} fill={meta.color} />
                      );
                    })}
                    {/* Start */}
                    <circle
                      cx={project(traj[0].x, traj[0].y)[0]}
                      cy={project(traj[0].x, traj[0].y)[1]}
                      r={5}
                      fill="none"
                      stroke={meta.color}
                      strokeWidth={2}
                    />
                    {/* End */}
                    <circle
                      cx={project(traj[traj.length - 1].x, traj[traj.length - 1].y)[0]}
                      cy={project(traj[traj.length - 1].x, traj[traj.length - 1].y)[1]}
                      r={4}
                      fill={meta.color}
                    />
                  </g>
                );
              })}
            </svg>
            <div className="flex items-center justify-between text-xs text-muted-foreground mt-2 font-mono">
              <span>◯ start</span>
              <span>● end after {steps} steps</span>
            </div>
          </Card>

          {/* Controls */}
          <div className="space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Активный оптимизатор
            </div>
            <div className="grid grid-cols-2 gap-1">
              {(Object.keys(OPT_META) as OptKind[]).map((k) => {
                const meta = OPT_META[k];
                const isActive = k === active;
                return (
                  <button
                    key={k}
                    onClick={() => setActive(k)}
                    className={cn(
                      "p-2 rounded-md border-2 text-xs font-semibold transition-all",
                      isActive ? "border-current scale-105" : "border-border opacity-60 hover:opacity-100"
                    )}
                    style={{ color: meta.color }}
                  >
                    {meta.label}
                  </button>
                );
              })}
            </div>

            <div className={cn("rounded-md p-3 border", accent.border, accent.bgSoft)}>
              <div className="text-xs font-mono mb-1">{OPT_META[active].formula}</div>
              <p className="text-xs leading-relaxed text-foreground/90">{OPT_META[active].desc}</p>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-mono">Learning rate η</span>
                <span className={cn("font-mono font-bold", accent.text)}>{lr.toFixed(3)}</span>
              </div>
              <input
                type="range"
                min="0.005"
                max="0.15"
                step="0.005"
                value={lr}
                onChange={(e) => setLr(parseFloat(e.target.value))}
                className="w-full accent-rose-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-mono">Steps</span>
                <span className={cn("font-mono font-bold", accent.text)}>{steps}</span>
              </div>
              <input
                type="range"
                min="20"
                max="200"
                step="10"
                value={steps}
                onChange={(e) => setSteps(parseInt(e.target.value))}
                className="w-full accent-rose-500"
              />
            </div>

            <div className="text-xs text-muted-foreground leading-relaxed">
              Тёмные области = выше loss. Все 4 оптимизатора стартуют с одной точки (−3, 2) и делают {steps} шагов с одинаковым η={lr.toFixed(3)}. Видно, как Adam и Momentum быстрее достигают минимума.
            </div>
          </div>
        </div>
      </SandboxBlock>

      <div className="grid sm:grid-cols-2 gap-3">
        <DefCard
          term="AdamW"
          definition="Adam + правильный weight decay. В оригинальном Adam weight decay добавлялся к градиенту, что искажало адаптивность. AdamW применяет decay напрямую к параметру: θ ← θ − η·(m̂/√v̂ + λ·θ)."
          example="Стандарт для всех современных LLM: Llama 2/3, Mistral, Qwen, GPT-4. Adam в чистом виде почти не используется."
          accent={accent}
        />
        <DefCard
          term="β₁, β₂"
          definition="Гиперпараметры Adam: β₁=0.9 (decay для первого момента, как в momentum), β₂=0.999 (decay для второго момента). Почти никогда не меняются."
          example="Для small datasets / fine-tuning иногда ставят β₁=0.95, β₂=0.999. Для pretraining — дефолты."
          accent={accent}
        />
        <DefCard
          term="ε"
          definition="Маленькая константа (1e-8) в знаменателе Adam, чтобы не делить на ноль. В BF16 training часто увеличивают до 1e-6 — иначе теряется точность."
          example="Llama 2 использовала eps=1e-5. Llama 3 — eps=1e-8 (стандарт)."
          accent={accent}
        />
        <DefCard
          term="Lion"
          definition="Optimizer от Google Brain (2023): использует только первый момент, подписанный sign(m). Меньше памяти, иногда лучше сходимость. Пока не вытеснил AdamW."
          example="Lion требует β₁=0.9, β₂=0.99, lr в 3-10 раз меньше, чем для AdamW."
          accent={accent}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <ConceptChip className={accent.chip}>SGD</ConceptChip>
        <ConceptChip className={accent.chip}>Momentum</ConceptChip>
        <ConceptChip className={accent.chip}>RMSprop</ConceptChip>
        <ConceptChip className={accent.chip}>Adam</ConceptChip>
        <ConceptChip className={accent.chip}>AdamW</ConceptChip>
        <ConceptChip className={accent.chip}>weight decay</ConceptChip>
        <ConceptChip className={accent.chip}>β₁ β₂</ConceptChip>
        <ConceptChip className={accent.chip}>ε</ConceptChip>
        <ConceptChip className={accent.chip}>Lion</ConceptChip>
      </div>
    </ModuleShell>
  );
}
