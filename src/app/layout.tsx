import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeToggle, ThemeScript } from "@/components/learn/theme-toggle";
import { ScrollToTopBrain } from "@/components/learn/scroll-to-top";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin", "cyrillic"],
});

const mono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: "Как нейросети учатся — backprop, Adam, регуляризация",
  description:
    "Интерактивный курс: что значит «обучать» нейросеть — loss functions, backprop и chain rule, оптимизаторы (SGD → Momentum → Adam → AdamW), LR schedules (warmup, cosine decay), dropout и регуляризация, batch/layer/RMSNorm, vanishing/exploding gradients, gradient clipping, mixed precision. 10 модулей с живыми песочницами.",
  keywords: [
    "backprop",
    "backpropagation",
    "chain rule",
    "gradient descent",
    "SGD",
    "Adam",
    "AdamW",
    "Momentum",
    "RMSprop",
    "loss function",
    "cross-entropy",
    "MSE",
    "dropout",
    "weight decay",
    "LayerNorm",
    "BatchNorm",
    "RMSNorm",
    "vanishing gradients",
    "gradient clipping",
    "mixed precision",
    "FP16",
    "BF16",
    "LR schedule",
    "cosine decay",
    "warmup",
    "интерактивный курс",
  ],
  authors: [{ name: "Как нейросети учатся" }],
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    shortcut: ["/icon.svg"],
    apple: ["/icon.svg"],
  },
  openGraph: {
    title: "Как нейросети учатся — backprop, Adam, регуляризация",
    description:
      "10 модулей: loss, backprop, оптимизаторы, LR schedules, нормализация, dropout, градиенты, mixed precision.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body
        className={`${inter.variable} ${mono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeToggle />
        {children}
        <ScrollToTopBrain />
      </body>
    </html>
  );
}
