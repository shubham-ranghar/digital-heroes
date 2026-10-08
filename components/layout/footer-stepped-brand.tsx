"use client";

import Link from "next/link";
import { m, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";

import { Container } from "@/components/layout/container";
import { useClientMounted } from "@/hooks/use-client-mounted";
import type { FooterContactBlock } from "@/lib/footer-links";
import { DURATION, revealTransition } from "@/lib/motion";
import { cn } from "@/lib/utils";

type FooterSteppedBrandProps = {
  contact: FooterContactBlock;
  year: number;
};

function FooterWordmark() {
  return (
    <p className="font-sans text-xl font-semibold tracking-tight text-cream md:text-2xl">
      digital<span className="text-coral">.HEROES</span>
      <sup className="ml-1 text-[0.45em] font-normal text-cream/70">®</sup>
    </p>
  );
}

function ContactLines({ contact }: { contact: FooterContactBlock }) {
  const contactTextClass = cn(
    "text-center font-sans font-light tracking-[-0.03em] text-cream",
    "text-[clamp(1.5rem,3vw,2.5rem)] leading-[1.15] [overflow-wrap:anywhere]",
  );

  if (contact.kind === "fallback") {
    return (
      <p className={contactTextClass}>
        Questions?{" "}
        <Link
          href="/contact"
          className="motion-transition-colors underline-offset-4 hover:text-coral hover:underline"
        >
          Reach us via the contact page
        </Link>
      </p>
    );
  }

  const email = contact.email;

  return (
    <div className={contactTextClass}>
      <p>
        <a
          href={`mailto:${email}`}
          className="motion-transition-colors hover:text-coral"
        >
          {email}
        </a>
      </p>
      {contact.kind === "full"
        ? contact.addressLines.map((line) => <p key={line}>{line}</p>)
        : null}
    </div>
  );
}

export function FooterSteppedBrand({ contact, year }: FooterSteppedBrandProps) {
  const reduceMotion = useReducedMotion();
  const hydrated = useClientMounted();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-8% 0px" });
  const shouldAnimate = hydrated && !reduceMotion && inView;

  return (
    <div
      ref={ref}
      className="relative overflow-x-clip"
      data-tone="navy"
      data-nav-theme="dark"
    >
      <m.div
        className="overflow-x-clip"
        initial={false}
        animate={
          reduceMotion
            ? { clipPath: "inset(0% 0% 0% 0%)" }
            : shouldAnimate
              ? { clipPath: "inset(0% 0% 0% 0%)" }
              : hydrated && !inView
                ? { clipPath: "inset(100% 0% 0% 0%)" }
                : { clipPath: "inset(0% 0% 0% 0%)" }
        }
        transition={
          reduceMotion ? { duration: DURATION.fast } : revealTransition
        }
      >
        <div className="footer-stepped-surface bg-navy">
          <Container className="flex flex-col items-center px-[var(--gutter)] pb-10 pt-16 text-center md:pt-20 lg:pt-24">
            <FooterWordmark />
            <div className="mt-10 w-full max-w-4xl md:mt-14">
              <ContactLines contact={contact} />
            </div>
          </Container>
        </div>
      </m.div>

      <div className="bg-navy pb-8 pt-2">
        <Container>
          <p className="text-center text-xs text-cream/70">
            © {year} Digital Heroes
          </p>
        </Container>
      </div>
    </div>
  );
}
