"use client";

import { motion, useReducedMotion } from "framer-motion";

import { fadeUp, staggerContainer } from "@/lib/motion";

const items = ["Charity impact", "Monthly draws", "Transparent payouts"];

/** Demonstrates fade-up stagger; disabled when prefers-reduced-motion. */
export function MotionShowcase() {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return (
      <p className="text-sm text-muted-foreground">
        Reduced motion is enabled — enter animations are skipped.
      </p>
    );
  }

  return (
    <motion.ul
      className="flex flex-col gap-2 text-sm text-foreground"
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
    >
      {items.map((label) => (
        <motion.li
          key={label}
          variants={fadeUp}
          className="rounded-full border border-line bg-foreground/5 px-4 py-2"
        >
          {label}
        </motion.li>
      ))}
    </motion.ul>
  );
}
