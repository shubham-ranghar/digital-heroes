"use client";

import { m } from "framer-motion";
import { useRef } from "react";

import { useClipReveal } from "@/components/motion/clip-reveal";
import { cn } from "@/lib/utils";

type CharityImageProps = {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
};

/**
 * External charity image URLs (not configured in next/image remote patterns).
 * Wipes in left→right on scroll entry, echoing the hero's stepped clip panels.
 * The clip runs on the element itself, so callers' layout classes are unchanged,
 * and it never waits on image load (a failed image still ends fully unclipped).
 */
export function CharityImage({ src, alt, className }: CharityImageProps) {
  const ref = useRef<HTMLImageElement>(null);
  const clip = useClipReveal(ref, { from: "right" });

  return (
    <m.img
      ref={ref}
      src={src}
      alt={alt}
      className={cn("object-cover", className)}
      loading="lazy"
      decoding="async"
      {...clip}
    />
  );
}
