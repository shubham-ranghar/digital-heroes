"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import { buttonMotionProps } from "@/lib/motion";

export function EditorialMobileSubscribeBar() {
  return (
    <div
      data-mobile-subscribe-bar
      className="fixed inset-x-0 bottom-0 z-40 border-t border-navy/10 bg-cream/95 p-3 backdrop-blur-md md:hidden"
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
    >
      <motion.div {...buttonMotionProps(false)}>
        <Link
          href="/subscribe"
          className="flex h-12 w-full items-center justify-center bg-coral text-base font-medium text-navy"
        >
          Subscribe now
        </Link>
      </motion.div>
    </div>
  );
}
