"use client";

import { useMotionValueEvent, type MotionValue } from "framer-motion";
import type { RefObject } from "react";

/**
 * Sets `data-scrubbing` on `ref` while `progress` is strictly between 0 and 1,
 * so CSS can apply `will-change` only during a scroll scrub and release the
 * layer once it settles. Written straight to the DOM — no React render.
 */
export function useScrubFlag(
  progress: MotionValue<number>,
  ref: RefObject<HTMLElement | null>,
) {
  useMotionValueEvent(progress, "change", (value) => {
    const node = ref.current;
    if (!node) {
      return;
    }
    const active = value > 0 && value < 1;
    if (active !== node.hasAttribute("data-scrubbing")) {
      node.toggleAttribute("data-scrubbing", active);
    }
  });
}
