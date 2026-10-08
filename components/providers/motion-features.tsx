"use client";

import { LazyMotion, domAnimation, domMax } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Root feature set: animations, variants, exit, gestures, in-view. `strict`
 * throws if a full `motion.*` component slips back in.
 */
export function MotionFeatures({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      {children}
    </LazyMotion>
  );
}

/**
 * Adds layout animations (`layout`, `layoutId`) for the member and admin
 * shells only — nav indicators and score-chip reordering need them. Scoped
 * here so domMax never ships in the marketing bundle.
 */
export function LayoutMotionFeatures({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domMax} strict>
      {children}
    </LazyMotion>
  );
}
