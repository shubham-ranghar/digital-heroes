import type { Transition, Variants } from "framer-motion";

export const EASE_OUT: Transition["ease"] = [0.22, 1, 0.36, 1];
export const EASE_IN_OUT: Transition["ease"] = [0.65, 0, 0.35, 1];
export const EASE_SOFT: Transition["ease"] = [0.4, 0, 0.2, 1];

export const DURATION = {
  instant: 0.15,
  fast: 0.2,
  base: 0.4,
  slow: 0.7,
  hero: 1.0,
} as const;

/** Vertical rise (px) for page-to-page route enters. */
export const ROUTE_ENTER_OFFSET = 12;

/** @deprecated Use EASE_OUT */
export const motionEase = EASE_OUT;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.slow, ease: EASE_OUT },
  },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: DURATION.fast, ease: EASE_OUT },
  },
};

export const revealTransition: Transition = {
  duration: DURATION.slow,
  ease: EASE_OUT,
};

export const buttonInteraction = {
  hover: { scale: 1.03 },
  tap: { scale: 0.97 },
};

export const cardLift = {
  rest: { y: 0 },
  hover: { y: -4 },
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
    transition: { duration: DURATION.fast, ease: EASE_OUT },
  };
}

