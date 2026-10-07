"use client";

import { useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";

import { SteppedEdge } from "@/components/editorial/stepped-edge";
import {
  pageOpenEdgeColor,
  pageOpenEdgeInsetClass,
} from "@/lib/page-open-edge";
import { cn } from "@/lib/utils";

/** Fixed stepped-edge reveal on each App Router template mount (route change). */
export function PageOpenEdge() {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const pathKey = pathname.split("?")[0] ?? pathname;

  if (reduceMotion) {
    return null;
  }

  return (
    <div
      key={pathKey}
      className={cn(
        "pointer-events-none fixed inset-x-0 z-[45]",
        pageOpenEdgeInsetClass(pathname),
      )}
      aria-hidden
    >
      <SteppedEdge
        position="top"
        color={pageOpenEdgeColor(pathname)}
        playOnMount
      />
    </div>
  );
}
