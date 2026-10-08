"use client";

import { m, useReducedMotion } from "framer-motion";

import { DURATION, EASE_OUT, ROUTE_ENTER_OFFSET } from "@/lib/motion";

/**
 * Route transition for dashboard/admin tabs, mounted by their templates inside
 * the chrome so the sidebar and nav never animate. Same timing as the
 * marketing `RouteTransition`; a transform is fine here because the shells'
 * fixed elements (mobile nav) live outside this wrapper.
 */
export function AppRouteFade({ children }: { children: React.ReactNode }) {
  const reduceMotion = useReducedMotion();

  return (
    <m.div
      className="min-w-0"
      initial={
        reduceMotion ? { opacity: 0 } : { opacity: 0, y: ROUTE_ENTER_OFFSET }
      }
      animate={{ opacity: 1, y: 0 }}
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
