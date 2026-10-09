"use client";

import { animate, useReducedMotion } from "framer-motion";
import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";

import { EASE_OUT } from "@/lib/motion";

type UseCountUpOptions = {
  /** Animation duration in milliseconds. */
  duration?: number;
  /** Start counting when true (e.g. after in-view). */
  enabled?: boolean;
  /** Text for a given numeric value (counting from zero up to `end`). */
  format: (value: number) => string;
};

/**
 * Counts a number up from zero, off the React render path: each frame writes
 * the element's text directly, and React renders once more at the end with
 * the final value so its output and the DOM agree.
 *
 * `ref` must point at an element whose only child is the returned `text`.
 * Reduced motion shows the final value immediately.
 */
export function useCountUp(
  ref: RefObject<HTMLElement | null>,
  end: number,
  { duration = 1200, enabled = true, format }: UseCountUpOptions,
) {
  const reduceMotion = useReducedMotion();
  const [settledEnd, setSettledEnd] = useState<number | null>(null);
  const formatRef = useRef(format);

  useLayoutEffect(() => {
    formatRef.current = format;
  });

  useEffect(() => {
    if (!enabled || reduceMotion) {
      return;
    }
    const node = ref.current;
    const controls = animate(0, end, {
      duration: duration / 1000,
      ease: EASE_OUT,
      onUpdate: (latest) => {
        if (node) {
          node.textContent = formatRef.current(latest);
        }
      },
      onComplete: () => setSettledEnd(end),
    });
    return () => controls.stop();
  }, [ref, end, duration, enabled, reduceMotion]);

  const settled = reduceMotion || settledEnd === end;
  return { text: format(settled ? end : 0) };
}
