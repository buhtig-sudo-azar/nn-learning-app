# Как нейросети учатся — backprop, Adam, регуляризация

Интерактивное приложение: разберитесь, что значит «обучать» нейросеть
после того, как понятна архитектура трансформера. Loss functions,
backpropagation и chain rule, оптимизаторы (SGD → Momentum → Adam →
AdamW), LR schedules (warmup, cosine decay), dropout и регуляризация,
batch/layer/RMSNorm, vanishing/exploding gradients, gradient clipping,
mixed precision (FP16/BF16).

**10 модулей с живыми песочницами.**

> Это приложение — продолжение курса [«Трансформеры — архитектура целиком»](https://transformers-architecture.vercel.app/).
> В свою очередь, он ведёт к [«Большие языковые модели»](https://llms-app.vercel.app/).

## Возможности

- **10 интерактивных модулей** с живыми песочницами на React + TypeScript
- **Карта цикла обучения** — forward → loss → backprop → update, кликабельно
- **Loss function playground** — MSE vs cross-entropy vs hinge на одном датасете
- **Backprop visualizer** — маленький вычислительный граф, пошаговый reverse pass
- **Optimizer playground** — траектории SGD/Momentum/Adam на 2D loss surface
- **LR schedule viewer** — constant/step/cosine/cyclic, warmup duration slider
- **Normalization comparison** — BatchNorm vs LayerNorm vs RMSNorm по характеристикам
- **Dropout rate slider** — voir как меняется output distribution при разных p
- **Gradient flow analyzer** — глубина до 48 слоёв, vanishing/exploding visualization
- **Mixed precision** — FP32 vs FP16 vs BF16: dynamic range, loss scaling
- **Прогресс сохраняется** локально в `localStorage`
- **Светлая/тёмная тема** с переключателем
- **Адаптивный дизайн** — мобильные и десктопы
- **Доступность**: keyboard-friendly, `aria-label`, `prefers-reduced-motion`

## Стек

- **Next.js 16** (App Router, Turbopack)
- **React 19**, **TypeScript**
- **Tailwind CSS 4** + **shadcn/ui**
- **lucide-react** для иконок
- **localStorage** для прогресса (без бэкенда)

## Серия курсов

Это пятый курс в серии:

1. [ML с нуля](https://ml-s-nula.vercel.app/) — бирюзовый курс: линейная регрессия, градиентный спуск, простые нейросети
2. [Токенизация](https://tokenizatsiya-app.vercel.app/) — фиолетовый курс: BPE, WordPiece, SentencePiece, byte-level
3. [Эмбеддинги и attention](https://embeddings-app.vercel.app/) — изумрудный курс: эмбеддинги, cosine, word2vec, attention
4. [Трансформеры — архитектура целиком](https://transformers-architecture.vercel.app/) — янтарный курс: Q/K/V, маски, FFN, residual, encoder/decoder, RoPE, forward pass, BERT/GPT/T5
5. **Как нейросети учатся** (этот курс) — rose курс: backprop, оптимизаторы, регуляризация

6. [Большие языковые модели](https://llms-app.vercel.app/) — blue курс: pretraining, scaling laws, KV-cache, sampling, hallucinations

## Запуск локально

```bash
bun install
bun run dev
# открыть http://localhost:3000
```

## Лицензия

MIT — используйте, форкайте, учите.

---

**AZAR**
