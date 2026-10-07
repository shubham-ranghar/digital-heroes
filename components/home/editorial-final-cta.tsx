"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

import { SteppedEdge } from "@/components/editorial/stepped-edge";
import { Container } from "@/components/layout/container";
import { editorialDisplay } from "@/lib/typography-editorial";
import { buttonMotionProps } from "@/lib/motion";
import { cn } from "@/lib/utils";

export function EditorialFinalCta() {
  const reduceMotion = useReducedMotion();

  return (
    <section data-nav-section data-nav-theme="dark" className="bg-navy text-cream">
      <SteppedEdge position="top" color="var(--navy)" />
      <Container className="py-20 sm:py-28">
        <div className="mx-auto max-w-4xl text-center">
          <h2
            className={cn(
              editorialDisplay,
              "text-cream [&_em]:font-serif [&_em]:italic [&_em]:text-coral",
            )}
          >
            Ready to play for <em>something bigger</em>?
          </h2>
          <motion.div className="mt-10" {...buttonMotionProps(reduceMotion)}>
            <Link
              href="/subscribe"
              className="inline-flex h-14 items-center bg-coral px-10 text-lg font-medium text-navy hover:bg-coral-deep motion-transition-colors"
            >
              Subscribe now
            </Link>
          </motion.div>
        </div>
      </Container>
      <SteppedEdge position="bottom" color="var(--cream)" />
    </section>
  );
}
