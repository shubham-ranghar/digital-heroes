"use client";

import type { ReactNode } from "react";

import { Reveal, RevealStagger, RevealStaggerItem } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

type ScrollRevealProps = {
  children: ReactNode;
  className?: string;
  stagger?: boolean;
};

/** @deprecated Prefer Reveal / RevealStagger from @/components/motion/reveal */
export function ScrollReveal({
  children,
  className,
  stagger = false,
}: ScrollRevealProps) {
  if (stagger) {
    return <RevealStagger className={className}>{children}</RevealStagger>;
  }
  return <Reveal className={className}>{children}</Reveal>;
}

type RevealItemProps = {
  children: ReactNode;
  className?: string;
};

/** @deprecated Prefer RevealStaggerItem */
export function RevealItem({ children, className }: RevealItemProps) {
  return <RevealStaggerItem className={cn(className)}>{children}</RevealStaggerItem>;
}
