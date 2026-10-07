"use client";

import type { ReactNode } from "react";

import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

type ScrollRevealProps = {
  children: ReactNode;
  className?: string;
  stagger?: boolean;
};

/** @deprecated Use Reveal / RevealStagger from @/components/motion/reveal */
export function ScrollReveal({ children, className }: ScrollRevealProps) {
  return <Reveal className={className}>{children}</Reveal>;
}

type RevealItemProps = {
  children: ReactNode;
  className?: string;
};

export function RevealItem({ children, className }: RevealItemProps) {
  return <div className={cn(className)}>{children}</div>;
}
