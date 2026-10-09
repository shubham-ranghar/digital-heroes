"use client";

import { SectionHeadline } from "@/components/motion/section-headline";
import { RevealStagger, RevealStaggerItem } from "@/components/motion/reveal";
import { Container } from "@/components/layout/container";
import {
  editorialBodyOnDark,
  editorialDisplayMd,
  editorialParenLabelOnDark,
  editorialStatement,
  editorialTitle,
} from "@/lib/typography-editorial";
import { tabularImpact } from "@/lib/typography";
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
      <Container className="py-16 pb-36 sm:py-24 sm:pb-44">
        <SectionHeadline
          align="left"
          label="How it works"
          labelClassName={editorialParenLabelOnDark}
          headlineClassName={cn(editorialDisplayMd, "text-cream")}
          lines={[
            <>Three steps to play &amp; give</>,
          ]}
        />

        <RevealStagger
          as="ol"
          className="mt-14 grid gap-10 md:grid-cols-3"
        >
          {steps.map((step, index) => (
            <RevealStaggerItem
              as="li"
              key={step.number}
              className={cn(
                "border-t border-cream/30 pt-6",
                index === 1 && "md:translate-y-12",
                index === 2 && "md:translate-y-24",
              )}
            >
              <p className={cn(editorialStatement, "text-coral", tabularImpact)}>
                {step.number}
              </p>
              <h3 className={cn(editorialTitle, "mt-4 text-cream")}>
                {step.title}
              </h3>
              <p className={cn("mt-3", editorialBodyOnDark)}>{step.body}</p>
            </RevealStaggerItem>
          ))}
        </RevealStagger>
      </Container>
    </section>
  );
}
