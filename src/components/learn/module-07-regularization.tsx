"use client";

import { useState } from "react";
import { ModuleShell, TheoryBlock, SandboxBlock, GoalBlock, ConceptChip, DefCard } from "@/components/learn/shell";
import { ACCENTS } from "@/components/learn/accents";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Shuffle, Shield, Target, TrendingDown } from "lucide-react";

type RegKind = "dropout" | "weight_decay" | "label_smoothing" | "early_stopping" | "data_aug";

const REG_META: Record<RegKind, { label: string; desc: string }> = {
  dropout: { label: "Dropout", desc: "Случайно зануляем долю p активаций на каждом forward. Сеть не может полагаться на конкретные нейроны — учится более устойчивые признаки." },
  weight_decay: { label: "Weight decay (L2)", desc: "Штраф за большие веса в loss: L_total = L + λ·Σθ². Эквивалентно softmax по θ после каждого шага: θ ← θ·(1 − η·λ)." },
  label_smoothing: { label: "Label smoothing", desc: "Вместо one-hot [0, 1, 0] используем [ε/K, 1−ε+ε/K, ε/K]. Сеть менее самоуверенна, лучше калибровка." },
  early_stopping: { label: "Early stopping", desc: "Мониторим val_loss, останавливаем обучение когда он начинает расти. Простейший и самый надёжный способ регуляризации." },
  data_aug: { label: "Data augmentation", desc: "Искусственно увеличиваем датасет: для картинок — flip/rotate/crop, для текста — back-translation/synonym replacement." },
};

