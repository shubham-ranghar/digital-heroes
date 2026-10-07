"use client";

import { motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { SteppedEdge } from "@/components/editorial/stepped-edge";
import {
  pageOpenEdgeColor,
  pageOpenEdgeInsetClass,
} from "@/lib/page-open-edge";
import { DURATION, EASE_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils";

/** Column reveal (0.4s + 4×0.06s) plus a short hold before the overlay exits. */
const EXIT_DELAY = DURATION.base + 0.24 + 0.2;

/** Fixed stepped-edge reveal on each App Router template mount (route change). */
export function PageOpenEdge() {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const pathKey = pathname.split("?")[0] ?? pathname;
  const [finished, setFinished] = useState(false);

  if (reduceMotion || finished) {
    return null;
  }

  return (
    <motion.div
      key={pathKey}
      className={cn(
        "pointer-events-none fixed inset-x-0 z-[45]",
        pageOpenEdgeInsetClass(pathname),
      )}
      initial={{ y: 0 }}
      animate={{ y: "-110%" }}
      transition={{
        delay: EXIT_DELAY,
        duration: DURATION.base,
        ease: EASE_OUT,
      }}
      onAnimationComplete={() => setFinished(true)}
      aria-hidden
    >
      <SteppedEdge
        position="top"
        color={pageOpenEdgeColor(pathname)}
        playOnMount
        fillBand={false}
      />
    </motion.div>
  );
}
