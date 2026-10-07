"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

type UseCountUpOptions = {
  /** Animation duration in milliseconds. */
  duration?: number;
  /** Decimal places in the displayed value. */
  decimals?: number;
  /** Start counting when true (e.g. after in-view). */
  enabled?: boolean;
};

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * Animates a number from zero to `end` for stat displays.
 * Respects prefers-reduced-motion by showing the final value immediately.
 */
export function useCountUp(
  end: number,
  {
    duration = 1600,
    decimals = 0,
    enabled = true,
  }: UseCountUpOptions = {},
) {
  const reduceMotion = useReducedMotion();
  const [value, setValue] = useState(reduceMotion ? end : 0);
  const frameRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) {
      setValue(0);
      return;
    }

    if (reduceMotion) {
      setValue(end);
      return;
    }

    startRef.current = null;

    const step = (timestamp: number) => {
      if (startRef.current === null) {
        startRef.current = timestamp;
      }
      const elapsed = timestamp - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);
      setValue(end * eased);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(step);
      }
    };

    frameRef.current = requestAnimationFrame(step);

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [end, duration, enabled, reduceMotion]);

  const formatted = value.toFixed(decimals);
  return { value, formatted };
}
