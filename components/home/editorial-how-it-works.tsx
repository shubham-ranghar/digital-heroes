"use client";

import { motion, useReducedMotion } from "framer-motion";

import { SteppedEdge } from "@/components/editorial/stepped-edge";
import { ParenLabel } from "@/components/editorial/paren-label";
import { Container } from "@/components/layout/container";
import {
  editorialBodyOnDark,
  editorialDisplayMd,
  editorialParenLabelOnDark,
} from "@/lib/typography-editorial";
import { motionEase, staggerContainer } from "@/lib/motion";
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
  const reduceMotion = useReducedMotion();

  return (
    <section
      id="how-it-works"
      data-nav-section
      data-nav-theme="dark"
      className="bg-navy text-cream"
    >
      <SteppedEdge position="top" color="var(--navy)" />
      <Container className="py-16 sm:py-24">
        <ParenLabel className={editorialParenLabelOnDark}>How it works</ParenLabel>
        <h2 className={cn(editorialDisplayMd, "mt-4 max-w-2xl text-cream")}>
          Three steps to <em className="font-serif italic text-coral">play &amp; give</em>
        </h2>

        <motion.ol
          className="mt-14 grid gap-10 md:grid-cols-3"
          variants={staggerContainer}
          initial={reduceMotion ? false : "hidden"}
          whileInView={reduceMotion ? undefined : "visible"}
          viewport={{ once: true, margin: "-60px" }}
        >
          {steps.map((step, index) => (
            <motion.li
              key={step.number}
              variants={{
                hidden: { opacity: 0, y: 24 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.55, ease: motionEase },
                },
              }}
              className={cn(
                "border-t border-cream/30 pt-6",
                index === 1 && "md:translate-y-12",
                index === 2 && "md:translate-y-24",
              )}
            >
              <div>
                <p
                  className="font-serif text-[clamp(56px,6vw,96px)] italic leading-none text-coral"
                >
                  {step.number}
                </p>
                <h3 className="mt-3 font-sans text-[clamp(28px,2vw,32px)] font-light tracking-tight text-cream">
                  {step.title}
                </h3>
                <p className={cn("mt-3", editorialBodyOnDark)}>{step.body}</p>
              </div>
            </motion.li>
          ))}
        </motion.ol>
      </Container>
      <SteppedEdge position="bottom" color="var(--cream)" />
    </section>
  );
}
