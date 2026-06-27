"use client";

import { useCallback, useRef, useSyncExternalStore } from "react";

/**
 * SSR-safe хук для localStorage на useSyncExternalStore.
 *
 * ВАЖНО: getSnapshot должен возвращать один и тот же объект, пока данные
 * в localStorage не изменились. Иначе React падает с
 * "The result of getSnapshot should be cached to avoid an infinite loop".
 *
 * Поэтому мы кэшируем:
 *   - последний прочитанный raw (строка из localStorage)
 *   - последний распарсенный value
 * И возвращаем закэшированный value, если raw не изменился.
 *
 * Запись делается через setItem + dispatchEvent, что триггерит подписчиков.
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  // Кэш с refs — не вызывает ре-рендер при изменении refs.
  const lastRawRef = useRef<string | null>(undefined); // undefined = ещё не читали
  const lastValueRef = useRef<T>(initialValue);

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const handler = () => onStoreChange();
      window.addEventListener("storage", handler);
      window.addEventListener(`local-storage:${key}`, handler);
      return () => {
        window.removeEventListener("storage", handler);
        window.removeEventListener(`local-storage:${key}`, handler);
      };
    },
    [key]
  );

  const getSnapshot = useCallback((): T => {
    let raw: string | null;
    try {
      raw = window.localStorage.getItem(key);
    } catch {
      raw = null;
    }
    // Если raw не изменился — возвращаем тот же объект.
    if (raw === lastRawRef.current) {
      return lastValueRef.current;
    }
    // raw изменился — парсим и кэшируем.
    let parsed: T;
    try {
      parsed = raw === null ? initialValue : (JSON.parse(raw) as T);
    } catch {
      parsed = initialValue;
    }
    lastRawRef.current = raw;
    lastValueRef.current = parsed;
    return parsed;
  }, [key, initialValue]);

  const getServerSnapshot = useCallback((): T => initialValue, [initialValue]);

  const value = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setValue = useCallback(
    (updater: T | ((prev: T) => T)) => {
      try {
        const raw = window.localStorage.getItem(key);
        const current: T = raw === null ? initialValue : (JSON.parse(raw) as T);
        const next =
          typeof updater === "function"
            ? (updater as (p: T) => T)(current)
            : updater;
        const nextRaw = JSON.stringify(next);
        window.localStorage.setItem(key, nextRaw);
        // Сразу обновим кэш, чтобы следующий getSnapshot не вернул устаревший объект.
        lastRawRef.current = nextRaw;
        lastValueRef.current = next;
        window.dispatchEvent(new Event(`local-storage:${key}`));
      } catch {
        /* ignore */
      }
    },
    [key, initialValue]
  );

  const reset = useCallback(() => {
    setValue(initialValue);
  }, [setValue, initialValue]);

  // hydrated = true на клиенте после монтирования (useSyncExternalStore обеспечивает SSR-консистентность)
  const hydrated = typeof window !== "undefined";

  return [value, setValue, reset, hydrated] as const;
}
