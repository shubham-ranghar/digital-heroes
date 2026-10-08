"use client";

import Link from "next/link";
import { m, useReducedMotion } from "framer-motion";

import { LineReveal } from "@/components/motion/line-reveal";
import { Container } from "@/components/layout/container";
import { editorialDisplay } from "@/lib/typography-editorial";
import { buttonMotionProps } from "@/lib/motion";
import { cn } from "@/lib/utils";

export function EditorialFinalCta() {
  const reduceMotion = useReducedMotion();

  return (
    <section data-nav-section data-nav-theme="dark" className="bg-navy text-cream">
      <Container className="py-20 sm:py-28">
        <div className="mx-auto max-w-4xl text-center">
          <LineReveal
            className={cn(
              editorialDisplay,
              "text-cream [&_em]:font-serif [&_em]:italic [&_em]:text-coral",
            )}
            lineClassName="text-[length:inherit] leading-[inherit]"
            lines={[
              <>
                Ready to play for <em>something bigger</em>?
              </>,
            ]}
          />
          <m.div className="mt-10" {...buttonMotionProps(reduceMotion)}>
            <Link
              href="/subscribe"
              className="inline-flex h-14 items-center rounded-full bg-coral px-10 text-lg font-medium text-navy hover:bg-coral-deep motion-transition-colors"
            >
              Subscribe now
            </Link>
          </m.div>
        </div>
      </Container>
    </section>
  );
}
