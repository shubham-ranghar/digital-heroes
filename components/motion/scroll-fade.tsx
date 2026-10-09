"use client";

import { m, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef, type ReactNode, type RefObject } from "react";

import { useMediaQuery } from "@/hooks/use-media-query";
import { useScrubFlag } from "@/hooks/use-scrub-flag";
import { cn } from "@/lib/utils";

/**
 * Never fully invisible on exit — text that disappears reads as a bug,
 * and the section stays selectable / reachable by assistive tech.
 */
const EXIT_FLOOR = 0.15;
const ENTRY_RISE_PX = 12;

type ScrollFadeProps = {
  children: ReactNode;
  className?: string;
  /**
   * Element whose travel drives the fade (e.g. the full section when the
   * content sits inside a sticky frame). Defaults to the fade element.
   */
  measureRef?: RefObject<HTMLElement | null>;
};

/**
 * Scroll-linked section opacity, strictly position-based: the same scroll
 * position always yields the same opacity, whichever way the user got there.
 * Progress runs 0 (top enters at viewport bottom) → 1 (bottom leaves at the
 * top): the first 25% fades 0→1 with a small rise, the middle band holds 1,
 * and on md+ the last 25% dims to the floor. Mobile keeps entry only — exit
 * fades read as flicker at phone scroll speeds. Reduced motion renders
 * static. Driven by framer's shared rAF scroll tracker (fed by Lenis), and
 * `will-change` is held only mid-travel via the `data-scrubbing` flag.
 *
 * Marketing surfaces only — never heroes (LCP) and never the app shell.
 */
export function ScrollFade({ children, className, measureRef }: ScrollFadeProps) {
  const ownRef = useRef<HTMLDivElement>(null);
  const targetRef = measureRef ?? ownRef;
  const reduceMotion = useReducedMotion();
  const mdUp = useMediaQuery("(min-width: 768px)");

  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "end start"],
  });

  const opacity = useTransform(
    scrollYProgress,
    [0, 0.25, 0.75, 1],
    mdUp ? [0, 1, 1, EXIT_FLOOR] : [0, 1, 1, 1],
  );
  // Rise is entry-only: clamped flat at 0 for the rest of the travel.
  const y = useTransform(scrollYProgress, [0, 0.25], [ENTRY_RISE_PX, 0]);

  useScrubFlag(scrollYProgress, ownRef);

  return (
    <m.div
      ref={ownRef}
      className={cn("data-scrubbing:will-change-[opacity]", className)}
      style={reduceMotion ? undefined : { opacity, y }}
    >
      {children}
    </m.div>
  );
}
