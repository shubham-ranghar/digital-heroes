"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { ImpactCount } from "@/components/home/impact-count";
import { LineReveal } from "@/components/motion/line-reveal";
import { Container } from "@/components/layout/container";
import { CURRENCY_SYMBOL, formatAmount } from "@/lib/money";
import { editorialDisplayMd, editorialEyebrow } from "@/lib/typography-editorial";
import { cn } from "@/lib/utils";

type EditorialFinalCtaProps = {
  /** Cumulative raised (₹): the impact figure's last appearance. */
  totalRaised: number | null;
};

export function EditorialFinalCta({ totalRaised }: EditorialFinalCtaProps) {
  return (
    <section data-nav-section data-nav-theme="dark" className="bg-navy text-cream">
      <Container className="py-20 sm:py-28 lg:py-32">
        <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
          {totalRaised != null ? (
            <p className="flex flex-col items-center gap-2">
              <span className={cn(editorialEyebrow, "text-on-dark-quiet")}>
                Raised by members so far
              </span>
              <ImpactCount
                className="type-subhead text-clay"
                prefix={CURRENCY_SYMBOL}
                value={totalRaised}
                format={formatAmount}
              />
            </p>
          ) : null}
          <LineReveal
            className={cn(editorialDisplayMd, "mt-10 text-cream")}
            lineClassName="text-[length:inherit] leading-[inherit]"
            lines={[<>Ready to play for something bigger?</>]}
          />
          <Link
            href="/subscribe"
            className="motion-cta type-body group/cta mt-12 inline-flex h-16 items-center gap-3 rounded-full bg-coral px-12 font-medium text-navy hover:bg-coral-deep"
          >
            Subscribe now
            <ArrowRight
              className="size-5 transition-transform duration-(--dur-hover) ease-(--ease-hover) group-hover/cta:translate-x-0.5 motion-reduce:transform-none"
              aria-hidden
            />
          </Link>
        </div>
      </Container>
    </section>
  );
}
