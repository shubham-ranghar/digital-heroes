"use client";

import { m, useReducedMotion } from "framer-motion";

import { DURATION, EASE_OUT, ROUTE_ENTER_OFFSET } from "@/lib/motion";

/**
 * Page enter for marketing/auth templates (rendered inside `<main>`, so the
 * header never animates). The rise uses relative `top`, not a transform: a
 * transformed ancestor would become the containing block for `position: fixed`
 * children (e.g. the mobile subscribe bar). Flex classes pass `<main>`'s
 * column layout straight through.
 */
export function RouteTransition({ children }: { children: React.ReactNode }) {
  const reduceMotion = useReducedMotion();

  return (
    <m.div
      className="relative flex min-w-0 flex-1 flex-col"
      initial={
        reduceMotion ? { opacity: 0 } : { opacity: 0, top: ROUTE_ENTER_OFFSET }
      }
      animate={reduceMotion ? { opacity: 1 } : { opacity: 1, top: 0 }}
      transition={
        reduceMotion
          ? { duration: DURATION.instant }
          : { duration: DURATION.base, ease: EASE_OUT }
      }
    >
      {children}
    </m.div>
  );
}
