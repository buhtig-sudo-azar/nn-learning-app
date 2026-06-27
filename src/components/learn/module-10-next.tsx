"use client";

import { ModuleShell, TheoryBlock, SandboxBlock, GoalBlock, ConceptChip } from "@/components/learn/shell";
import { ACCENTS } from "@/components/learn/accents";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ExternalLink, Code, BookOpen, Boxes, Wrench, Network, Layers, Cpu, Zap, GraduationCap, Brain, Sparkles } from "lucide-react";

const TRANSFORMERS_URL = "https://transformers-architecture.vercel.app/";
const EMBEDDINGS_APP_URL = "https://embeddings-app.vercel.app/";
const TOKENIZATSIYA_URL = "https://tokenizatsiya-app.vercel.app/";
const ML_S_NULA_URL = "https://ml-s-nula.vercel.app/";
const LLM_APP_URL = "https://llms-app.vercel.app/";

const RESOURCES: Array<{
  icon: typeof BookOpen;
  title: string;
  description: string;
  url: string;
  linkLabel: string;
  tag: string;
}> = [
  {
    icon: Code,
    title: "Andrej Karpathy — Micrograd",
    description:
      "300 строк Python, которые реализуют backprop с нуля. Лучший способ понять, что именно делает autograd — написать его вручную. Видео 2.5 часа, код на GitHub.",
    url: "https://github.com/karpathy/micrograd",
    linkLabel: "github.com/karpathy/micrograd",
    tag: "Код + видео",
  },
  {
    icon: BookOpen,
    title: "Andrej Karpathy — Let's build GPT from scratch",
    description:
      "Двухчасовое видео, где Карпата собирает GPT-подобную модель на Python. Включает полную реализацию backprop через PyTorch,Optimizer и training loop. Лучший способ «почувствовать» обучение руками.",
    url: "https://www.youtube.com/watch?v=kCc8FmEb1nY",
    linkLabel: "youtube.com — Karpathy",
    tag: "Видео",
  },
  {
    icon: BookOpen,
    title: "Adam: A Method for Stochastic Optimization",
    description:
      "Оригинальная статья Kingma & Ba (2015). Самая цитируемая статья по оптимизации за последние 10 лет. Если хотите понять, откуда взялись β₁=0.9, β₂=0.999, ε=1e-8.",
    url: "https://arxiv.org/abs/1412.6980",
    linkLabel: "arxiv.org/abs/1412.6980",
    tag: "Статья",
  },
  {
    icon: BookOpen,
    title: "Decoupled Weight Decay Regularization (AdamW)",
    description:
      "Loshchilov & Hutter (2019) — статья, которая объясняет, почему weight decay в оригинальном Adam был реализован неправильно, и как AdamW это исправляет.",
    url: "https://arxiv.org/abs/1711.05101",
    linkLabel: "arxiv.org/abs/1711.05101",
    tag: "Статья",
  },
  {
    icon: BookOpen,
    title: "Layer Normalization — Ba et al., 2016",
    description:
      "Оригинальная статья о LayerNorm. Если хотите понять математику нормализации и почему именно per-position, а не per-batch (как BatchNorm).",
    url: "https://arxiv.org/abs/1607.06450",
    tag: "Статья",
    linkLabel: "arxiv.org/abs/1607.06450",
  },
  {
    icon: BookOpen,
    title: "Root Mean Square Layer Normalization (RMSNorm)",
    description:
      "Zhang & Sennrich (2019). Статья о RMSNorm — упрощённом LayerNorm без центрирования. На 10-30% быстрее, точность та же. Стандарт для Llama, Mistral, Qwen.",
    url: "https://arxiv.org/abs/1910.07467",
    linkLabel: "arxiv.org/abs/1910.07467",
    tag: "Статья",
  },
  {
    icon: BookOpen,
    title: "Dropout: A Simple Way to Prevent Neural Networks from Overfitting",
    description:
      "Hinton et al. (2014) — оригинальная статья о dropout. Если хотите понять, почему случайное зануление работает как регуляризация.",
    url: "https://jmlr.org/papers/v15/srivastava14a.html",
    linkLabel: "jmlr.org",
    tag: "Статья",
  },
  {
    icon: Wrench,
    title: "PyTorch AMP — Automatic Mixed Precision",
    description:
      "Документация PyTorch по mixed precision training. Autocast + GradScaler — всё, что нужно для FP16/BF16 обучения. Самый короткий путь к production training.",
    url: "https://pytorch.org/docs/stable/amp.html",
    linkLabel: "pytorch.org/docs/amp",
    tag: "Документация",
  },
  {
    icon: BookOpen,
    title: "Mixed Precision Training — NVIDIA, 2017",
    description:
      "Статья, которая открыла mixed precision training для широкого использования. Loss scaling, FP32 master weights — все трюки, которые стали стандартом.",
    url: "https://arxiv.org/abs/1710.03740",
    linkLabel: "arxiv.org/abs/1710.03740",
    tag: "Статья",
  },
  {
    icon: BookOpen,
    title: "On the Stability of Large Language Model Training",
    description:
      "Статья 2024 года о том, почему pretraining больших LLM нестабилен и какие трюки (gradient clipping, QK-Norm, init schemes) делают его стабильным.",
    url: "https://arxiv.org/abs/2401.14444",
    linkLabel: "arxiv.org/abs/2401.14444",
    tag: "Статья",
  },
];