export function Module07Regularization() {
  const accent = ACCENTS[7];
  const [dropoutP, setDropoutP] = useState(0.5);
  const [seed, setSeed] = useState(1);

  // Визуализация: 8×8 нейронов, какие зануляются
  const N = 8;
  const total = N * N;
  const zeros = Math.round(total * dropoutP);
  // Псевдослучайный выбор: используем seed
  const mask: boolean[] = [];
  let s = seed * 12345;
  for (let i = 0; i < total; i++) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    mask.push((s / 0x7fffffff) < dropoutP);
  }
  const actualZeros = mask.filter(Boolean).length;

  // Scale: at inference, dropout is disabled (multiply by 1/(1-p) at train)
  // Покажем эффективный output

  return (
    <ModuleShell
      id={7}
      title="Регуляризация — dropout, weight decay, label smoothing"
      subtitle="Сеть с 175B параметров на датасете 300B токенов может просто зазубрить. Регуляризация мешает этому — делает сеть обобщающей, а не запоминающей. Пять главных методов."
      accent={accent}
    >
      <GoalBlock accent={accent}>
        понять пять главных методов регуляризации и почему dropout практически исчез в современных LLM (но не полностью).
      </GoalBlock>

      <TheoryBlock accent={accent}>
        <p>
          <strong>Переобучение</strong> (overfitting) — главная болезнь
          глубокого обучения. Сеть с миллиардами параметров легко
          запоминает весь датасет, но не обобщает. Регуляризация —
          любой приём, который мешает запоминанию и заставляет сеть
          выучивать общие закономерности.
        </p>
        <p>
          <strong>Dropout</strong> (2014): на каждом forward случайно
          зануляем долю p активаций (типично p=0.1 для LLM, 0.5 для
          классификации). Сеть не может полагаться на конкретный нейрон
          — учится распределять информацию. На inference dropout
          выключается. Эффективно, но в современных LLM почти не
          используется — есть более эффективные методы.
        </p>
        <p>
          <strong>Weight decay</strong> (L2 регуляризация): добавляем
          к loss штраф за большие веса:{" "}
          <code className="font-mono text-xs px-1 py-0.5 rounded bg-muted">L_total = L + λ·Σθ²</code>.
          С_push веса к нулю, но не обнуляет. В AdamW weight decay
          применяется правильно (напрямую к параметру, не к градиенту).
          Стандарт для всех LLM: λ ≈ 0.1 для pretraining, 0.01 для
          fine-tuning.
        </p>
        <p>
          <strong>Label smoothing</strong>: вместо one-hot [0,1,0]
          используем [0.033, 0.934, 0.033]. Сеть не может дать
          уверенность 100% — улучшает calibration. Использовался в GPT-3
          (ε=0.1), но в Llama 2/3 от него отказались — hurts downstream
          benchmarks.
        </p>
        <p>
          <strong>Early stopping</strong>: мониторим val_loss, останавливаем
          обучение когда он начинает расти. Простейший и самый надёжный
          метод. Для LLM редко используется — pretraining идёт на
          заранее определённое число шагов, early stopping применяется
          только на fine-tuning.
        </p>
      </TheoryBlock>

      <SandboxBlock accent={accent} title="Dropout visualizer — как меняется маска зануления">
        <div className="grid lg:grid-cols-[1fr_280px] gap-4">
          <Card className={cn("p-5", accent.border)}>
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
              Слой из {total} нейронов, dropout p = {dropoutP.toFixed(2)}
            </div>
            <div className="grid grid-cols-8 gap-1 inline-block">
              {mask.map((isZero, i) => (
                <div
                  key={i}
                  className={cn(
                    "w-10 h-10 rounded flex items-center justify-center text-xs font-mono font-bold transition-all",
                    isZero
                      ? "bg-muted/30 text-muted-foreground/50 border border-dashed border-muted-foreground/40"
                      : cn(accent.bg, accent.text, "border", accent.border)
                  )}
                >
                  {isZero ? "0" : "●"}
                </div>
              ))}
            </div>
            <div className="mt-4 text-xs text-muted-foreground">
              Занулено: <strong>{actualZeros}</strong> из {total} ({((actualZeros / total) * 100).toFixed(1)}%).
              Оставшиеся умножаются на 1/(1−p) = {(1 / (1 - dropoutP)).toFixed(2)} (inverted dropout) — чтобы математическое ожидание выхода осталось прежним.
            </div>
          </Card>

          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-mono">Dropout rate p</span>
                <span className={cn("font-mono font-bold", accent.text)}>{dropoutP.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="0.9"
                step="0.05"
                value={dropoutP}
                onChange={(e) => setDropoutP(parseFloat(e.target.value))}
                className="w-full accent-rose-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-mono">Random seed</span>
                <span className={cn("font-mono font-bold", accent.text)}>{seed}</span>
              </div>
              <input
                type="range"
                min="1"
                max="20"
                step="1"
                value={seed}
                onChange={(e) => setSeed(parseInt(e.target.value))}
                className="w-full accent-rose-500"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Меняй seed — увидишь, что маска меняется на каждом forward. Это и есть dropout.
              </p>
            </div>

            <div className={cn("rounded-md p-3 border text-xs leading-relaxed", accent.border, accent.bgSoft)}>
              <strong>Где используется в LLM:</strong>
              <ul className="mt-1 space-y-1">
                <li>• GPT-2/3: dropout 0.1 на embeddings, attention, residual</li>
                <li>• Llama 2/3: dropout 0.0 (не используется)</li>
                <li>• Mistral: dropout 0.0</li>
                <li>• BERT: dropout 0.1 везде</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Все методы регуляризации */}
        <Card className={cn("p-4 mt-3", accent.border)}>
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
            Все методы регуляризации
          </div>
          <div className="grid sm:grid-cols-2 gap-2">
            {(Object.keys(REG_META) as RegKind[]).map((k) => (
              <div key={k} className={cn("rounded-md p-3 border", accent.border, "bg-card")}>
                <div className="font-semibold text-sm mb-1">{REG_META[k].label}</div>
                <p className="text-xs text-muted-foreground leading-relaxed">{REG_META[k].desc}</p>
              </div>
            ))}
          </div>
        </Card>
      </SandboxBlock>

      <div className="grid sm:grid-cols-2 gap-3">
        <DefCard
          term="Inverted dropout"
          definition="На train зануляем с вероятностью p и делим оставшиеся на (1−p). На inference ничего не делаем. Так удобнее — не нужно масштабировать на inference."
          example="В PyTorch: nn.Dropout(p) реализует именно inverted dropout. На inference .eval() выключает dropout."
          accent={accent}
        />
        <DefCard
          term="DropConnect"
          definition="Вместо активаций зануляем веса. Реже встречается, теоретически более мощный, но сложнее в реализации."
          example="Использовался в некоторых CNN архитектурах 2014-2016. В LLM не прижился."
          accent={accent}
        />
        <DefCard
          term="Stochastic depth"
          definition="Случайно «выключаем» целый residual block (пропускаем через identity). Глубокая сеть учится как ансамбль более мелких. Используется в ViT и некоторых LLM."
          example="Llama 3 405B использует stochastic depth с p=0.05 для самых глубоких слоёв."
          accent={accent}
        />
        <DefCard
          term="Mixture of Experts (MoE)"
          definition="Не регуляризация в чистом виде, но связано: только часть параметров активна на каждом токене. Эффективная регуляризация — сеть не может «запомнить» все в одном эксперте."
          example="Mixtral 8x7B: 8 экспертов, 2 активны на каждом токене. GPT-4 — MoE."
          accent={accent}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <ConceptChip className={accent.chip}>dropout</ConceptChip>
        <ConceptChip className={accent.chip}>weight decay</ConceptChip>
        <ConceptChip className={accent.chip}>label smoothing</ConceptChip>
        <ConceptChip className={accent.chip}>early stopping</ConceptChip>
        <ConceptChip className={accent.chip}>data augmentation</ConceptChip>
        <ConceptChip className={accent.chip}>inverted dropout</ConceptChip>
        <ConceptChip className={accent.chip}>stochastic depth</ConceptChip>
        <ConceptChip className={accent.chip}>overfitting</ConceptChip>
      </div>
    </ModuleShell>
  );
}
