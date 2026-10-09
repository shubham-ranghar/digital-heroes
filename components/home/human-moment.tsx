"use client";

import Image from "next/image";
import { m, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

import { Container } from "@/components/layout/container";
import { LineReveal } from "@/components/motion/line-reveal";
import { useMediaQuery } from "@/hooks/use-media-query";
import { editorialDisplayMd } from "@/lib/typography-editorial";
import { cn } from "@/lib/utils";

const PHOTO_SRC = "/impact/children-gathered.webp";
const PHOTO_ALT =
  "Children and women sitting close together at an outdoor community gathering";

/**
 * Silence after density: one full-bleed photograph and one line, with no
 * card, border or stepped edge. The photo drifts on scroll (md+, motion
 * allowed); the line reveals on entry. Different elements, never both.
 */
export function HumanMoment() {
  const reduceMotion = useReducedMotion();
  const mdUp = useMediaQuery("(min-width: 768px)");
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const photoY = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"]);
  const drift = mdUp && !reduceMotion;

  return (
    <section
      ref={ref}
      aria-label="Who the draw is really for"
      data-nav-section
      data-nav-theme="dark"
      className="relative isolate flex min-h-[78svh] items-end overflow-hidden bg-navy md:min-h-svh"
    >
      <m.div
        className="absolute inset-x-0 -top-[8%] -bottom-[8%] -z-10"
        style={drift ? { y: photoY } : undefined}
      >
        <Image
          src={PHOTO_SRC}
          alt={PHOTO_ALT}
          fill
          sizes="100vw"
          className="object-cover object-[center_30%]"
        />
      </m.div>
      {/* Legibility wash: light at the faces, deep under the line. */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-t from-navy via-navy/40 to-navy/5"
        aria-hidden
      />

      <Container className="w-full pb-14 pt-40 md:pb-24">
        <LineReveal
          className={cn(editorialDisplayMd, "max-w-[16ch] text-cream")}
          lineClassName="text-[length:inherit] leading-[inherit]"
          lines={["One member wins the draw.", "They win every month."]}
        />
        <p className="type-caption mt-8 text-on-dark-quiet">
          ( Photo: Amol Sonar, Unsplash )
        </p>
      </Container>
    </section>
  );
}
