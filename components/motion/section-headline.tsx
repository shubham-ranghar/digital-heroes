"use client";

import type { ReactNode } from "react";

import { ParenLabel } from "@/components/editorial/paren-label";
import { LineReveal } from "@/components/motion/line-reveal";
import { StepMark } from "@/components/motion/step-mark";
import { cn } from "@/lib/utils";

type SectionHeadlineProps = {
  label: string;
  lines: ReactNode[];
  labelClassName?: string;
  headlineClassName?: string;
  align?: "left" | "center";
};

export function SectionHeadline({
  label,
  lines,
  labelClassName,
  headlineClassName,
  align = "center",
}: SectionHeadlineProps) {
  return (
    <div
      className={cn(
        align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-2xl text-left",
      )}
    >
      <div
        className={cn(
          "flex flex-col items-center gap-3",
          align === "left" && "items-start",
        )}
      >
        <StepMark />
        <ParenLabel className={labelClassName}>{label}</ParenLabel>
      </div>
      <LineReveal
        className={cn("mt-4", headlineClassName)}
        lineClassName="text-[length:inherit] leading-[inherit] [&_em]:font-serif [&_em]:italic"
        lines={lines}
      />
    </div>
  );
}
