"use client";

import { LineReveal } from "@/components/motion/line-reveal";
import { Reveal } from "@/components/motion/reveal";
import { Container } from "@/components/layout/container";
import { editorialStatement } from "@/lib/typography-editorial";
import { cn } from "@/lib/utils";

export function StatementSection() {
  return (
    <section
      data-nav-section
      data-nav-theme="light"
      className="bg-cream py-20 sm:py-28"
    >
      <Container>
        <LineReveal
          className={cn(
            editorialStatement,
            "mx-auto max-w-[1200px] text-center text-navy",
          )}
          lineClassName="text-[length:inherit] leading-[inherit] [&_em]:font-serif [&_em]:italic"
          lines={[
            <>
              Every membership sends at least <em>10% to your charity</em> — and your
              latest five scores place you in
            </>,
            <>
              the <em>monthly community draw</em> without extra steps.
            </>,
          ]}
        />

        <div className="relative mt-16 w-full">
          <Reveal>
            <div
              data-nav-theme="dark"
              className="bg-navy py-12 text-center sm:py-14"
            >
              <LineReveal
                className="mx-auto max-w-[22ch] font-serif text-[clamp(28px,3vw,44px)] italic leading-snug text-balance text-cream md:max-w-[22ch]"
                lines={[
                  "“Small subscriptions, shared scores, outsized good.”",
                ]}
              />
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
