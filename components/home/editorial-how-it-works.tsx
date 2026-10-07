"use client";

import { SteppedEdge } from "@/components/editorial/stepped-edge";
import { ParenLabel } from "@/components/editorial/paren-label";
import { Reveal, RevealStagger, RevealStaggerItem } from "@/components/motion/reveal";
import { Container } from "@/components/layout/container";
import {
  editorialBodyOnDark,
  editorialDisplayMd,
  editorialParenLabelOnDark,
} from "@/lib/typography-editorial";
import { cn } from "@/lib/utils";

const steps = [
  {
    number: "01",
    title: "Subscribe",
    body: "Choose monthly or yearly billing. Pick your charity and set at least 10% of your fee to their work.",
  },
  {
    number: "02",
    title: "Enter your last 5 scores",
    body: "One Stableford score per day — we keep your latest five rounds as your draw snapshot.",
  },
  {
    number: "03",
    title: "Draw + funded cause",
    body: "You’re in the monthly prize draw while your charity receives ongoing support from every cycle.",
  },
];

export function EditorialHowItWorks() {
  return (
    <section
      id="how-it-works"
      data-nav-section
      data-nav-theme="dark"
      className="bg-navy text-cream"
    >
      <SteppedEdge position="top" color="var(--navy)" />
      <Container className="py-16 sm:py-24">
        <Reveal>
          <ParenLabel className={editorialParenLabelOnDark}>How it works</ParenLabel>
          <h2 className={cn(editorialDisplayMd, "mt-4 max-w-2xl text-cream")}>
            Three steps to <em className="font-serif italic text-coral">play &amp; give</em>
          </h2>
        </Reveal>

        <RevealStagger
          as="ol"
          className="mt-14 grid gap-10 md:grid-cols-3"
          stagger={0.12}
        >
          {steps.map((step, index) => (
            <RevealStaggerItem
              key={step.number}
              className={cn(
                "border-t border-cream/30 pt-6",
                index === 1 && "md:translate-y-12",
                index === 2 && "md:translate-y-24",
              )}
            >
              <p
                className="font-serif text-[clamp(56px,6vw,96px)] italic leading-none text-coral"
              >
                {step.number}
              </p>
              <h3 className="mt-3 font-sans text-[clamp(28px,2vw,32px)] font-light tracking-tight text-cream">
                {step.title}
              </h3>
              <p className={cn("mt-3", editorialBodyOnDark)}>{step.body}</p>
            </RevealStaggerItem>
          ))}
        </RevealStagger>
      </Container>
      <SteppedEdge position="bottom" color="var(--cream)" />
    </section>
  );
}
