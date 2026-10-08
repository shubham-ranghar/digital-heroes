"use client";

import { SteppedEdge } from "@/components/editorial/stepped-edge";
import { LineReveal } from "@/components/motion/line-reveal";
import { Reveal } from "@/components/motion/reveal";
import { EDGE_PAD_X, STEP_LINE_GRID } from "@/lib/home/step-line";
import { editorialStatement } from "@/lib/typography-editorial";
import { cn } from "@/lib/utils";

/**
 * lg+: headline holds the left of the hero's step line; the quote block hangs
 * off the line, flush with the headline's last line, and bleeds right — the
 * headline's opening lines sit alone above it, stepping down like the hero.
 * md: stacked, block indented to the hero's lowest step (46%) and bleeding.
 * <md: plain stack inside the gutters.
 */
export function StatementSection() {
  return (
    <section
      data-nav-section
      data-nav-theme="light"
      className="flex flex-col justify-center bg-cream py-16 lg:py-20 group-data-pinned/curtain:min-h-svh"
    >
      <div className={cn("grid gap-y-10 md:gap-y-12 lg:items-end", STEP_LINE_GRID)}>
        <LineReveal
          className={cn(
            editorialStatement,
            EDGE_PAD_X,
            "text-navy md:text-[clamp(2.25rem,5vw,3.25rem)] lg:col-start-2 lg:col-end-5 lg:px-0 lg:text-[clamp(2.5rem,4.2vw,4.5rem)]",
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

        <Reveal className="mx-[var(--gutter)] md:mr-0 md:ml-[46%] lg:col-start-6 lg:ml-0">
          <SteppedEdge
            position="top"
            color="var(--navy)"
            fillBand={false}
            static
            className="[--step-edge:12px] md:[--step-edge:16px]"
          />
          <div
            data-nav-theme="dark"
            className="bg-navy py-10 pr-6 pl-6 sm:pr-10 sm:pl-10 md:pr-[max(var(--gutter),calc(50vw-960px+var(--gutter)))] lg:py-12 lg:pl-12"
          >
            <LineReveal
              className="max-w-[22ch] font-serif text-[clamp(28px,3vw,44px)] italic leading-snug text-balance text-cream"
              lines={[
                "“Small subscriptions, shared scores, outsized good.”",
              ]}
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