const NEXT_TOPICS: Array<{
  icon: typeof Code;
  title: string;
  short: string;
  description: string;
}> = [
  {
    icon: Cpu,
    title: "Большие языковые модели",
    short: "LLM",
    description:
      "Pretraining objective, scaling laws (Chinchilla), emergent abilities, KV-cache для inference, sampling (temperature, top-k, top-p), hallucinations, in-context learning. Прямой следующий курс — применяем backprop+Adam к трансформеру и смотрим, что получается при масштабировании.",
  },
  {
    icon: Zap,
    title: "Efficient inference",
    short: "Infer",
    description:
      "Квантизация (4-bit, 8-bit), KV-cache, speculative decoding, FlashAttention, attention sinks. Без этого LLM на 70B+ параметров было бы невозможно запускать локально.",
  },
  {
    icon: Layers,
    title: "Multimodal LLM",
    short: "MM",
    description:
      "Модели, которые работают не только с текстом, но и с картинками (GPT-4V, Claude 3), аудио, видео. Эмбеддинги разных модальностей приводятся к общему пространству через cross-attention или projection.",
  },
  {
    icon: Network,
    title: "Agents и tool use",
    short: "Agent",
    description:
      "LLM как «мозг» агента, который вызывает инструменты (поиск, код, API), планирует многошаговые задачи. Это следующий уровень после chat — AutoGPT, ReAct, function calling.",
  },
  {
    icon: BookOpen,
    title: "Mechanistic interpretability",
    short: "Interp",
    description:
      "Reverse-engineering обученных моделей: что именно выучила каждая голова, каждый нейрон? Anthropic Circuits, Transformer Circuits Thread, sparse autoencoders. Самое «научное» направление в LLM.",
  },
  {
    icon: Boxes,
    title: "Alignment и safety",
    short: "Align",
    description:
      "SFT, LoRA/QLoRA, instruction tuning, reward modeling, RLHF, DPO, Constitutional AI. Как из base LLM (которая просто предсказывает следующий токен) сделать ChatGPT.",
  },
];

