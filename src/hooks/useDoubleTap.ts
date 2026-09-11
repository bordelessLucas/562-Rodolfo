import { useCallback, useRef } from 'react';

/** Janela para o 2º toque contar como curtida (evita like acidental). */
export const DOUBLE_TAP_LIKE_WINDOW_MS = 400;

/**
 * Toque simples e duplo.
 * Curtida só no 2º toque dentro da janela de tempo.
 * Quando `enabled` é false, ignora toques (ex.: enquanto comenta).
 */
export function useDoubleTap(
  onDoubleTap: () => void,
  onSingleTap?: () => void,
  options?: {
    delayMs?: number;
    enabled?: boolean;
  },
) {
  const delayMs = options?.delayMs ?? DOUBLE_TAP_LIKE_WINDOW_MS;
  const enabled = options?.enabled ?? true;
  const lastTapRef = useRef(0);
  const singleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  const clearSingleTimer = useCallback(() => {
    if (singleTimerRef.current) {
      clearTimeout(singleTimerRef.current);
      singleTimerRef.current = null;
    }
  }, []);

  const onPress = useCallback(() => {
    if (!enabledRef.current) {
      clearSingleTimer();
      lastTapRef.current = 0;
      return;
    }

    const now = Date.now();

    if (now - lastTapRef.current < delayMs) {
      clearSingleTimer();
      lastTapRef.current = 0;
      onDoubleTap();
      return;
    }

    lastTapRef.current = now;
    clearSingleTimer();

    if (!onSingleTap) {
      return;
    }

    singleTimerRef.current = setTimeout(() => {
      singleTimerRef.current = null;
      lastTapRef.current = 0;
      if (enabledRef.current) {
        onSingleTap();
      }
    }, delayMs);
  }, [clearSingleTimer, delayMs, onDoubleTap, onSingleTap]);

  return onPress;
}
