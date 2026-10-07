"use client";

import { motion, useReducedMotion } from "framer-motion";

import { SteppedEdge } from "@/components/editorial/stepped-edge";
import { Container } from "@/components/layout/container";
import { editorialStatement } from "@/lib/typography-editorial";
import { motionEase } from "@/lib/motion";
import { cn } from "@/lib/utils";

export function StatementSection() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      data-nav-section
      data-nav-theme="light"
      className="bg-cream py-20 sm:py-28"
    >
      <Container>
        <motion.p
          className={cn(
            editorialStatement,
            "mx-auto max-w-[1200px] text-center text-navy",
            "[&_em]:font-serif [&_em]:italic [&_em]:text-[length:inherit] [&_em]:leading-[inherit]",
          )}
          initial={reduceMotion ? false : { opacity: 0, y: 32 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.75, ease: motionEase }}
        >
          Every membership sends at least{" "}
          <em>10% to your charity</em> — and your latest five scores place you in
          the <em>monthly community draw</em> without extra steps.
        </motion.p>

        <div className="relative mt-16 w-full">
          <SteppedEdge position="top" color="var(--navy)" />
          <div
            data-nav-theme="dark"
            className="bg-navy py-12 text-center sm:py-14"
          >
            <p
              className="mx-auto max-w-3xl font-serif text-[clamp(28px,3.2vw,44px)] italic leading-snug text-cream"
            >
              &ldquo;Small subscriptions, shared scores, outsized good.&rdquo;
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
