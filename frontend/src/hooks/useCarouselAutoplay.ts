import { useCallback, useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';

interface UseCarouselAutoplayOptions {
  itemCount: number;
  intervalMs?: number;
  onAdvance: () => void;
}

interface UseCarouselAutoplayReturn {
  pause: () => void;
  resume: () => void;
}

/**
 * Autoplay logic for HeroCarousel.
 * - Advances every `intervalMs` (default 4500ms)
 * - Pauses on hover / drag / focus, resumes on leave / drag end / blur
 * - Respects prefers-reduced-motion (autoplay disabled entirely)
 * - Cleans up interval on unmount
 */
export function useCarouselAutoplay({
  itemCount,
  intervalMs = 4500,
  onAdvance,
}: UseCarouselAutoplayOptions): UseCarouselAutoplayReturn {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isPausedRef = useRef(false);
  const prefersReducedMotion = useReducedMotion();

  const clear = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    clear();
    if (prefersReducedMotion || itemCount <= 1) return;

    intervalRef.current = setInterval(() => {
      if (!isPausedRef.current) onAdvance();
    }, intervalMs);
  }, [clear, intervalMs, itemCount, onAdvance, prefersReducedMotion]);

  const pause = useCallback(() => {
    isPausedRef.current = true;
  }, []);

  const resume = useCallback(() => {
    isPausedRef.current = false;
  }, []);

  useEffect(() => {
    start();
    return clear;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [start, clear]);

  return { pause, resume };
}