export function Module10Next() {
  const accent = ACCENTS[10];

  return (
    <ModuleShell
      id={10}
      title="Что изучать дальше — roadmap после этого курса"
      subtitle="Мы прошли путь от loss function до mixed precision. Что осталось за кадром? Вот шесть больших направлений, в которые логично идти следующими."
      accent={accent}
    >
      <GoalBlock accent={accent}>
        составить план дальнейшего изучения — после того, как понятны loss, backprop, оптимизаторы, LR schedules, нормализация, регуляризация, gradient clipping и mixed precision.
      </GoalBlock>

      <TheoryBlock accent={accent}>
        <p>
          Этот курс закрыл <strong>динамический фундамент</strong> — то,
          как именно нейросеть обучается. Теперь вы знаете, что один
          iteration = forward + loss + backward + optimizer step, почему
          AdamW вытеснил SGD, зачем нужен warmup+cosine decay, почему
          residual connections спасают от vanishing gradients, и почему
          BF16 — современный стандарт.
        </p>
        <p>
          Важный момент: <strong>этот курс был про обучение «в
          вакууме»</strong> — на игрушечных графах и абстрактных loss
          surfaces. Дальше лучше всего идти в <strong>масштабирование</strong>:
          что меняется, когда мы обучаем не MLP на 1000 параметров, а
          трансформер на 175B? Это следующий курс серии, и без него
          сложно понять, почему pretraining GPT-4 стоит $100M+ и
          занимает месяцы на кластере из 25000 GPU.
        </p>
      </TheoryBlock>

      {/* Блок-ссылка на следующий курс — Курс 6, blue accent */}
      <div className="rounded-lg border-2 border-blue-300 bg-blue-50/50 dark:border-blue-700 dark:bg-blue-950/30 p-5">
        <div className="flex items-start gap-3 flex-wrap">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-500 text-white">
            <Cpu className="h-6 w-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs uppercase tracking-wide text-blue-700 dark:text-blue-300 font-semibold mb-1">
              Продолжение серии · следующий курс
            </div>
            <h3 className="text-lg font-bold mb-2">
              «Большие языковые модели» — pretraining, scaling, inference
            </h3>
            <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
              10 модулей о том, что происходит, когда трансформер
              масштабируется до миллиардов параметров: pretraining
              objective (next-token prediction), scaling laws
              (Chinchilla, 20 tokens per parameter), emergent abilities,
              context window и KV-cache, sampling (temperature, top-k,
              top-p), hallucinations, in-context learning, prompting.
              С живыми песочницами: sampling playground, KV-cache
              visualizer, scaling laws calculator.
            </p>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {["Pretraining", "Scaling laws", "KV-cache", "Sampling", "Hallucinations", "In-context learning"].map((t) => (
                <Badge key={t} variant="outline" className="text-[10px] font-mono">
                  {t}
                </Badge>
              ))}
            </div>
            <a href={LLM_APP_URL} target="_blank" rel="noopener noreferrer">
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-700 dark:hover:bg-blue-600"
              >
                <ArrowUpRight className="h-4 w-4 mr-1.5" />
                Перейти к курсу «Большие языковые модели»
              </Button>
            </a>
          </div>
        </div>
      </div>

      <SandboxBlock accent={accent} title="Шесть направлений — куда расти дальше">
        <div className="grid sm:grid-cols-2 gap-3">
          {NEXT_TOPICS.map((t) => (
            <Card key={t.short} className="p-4 border-blue-200 dark:border-blue-800/60">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-200">
                  <t.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm">{t.title}</h3>
                    <Badge variant="outline" className="text-[10px] font-mono">
                      {t.short}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {t.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </SandboxBlock>

      <SandboxBlock accent={accent} title="Кураторские ресурсы для углубления">
        <div className="grid sm:grid-cols-2 gap-3">
          {RESOURCES.map((r) => (
            <a
              key={r.title}
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Card className="p-4 border-blue-200 dark:border-blue-800/60 hover:border-blue-400 hover:shadow-md transition-all h-full">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-200">
                    <r.icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-sm line-clamp-2">{r.title}</h3>
                    </div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <Badge variant="outline" className="text-[10px] font-mono">
                        {r.tag}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                      {r.description}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-blue-700 dark:text-blue-300 mt-2 font-mono">
                      <ExternalLink className="h-3 w-3" />
                      {r.linkLabel}
                    </div>
                  </div>
                </div>
              </Card>
            </a>
          ))}
        </div>
      </SandboxBlock>

      {/* Блок «Возврат к материнским курсам» */}
      <div className="rounded-lg border-2 border-dashed border-blue-200 bg-blue-50/50 dark:border-blue-800/60 dark:bg-blue-950/30 p-5 text-center">
        <div className="text-xs uppercase tracking-wide text-blue-700 dark:text-blue-300 font-semibold mb-2">
          Возврат к материнским курсам
        </div>
        <p className="text-sm text-muted-foreground mb-4 max-w-xl mx-auto">
          Это приложение — продолжение серии из четырёх курсов. Если
          хочешь вернуться к ним — кнопки ниже ведут на их главные
          страницы.
        </p>
        <div className="flex flex-wrap gap-2 justify-center">
          <a href={TRANSFORMERS_URL} target="_blank" rel="noopener noreferrer">
            <Button
              size="lg"
              className="bg-amber-600 hover:bg-amber-700 text-white dark:bg-amber-700 dark:hover:bg-amber-600"
            >
              <ArrowUpRight className="h-4 w-4 mr-1.5" />
              Трансформеры
            </Button>
          </a>
          <a href={EMBEDDINGS_APP_URL} target="_blank" rel="noopener noreferrer">
            <Button
              size="lg"
              variant="outline"
              className="border-emerald-500 text-emerald-700 hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-950/40"
            >
              <ArrowUpRight className="h-4 w-4 mr-1.5" />
              Эмбеддинги
            </Button>
          </a>
          <a href={TOKENIZATSIYA_URL} target="_blank" rel="noopener noreferrer">
            <Button
              size="lg"
              variant="outline"
              className="border-purple-500 text-purple-700 hover:bg-purple-50 dark:text-purple-300 dark:hover:bg-purple-950/40"
            >
              <ArrowUpRight className="h-4 w-4 mr-1.5" />
              Токенизация
            </Button>
          </a>
          <a href={ML_S_NULA_URL} target="_blank" rel="noopener noreferrer">
            <Button
              size="lg"
              variant="outline"
              className="border-teal-500 text-teal-700 hover:bg-teal-50 dark:text-teal-300 dark:hover:bg-teal-950/40"
            >
              <ArrowUpRight className="h-4 w-4 mr-1.5" />
              ML с нуля
            </Button>
          </a>
        </div>
      </div>
    </ModuleShell>
  );
}
