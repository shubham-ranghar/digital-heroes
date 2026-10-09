import type { CSSProperties, ReactNode } from "react";

import { cn } from "@/lib/utils";

type EditorialCardProps = {
  children: ReactNode;
  className?: string;
  /**
   * `stepped` cuts a two-step notch from the top-right corner — the same
   * rectilinear grammar as the section stepped edges. `none` is a plain box.
   */
  corner?: "stepped" | "none";
  /** Step size in px (each of the two steps). */
  step?: number;
  /** Background of the 1px frame (the visible border). */
  borderClassName?: string;
};

export function EditorialCard({
  children,
  className,
  corner = "stepped",
  step,
  borderClassName = "bg-navy",
}: EditorialCardProps) {
  if (corner === "none") {
    return <div className={cn("relative", className)}>{children}</div>;
  }

  const style = step
    ? ({ "--corner-step": `${step}px` } as CSSProperties)
    : undefined;

  // Frame and content share one clip: inside the 1px padding the same
  // polygon lands exactly 1px in on every edge and step, so the border
  // follows the corner.
  return (
    <div
      className={cn("clip-stepped-corner relative p-px", borderClassName)}
      style={style}
    >
      <div className={cn("clip-stepped-corner relative h-full min-h-0", className)}>
        {children}
      </div>
    </div>
  );
}
