"use client";

import { motion, useReducedMotion } from "framer-motion";

import { PageOpenEdge } from "@/components/motion/page-open-edge";
import { DURATION, EASE_OUT } from "@/lib/motion";

export default function Template({ children }: { children: React.ReactNode }) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15 }}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <>
      <PageOpenEdge />
      <motion.div
        className="min-w-0 overflow-x-clip"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: DURATION.base, ease: EASE_OUT }}
      >
        {children}
      </motion.div>
    </>
  );
}
