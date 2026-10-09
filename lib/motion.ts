import type { Transition, Variants } from "framer-motion";

export const EASE_OUT: Transition["ease"] = [0.22, 1, 0.36, 1];
export const EASE_IN_OUT: Transition["ease"] = [0.65, 0, 0.35, 1];
export const EASE_SOFT: Transition["ease"] = [0.4, 0, 0.2, 1];
/** Reveal curve: a fast start that settles long, so entries feel placed. */
export const EASE_REVEAL: Transition["ease"] = [0.16, 1, 0.3, 1];

export const DURATION = {
  instant: 0.15,
  /** Hover / press feedback (CSS twin: --dur-hover). */
  hover: 0.16,
  fast: 0.2,
  base: 0.4,
  /** Scroll and mount reveals. */
  reveal: 0.42,
  slow: 0.7,
  hero: 1.0,
} as const;

/**
 * Reveal discipline: 420ms on EASE_REVEAL, a 16px rise, never a scale.
 * Siblings stagger 60ms, and a chain stops growing after five (the sixth
 * item onward lands with the fifth).
 */
export const REVEAL = {
  duration: DURATION.reveal,
  ease: EASE_REVEAL,
  rise: 16,
  stagger: 0.06,
  maxChain: 5,
} as const;

/** Delay for the `index`-th sibling of a reveal chain. */
export function revealDelay(index: number, base = 0): number {
  return base + Math.min(index, REVEAL.maxChain - 1) * REVEAL.stagger;
}

/** Impact count-ups: 1.2s ease-out, once, when the figure reaches 40% up the viewport. */
export const COUNT_UP = {
  durationMs: 1200,
  inViewMargin: "0px 0px -40% 0px",
} as const;

/** @deprecated Use EASE_OUT */
export const motionEase = EASE_OUT;

export const revealTransition: Transition = {
  duration: REVEAL.duration,
  ease: REVEAL.ease,
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: REVEAL.rise },
  visible: {
    opacity: 1,
    y: 0,
    transition: revealTransition,
  },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: REVEAL.stagger },
  },
};

/** Hover lifts 2px; press settles back. No scale anywhere. */
export const buttonInteraction = {
  hover: { y: -2 },
  tap: { y: 0 },
};

export const cardLift = {
  rest: { y: 0 },
  hover: { y: -2 },
};

export const layoutSpring = {
  type: "spring" as const,
  stiffness: 300,
  damping: 30,
};

export function buttonMotionProps(reduceMotion: boolean | null) {
  if (reduceMotion) {
    return {};
  }
  return {
    whileHover: buttonInteraction.hover,
    whileTap: buttonInteraction.tap,
    transition: { duration: DURATION.hover, ease: "linear" as const },
  };
}

