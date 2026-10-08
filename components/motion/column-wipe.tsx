"use client";

import { m, type Variants } from "framer-motion";

import { EASE_IN_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils";

export const COLUMN_COUNT = 5;

/** `above`: columns parked above the viewport. `cover`: columns filling it. */
export type WipeState = "above" | "cover";

export type WipeTiming = {
  /** Per column, seconds. Covering runs left→right, revealing right→left. */
  cover: { duration: number; stagger: number };
  reveal: { duration: number; stagger: number };
};

/** Fullscreen menu: ~1.04s in, ~0.74s out. The out half is also the first-load intro. */
export const MENU_WIPE: WipeTiming = {
  cover: { duration: 0.8, stagger: 0.06 },
  reveal: { duration: 0.5, stagger: 0.06 },
};

/** Route changes: 0.28s cover + 0.28s reveal, so navigation never feels slow. */
export const ROUTE_WIPE: WipeTiming = {
  cover: { duration: 0.2, stagger: 0.02 },
  reveal: { duration: 0.2, stagger: 0.02 },
};

// Whole `transform` strings, not `y`: Framer only hands `transform` (not the
// individual x/y values) to WAAPI, which runs on the compositor. A route
// committing underneath (a long main-thread task) then can't drop wipe frames.
export const WIPE_TRANSFORM: Record<WipeState, string> = {
  above: "translateY(-100%)",
  cover: "translateY(0%)",
};

/** One column's tween into `state`, in seconds. */
export function columnTiming(
  { cover, reveal }: WipeTiming,
  state: WipeState,
  index: number,
): { duration: number; delay: number } {
  return state === "cover"
    ? { duration: cover.duration, delay: index * cover.stagger }
    : {
        duration: reveal.duration,
        delay: (COLUMN_COUNT - 1 - index) * reveal.stagger,
      };
}

function wipeVariants(timing: WipeTiming): Variants {
  const to = (state: WipeState) => (index: number) => ({
    transform: WIPE_TRANSFORM[state],
    transition: { ...columnTiming(timing, state, index), ease: EASE_IN_OUT },
  });
  return { above: to("above"), cover: to("cover") };
}

type ColumnWipeProps = {
  timing: WipeTiming;
  animate: WipeState;
  initial?: WipeState;
  /** For use inside `AnimatePresence`. */
  exit?: WipeState;
  /** Fires once, when the last column settles in `state`. */
  onComplete?: (state: WipeState) => void;
  className?: string;
};

/**
 * Five cream columns that drop in (cover) and lift away (reveal) with a
 * stagger. Compositor transform only; never takes pointer events.
 */
export function ColumnWipe({
  timing,
  animate,
  initial,
  exit,
  onComplete,
  className,
}: ColumnWipeProps) {
  const variants = wipeVariants(timing);

  return (
    <div
      className={cn("pointer-events-none absolute inset-0 flex", className)}
      aria-hidden
    >
      {Array.from({ length: COLUMN_COUNT }, (_, index) => {
        // Covering ends on the last column, revealing on the first.
        const settlesLast = (state: WipeState) =>
          index === (state === "cover" ? COLUMN_COUNT - 1 : 0);
        return (
          <m.div
            key={index}
            custom={index}
            variants={variants}
            initial={initial}
            animate={animate}
            exit={exit}
            onAnimationComplete={(definition) => {
              const state = definition as WipeState;
              if (onComplete && settlesLast(state)) {
                onComplete(state);
              }
            }}
            className="h-full flex-1 bg-cream will-change-transform"
          />
        );
      })}
    </div>
  );
}
