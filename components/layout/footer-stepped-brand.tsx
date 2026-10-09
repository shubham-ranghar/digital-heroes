"use client";

import Link from "next/link";
import { m, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";

import { ParenLabel } from "@/components/editorial/paren-label";
import { Container } from "@/components/layout/container";
import { useClientMounted } from "@/hooks/use-client-mounted";
import type { FooterContactBlock } from "@/lib/footer-links";
import { DURATION, revealTransition } from "@/lib/motion";
import { editorialParenLabelOnDark } from "@/lib/typography-editorial";

type FooterSteppedBrandProps = {
  contact: FooterContactBlock;
  year: number;
};

function FooterWordmark() {
  return (
    <p className="footer-wordmark font-medium text-cream">
      digital<span className="text-coral">.HEROES</span>
      <sup className="ml-1 text-[0.45em] font-normal text-cream/70">®</sup>
    </p>
  );
}

const contactLinkClass =
  "motion-transition-colors underline decoration-cream/35 underline-offset-4 hover:text-coral hover:decoration-coral";

/** Body-scale contact under a `( Contact )` label — the wordmark leads, not the inbox. */
function ContactLines({ contact }: { contact: FooterContactBlock }) {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <ParenLabel className={editorialParenLabelOnDark}>Contact</ParenLabel>
      <div className="type-body text-on-dark-body wrap-anywhere">
        {contact.kind === "fallback" ? (
          <p>
            Questions?{" "}
            <Link href="/contact" className={contactLinkClass}>
              Write to us on the contact page
            </Link>
          </p>
        ) : (
          <>
            <p>
              <a href={`mailto:${contact.email}`} className={contactLinkClass}>
                {contact.email}
              </a>
            </p>
            {contact.kind === "full"
              ? contact.addressLines.map((line) => <p key={line}>{line}</p>)
              : null}
          </>
        )}
      </div>
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
