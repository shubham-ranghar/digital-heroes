import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type EditorialCardProps = {
  children: ReactNode;
  className?: string;
  notch?: "top" | "bottom" | "none";
  borderClassName?: string;
};

const NOTCH_CLIP_TOP =
  "polygon(0 0, calc(50% - 16px) 0, 50% 16px, calc(50% + 16px) 0, 100% 0, 100% 100%, 0 100%)";

const NOTCH_CLIP_BOTTOM =
  "polygon(0 0, 100% 0, 100% calc(100% - 16px), calc(50% + 16px) 100%, 50% calc(100% - 16px), calc(50% - 16px) 100%, 0 calc(100% - 16px))";

export function EditorialCard({
  children,
  className,
  notch = "top",
  borderClassName = "bg-navy",
}: EditorialCardProps) {
  const clip =
    notch === "top"
      ? NOTCH_CLIP_TOP
      : notch === "bottom"
        ? NOTCH_CLIP_BOTTOM
        : undefined;

  if (!clip) {
    return <div className={cn("relative", className)}>{children}</div>;
  }

  return (
    <div
      className={cn("relative p-px", borderClassName)}
      style={{ clipPath: clip, WebkitClipPath: clip }}
    >
      <div
        className={cn("relative h-full min-h-0", className)}
        style={{ clipPath: clip, WebkitClipPath: clip }}
      >
        {children}
      </div>
    </div>
  );
}
