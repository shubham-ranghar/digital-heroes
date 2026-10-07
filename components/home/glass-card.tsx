import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type GlassCardProps = {
  children: ReactNode;
  className?: string;
};

export function GlassCard({ children, className }: GlassCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-cream/15 bg-surface/25 p-4 shadow-lg backdrop-blur-md",
        className,
      )}
    >
      {children}
    </div>
  );
}
